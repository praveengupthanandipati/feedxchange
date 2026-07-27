// TODO: replace with real data once the promoter-dashboard API is wired up.

export type CommissionStatus = "Pending" | "Paid";

export interface PromoterContractRow {
  id: string;
  contractNumber: string;
  seller: string;
  buyer: string;
  contractDate: string;
  contractDateValue: number;
  totalAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  status: CommissionStatus;
}

const SELLERS = [
  "Chatrai - Lakshmi Poultry",
  "Mudinepalli - Purnima Feeds",
  "Chilakaluripet - Eswar Traders",
  "Miryalguda - Rayapudi Agro",
  "Ankur Animal Feeds",
];

const BUYERS = [
  "Sai Feeds Pvt Ltd",
  "Blue Aqua Farms",
  "Green Valley Dairy",
  "Tadepalligudem - SL Traders",
  "Srinivasa Traders - Vijayawada",
];

const STATUSES: CommissionStatus[] = ["Pending", "Paid"];
const COMMISSION_PERCENTS = [2, 2.5, 3, 3.5, 4];
const ROW_COUNT = 10;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function buildRows(): PromoterContractRow[] {
  const today = new Date();
  const rows: PromoterContractRow[] = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    const seller = SELLERS[i % SELLERS.length];
    let buyer = BUYERS[(i + 1) % BUYERS.length];
    if (buyer === seller) buyer = BUYERS[(i + 2) % BUYERS.length];

    const totalAmount = 150000 + ((i * 93417) % 4500000);
    const commissionPercent = COMMISSION_PERCENTS[i % COMMISSION_PERCENTS.length];
    const commissionAmount = Math.round(totalAmount * (commissionPercent / 100));
    const status = STATUSES[i % STATUSES.length];

    const date = new Date(today);
    date.setDate(date.getDate() - (i * 3 + (i % 4)));

    rows.push({
      id: `pc-${4000 + i}`,
      contractNumber: `${4000 + i}`,
      seller,
      buyer,
      contractDate: `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`,
      contractDateValue: date.getTime(),
      totalAmount,
      commissionPercent,
      commissionAmount,
      status,
    });
  }

  return rows;
}

export const promoterContracts: PromoterContractRow[] = buildRows();
