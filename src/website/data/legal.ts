// Shared shape for legal pages (Privacy Policy, Terms and Conditions).

export interface PolicyPoint {
  /** Bold lead-in, e.g. "KYC Documents". */
  label?: string;
  text?: string;
  /** Nested bullets under this point. */
  points?: PolicyPoint[];
}

export interface PolicySection {
  id: string;
  title: string;
  /** Paragraphs before the list. */
  intro?: string[];
  points?: PolicyPoint[];
}
