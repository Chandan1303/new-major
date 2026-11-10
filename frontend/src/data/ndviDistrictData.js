export const NDVI_PERIOD = {
  start_date: '2026-01-01',
  end_date: '2026-07-31',
};

// The page uses these supplied district means directly; it does not request NDVI from an API.
export const NDVI_DATA = {
  Karnataka: [
    { district: 'Bagalkot', ndvi: 0.3222153261 },
    { district: 'Ballari', ndvi: 0.2773602396 },
    { district: 'Belagavi', ndvi: 0.3665523552 },
    { district: 'Chikkamagaluru', ndvi: 0.5806896507 },
    { district: 'Chitradurga', ndvi: 0.2931708358 },
    { district: 'Davangere', ndvi: 0.4062810241 },
    { district: 'Mandya', ndvi: 0.4390224345 },
    { district: 'Mysuru', ndvi: 0.3917571726 },
    { district: 'Raichur', ndvi: 0.2698424792 },
    { district: 'Shivamogga', ndvi: 0.5693782977 },
    { district: 'Uttara Kannada', ndvi: 0.6393709791 },
    { district: 'Vijayapura', ndvi: 0.2710065789 },
  ],
  Maharashtra: [
    { district: 'Kolhapur', ndvi: 0.436433739 },
    { district: 'Latur', ndvi: 0.2813445117 },
    { district: 'Nandurbar', ndvi: 0.2849856316 },
    { district: 'Nashik', ndvi: 0.2919048 },
    { district: 'Pune', ndvi: 0.3240667838 },
    { district: 'Sangli', ndvi: 0.2992746343 },
    { district: 'Satara', ndvi: 0.3305391771 },
    { district: 'Solapur', ndvi: 0.3048386021 },
    { district: 'Dhule', ndvi: 0.2615914584 },
    { district: 'Jalgaon', ndvi: 0.322272797 },
  ],
  Punjab: [
    { district: 'Jalandhar', ndvi: 0.3539970812 },
    { district: 'Amritsar', ndvi: 0.3174136619 },
    { district: 'Gurdaspur', ndvi: 0.3178543346 },
  ],
  'Tamil Nadu': [
    { district: 'Namakkal', ndvi: 0.404822161 },
    { district: 'Tirunelveli', ndvi: 0.42650801 },
    { district: 'Villupuram', ndvi: 0.4267105792 },
    { district: 'Perambalur', ndvi: 0.3724806864 },
    { district: 'Salem', ndvi: 0.4502622926 },
    { district: 'Thanjavur', ndvi: 0.4670028173 },
    { district: 'Coimbatore', ndvi: 0.4548548161 },
    { district: 'Cuddalore', ndvi: 0.4229058135 },
    { district: 'Erode', ndvi: 0.4511413782 },
    { district: 'Karur', ndvi: 0.307236513 },
  ],
  Telangana: [
    { district: 'Karimnagar', ndvi: 0.4208811149 },
    { district: 'Khammam', ndvi: 0.4382352654 },
    { district: 'Medak', ndvi: 0.3430323875 },
    { district: 'Nalgonda', ndvi: 0.3439808024 },
    { district: 'Nizamabad', ndvi: 0.3533146683 },
    { district: 'Sangareddy', ndvi: 0.3060504061 },
  ],
  Uttarakhand: [
    { district: 'Dehradun', ndvi: 0.5163441559 },
    { district: 'Haridwar', ndvi: 0.4583160778 },
  ],
  'Uttar Pradesh': [
    { district: 'Gonda', ndvi: 0.3639276439 },
    { district: 'Gorakhpur', ndvi: 0.2813113513 },
    { district: 'Kheri', ndvi: 0.4246016185 },
    { district: 'Meerut', ndvi: 0.4430168419 },
    { district: 'Muzaffarnagar', ndvi: 0.4750629753 },
    { district: 'Pilibhit', ndvi: 0.4213218191 },
    { district: 'Saharanpur', ndvi: 0.4815963715 },
    { district: 'Bareilly', ndvi: 0.3877484429 },
    { district: 'Basti', ndvi: 0.3090536501 },
    { district: 'Bijnor', ndvi: 0.4355895746 },
    { district: 'Bulandshahr', ndvi: 0.434996175 },
    { district: 'Deoria', ndvi: 0.3117822169 },
    { district: 'Shahjahanpur', ndvi: 0.3369580705 },
  ],
  Haryana: [
    { district: 'Yamunanagar', ndvi: 0.3954134506 },
    { district: 'Karnal', ndvi: 0.2799353682 },
    { district: 'Kurukshetra', ndvi: 0.3220680082 },
  ],
  Gujarat: [
    { district: 'Bharuch', ndvi: 0.3211986289 },
    { district: 'Kheda', ndvi: 0.3902418826 },
    { district: 'Narmada', ndvi: 0.3300752917 },
    { district: 'Navsari', ndvi: 0.3887613909 },
    { district: 'Surat', ndvi: 0.3458372625 },
    { district: 'Tapi', ndvi: 0.3081301107 },
    { district: 'Valsad', ndvi: 0.3448248947 },
    { district: 'Ahmadabad', ndvi: 0.2459573352 },
  ],
  Bihar: [
    { district: 'Saran', ndvi: 0.3888553457 },
    { district: 'Darbhanga', ndvi: 0.4530300141 },
    { district: 'Gopalganj', ndvi: 0.3617447058 },
    { district: 'Muzaffarpur', ndvi: 0.4624524438 },
    { district: 'Siwan', ndvi: 0.378048779 },
    { district: 'Vaishali', ndvi: 0.4206175844 },
  ],
  'Andhra Pradesh': [
    { district: 'Prakasam', ndvi: 0.3371743566 },
    { district: 'Visakhapatnam', ndvi: 0.5286817611 },
    { district: 'West Godavari', ndvi: 0.44458735 },
    { district: 'Chittoor', ndvi: 0.3917790847 },
    { district: 'East Godavari', ndvi: 0.4927781276 },
    { district: 'Guntur', ndvi: 0.3735266805 },
    { district: 'Krishna', ndvi: 0.3581085568 },
  ],
};

export const NDVI_CLASSIFICATIONS = [
  { range_label: '< 0.0', min: -1, max: 0, category: 'Very Bad', interpretation: 'Water, non-vegetated surfaces', color: '#991b1b' },
  { range_label: '0.0–0.1', min: 0, max: 0.1, category: 'Bad', interpretation: 'Bare soil or built-up areas', color: '#dc2626' },
  { range_label: '0.1–0.2', min: 0.1, max: 0.2, category: 'Poor', interpretation: 'Very sparse vegetation', color: '#f97316' },
  { range_label: '0.2–0.3', min: 0.2, max: 0.3, category: 'Moderate', interpretation: 'Sparse vegetation', color: '#ca8a04' },
  { range_label: '0.3–0.4', min: 0.3, max: 0.4, category: 'Good', interpretation: 'Moderate vegetation', color: '#65a30d' },
  { range_label: '0.4–0.6', min: 0.4, max: 0.6, category: 'Very Good', interpretation: 'Healthy vegetation', color: '#22c55e' },
  { range_label: '0.6–0.8', min: 0.6, max: 0.8, category: 'Excellent', interpretation: 'Dense, healthy vegetation', color: '#16a34a' },
  { range_label: '> 0.8', min: 0.8, max: 1, category: 'Very High', interpretation: 'Extremely dense vegetation', color: '#047857' },
];

export function classifyMeanNdvi(value) {
  if (!Number.isFinite(Number(value))) return null;
  const ndvi = Number(value);
  if (ndvi < 0) return NDVI_CLASSIFICATIONS[0];
  if (ndvi > 0.8) return NDVI_CLASSIFICATIONS[7];
  return NDVI_CLASSIFICATIONS.find((item, index) =>
    ndvi >= item.min && (index === NDVI_CLASSIFICATIONS.length - 2 ? ndvi <= item.max : ndvi < item.max)
  ) || null;
}

const DISTRICT_ALIASES = {
  bellary: 'ballari',
  'yamuna nagar': 'yamunanagar',
  'lakhimpur kheri': 'kheri',
  ahmedabad: 'ahmadabad',
};

export function getDistrictNdvi(state, district) {
  const districtKey = String(district || '').trim().toLowerCase();
  const normalizedKey = DISTRICT_ALIASES[districtKey] || districtKey;
  return (NDVI_DATA[state] || []).find(record => {
    const recordKey = String(record.district).trim().toLowerCase();
    return recordKey === normalizedKey || (DISTRICT_ALIASES[recordKey] || recordKey) === normalizedKey;
  }) || null;
}

export function formatMeanNdvi(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return Number(value).toFixed(2);
}
