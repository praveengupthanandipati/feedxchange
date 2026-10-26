// TODO: replace with real data once the referred-profiles API is wired up.

import type { BusinessType } from "../../businessowners/BusinessList/businessOwners.data";

export type ReferredProfileStatus = "Pending" | "Approved" | "Rejected";

export interface ReferredProfileRow {
  id: string;
  businessName: string;
  lineOfBusiness: BusinessType;
  registrationDate: string;
  registrationDateValue: number;
  status: ReferredProfileStatus;
}

const BUSINESSES: { name: string; type: BusinessType }[] = [
  { name: "Sri Venkateswara Fish Farms", type: "Fish Farm" },
  { name: "Amaravati Layer Poultry", type: "Layer Poultry" },
  { name: "Godavari Aqua Traders", type: "Fish Farm" },
  { name: "Krishna Delta Poultry Farms", type: "Layer Poultry" },
  { name: "Bay of Bengal Fisheries", type: "Fish Farm" },
  { name: "Rayalaseema Egg Producers", type: "Layer Poultry" },
  { name: "Konaseema Prawn Farms", type: "Fish Farm" },
  { name: "Nellore Broiler Farms", type: "Layer Poultry" },
  { name: "Anantapur Layer Co-op", type: "Layer Poultry" },
  { name: "Vizag Aqua Exports", type: "Fish Farm" },
];

const STATUSES: ReferredProfileStatus[] = ["Pending", "Approved", "Rejected"];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date): string {
  return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function buildRows(): ReferredProfileRow[] {
  const today = new Date();
  const rows: ReferredProfileRow[] = [];

  for (let i = 0; i < BUSINESSES.length; i++) {
    const business = BUSINESSES[i];
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 6 + (i % 4)));

    rows.push({
      id: `ref-${2000 + i}`,
      businessName: business.name,
      lineOfBusiness: business.type,
      registrationDate: formatDate(date),
      registrationDateValue: date.getTime(),
      status: STATUSES[i % STATUSES.length],
    });
  }

  return rows;
}

export const referredProfiles: ReferredProfileRow[] = buildRows();
