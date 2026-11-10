export const soilGuides = [
  {
    id: 'alluvial',
    title: 'Alluvial soil',
    imageFile: 'alluvial.webp',
    summary: 'River-deposited soils with texture and drainage that can vary considerably from field to field.',
    regions: 'Indo-Gangetic and Brahmaputra plains, and river deltas across northern, eastern and coastal India. Examples include Punjab, Haryana, Uttar Pradesh, Bihar, West Bengal, Odisha and the Godavari–Krishna delta areas.',
    caneNote: 'Deep, well-drained loam with good water-holding capacity is favourable for cane. Check for local salinity, sodicity, hardpan or waterlogging before choosing a field.',
    fieldTip: 'Use a soil test and keep surface drains open after heavy rain; “alluvial” alone does not describe a field’s fertility or drainage.'
  },
  {
    id: 'black-cotton',
    title: 'Black soil (Vertisol)',
    imageFile: 'black-cotton.jpg',
    summary: 'Clay-rich soil that holds moisture and may swell when wet, then form deep cracks as it dries.',
    regions: 'Deccan and central-western India, especially Maharashtra, Madhya Pradesh and Gujarat, with black-soil tracts in parts of Karnataka and other states.',
    caneNote: 'Its water storage can support cane, but heavy or poorly drained plots can stay waterlogged. Field drainage and irrigation timing matter.',
    fieldTip: 'Avoid working very wet clay. Check infiltration and drainage, and use soil-test recommendations for nutrient management.'
  },
  {
    id: 'red',
    title: 'Red loam soil',
    imageFile: 'red.webp',
    summary: 'Iron-rich soils ranging from sandy loam to clay loam; depth, acidity and water retention differ by location.',
    regions: 'Broad areas of Karnataka, Tamil Nadu, Andhra Pradesh and Telangana, plus parts of Odisha, Maharashtra, Madhya Pradesh and eastern India.',
    caneNote: 'Cane can be grown where soil is sufficiently deep and water is available. Lighter profiles may dry faster, so match irrigation to rooting depth and weather.',
    fieldTip: 'Base lime, compost or fertilizer decisions on a current soil test; red colour is not a nutrient diagnosis.'
  },
  {
    id: 'clay-loam',
    title: 'Clay loam',
    imageFile: 'clay-loam.webp',
    summary: 'A balanced texture with more clay than loam; it can hold moisture while still supporting root growth when structure and drainage are good.',
    regions: 'Occurs in many agricultural regions, including parts of the Indo-Gangetic plains, central India and peninsular river basins; it is not confined to one state.',
    caneNote: 'Can suit sugarcane where the profile is deep and well drained. Heavy compaction or standing water can restrict roots.',
    fieldTip: 'Avoid traffic on wet soil, maintain field drains and use a soil test to guide nutrient applications.'
  },
  {
    id: 'sandy-loam',
    title: 'Sandy loam',
    imageFile: 'sandy-loam.jpg',
    summary: 'A lighter-textured soil that drains readily and is easier to work, but usually stores less water than clay-rich soil.',
    regions: 'Found in parts of north-western and peninsular India, coastal belts and alluvial landscapes; local texture can change within a field.',
    caneNote: 'Sugarcane can grow where rooting depth, irrigation supply and nutrient management are adequate. Light soils may need more careful irrigation scheduling.',
    fieldTip: 'Check soil moisture near the root zone and split nutrient applications as recommended locally to reduce losses.'
  }
];

export const plantingWindows = [
  {
    id: 'north-spring',
    region: 'North & subtropical India',
    season: 'Spring planting',
    months: 'February–mid-March',
    detail: 'A common spring window in northern cane-growing areas. Late planting after wheat harvest needs local, variety-specific advice and timely establishment.'
  },
  {
    id: 'north-autumn',
    region: 'North & subtropical India',
    season: 'Autumn planting',
    months: 'September–October',
    detail: 'An established regional window in parts of the subtropical belt. Cold conditions slow early growth, so use locally recommended varieties and planting material.'
  },
  {
    id: 'tropical-kharif',
    region: 'Tropical & peninsular India',
    season: 'Kharif / monsoon planting',
    months: 'June–July; often July–August in the south',
    detail: 'Rain can support establishment, but provide drainage during intense monsoon spells and irrigate only when rainfall and field moisture are insufficient.'
  },
  {
    id: 'maharashtra',
    region: 'Maharashtra seasonal systems',
    season: 'Adsali · pre-seasonal · Suru',
    months: 'July–August · October–November · January–February',
    detail: 'These are locally named planting systems. Duration and recommended dates vary by variety and district; follow the current MPKV, VSI, mill or KVK package for your location.'
  }
];

export const irrigationMethods = [
  {
    id: 'furrow',
    name: 'Furrow irrigation',
    type: 'Surface method',
    detail: 'Water flows through channels beside the cane rows. It is familiar and simple to operate, but field levelling, soil intake and avoiding prolonged ponding affect uniformity.'
  },
  {
    id: 'alternate-furrow',
    name: 'Alternate / skip furrow',
    type: 'Water-saving surface practice',
    detail: 'Irrigate alternate furrows according to the locally tested schedule. IISR reports water savings in its reference conditions; do not adopt a fixed skip pattern if the crop or soil is showing stress.'
  },
  {
    id: 'drip',
    name: 'Drip & fertigation',
    type: 'Micro-irrigation',
    detail: 'Apply water near the root zone through laterals; fertigation can be scheduled with a soil-test-based nutrient plan. Correct filtration, pressure and maintenance are essential.'
  },
  {
    id: 'sprinkler',
    name: 'Sprinkler irrigation',
    type: 'Pressurised method',
    detail: 'Can suit uneven or undulating land where surface levelling is difficult. Select equipment and operating times for local wind, soil intake and crop stage.'
  }
];

export const guideSources = [
  {
    title: 'ICAR Kharif Agro-Advisories for Farmers 2025',
    organization: 'Indian Council of Agricultural Research',
    url: 'https://icar.gov.in/sites/default/files/Circulars/ICAR%20En-Kharif%20Agro-Advisories%20for%20Farmers%202025.pdf',
    supports: 'Kharif planting, well-drained loam, furrow/trench planting, drainage and residue mulching.'
  },
  {
    title: 'Vegetables intercropping with autumn-planted sugarcane',
    organization: 'ICAR–Indian Institute of Sugarcane Research',
    url: 'https://icar.gov.in/sites/default/files/inline-files/Vegetables-intercropping-with-autumn-planted-sugarcane.pdf',
    supports: 'September–October autumn planting in subtropical India.'
  },
  {
    title: 'ICAR–IISR interventions in Narsinghpur, Madhya Pradesh',
    organization: 'Indian Council of Agricultural Research',
    url: 'https://icar.gov.in/en/node/5746',
    supports: 'Local September–October planting and sprinkler irrigation on undulating land.'
  },
  {
    title: 'Skip-furrow method of irrigation',
    organization: 'Indian Institute of Sugarcane Research, Lucknow',
    url: 'https://www.indiascienceandtechnology.gov.in/technologies/skip-furrow-method-irrigation-water-saving-sugarcane-production-technology',
    supports: 'Alternate/skip furrow method; reported savings are specific to the reference practice.'
  },
  {
    title: 'India’s major soil types and distribution',
    organization: 'Press Information Bureau, Government of India',
    url: 'https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=159311&id=159311&lang=1&reg=31',
    supports: 'Broad occurrence of alluvial, black, red and laterite soils across India.'
  },
  {
    title: 'EnviStats India 2024: Environment Accounts',
    organization: 'Ministry of Statistics and Programme Implementation',
    url: 'https://www.mospi.gov.in/sites/default/files/publication_reports/EnviStats_India_2024.pdf',
    supports: 'General soil characteristics, formation and distribution.'
  }
];
