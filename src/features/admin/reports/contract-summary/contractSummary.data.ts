export const filterOptions = [
  { value: "All", label: "All" },
  { value: "Party", label: "Party" },
  { value: "Area Wise", label: "Area Wise" },
  { value: "Collection Area Wise", label: "Collection Area Wise" },
  { value: "Group", label: "Group" },
  { value: "City", label: "City" },
];

export type SummaryTabId = "contract" | "account";

export const summaryTabs: { id: SummaryTabId; label: string }[] = [
  { id: "contract", label: "Contract Summary" },
  { id: "account", label: "Account Summary" },
];
