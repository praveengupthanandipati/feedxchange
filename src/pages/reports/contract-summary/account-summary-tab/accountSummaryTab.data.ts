// TODO: replace with real data once the reports API is wired up.

export interface AccountSummaryRow {
  id: string;
  sNo: number;
  partyName: string;
}

export const accountSummaryRows: AccountSummaryRow[] = [
  { id: "P1", sNo: 1, partyName: "Sai Feeds Pvt Ltd" },
  { id: "P2", sNo: 2, partyName: "Ankur Animal Feeds" },
  { id: "P3", sNo: 3, partyName: "Blue Aqua Farms" },
  { id: "P4", sNo: 4, partyName: "Green Valley Dairy" },
  { id: "P5", sNo: 5, partyName: "Shree Animal Nutrition" },
];
