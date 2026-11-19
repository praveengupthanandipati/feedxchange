// TODO: replace with real reference data once seller/buyer/product masters are wired up.

/*export const sellerOptions = [
  { value: "chatrai-lakshmi", label: "Chatrai - Lakshmi Poultry" },
  { value: "mudinepalli-purnima", label: "Mudinepalli - Purnima Feeds" },
  { value: "chilakaluripet-eswar", label: "Chilakaluripet - Eswar Traders" },
  { value: "miryalguda-rayapudi", label: "Miryalguda - Rayapudi Agro" },
];

export const buyerOptions = sellerOptions;

export const productOptions = [
  { value: "maize-ddgs", label: "Maize DDGS" },
  { value: "dorb", label: "DORB" },
  { value: "rapeseed-doc", label: "Rapeseed DOC" },
  { value: "rice-ddgs", label: "Rice DDGS" },
  { value: "soya-doc", label: "Soya DOC" },
];*/

export const quantityMeasureOptions = [
  { value: "mt", label: "Metric Tons" },
  { value: "trucks", label: "Trucks" },
  { value: "barrels", label: "Barrels" },
  { value: "kg", label: "Kilograms" },
];

export const poToleranceOptions = [
  { value: "2", label: "+/- 2%" },
  { value: "5", label: "+/- 5%" },
  { value: "10", label: "+/- 10%" },
  { value: "0", label: "No Tolerance" },
];

export const deliveryTypeOptions = [
  { value: "ex-loading", label: "Ex-Loading" },
  { value: "for-delivery", label: "FOR Delivery" },
];

/** Whether the rate entered includes GST. The GST % itself is its own field. */
export const gstDetailsOptions = [
  { value: "including", label: "Including GST" },
  { value: "excluding", label: "Excluding GST" },
];

export const deliveryScheduleOptions = [
  { value: "ready-loading", label: "Ready Loading" },
  { value: "forward-contract", label: "Forward Contract" },
  { value: "specific-days", label: "Specific Days" },
];

/** Whether a side's quality specs come from the product master (and are shown) or are left out of the contract. */
export const QUALITY_SPEC_FROM_MASTER = "show-from-master";
export const QUALITY_SPEC_NOT_FROM_MASTER = "do-not-show-from-master";

export const qualitySpecSourceOptions = [
  { value: QUALITY_SPEC_FROM_MASTER, label: "Show from Master" },
  { value: QUALITY_SPEC_NOT_FROM_MASTER, label: "Do not show from Master" },
];

export const addressOptions = [
  { value: "achutapuram", label: "Achutapuram" },
  { value: "guntur", label: "Guntur" },
  { value: "vijayawada", label: "Vijayawada" },
  { value: "rajahmundry", label: "Rajahmundry" },
];

export const paymentTermsOptions = [
  { value: "100-advance", label: "100% Advance" },
  { value: "forward-advance", label: "Forward Advance" },
  { value: "credits", label: "Credits" },
];
