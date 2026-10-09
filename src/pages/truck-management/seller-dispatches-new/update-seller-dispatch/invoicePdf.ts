/**
 * Builds a one-page PDF listing the invoice fields, for when no uploaded invoice copy exists yet.
 * Hand-written so no PDF library is needed: plain Helvetica text, ASCII only (the built-in PDF
 * fonts have no ₹ glyph, so amounts use "Rs.").
 */

export interface InvoicePdfLine {
  label: string;
  value: string;
}

const toPdfText = (value: string) =>
  value
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/([\\()])/g, "\\$1");

export function buildInvoicePdf(title: string, lines: InvoicePdfLine[]): Blob {
  const content = [
    "BT",
    "/F2 18 Tf",
    "50 790 Td",
    `(${toPdfText(title)}) Tj`,
    "/F1 11 Tf",
    "0 -36 Td",
    ...lines.flatMap(({ label, value }) => [
      `(${toPdfText(label)}) Tj`,
      `180 0 Td (${toPdfText(value)}) Tj -180 0 Td`,
      "0 -22 Td",
    ]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  // Everything is ASCII, so string length equals byte length for the xref offsets.
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

/** Saves a Blob through a temporary link. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
