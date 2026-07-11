// TODO: replace with real data once the contracts API is wired up.

export type ContractStatus = "Open" | "Pending" | "In-transit" | "Rejected";

export interface Contract {
  id: string;
  date: string;
  dateValue: number;
  status: ContractStatus;
  seller: string;
  buyer: string;
  product: string;
  qty: string;
  qtyValue: number;
  aQty: string;
  pQty: string;
  dQty: string;
  cRate: string;
  cRateValue: number;
  gst: string;
  netRate: string;
  netRateValue: number;
  deliveryType: string;
  paymentTerms: string;
  iFreight: string;
  iFreightValue: number;
}

const SELLERS = [
  "Chatrai - Lakshmi Poultry",
  "Mudinepalli - Purnima Feeds",
  "Chilakaluripet - Eswar Traders",
  "Miryalguda - Rayapudi Agro",
];

const BUYERS = [
  "Chilakaluripet - Eswar Traders",
  "Tadepalligudem - SL Traders",
  "Miryalguda - Rayapudi Agro",
  "Mudinepalli - Purnima Feeds",
];

const PRODUCTS = ["Maize DDGS", "DORB", "Rapeseed DOC", "Rice DDGS", "Soya DOC"];
const STATUSES: ContractStatus[] = ["In-transit", "Pending", "Open", "Rejected"];
const DELIVERY_TYPES = ["Ex-Loading", "FOR Delivery"];
const PAYMENT_TERMS = ["100% Advance", "Forward Advance", "Credits"];
const UNITS = ["MT", "Trucks", "Barrels"];

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const formatDate = (date: Date) =>
  `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

const ROW_COUNT = 25;

function buildContracts(): Contract[] {
  const today = new Date();
  const rows: Contract[] = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    const seller = SELLERS[i % SELLERS.length];
    let buyer = BUYERS[(i + 1) % BUYERS.length];
    if (buyer === seller) buyer = BUYERS[(i + 2) % BUYERS.length];

    const product = PRODUCTS[i % PRODUCTS.length];
    const status = STATUSES[i % STATUSES.length];
    const unit = i % 7 === 0 ? UNITS[1] : i % 11 === 0 ? UNITS[2] : UNITS[0];

    const qtyValue = 10 + ((i * 37) % 990);
    const cRateValue = 12 + ((i * 733) % 25000);
    const gstValue = 5;
    const netRateValue = Math.round(cRateValue * (1 + gstValue / 100));
    const iFreightValue = (i * 211) % 20000;

    const arranged =
      status === "Pending" || status === "Rejected" ? null : Math.round(qtyValue * 0.6);
    const pending = arranged !== null ? qtyValue - arranged : null;
    const dispatched =
      status === "In-transit" || status === "Open" ? Math.round(qtyValue * 0.3) : null;

    // spread sample dates across the last ~90 days so the date-range filters
    // (Today / Last 7 Days / Last 30 Days / Previous Month) have real matches
    const daysAgo = (i * 4 + (i % 5) * 3) % 90;
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12, 20 - i, 0, 0);

    rows.push({
      id: `2026-${ROW_COUNT - i}`,
      date: formatDate(date),
      dateValue: date.getTime(),
      status,
      seller,
      buyer,
      product,
      qty: `${qtyValue} ${unit}`,
      qtyValue,
      aQty: arranged !== null ? `${arranged} ${unit}` : "N/A",
      pQty: pending !== null ? `${pending} ${unit}` : "N/A",
      dQty: dispatched !== null ? `${dispatched} ${unit}` : "N/A",
      cRate: formatINR(cRateValue),
      cRateValue,
      gst: `${gstValue}%`,
      netRate: formatINR(netRateValue),
      netRateValue,
      deliveryType: DELIVERY_TYPES[i % DELIVERY_TYPES.length],
      paymentTerms: PAYMENT_TERMS[i % PAYMENT_TERMS.length],
      iFreight: formatINR(iFreightValue),
      iFreightValue,
    });
  }

  return rows;
}

export const contracts: Contract[] = buildContracts();

export const statusOptions = [
  { value: "All", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Rejected", label: "Rejected" },
  { value: "Pending", label: "Pending" },
  { value: "In-transit", label: "In Transit" },
];

export const dateRangeOptions = [
  { value: "All", label: "All" },
  { value: "Today", label: "Today" },
  { value: "Last 7 Days", label: "Last 7 Days" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "Previous Month", label: "Previous Month" },
  { value: "Custom Date Range", label: "Custom Date Range" },
];
