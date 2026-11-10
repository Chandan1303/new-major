"""
NDVI Data Fetcher for Sugarcane Dataset
========================================

Enriches records only with the supplied 2026 district-period NDVI averages.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

class NDVIDataFetcher:
    """
    Fetch and process NDVI data for sugarcane fields
    """
    
    def __init__(self, enriched_csv_path, ndvi_data_dir='cleaned_data'):
        """
        Initialize NDVI fetcher
        
        Parameters:
        -----------
        enriched_csv_path : str
            Path to enriched dataset
        ndvi_data_dir : str
            Directory containing NDVI CSV files
        """
        self.df = pd.read_csv(enriched_csv_path)
        self.ndvi_data_dir = ndvi_data_dir
        
        print(f"📂 Loaded {len(self.df)} records for NDVI enrichment")
        
        # The supplied district-period averages are the sole NDVI source.
        self.period_ndvi_data = self._load_period_ndvi_data()

    @staticmethod
    def _normalize_location(value):
        return ''.join(character for character in str(value).casefold() if character.isalnum())

    def _load_period_ndvi_data(self):
        """Load the active user-provided state/district NDVI period averages."""
        repository_dir = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            os.path.join(repository_dir, 'datasets', 'cleaned_data', 'NDVI_all_districts_complete.csv'),
            os.path.join(self.ndvi_data_dir, 'NDVI_all_districts_complete.csv'),
        ]
        for filepath in candidates:
            if os.path.isfile(filepath):
                frame = pd.read_csv(filepath, dtype={'state': str, 'district': str})
                required = {'state', 'district', 'ndvi', 'start_date', 'end_date'}
                missing = required.difference(frame.columns)
                if missing:
                    raise ValueError(
                        f"NDVI period dataset is missing required columns: {', '.join(sorted(missing))}"
                    )
                if frame.empty:
                    raise ValueError(f"NDVI period dataset contains no records: {filepath}")
                frame['ndvi'] = pd.to_numeric(frame['ndvi'], errors='raise')
                return frame
        raise FileNotFoundError(
            "The supplied NDVI period dataset was not found in datasets/cleaned_data"
        )
    
    def _load_ndvi_datasets(self):
        """Load all available NDVI CSV files"""
        ndvi_files = [
            'NDVI_belagavi_cleaned.csv',
            'NDVI_mandya_cleaned.csv',
            'NDVI_punjab_cleaned.csv',
            'NDVI_tamil_nadu_cleaned.csv',
            'productivity_NDVI_cleaned.csv'
        ]
        
        datasets = {}
        
        for filename in ndvi_files:
            filepath = os.path.join(self.ndvi_data_dir, filename)
            if os.path.exists(filepath):
                try:
                    df = pd.read_csv(filepath)
                    region = filename.split('_')[1].split('.')[0]
                    datasets[region] = df
                    print(f"  ✅ Loaded {filename}: {len(df)} records")
                except Exception as e:
                    print(f"  ⚠️  Failed to load {filename}: {str(e)}")
        
        return datasets
    
    def match_ndvi_from_existing(self, row):
        """
        Try to match NDVI data from existing datasets
        
        Parameters:
        -----------
        row : pd.Series
            Row from enriched dataset
            
        Returns:
        --------
        dict : NDVI features if found
        """
        district = str(row.get('district', '')).lower()
        state = str(row.get('state', '')).lower()
        year = row.get('year')

        # These are period averages, not a time series. Use the exact supplied
        # NDVI value and leave per-day/stage features unavailable.
        if not self.period_ndvi_data.empty and state and district:
            state_key = self._normalize_location(state)
            district_key = self._normalize_location(district)
            matched_period = self.period_ndvi_data[
                self.period_ndvi_data['state'].map(self._normalize_location).eq(state_key)
                & self.period_ndvi_data['district'].map(self._normalize_location).eq(district_key)
            ]
            if not matched_period.empty:
                return {'ndvi_mean': float(matched_period.iloc[-1]['ndvi'])}
        return None
    
    def _extract_ndvi_features(self, ndvi_df):
        """Extract NDVI features from matched dataset"""
        features = {}
        
        # Look for NDVI columns
        ndvi_cols = [col for col in ndvi_df.columns if 'ndvi' in col.lower()]
        
        if ndvi_cols:
            # Extract values
            ndvi_values = []
            for col in ndvi_cols:
                values = pd.to_numeric(ndvi_df[col], errors='coerce').dropna()
                ndvi_values.extend(values.tolist())
            
            if ndvi_values:
                # Filter valid NDVI range (-1 to 1)
                ndvi_values = [v for v in ndvi_values if -1 <= v <= 1]
                
                if ndvi_values:
                    features['ndvi_mean'] = np.mean(ndvi_values)
                    features['ndvi_max'] = np.max(ndvi_values)
                    features['ndvi_min'] = np.min(ndvi_values)
                    features['ndvi_std'] = np.std(ndvi_values)
                    
                    # Estimate time-series values
                    if len(ndvi_values) >= 5:
                        features['ndvi_30d'] = ndvi_values[0] if len(ndvi_values) > 0 else np.nan
                        features['ndvi_60d'] = ndvi_values[1] if len(ndvi_values) > 1 else np.nan
                        features['ndvi_90d'] = ndvi_values[2] if len(ndvi_values) > 2 else np.nan
                        features['ndvi_120d'] = ndvi_values[3] if len(ndvi_values) > 3 else np.nan
                        features['ndvi_150d'] = ndvi_values[4] if len(ndvi_values) > 4 else np.nan
                        
                        # Calculate trend
                        if len(ndvi_values) >= 2:
                            features['ndvi_trend'] = ndvi_values[-1] - ndvi_values[0]
        
        return features if features else None
    
    def simulate_realistic_ndvi(self, row):
        """
        Simulate realistic NDVI values based on sugarcane growth patterns
        
        Sugarcane NDVI pattern:
        - Month 1-2: 0.2-0.35 (establishment)
        - Month 3-4: 0.4-0.6 (vegetative growth)
        - Month 5-8: 0.65-0.85 (peak growth)
        - Month 9-11: 0.5-0.7 (maturation)
        - Month 12: 0.4-0.6 (pre-harvest)
        
        Parameters:
        -----------
        row : pd.Series
            Row from enriched dataset
            
        Returns:
        --------
        dict : Simulated NDVI features
        """
        # Base NDVI influenced by factors
        base_ndvi = 0.65
        
        # Adjust based on available data
        if pd.notna(row.get('rainfall_mm')):
            rainfall = row['rainfall_mm']
            if rainfall < 1000:
                base_ndvi -= 0.15
            elif rainfall > 2000:
                base_ndvi += 0.05
        
        if pd.notna(row.get('irrigation_availability')):
            if row['irrigation_availability'] == 1:
                base_ndvi += 0.1
        
        if pd.notna(row.get('soil_ph')):
            soil_ph = row['soil_ph']
            if 6.0 <= soil_ph <= 7.5:
                base_ndvi += 0.05
        
        # Add variety influence
        variety = str(row.get('variety', ''))
        if 'Co 86032' in variety or 'CoM 0265' in variety:
            base_ndvi += 0.05
        
        # Generate realistic time series
        np.random.seed(int(row.get('record_id', 0)) if pd.notna(row.get('record_id')) else 42)
        
        # Growth curve
        days = [30, 60, 90, 120, 150]
        growth_multipliers = [0.5, 0.75, 1.0, 0.9, 0.8]
        noise = 0.05
        
        ndvi_values = []
        for multiplier in growth_multipliers:
            value = base_ndvi * multiplier + np.random.uniform(-noise, noise)
            value = max(0.1, min(0.95, value))  # Clip to valid range
            ndvi_values.append(value)
        
        features = {
            'ndvi_30d': ndvi_values[0],
            'ndvi_60d': ndvi_values[1],
            'ndvi_90d': ndvi_values[2],
            'ndvi_120d': ndvi_values[3],
            'ndvi_150d': ndvi_values[4],
            'ndvi_mean': np.mean(ndvi_values),
            'ndvi_max': np.max(ndvi_values),
            'ndvi_min': np.min(ndvi_values),
            'ndvi_std': np.std(ndvi_values),
            'ndvi_trend': ndvi_values[-1] - ndvi_values[0],
        }
        
        return features
    
    def enrich_dataset_with_ndvi(self):
        """
        Enrich dataset with NDVI data
        
        Matching records receive their supplied district average. Unknown
        locations remain without NDVI values; no fallback values are generated.
        
        Returns:
        --------
        pd.DataFrame : NDVI-enriched dataset
        """
        print("\n🛰️  Enriching dataset with NDVI data...")
        print("=" * 60)
        
        enriched_records = []
        matched_count = 0
        unavailable_count = 0
        
        for idx, row in self.df.iterrows():
            row_dict = row.to_dict()
            for column in list(row_dict):
                if column.lower().startswith('ndvi') or column.lower() == 'vegetation_health':
                    row_dict.pop(column)
            
            ndvi_features = self.match_ndvi_from_existing(row)
            
            if ndvi_features:
                matched_count += 1
            else:
                ndvi_features = {}
                unavailable_count += 1
            
            # Add NDVI features
            row_dict.update(ndvi_features)
            
            # Add vegetation health category
            if pd.notna(ndvi_features.get('ndvi_mean')):
                ndvi_mean = ndvi_features['ndvi_mean']
                if ndvi_mean > 0.6:
                    row_dict['vegetation_health'] = 'Good'
                elif ndvi_mean > 0.4:
                    row_dict['vegetation_health'] = 'Moderate'
                else:
                    row_dict['vegetation_health'] = 'Poor'
            
            enriched_records.append(row_dict)
            
            if (idx + 1) % 1000 == 0:
                print(f"  Processed {idx + 1}/{len(self.df)} records...")
        
        enriched_df = pd.DataFrame(enriched_records)
        
        print(f"\n✅ NDVI enrichment complete:")
        print(f"   Matched supplied district averages: {matched_count}")
        print(f"   No supplied district value: {unavailable_count}")
        
        return enriched_df
    
    def save_enriched_dataset(self, enriched_df, output_path):
        """Save NDVI-enriched dataset"""
        enriched_df.to_csv(output_path, index=False)
        print(f"\n💾 Saved NDVI-enriched dataset: {output_path}")
        
        # Print NDVI summary
        ndvi_cols = ['ndvi_mean', 'ndvi_max', 'ndvi_90d']
        print("\n📊 NDVI Data Summary:")
        for col in ndvi_cols:
            if col in enriched_df.columns:
                completeness = enriched_df[col].notna().mean() * 100
                mean_val = enriched_df[col].mean()
                print(f"   {col:20s}: {completeness:5.1f}% complete, mean = {mean_val:.3f}")
        
        # Vegetation health distribution
        if 'vegetation_health' in enriched_df.columns:
            print("\n🌱 Vegetation Health Distribution:")
            health_dist = enriched_df['vegetation_health'].value_counts()
            for health, count in health_dist.items():
                pct = count / len(enriched_df) * 100
                print(f"   {health:15s}: {count:6d} ({pct:5.1f}%)")


def main():
    """Main execution"""
    print("=" * 60)
    print("🛰️  NDVI DATA ENRICHMENT")
    print("=" * 60)
    
    # Initialize fetcher
    fetcher = NDVIDataFetcher(
        'enriched_data/weather_enriched_dataset.csv',
        ndvi_data_dir='cleaned_data'
    )
    
    # Enrich dataset
    enriched_df = fetcher.enrich_dataset_with_ndvi()
    
    # Save result
    fetcher.save_enriched_dataset(
        enriched_df,
        'enriched_data/ndvi_enriched_dataset.csv'
    )
    
    print("\n✅ NDVI enrichment complete!")
    print("\nOnly supplied 2026 district-period averages were used; other locations remain unpopulated.")


if __name__ == "__main__":
    main()
