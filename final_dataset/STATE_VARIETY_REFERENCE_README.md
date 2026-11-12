# Last Final dataset

`Last Final dataset.csv` is the prepared training dataset for the app's supported locations. It contains 3,902 rows: 3,893 observations and 9 location-only references, spanning the original 11 configured states plus Madhya Pradesh and West Bengal. The final copy includes 115 state–district pairs.

## District coverage

- The original 11 state and district selections are preserved.
- Madhya Pradesh is limited to its five highest sugarcane-area districts in the project's 2015-onward district records: Narsinghpur, Betul, Hoshangabad, Chhindwara, and Datia. Each appears in the 2023–24 DPD Bhopal list of major/potential sugarcane districts.
- West Bengal is limited to the five highest sugarcane-area districts in the project's 2015-onward records: Medinipur West, Murshidabad, Maldah, Nadia, and Purba Bardhaman.
- Other states and unrelated district rows are excluded from this prepared copy. The original source datasets remain unchanged.
- Nine `location_reference` rows preserve configured legacy locations without measured rows. Their yield and agronomic values are blank; exclude them from ML training.

The `year` column, duplicate state/district aliases, duplicate or empty yield columns, NDVI grouping labels, and unused provenance fields have been removed. The `yield` column is the model target. Hard-coded district NDVI means from `frontend/src/data/ndviDistrictData.js` remain in `ndvi_mean` where available.

The prepared data has these added-state variety labels: Co 86032 for Madhya Pradesh and Co 0238 for West Bengal. Dataset presence does not independently confirm local suitability.

## Source references

- [DPD Bhopal Annual Report 2023–24](https://dpd.gov.in/Annual%20Report%20%202023-24%2014.01.2025.pdf) identifies Madhya Pradesh's major/potential sugarcane districts.
- [West Bengal district crop statistics dataset](https://dataful.in/datasets/5607/) is sourced from Ministry of Agriculture and Farmers Welfare DES / UPAg. District selection here uses the project's 2015-onward sugarcane area records.
- Project district records: `cleaned_data/Cleaned_Sugarcane_Dataset.csv`.
