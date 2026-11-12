import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { NDVI_DATA, NDVI_PERIOD, NDVI_STATE_PERIODS, NDVI_CLASSIFICATIONS, classifyMeanNdvi, formatMeanNdvi, getDistrictNdvi } from '../data/ndviDistrictData';
import { Activity, AlertTriangle, BarChart3, CalendarDays, Info, ListChecks, MapPin, Satellite, Sprout } from 'lucide-react';

const stateMapImages = {
  'Andhra Pradesh': '/images/ndvi-maps/Andhra-Pradesh.png',
  'Madhya Pradesh': '/images/ndvi-maps/Madhya-Pradesh.png',
  Bihar: '/images/ndvi-maps/Bihar.png',
  Gujarat: '/images/ndvi-maps/Gujarat.png',
  Haryana: '/images/ndvi-maps/Haryana.png',
  Karnataka: '/images/ndvi-maps/Karnataka.png',
  Maharashtra: '/images/ndvi-maps/Maharashtra.png',
  Punjab: '/images/ndvi-maps/Punjab.png',
  'Tamil Nadu': '/images/ndvi-maps/Tamil-Nadu.png',
  Telangana: '/images/ndvi-maps/Telangana.png',
  Uttarakhand: '/images/ndvi-maps/Uttarakhand.png',
  'Uttar Pradesh': '/images/ndvi-maps/Uttar-Pradesh.png',
  'West Bengal': '/images/ndvi-maps/West-Bengal.png',
};

const NDVI_GEOGRAPHY = Object.entries(NDVI_DATA).map(([state, records]) => ({
  state,
  districts: records.map(record => record.district),
}));

export default function CropHealthPage() {
  const [selectedLocation, setSelectedLocation] = useState({ state: 'Karnataka', district: 'Belagavi' });
  const { state: selectedState, district: selectedDistrict } = selectedLocation;
  const selectedRegion = NDVI_GEOGRAPHY.find(region => region.state === selectedState);
  const availableDistricts = selectedRegion?.districts || [];
  const selectedRecord = getDistrictNdvi(selectedState, selectedDistrict);
  const selectedPeriod = Object.prototype.hasOwnProperty.call(NDVI_STATE_PERIODS, selectedState)
    ? NDVI_STATE_PERIODS[selectedState]
    : NDVI_PERIOD;
  const currentNDVIValue = selectedRecord?.ndvi ?? null;
  const classification = classifyMeanNdvi(currentNDVIValue);
  const currentNDVIHealth = classification ? {
    ...classification,
    description: classification.interpretation,
    ndvi_value: currentNDVIValue,
    ndvi_range: [classification.min, classification.max],
    icon: '●',
    action_required: currentNDVIValue < 0.3,
    priority: currentNDVIValue < 0.2 ? 'High' : 'Medium',
    recommendations: currentNDVIValue < 0.3
      ? ['Review vegetation coverage and inspect crop conditions for this district.']
      : ['Continue routine crop monitoring for this district.'],
  } : null;
  const currentHealthStatus = classification?.category || 'Unavailable';
  const currentHealthColor = classification?.color || '#64748b';
  const currentVigor = currentNDVIValue == null ? null : Math.round(currentNDVIValue * 100);
  const observationStartDate = selectedPeriod?.start_date || null;
  const observationEndDate = selectedPeriod?.end_date || null;
  const observationPeriodLabel = `${NDVI_PERIOD.start_date} – ${NDVI_PERIOD.end_date}`;
  const healthThresholds = NDVI_CLASSIFICATIONS.map(item => ({
    ...item,
    ndvi_range: { min: item.min, max: item.max },
    description: item.interpretation,
    icon: '●',
    action_required: false,
  }));
  const currentNDVIData = selectedRecord ? {
    data_source: 'provided-period-mean',
    timestamp: observationEndDate ? `${observationEndDate}T00:00:00` : null,
    location: { state: selectedState, district: selectedDistrict },
    ndvi_data: {
      source: selectedRecord.source_district
        ? `User-provided district NDVI summary (${selectedRecord.source_district})`
        : 'User-provided district mean NDVI',
      ndvi_mean: selectedRecord.ndvi,
      ndvi_max: selectedRecord.ndvi_max ?? null,
      ndvi_min: selectedRecord.ndvi_min ?? null,
      satellite: selectedPeriod?.satellite || null,
      observation_date: observationEndDate,
      start_date: observationStartDate,
      end_date: observationEndDate,
      average_health: currentNDVIHealth,
    },
  } : null;

  return (
    <AppLayout>
      <div className="page-container crop-health-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Regional NDVI Monitoring</p>
            <h1 className="page-title">Crop Health & Vegetation Analysis</h1>
            <p className="page-subtitle">
              District mean NDVI values are shown for the period 1 January to 31 July 2026.
            </p>
          </div>
          <span className="badge badge-green">2026 district mean NDVI</span>
        </div>

        {/* Location Selector */}
        <div className="dash-panel" style={{ marginBottom: 24 }}>
          <div className="dash-panel-header">
              <h3><MapPin size={17} aria-hidden="true" /> Select Location for NDVI Monitoring</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, padding: '16px 24px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>State</label>
              <select 
                value={selectedState} 
                onChange={(e) => {
                  const nextState = NDVI_GEOGRAPHY.find(region => region.state === e.target.value);
                  if (nextState) {
                    setSelectedLocation({ state: nextState.state, district: nextState.districts[0] });
                  }
                }}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ddd' }}
              >
                {NDVI_GEOGRAPHY.map(item => (
                  <option key={item.state} value={item.state}>{item.state}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>District</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedLocation(location => ({ ...location, district: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ddd' }}
              >
                {availableDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* NDVI Overview - Enhanced with Real Data */}
        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))' }}>
          <div className="summary-card" style={{ '--card-accent': currentHealthColor }}>
            <div className="sc-icon"><Satellite size={19} aria-hidden="true" /></div>
            <div className="sc-body">
              <span className="sc-label">Mean NDVI value</span>
              <span className="sc-value">{formatMeanNdvi(currentNDVIValue)}</span>
              {currentNDVIData?.data_source && (
                <span style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  User-provided mean
                </span>
              )}
            </div>
          </div>

          <div className="summary-card" style={{ '--card-accent': currentHealthColor }}>
            <div className="sc-icon"><Activity size={19} aria-hidden="true" /></div>
            <div className="sc-body">
              <span className="sc-label">Crop Health Status</span>
              <span className={`sc-value crop-health-status ndvi-status-${currentHealthStatus.toLowerCase().replace(/\s+/g, '-')}`} style={{ color: currentHealthColor }}>
                {currentHealthStatus}
              </span>
            </div>
          </div>

          <div className="summary-card" style={{ '--card-accent': currentHealthColor }}>
            <div className="sc-icon"><Sprout size={19} aria-hidden="true" /></div>
            <div className="sc-body">
              <span className="sc-label">Vegetation Vigor</span>
              <span className="sc-value">{currentVigor == null ? '—' : `${currentVigor}%`}</span>
            </div>
          </div>

          <div className="summary-card" style={{ '--card-accent': '#3b82f6' }}>
            <div className="sc-icon"><CalendarDays size={19} aria-hidden="true" /></div>
            <div className="sc-body">
              <span className="sc-label">Observation Period</span>
              <span className="sc-value" style={{ fontSize: 14 }}>
                {observationPeriodLabel}
              </span>
            </div>
          </div>

        </div>

        {/* NDVI Health Classification Guide */}
        {currentNDVIHealth && (
          <div className="dash-panel" style={{ marginBottom: 24 }}>
            <div className="dash-panel-header">
              <h3><Activity size={17} aria-hidden="true" /> Current Health Analysis</h3>
              <span className={`badge crop-health-status-badge ndvi-status-${currentHealthStatus.toLowerCase().replace(/\s+/g, '-')}`} style={{ background: currentHealthColor, color: 'white' }}>
                {currentHealthStatus}
              </span>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div className="ndvi-current-analysis">
                <div style={{ flex: 2 }}>
                  <p style={{ fontSize: 16, marginBottom: 12, fontWeight: 500 }}>
                    {currentNDVIHealth.description}
                  </p>
                  <div style={{ marginBottom: 16 }}>
                    <strong>Mean NDVI value:</strong> {formatMeanNdvi(currentNDVIValue)}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <strong>Classification:</strong> {currentHealthStatus}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <strong>Interpretation:</strong> {currentNDVIHealth.interpretation || currentNDVIHealth.description}
                  </div>
                  
                  {currentNDVIHealth.action_required && (
                    <div className="ndvi-action-callout" style={{ 
                      padding: 12, 
                      background: '#fef3c7', 
                      border: '1px solid #fbbf24',
                      borderRadius: 8,
                      marginBottom: 12
                    }}>
                      <strong><AlertTriangle size={15} aria-hidden="true" /> Action Required ({currentNDVIHealth.priority} Priority)</strong>
                    </div>
                  )}

                  <div>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}><ListChecks size={15} aria-hidden="true" /> Recommendations</strong>
                    <ul style={{ marginLeft: 20, lineHeight: 1.8 }}>
                      {currentNDVIHealth.recommendations?.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Visual NDVI Gauge */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div className="ndvi-gauge-track" style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: '50%',
                    background: `conic-gradient(${currentHealthColor} ${currentVigor}%, var(--ndvi-gauge-track, #e5e7eb) ${currentVigor}%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <div className="ndvi-gauge-center" style={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: '50%', 
                      background: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div className="ndvi-gauge-value" style={{ fontSize: 32, fontWeight: 'bold', color: currentHealthColor }}>
                        {currentVigor}%
                      </div>
                    <div className="ndvi-gauge-caption" style={{ fontSize: 12, color: '#666' }}>Vigor</div>
                    </div>
                  </div>
                  <div className="ndvi-gauge-caption" style={{ fontSize: 13, color: '#666' }}>
                    Mean NDVI: {formatMeanNdvi(currentNDVIValue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dash-two-col">
          {/* Show supplied state images when present; otherwise compare supplied district means. */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3>{stateMapImages[selectedState] ? `${selectedState} NDVI Map` : `${selectedState} District NDVI`}</h3>
              <span className="badge badge-green">District mean values</span>
            </div>
            <div className="ndvi-state-map-wrap">
              {stateMapImages[selectedState] ? (
                <img
                  className="ndvi-state-map"
                  src={stateMapImages[selectedState]}
                  alt={`${selectedState} NDVI map`}
                />
              ) : (
                <div className="ndvi-district-profile" role="list" aria-label={`${selectedState} district mean NDVI values`}>
                  {availableDistricts.map(district => {
                    const record = getDistrictNdvi(selectedState, district);
                    const value = Number(record?.ndvi);
                    const color = classifyMeanNdvi(value)?.color || '#64748b';
                    const barWidth = Number.isFinite(value) ? Math.max(0, Math.min(100, value * 100)) : 0;
                    return <div className="ndvi-district-profile-row" role="listitem" key={district}>
                      <span className="ndvi-district-profile-name">{district}</span>
                      <span className="ndvi-district-profile-track"><span style={{ width: `${barWidth}%`, backgroundColor: color }} /></span>
                      <strong>{formatMeanNdvi(record?.ndvi)}</strong>
                    </div>;
                  })}
                </div>
              )}
              <div className="ndvi-state-map-caption">
                <span><strong>Selected district:</strong> {selectedDistrict || '—'} · Mean NDVI {formatMeanNdvi(currentNDVIValue)}{selectedRecord?.source_district ? ` · Source name: ${selectedRecord.source_district}` : ''}</span>
                <span><strong>Period:</strong> {observationPeriodLabel}{selectedPeriod?.satellite ? ` · ${selectedPeriod.satellite}` : ''}</span>
              </div>
            </div>
          </div>

          {/* NDVI Health Thresholds */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3><BarChart3 size={17} aria-hidden="true" /> NDVI Health Classification Standards</h3>
            </div>
            <div style={{ padding: '16px 24px' }}>
              {healthThresholds.length > 0 ? (
                <div className="ndvi-classification-table-wrap">
                  <table className="ndvi-classification-table">
                    <thead><tr><th>Mean NDVI value</th><th>Classification</th><th>Interpretation</th></tr></thead>
                    <tbody>{healthThresholds.map(threshold => (
                      <tr key={threshold.category} className={threshold.category === currentHealthStatus ? 'active' : ''}>
                        <td>{threshold.range_label || `${threshold.ndvi_range.min.toFixed(2)}–${threshold.ndvi_range.max.toFixed(2)}`}</td>
                        <td><span className="ndvi-classification-name"><i style={{ backgroundColor: threshold.color }} />{threshold.category}</span></td>
                        <td>{threshold.interpretation || threshold.description}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', padding: 24 }}>
                  Loading health thresholds...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        {currentNDVIData && (
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3><Info size={17} aria-hidden="true" /> Data Source Information</h3>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <div className="ndvi-meta-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Source</div>
                  <div style={{ fontWeight: 500 }}>
                    {currentNDVIData.ndvi_data?.source || 'User-provided 2026 NDVI averages'}
                  </div>
                </div>
                <div>
                  <div className="ndvi-meta-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Location</div>
                  <div style={{ fontWeight: 500 }}>
                    {currentNDVIData.location.district}, {currentNDVIData.location.state}
                  </div>
                </div>
                <div>
                  <div className="ndvi-meta-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Resolution</div>
                  <div style={{ fontWeight: 500 }}>
                    {currentNDVIData.ndvi_data?.resolution_meters ? `${currentNDVIData.ndvi_data.resolution_meters}m` : 'Regional Average'}
                  </div>
                </div>
                {currentNDVIData.ndvi_data?.satellite && <div>
                  <div className="ndvi-meta-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Satellite</div>
                  <div style={{ fontWeight: 500 }}>{currentNDVIData.ndvi_data.satellite}</div>
                </div>}
                <div>
                  <div className="ndvi-meta-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Observation Period</div>
                  <div style={{ fontWeight: 500 }}>{observationPeriodLabel}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ndvi-current-analysis { display: flex; align-items: flex-start; gap: 24px; }
        .ndvi-current-analysis > div { min-width: 0; max-width: 100%; }
        .ndvi-state-map-wrap { padding: 18px 24px 22px; }
        .ndvi-state-map {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: contain;
          border: 1px solid var(--border, #d8e5dc);
          border-radius: 10px;
          background: #f5faf6;
        }
        .ndvi-state-map-caption {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px 20px;
          margin-top: 14px;
          color: var(--text-secondary, #365c43);
          font-size: 13px;
          line-height: 1.6;
        }
        .ndvi-state-map-caption strong { color: var(--text-primary, #173b2a); }
        .ndvi-classification-table-wrap { overflow-x: auto; padding: 0 16px 16px; }
        .ndvi-classification-table { width: 100%; min-width: 540px; border-collapse: collapse; color: var(--text-primary); }
        .ndvi-classification-table th,
        .ndvi-classification-table td { padding: 11px 12px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: middle; }
        .ndvi-classification-table th { color: var(--text-secondary); font-size: 12px; font-weight: 700; }
        .ndvi-classification-table td { font-size: 13px; }
        .ndvi-classification-table tr.active { background: var(--bg-secondary); font-weight: 600; }
        .ndvi-classification-name { display: inline-flex; align-items: center; gap: 8px; }
        .ndvi-classification-name i { width: 9px; height: 9px; flex: 0 0 9px; border-radius: 50%; }
        @media (max-width: 640px) {
          .ndvi-current-analysis { flex-direction: column; }
          .ndvi-state-map-wrap { padding: 14px; }
          .ndvi-state-map-caption { display: grid; }
        }
        .ndvi-map-visual {
          padding: 24px;
        }
        .ndvi-map-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .map-zone {
          padding: 20px;
          border-radius: 12px;
          border: 2px solid;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .map-zone:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .map-zone-active {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transform: scale(1.02);
        }
        .map-zone-label {
          font-weight: 600;
          font-size: 16px;
        }
        .map-zone-ndvi {
          font-size: 20px;
          font-weight: 700;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          align-self: flex-start;
        }
        .status-healthy { background: #dcfce7; color: #166534; }
        .status-good { background: #ecfccb; color: #3f6212; }
        .status-moderate { background: #fef3c7; color: #92400e; }
        .status-poor { background: #fed7aa; color: #9a3412; }
        .status-critical { background: #fecaca; color: #991b1b; }
        .ndvi-map-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #666;
        }
      `}</style>
    </AppLayout>
  );
}
