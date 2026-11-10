import { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Droplets,
  FlaskConical,
  MapPin,
  Sprout,
  Tractor,
  Waves,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { guideSources, irrigationMethods, plantingWindows, soilGuides } from '../data/agronomyGuide';

function GuideImage({ folder, file, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="agronomy-image-placeholder" role="img" aria-label={`${alt} image could not be loaded`}>
        {folder === 'soils' ? <LayersIcon /> : <Sprout size={22} />}
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      className="agronomy-guide-image"
      src={`/images/${folder}/${encodeURIComponent(file)}`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function LayersIcon() {
  return <FlaskConical size={22} aria-hidden="true" />;
}

export default function AgronomyGuidePage() {
  return (
    <AppLayout>
      <div className="page-container agronomy-guide-page">
        <header className="page-header agronomy-guide-header">
          <div>
            <p className="eyebrow"><BookOpen size={14} /> Farmer field guide</p>
            <h1 className="page-title">Soil, Seasons & Irrigation</h1>
            <p className="page-subtitle">A practical reference to Indian soils, sugarcane planting seasons, and common irrigation methods.</p>
          </div>
        </header>

        <section className="agronomy-guide-callout" aria-label="Using this guide">
          <span className="agronomy-callout-icon"><FlaskConical size={18} /></span>
          <p><strong>Start with the field, not the soil’s colour.</strong> Soil groups cover broad areas and can change over short distances. Use a current soil test and local KVK, agriculture department or sugar-mill guidance before making irrigation or input decisions.</p>
        </section>

        <section className="agronomy-guide-section" aria-labelledby="soil-guide-heading">
          <div className="agronomy-section-heading">
            <div><span className="agronomy-section-kicker">Know the ground</span><h2 id="soil-guide-heading">Indian soils and field textures</h2></div>
            <p>Examples and broad regions; local soil tests describe your plot.</p>
          </div>
          <div className="agronomy-soil-grid">
            {soilGuides.map((soil, index) => (
              <article className="agronomy-soil-card" key={soil.id}>
                <div className="agronomy-soil-media">
                  <GuideImage folder="soils" file={soil.imageFile} alt={soil.title} />
                  <span className="agronomy-image-index">0{index + 1}</span>
                </div>
                <div className="agronomy-soil-body">
                  <h3>{soil.title}</h3>
                  <p className="agronomy-soil-summary">{soil.summary}</p>
                  <div className="agronomy-guide-detail"><span><MapPin size={14} /> Where it occurs</span><p>{soil.regions}</p></div>
                  <div className="agronomy-guide-detail"><span><Sprout size={14} /> What it means for cane</span><p>{soil.caneNote}</p></div>
                  <p className="agronomy-field-tip"><strong>Field note</strong>{soil.fieldTip}</p>
                </div>
              </article>
            ))}
          </div>
          <aside className="agronomy-laterite-note"><strong>Also found in India: laterite soils</strong><span>Laterite occurs in high-rainfall parts of the Western and Eastern Ghats, including areas of Kerala, Karnataka, Goa, Maharashtra and Odisha. Acidity, soil depth and nutrient status vary, so check the actual plot and soil-test result.</span></aside>
        </section>

        <section className="agronomy-guide-section" aria-labelledby="season-guide-heading">
          <div className="agronomy-section-heading">
            <div><span className="agronomy-section-kicker">Plan the planting</span><h2 id="season-guide-heading">Sugarcane planting seasons</h2></div>
            <p>These are broad regional references for India; variety and district advisories take priority.</p>
          </div>
          <div className="agronomy-season-grid">
            {plantingWindows.map((window, index) => (
              <article className="agronomy-season-card" key={window.id}>
                <div className="agronomy-season-top"><span className="agronomy-season-icon"><CalendarDays size={18} /></span><span className="agronomy-season-number">0{index + 1}</span></div>
                <span className="agronomy-season-region">{window.region}</span>
                <h3>{window.season}</h3>
                <strong className="agronomy-season-months">{window.months}</strong>
                <p>{window.detail}</p>
              </article>
            ))}
          </div>
          <div className="agronomy-practice-note"><CheckCircle2 size={17} /><p><strong>Before planting:</strong> confirm variety and seed-cane availability with the local mill or extension office; prepare drainage and plant into suitable soil moisture. If the soil is dry after planting, irrigate for establishment according to local advice.</p></div>
        </section>

        <section className="agronomy-guide-section" aria-labelledby="irrigation-guide-heading">
          <div className="agronomy-section-heading">
            <div><span className="agronomy-section-kicker">Use water carefully</span><h2 id="irrigation-guide-heading">Irrigation methods used in India</h2></div>
            <p>Choose by field slope, soil intake, water supply, and available equipment.</p>
          </div>
          <div className="agronomy-irrigation-grid">
            {irrigationMethods.map((method, index) => (
              <article className="agronomy-irrigation-card" key={method.id}>
                <span className="agronomy-irrigation-icon">{index === 0 ? <Waves size={18} /> : index === 1 ? <Droplets size={18} /> : index === 2 ? <Droplets size={18} /> : <Tractor size={18} />}</span>
                <div><span className="agronomy-irrigation-type">{method.type}</span><h3>{method.name}</h3><p>{method.detail}</p></div>
              </article>
            ))}
          </div>
          <div className="agronomy-water-principles">
            <h3>Good water-management habits</h3>
            <ul>
              <li>Use rainfall and a field moisture check before irrigating; do not follow one calendar interval for every soil and season.</li>
              <li>Keep drains clear during heavy rain, especially in clay-rich and low-lying fields.</li>
              <li>Trash mulch can help conserve moisture; ICAR includes it among its cane-management practices.</li>
              <li>For drip or fertigation, maintain filters and follow a soil-test-based nutrient plan.</li>
            </ul>
          </div>
        </section>

        <section className="agronomy-sources-panel" aria-labelledby="agronomy-sources-heading">
          <div className="agronomy-sources-title"><div><span className="agronomy-section-kicker">Check the source</span><h2 id="agronomy-sources-heading">References for this guide</h2></div><span>Extension-level summaries</span></div>
          <div className="agronomy-sources-list">
            {guideSources.map(source => (
              <a href={source.url} key={source.url} target="_blank" rel="noreferrer">
                <span><strong>{source.title}</strong><small>{source.organization} · {source.supports}</small></span>
                <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </section>

        <p className="agronomy-guide-footnote">This guide is general information, not a field prescription. For variety-specific planting dates, irrigation scheduling, soil amendments and fertilizer rates, follow current district recommendations and a laboratory soil test.</p>
      </div>
    </AppLayout>
  );
}
