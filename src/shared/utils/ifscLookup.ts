export interface IfscBranch {
  bankName: string;
  branch: string;
}

interface IfscApiResult {
  BANK?: string;
  BRANCH?: string;
}

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// India-only public lookup (Razorpay's IFSC service): given an 11-character IFSC code, resolves the bank and branch so
// forms can fill them in. Returns null for a malformed or unknown code, or a network failure.
export async function fetchBankFromIfsc(ifscCode: string): Promise<IfscBranch | null> {
  const code = ifscCode.trim().toUpperCase();
  if (!IFSC_PATTERN.test(code)) return null;

  try {
    const response = await fetch(`https://ifsc.razorpay.com/${code}`);
    if (!response.ok) return null;
    const data: IfscApiResult = await response.json();
    if (!data?.BANK) return null;
    return { bankName: data.BANK, branch: data.BRANCH ?? "" };
  } catch (err) {
    console.error("Failed to look up IFSC code:", code, err);
    return null;
  }
}
