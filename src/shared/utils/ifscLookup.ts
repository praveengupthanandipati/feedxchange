export interface IfscBranch {
  bankName: string;
  branch: string;
}

interface IfscApiResult {
  BANK?: string;
  BRANCH?: string;
}

/** 4 letters (bank), a 0, then 6 letters or digits (branch), e.g. SBIN0000691. */
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const isValidIfsc = (ifscCode: string) => IFSC_PATTERN.test(ifscCode.trim().toUpperCase());

// India-only public lookup (Razorpay's IFSC service): given an 11-character IFSC code, resolves the bank and branch so
// forms can fill them in. Returns null for a malformed or unknown code; throws when the service can't be reached, so
// the form can say so instead of "not found".
export async function fetchBankFromIfsc(ifscCode: string): Promise<IfscBranch | null> {
  const code = ifscCode.trim().toUpperCase();
  if (!IFSC_PATTERN.test(code)) return null;

  let response: Response;
  try {
    response = await fetch(`https://ifsc.razorpay.com/${code}`);
  } catch (err) {
    console.error("IFSC service unreachable:", code, err);
    throw new Error("The IFSC service could not be reached.");
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`The IFSC service answered ${response.status}.`);
  const data: IfscApiResult = await response.json();
  return data?.BANK ? { bankName: data.BANK, branch: data.BRANCH ?? "" } : null;
}
