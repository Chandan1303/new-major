"""
NDVI Monitoring Service - Separate Module
==========================================
Provides real-time NDVI calculation and crop health monitoring
using Sentinel-2 satellite data via Google Earth Engine.

Features:
- Calculate NDVI for selected location/farm
- Classify crop health based on NDVI values
- Handle cloud coverage and data availability
- Historical NDVI trends
- Integration with existing system (non-invasive)

Author: Chandan (Lead), Dayanand, Harsha, Mohammad
Date: 2026-10-01
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple

# Google Earth Engine (optional - will fallback to historical data)
try:
    import ee
    GEE_AVAILABLE = True
except ImportError:
    GEE_AVAILABLE = False
    print("⚠️  Google Earth Engine not installed. Using historical NDVI data only.")


class NDVIService:
    """
    Professional NDVI Monitoring Service
    Integrates with existing system without modifying core modules
    """
    
    def __init__(self, use_gee=True):
        """
        Initialize NDVI Service
        
        Parameters:
        -----------
        use_gee : bool
            Whether to use Google Earth Engine (requires authentication)
        """
        self.use_gee = use_gee and GEE_AVAILABLE
        self.base_dir = Path(__file__).resolve().parent.parent
        # NDVI files exist in both the legacy root folder and the organized
        # datasets folder. Prefer the legacy path, but search both so the
        # service works with either repository/deployment layout.
        self.historical_data_dirs = [
            self.base_dir / "cleaned_data",
            self.base_dir / "datasets" / "cleaned_data",
        ]
        self.historical_data_dir = next(
            (directory for directory in self.historical_data_dirs if directory.is_dir()),
            self.historical_data_dirs[0],
        )
        
        # User-provided mean-NDVI classification bands.
        self.health_thresholds = {
            "Very Bad": (-1.0, 0.0),
            "Bad": (0.0, 0.1),
            "Poor": (0.1, 0.2),
            "Moderate": (0.2, 0.3),
            "Good": (0.3, 0.4),
            "Very Good": (0.4, 0.6),
            "Excellent": (0.6, 0.8),
            "Very High": (0.8, 1.0),
        }
        
        # Initialize GEE if available
        if self.use_gee:
            self._initialize_gee()
        else:
            print("📊 NDVI Service initialized with historical data only")
    
    def _initialize_gee(self):
        """Initialize Google Earth Engine"""
        try:
            ee.Initialize()
            print("✅ Google Earth Engine initialized successfully")
        except Exception as e:
            print(f"⚠️  GEE initialization failed: {e}")
            print("   Falling back to historical NDVI data")
            self.use_gee = False
    
    def calculate_ndvi_gee(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: str,
        end_date: str,
        buffer_meters: int = 1000
    ) -> Dict:
        """
        Calculate NDVI using Google Earth Engine Sentinel-2 data
        
        Parameters:
        -----------
        latitude : float
            Latitude of location
        longitude : float
            Longitude of location
        start_date : str
            Start date (YYYY-MM-DD)
        end_date : str
            End date (YYYY-MM-DD)
        buffer_meters : int
            Buffer around point in meters (default: 1000m = 1km)
        
        Returns:
        --------
        dict : NDVI data including value, date, cloud coverage, health classification
        """
        if not self.use_gee:
            return {"error": "Google Earth Engine not available", "fallback": True}
        
        try:
            # Create point geometry
            point = ee.Geometry.Point([longitude, latitude])
            area = point.buffer(buffer_meters)
            
            # Load Sentinel-2 Surface Reflectance collection
            collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                         .filterDate(start_date, end_date)
                         .filterBounds(area)
                         .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))  # <20% cloud
            
            # Check if images available
            count = collection.size().getInfo()
            if count == 0:
                return {
                    "error": "No cloud-free Sentinel-2 images available for this period",
                    "fallback": True,
                    "reason": "clouds",
                    "location": {"latitude": latitude, "longitude": longitude},
                    "period": {"start": start_date, "end": end_date}
                }
            
            # Calculate NDVI for each image
            def add_ndvi(image):
                # Sentinel-2: Band 8 (NIR), Band 4 (Red)
                nir = image.select('B8')
                red = image.select('B4')
                ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI')
                return image.addBands(ndvi)
            
            collection_ndvi = collection.map(add_ndvi)
            
            # Get most recent image
            latest = collection_ndvi.sort('system:time_start', False).first()
            
            # Extract NDVI value for the area (mean)
            ndvi_mean = latest.select('NDVI').reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=area,
                scale=10,  # Sentinel-2 resolution: 10m
                maxPixels=1e9
            ).getInfo()
            
            # Get image metadata
            image_date = datetime.fromtimestamp(
                latest.get('system:time_start').getInfo() / 1000
            )
            cloud_coverage = latest.get('CLOUDY_PIXEL_PERCENTAGE').getInfo()
            
            ndvi_value = ndvi_mean.get('NDVI')
            
            if ndvi_value is None:
                return {
                    "error": "NDVI calculation failed - no valid pixels",
                    "fallback": True,
                    "reason": "no_data"
                }
            
            # Classify health
            health_category = self.classify_crop_health(ndvi_value)
            
            return {
                "success": True,
                "source": "Sentinel-2 (Google Earth Engine)",
                "ndvi": round(ndvi_value, 3),
                "health": health_category,
                "observation_date": image_date.strftime('%Y-%m-%d'),
                "cloud_coverage_percent": round(cloud_coverage, 1),
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "buffer_meters": buffer_meters
                },
                "period_requested": {
                    "start": start_date,
                    "end": end_date
                },
                "images_available": count,
                "resolution_meters": 10,
                "satellite": "Sentinel-2"
            }
            
        except Exception as e:
            return {
                "error": f"GEE calculation failed: {str(e)}",
                "fallback": True,
                "reason": "exception"
            }
    
    def classify_crop_health(self, ndvi: float) -> Dict:
        """
        Classify crop health based on NDVI value
        
        Parameters:
        -----------
        ndvi : float
            NDVI value (0.0 to 1.0)
        
        Returns:
        --------
        dict : Health classification with category, description, color, recommendations
        """
        # 0.8 belongs to Excellent; only values strictly above 0.8 are Very High.
        if ndvi < 0.0:
            category = "Very Bad"
        elif ndvi < 0.1:
            category = "Bad"
        elif ndvi < 0.2:
            category = "Poor"
        elif ndvi < 0.3:
            category = "Moderate"
        elif ndvi < 0.4:
            category = "Good"
        elif ndvi < 0.6:
            category = "Very Good"
        elif ndvi <= 0.8:
            category = "Excellent"
        else:
            category = "Very High"
        
        # Detailed descriptions and recommendations
        health_info = {
            "Very Bad": {
                "description": "Water or non-vegetated surfaces",
                "interpretation": "Water, non-vegetated surfaces",
                "color": "#991b1b",
                "icon": "●",
                "recommendations": ["Confirm the map location and inspect the area before interpreting crop condition"],
                "action_required": True,
                "priority": "High"
            },
            "Bad": {
                "description": "Bare soil or built-up areas",
                "interpretation": "Bare soil or built-up areas",
                "color": "#dc2626",
                "icon": "●",
                "recommendations": ["Check whether the mapped area contains planted sugarcane"],
                "action_required": True,
                "priority": "High"
            },
            "Poor": {
                "description": "Very sparse vegetation",
                "interpretation": "Very sparse vegetation",
                "color": "#f97316",
                "icon": "●",
                "recommendations": ["Inspect crop establishment and check for water or nutrient stress"],
                "action_required": True,
                "priority": "Medium"
            },
            "Moderate": {
                "description": "Sparse vegetation",
                "interpretation": "Sparse vegetation",
                "color": "#ca8a04",
                "icon": "●",
                "recommendations": ["Check crop cover and monitor irrigation and nutrient conditions"],
                "action_required": True,
                "priority": "Medium"
            },
            "Good": {
                "description": "Moderate vegetation",
                "interpretation": "Moderate vegetation",
                "color": "#65a30d",
                "icon": "●",
                "recommendations": ["Continue routine crop monitoring and management"],
                "action_required": False
            },
            "Very Good": {
                "description": "Healthy vegetation",
                "interpretation": "Healthy vegetation",
                "color": "#22c55e",
                "icon": "●",
                "recommendations": ["Maintain current crop management and continue monitoring"],
                "action_required": False
            },
            "Excellent": {
                "description": "Dense, healthy vegetation",
                "interpretation": "Dense, healthy vegetation",
                "color": "#16a34a",
                "icon": "✅",
                "recommendations": [
                    "Maintain current crop management",
                    "Continue routine monitoring"
                ],
                "action_required": False
            },
            "Very High": {
                "description": "Extremely dense vegetation",
                "interpretation": "Extremely dense vegetation",
                "color": "#047857",
                "icon": "✅",
                "recommendations": ["Continue monitoring; verify dense cover reflects the intended crop area"],
                "action_required": False
            }
        }
        
        result = health_info.get(category, {
            "description": "Unknown health status",
            "color": "#6b7280",
            "icon": "?",
            "recommendations": ["NDVI value out of expected range"],
            "action_required": False
        })
        
        result["category"] = category
        result["ndvi_value"] = round(ndvi, 3)
        result["ndvi_range"] = self.health_thresholds.get(category, (0, 1))
        
        return result
    
    def _load_updated_period_ndvi(self) -> pd.DataFrame:
        """Load the active 2026 state/district NDVI snapshot."""
        data_file = self.base_dir / "datasets" / "cleaned_data" / "NDVI_all_districts_complete.csv"
        if not data_file.is_file():
            return pd.DataFrame()
        try:
            frame = pd.read_csv(data_file, dtype={"state": str, "district": str})
            required = {"state", "district", "ndvi", "start_date", "end_date"}
            return frame if required.issubset(frame.columns) else pd.DataFrame()
        except (OSError, pd.errors.ParserError, ValueError):
            return pd.DataFrame()

    @staticmethod
    def _region_key(value: str) -> str:
        return "".join(character for character in str(value).casefold() if character.isalnum())

    def get_available_regions(self) -> Dict:
        """Return states, districts, and date coverage from the active snapshot."""
        frame = self._load_updated_period_ndvi()
        if frame.empty:
            return {"period": None, "regions": []}

        regions = []
        for state, rows in frame.groupby("state", sort=True):
            regions.append({
                "state": state,
                "districts": sorted(rows["district"].dropna().astype(str).unique().tolist()),
            })
        return {
            "period": {
                "start_date": str(frame["start_date"].min()),
                "end_date": str(frame["end_date"].max()),
            },
            "regions": regions,
        }

    def get_historical_ndvi(
        self, 
        state: str, 
        district: str,
        variety: Optional[str] = None
    ) -> Dict:
        """
        Get historical NDVI data from cleaned CSV files
        
        Parameters:
        -----------
        state : str
            State name
        district : str
            District name
        variety : str, optional
            Sugarcane variety
        
        Returns:
        --------
        dict : Historical NDVI statistics
        """
        # This snapshot replaces legacy synthetic/historical district files.
        # Do not fall through to those files when a location is absent here.
        updated_frame = self._load_updated_period_ndvi()
        if updated_frame.empty:
            return {"error": "The supplied 2026 NDVI dataset is unavailable"}

        state_key = self._region_key(state)
        district_key = self._region_key(district)
        selected = updated_frame[
            updated_frame["state"].map(self._region_key).eq(state_key)
            & updated_frame["district"].map(self._region_key).eq(district_key)
        ]
        if selected.empty:
            return {
                "error": f"No supplied NDVI record for {district}, {state}",
                "available_regions": self.get_available_regions()["regions"],
            }

        row = selected.iloc[-1]
        value = float(row["ndvi"])
        health = self.classify_crop_health(value)
        period_start = str(row["start_date"])
        period_end = str(row["end_date"])
        stats = {
            "source": "User-provided district period average",
            "region": district,
            "state": state,
            "district": district,
            "total_records": 1,
            "ndvi_mean": value,
            "ndvi_median": value,
            "ndvi_std": 0.0,
            "ndvi_min": value,
            "ndvi_max": value,
            "ndvi_p25": value,
            "ndvi_p75": value,
            "observation_date": period_end,
            "start_date": period_start,
            "end_date": period_end,
            "period": {"start_date": period_start, "end_date": period_end},
            "average_health": health,
        }
        return {"success": True, "data": stats}

        # Map districts to NDVI regions (all 85 districts)
        district_to_region_file = {
            # Karnataka - 12 districts
            "Belagavi": "NDVI_belagavi_cleaned.csv",
            "Mandya": "NDVI_mandya_cleaned.csv",
            "Mysuru": "NDVI_mysuru_cleaned.csv",
            "Bagalkot": "NDVI_bagalkot_cleaned.csv",
            "Shivamogga": "NDVI_shivamogga_cleaned.csv",
            "Vijayapura": "NDVI_vijayapura_cleaned.csv",
            "Chikkamagaluru": "NDVI_chikkamagaluru_cleaned.csv",
            "Davangere": "NDVI_davangere_cleaned.csv",
            "Raichur": "NDVI_raichur_cleaned.csv",
            "Bellary": "NDVI_bellary_cleaned.csv",
            "Chitradurga": "NDVI_chitradurga_cleaned.csv",
            "Uttara Kannada": "NDVI_uttara_kannada_cleaned.csv",
            
            # Uttar Pradesh - 13 districts
            "Muzaffarnagar": "NDVI_muzaffarnagar_cleaned.csv",
            "Meerut": "NDVI_meerut_cleaned.csv",
            "Bijnor": "NDVI_bijnor_cleaned.csv",
            "Saharanpur": "NDVI_saharanpur_cleaned.csv",
            "Bareilly": "NDVI_bareilly_cleaned.csv",
            "Lakhimpur Kheri": "NDVI_lakhimpur_kheri_cleaned.csv",
            "Deoria": "NDVI_deoria_cleaned.csv",
            "Basti": "NDVI_basti_cleaned.csv",
            "Gonda": "NDVI_gonda_cleaned.csv",
            "Gorakhpur": "NDVI_gorakhpur_cleaned.csv",
            "Pilibhit": "NDVI_pilibhit_cleaned.csv",
            "Shahjahanpur": "NDVI_shahjahanpur_cleaned.csv",
            "Bulandshahr": "NDVI_bulandshahr_cleaned.csv",
            
            # Maharashtra - 12 districts
            "Kolhapur": "NDVI_kolhapur_cleaned.csv",
            "Sangli": "NDVI_sangli_cleaned.csv",
            "Satara": "NDVI_satara_cleaned.csv",
            "Ahmednagar": "NDVI_ahmednagar_cleaned.csv",
            "Pune": "NDVI_pune_cleaned.csv",
            "Solapur": "NDVI_solapur_cleaned.csv",
            "Nashik": "NDVI_nashik_cleaned.csv",
            "Jalgaon": "NDVI_jalgaon_cleaned.csv",
            "Dhule": "NDVI_dhule_cleaned.csv",
            "Nandurbar": "NDVI_nandurbar_cleaned.csv",
            "Beed": "NDVI_beed_cleaned.csv",
            "Osmanabad": "NDVI_osmanabad_cleaned.csv",
            
            # Tamil Nadu - 12 districts
            "Coimbatore": "NDVI_coimbatore_cleaned.csv",
            "Erode": "NDVI_erode_cleaned.csv",
            "Salem": "NDVI_salem_cleaned.csv",
            "Thanjavur": "NDVI_thanjavur_cleaned.csv",
            "Tiruchirappalli": "NDVI_tiruchirappalli_cleaned.csv",
            "Cuddalore": "NDVI_cuddalore_cleaned.csv",
            "Tirunelveli": "NDVI_tirunelveli_cleaned.csv",
            "Thoothukudi": "NDVI_thoothukudi_cleaned.csv",
            "Villupuram": "NDVI_villupuram_cleaned.csv",
            "Namakkal": "NDVI_namakkal_cleaned.csv",
            "Karur": "NDVI_karur_cleaned.csv",
            "Perambalur": "NDVI_perambalur_cleaned.csv",
            "Tamil Nadu": "NDVI_tamil_nadu_cleaned.csv",  # State-level fallback
            
            # Andhra Pradesh - 8 districts
            "East Godavari": "NDVI_east_godavari_cleaned.csv",
            "West Godavari": "NDVI_west_godavari_cleaned.csv",
            "Krishna": "NDVI_krishna_cleaned.csv",
            "Visakhapatnam": "NDVI_visakhapatnam_cleaned.csv",
            "Guntur": "NDVI_guntur_cleaned.csv",
            "Prakasam": "NDVI_prakasam_cleaned.csv",
            "Chittoor": "NDVI_chittoor_cleaned.csv",
            "Nellore": "NDVI_nellore_cleaned.csv",
            
            # Gujarat - 8 districts
            "Surat": "NDVI_surat_cleaned.csv",
            "Navsari": "NDVI_navsari_cleaned.csv",
            "Bharuch": "NDVI_bharuch_cleaned.csv",
            "Valsad": "NDVI_valsad_cleaned.csv",
            "Tapi": "NDVI_tapi_cleaned.csv",
            "Narmada": "NDVI_narmada_cleaned.csv",
            "Ahmedabad": "NDVI_ahmedabad_cleaned.csv",
            "Kheda": "NDVI_kheda_cleaned.csv",
            
            # Haryana - 3 districts
            "Yamuna Nagar": "NDVI_yamuna_nagar_cleaned.csv",
            "Karnal": "NDVI_karnal_cleaned.csv",
            "Kurukshetra": "NDVI_kurukshetra_cleaned.csv",
            
            # Punjab - 3 districts
            "Jalandhar": "NDVI_jalandhar_cleaned.csv",
            "Gurdaspur": "NDVI_gurdaspur_cleaned.csv",
            "Amritsar": "NDVI_amritsar_cleaned.csv",
            "Punjab": "NDVI_punjab_cleaned.csv",  # State-level fallback
            
            # Bihar - 7 districts
            "Champaran": "NDVI_champaran_cleaned.csv",
            "Siwan": "NDVI_siwan_cleaned.csv",
            "Gopalganj": "NDVI_gopalganj_cleaned.csv",
            "Muzaffarpur": "NDVI_muzaffarpur_cleaned.csv",
            "Saran": "NDVI_saran_cleaned.csv",
            "Darbhanga": "NDVI_darbhanga_cleaned.csv",
            "Vaishali": "NDVI_vaishali_cleaned.csv",
            
            # Telangana - 7 districts
            "Nizamabad": "NDVI_nizamabad_cleaned.csv",
            "Medak": "NDVI_medak_cleaned.csv",
            "Karimnagar": "NDVI_karimnagar_cleaned.csv",
            "Khammam": "NDVI_khammam_cleaned.csv",
            "Warangal": "NDVI_warangal_cleaned.csv",
            "Nalgonda": "NDVI_nalgonda_cleaned.csv",
            "Sangareddy": "NDVI_sangareddy_cleaned.csv",
            
            # Uttarakhand - 2 districts
            "Haridwar": "NDVI_haridwar_cleaned.csv",
            "Dehradun": "NDVI_dehradun_cleaned.csv",
        }
        
        # Try the explicit mapping first, then derive the usual filename from
        # the selected district. This supports districts added to geography
        # data without requiring another hard-coded mapping entry.
        ndvi_file = None
        for region, filename in district_to_region_file.items():
            if district.lower() in region.lower() or region.lower() in district.lower():
                ndvi_file = next(
                    (directory / filename for directory in self.historical_data_dirs
                     if (directory / filename).is_file()),
                    None,
                )
                break

        if ndvi_file is None:
            district_name = district.strip()
            if district_name.lower().endswith(" district"):
                district_name = district_name[:-9].strip()
            district_slug = "_".join(district_name.lower().replace("-", " ").split())
            expected_name = f"NDVI_{district_slug}_cleaned.csv"
            ndvi_file = next(
                (directory / expected_name for directory in self.historical_data_dirs
                 if (directory / expected_name).is_file()),
                None,
            )
        
        if ndvi_file and ndvi_file.exists():
            try:
                df = pd.read_csv(ndvi_file)
                
                # Calculate statistics
                stats = {
                    "source": "Historical Data",
                    "region": district,
                    "total_records": len(df),
                    "ndvi_mean": float(df['ndvi'].mean()),
                    "ndvi_median": float(df['ndvi'].median()),
                    "ndvi_std": float(df['ndvi'].std()),
                    "ndvi_min": float(df['ndvi'].min()),
                    "ndvi_max": float(df['ndvi'].max()),
                    "ndvi_p25": float(df['ndvi'].quantile(0.25)),
                    "ndvi_p75": float(df['ndvi'].quantile(0.75))
                }
                
                # Classify average health
                stats["average_health"] = self.classify_crop_health(stats["ndvi_mean"])
                
                return {"success": True, "data": stats}
                
            except Exception as e:
                return {"error": f"Failed to load historical data: {str(e)}"}

        # As a final fallback, use the combined historical file and select
        # rows for this district (case-insensitively).
        for directory in self.historical_data_dirs:
            combined_file = directory / "NDVI_all_districts_complete.csv"
            if not combined_file.is_file():
                continue
            try:
                df = pd.read_csv(combined_file)
                if "district" not in df.columns or "ndvi" not in df.columns:
                    continue
                district_names = {district.strip().casefold()}
                if district.strip().casefold().endswith(" district"):
                    district_names.add(district.strip()[:-9].strip().casefold())
                df = df[df["district"].astype(str).str.strip().str.casefold().isin(district_names)]
                if df.empty:
                    continue

                stats = {
                    "source": "Historical Data",
                    "region": district,
                    "total_records": len(df),
                    "ndvi_mean": float(df["ndvi"].mean()),
                    "ndvi_median": float(df["ndvi"].median()),
                    "ndvi_std": float(df["ndvi"].std()),
                    "ndvi_min": float(df["ndvi"].min()),
                    "ndvi_max": float(df["ndvi"].max()),
                    "ndvi_p25": float(df["ndvi"].quantile(0.25)),
                    "ndvi_p75": float(df["ndvi"].quantile(0.75)),
                }
                stats["average_health"] = self.classify_crop_health(stats["ndvi_mean"])
                return {"success": True, "data": stats}
            except Exception as e:
                return {"error": f"Failed to load combined historical data: {str(e)}"}
        
        return {
            "error": "No historical NDVI data available for this location",
            "available_regions": list(district_to_region_file.keys())
        }
    
    def get_ndvi_for_location(
        self,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        days_back: int = 30
    ) -> Dict:
        """
        Main method: Get NDVI for a location (GEE or historical fallback)
        
        Parameters:
        -----------
        latitude, longitude : float, optional
            GPS coordinates (for GEE)
        state, district : str, optional
            Location names (for historical data)
        days_back : int
            Number of days to look back for satellite images
        
        Returns:
        --------
        dict : NDVI data with health classification
        """
        result = {
            "timestamp": datetime.now().isoformat(),
            "location": {
                "state": state,
                "district": district,
                "latitude": latitude,
                "longitude": longitude
            }
        }
        
        # The supplied district-period snapshot is authoritative for this
        # endpoint; never substitute live, legacy, or generated NDVI values.
        if state and district:
            historical = self.get_historical_ndvi(state, district)
            if historical.get("success"):
                result["ndvi_data"] = historical["data"]
                result["data_source"] = "historical"
                result["note"] = "Using the supplied 2026 district-period average"
                return result
            result["error"] = historical.get("error")
            return result

        result["error"] = "State and district are required to retrieve a supplied NDVI average"
        return result


# Helper function for Flask integration
def create_ndvi_service(use_gee=False):
    """
    Factory function to create NDVI service
    Set use_gee=True only if GEE is properly authenticated
    """
    return NDVIService(use_gee=use_gee)
