# India state and district directory

`india-states-districts.json` provides the prediction and farm-location choices.

- The original configured 11 state/district lists are preserved.
- Madhya Pradesh is limited to five sugarcane districts selected from the project's area records and checked against the [DPD Bhopal Annual Report 2023–24](https://dpd.gov.in/Annual%20Report%20%202023-24%2014.01.2025.pdf).
- West Bengal is limited to five districts with the highest sugarcane area in the project's district records from 2015 onward; the broader district-crop series is sourced from [DES/UPAg district statistics](https://dataful.in/datasets/5607/).
- `predictionGeography.json` mirrors this directory for the prediction page so stale backend responses cannot repopulate removed options.
