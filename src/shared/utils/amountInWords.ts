const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** 0–99 in words. */
function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`;
}

/** 0–999 in words. */
function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return [hundreds ? `${ONES[hundreds]} Hundred` : "", rest ? twoDigits(rest) : ""].filter(Boolean).join(" ");
}

/** A whole number in words, Indian style (thousand, lakh, crore). */
function wholeInWords(n: number): string {
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thousand = Math.floor((n % 100_000) / 1000);
  const rest = n % 1000;
  return [
    crore ? `${wholeInWords(crore)} Crore` : "",
    lakh ? `${twoDigits(lakh)} Lakh` : "",
    thousand ? `${twoDigits(thousand)} Thousand` : "",
    rest ? threeDigits(rest) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * An amount in rupees in words, for checking a typed amount, e.g. 125000.5 → "Rupees One Lakh Twenty Five Thousand
 * and Fifty Paise Only". Returns "" for an empty, invalid or negative amount.
 */
export function amountInWords(value: string | number | null | undefined): string {
  const amount = typeof value === "number" ? value : Number(String(value ?? "").replace(/,/g, "").trim());
  if (value === "" || value == null || !Number.isFinite(amount) || amount < 0) return "";
  const paiseTotal = Math.round(amount * 100);
  const rupees = Math.floor(paiseTotal / 100);
  const paise = paiseTotal % 100;
  const rupeeWords = `Rupees ${wholeInWords(rupees)}`;
  return paise ? `${rupeeWords} and ${twoDigits(paise)} Paise Only` : `${rupeeWords} Only`;
}
