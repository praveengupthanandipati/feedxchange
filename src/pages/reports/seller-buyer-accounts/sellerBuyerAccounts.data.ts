// TODO: replace with real data once the reports API is wired up.

export type PartyRole = "Seller" | "Buyer";

export const partyRoleOptions: { value: PartyRole; label: string }[] = [
  { value: "Seller", label: "Seller" },
  { value: "Buyer", label: "Buyer" },
];

export const businessOptions = [
  { value: "ankur-animal-feeds", label: "Ankur Animal Feeds - Ahmedabad" },
  { value: "sai-feeds", label: "Sai Feeds Pvt Ltd - Mumbai" },
  { value: "chatrai-lakshmi-poultry", label: "Chatrai - Lakshmi Poultry" },
  { value: "green-valley-dairy", label: "Green Valley Dairy - Pune" },
];

export const accountTabs = [
  { id: "contracts", label: "Contracts" },
  { id: "pending-supplies", label: "Pending Supplies" },
  { id: "summary", label: "Summary" },
  { id: "pending-payments", label: "Pending Payments" },
  { id: "over-due-pay", label: "Over Due Pay" },
  { id: "un-account-bal", label: "Un Account Bal" },
  { id: "avg-payments", label: "Avg Payments" },
  { id: "payments", label: "Payments" },
  { id: "profile", label: "Profile" },
  { id: "contact-info", label: "Contact Info" },
] as const;

export type AccountTabId = (typeof accountTabs)[number]["id"];
