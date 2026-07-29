// TODO: replace with real data once the promo-codes API is wired up.

export type PromoCodeStatus = "Active" | "Inactive";

export interface PromoCodeRow {
  id: string;
  code: string;
  url: string;
  createdDate: string;
  createdDateValue: number;
  status: PromoCodeStatus;
}

const CODES = [
  "WELCOME10",
  "FEED2025",
  "HARVEST15",
  "AGRIBOOST",
  "SEASONAL20",
  "FIRSTORDER",
  "BULKSAVE",
  "REFER25",
  "SUMMERDEAL",
  "TRADEPLUS",
];

const STATUSES: PromoCodeStatus[] = ["Active", "Inactive"];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDate(date: Date): string {
  return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function buildPromoCodeUrl(code: string): string {
  return `https://feedxchange.app/promo/${code.toUpperCase()}`;
}

function buildRows(): PromoCodeRow[] {
  const today = new Date();
  const rows: PromoCodeRow[] = [];

  for (let i = 0; i < CODES.length; i++) {
    const code = CODES[i];
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 5 + (i % 3)));

    rows.push({
      id: `promo-${1000 + i}`,
      code,
      url: buildPromoCodeUrl(code),
      createdDate: formatDate(date),
      createdDateValue: date.getTime(),
      status: STATUSES[i % STATUSES.length],
    });
  }

  return rows;
}

export const promoCodes: PromoCodeRow[] = buildRows();
