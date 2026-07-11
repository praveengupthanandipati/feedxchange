// TODO: replace with real reference data once seller/buyer/product masters are wired up.

export const sellerOptions = [
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
];

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

export const gstDetailsOptions = [
  { value: "5", label: "5% GST" },
  { value: "12", label: "12% GST" },
  { value: "18", label: "18% GST" },
  { value: "0", label: "Exempt" },
];

export const deliveryScheduleOptions = [
  { value: "immediate", label: "Immediate" },
  { value: "7d", label: "Within 7 Days" },
  { value: "15d", label: "Within 15 Days" },
  { value: "30d", label: "Within 30 Days" },
];

export const qualitySpecSourceOptions = [
  { value: "buyer-lab", label: "Buyer Lab" },
  { value: "seller-lab", label: "Seller Lab" },
  { value: "third-party", label: "Third-Party Lab" },
  { value: "mutual", label: "Mutually Agreed" },
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
