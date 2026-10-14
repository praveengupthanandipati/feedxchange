/** The kinds of information a user can share (Stage 8). The value is what the server expects; it also selects the message template. */
export interface InformationTypeOption {
  value: string;
  label: string;
  /** Needs a contract (the others also work from a profile page). */
  needsContract?: boolean;
}

export const INFORMATION_TYPES: InformationTypeOption[] = [
  { value: "BANK_DETAILS", label: "Bank details" },
  { value: "SELLER_ADDRESS", label: "Seller address" },
  { value: "BUYER_ADDRESS", label: "Buyer address" },
  { value: "CONTRACT_INFO", label: "Contract information", needsContract: true },
  { value: "PENDING_INVOICES", label: "Pending invoices / payments" },
  { value: "CONTACT_DETAILS", label: "Contact details" },
  { value: "GREETING", label: "Greeting message" },
];

export const informationLabel = (value: string): string => INFORMATION_TYPES.find((t) => t.value === value)?.label ?? value;
