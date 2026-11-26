import logoUrl from "../../assets/img/logo.png";
import type { TableColumn } from "./table.types";

/**
 * Export of any shared Table to CSV (opens in Excel) or PDF. The columns are the ones shown on screen (in their order, without
 * row actions), the rows are the ones the screen passes (all filtered rows, not only the current page).
 */

/** Columns never exported: row menus and selection boxes. */
const NON_DATA_KEYS = new Set(["actions", "action", "select", "menu", "rowActions"]);

export const exportableColumns = <T,>(columns: TableColumn<T>[]) =>
  columns.filter((column) => column.exportable !== false && !NON_DATA_KEYS.has(column.key) && column.header.trim() !== "");

/** Sort values are often a time in milliseconds (a date column sorted by date): export those as a date, not a number. */
const looksLikeTime = (value: number) => value > 946_684_800_000 && value < 4_102_444_800_000; // 2000 - 2100

const plain = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return null;
  return String(value);
};

/**
 * The plain text of one cell: the column's exportValue, else the row's own field (screens keep their rows display-ready),
 * else the column's sortValue (a time in milliseconds becomes a date).
 */
export const cellText = <T,>(row: T, column: TableColumn<T>): string => {
  if (column.exportValue) return plain(column.exportValue(row)) ?? "";
  const own = plain((row as Record<string, unknown>)[column.key]);
  if (own !== null) return own;
  if (column.sortValue) {
    const sorted = column.sortValue(row);
    if (typeof sorted === "number" && looksLikeTime(sorted)) return new Date(sorted).toLocaleDateString("en-IN");
    return plain(sorted) ?? "";
  }
  return "";
};

const fileSafe = (text: string) => text.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "export";
const stamp = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const save = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** CSV with a BOM, so Excel shows ₹ and names in Indian scripts correctly. */
export function exportTableCsv<T>(name: string, columns: TableColumn<T>[], rows: T[]) {
  const cols = exportableColumns(columns);
  const escape = (text: string) => (/[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text);
  const lines = [cols.map((c) => escape(c.header)), ...rows.map((row) => cols.map((c) => escape(cellText(row, c))))];
  save(new Blob(["﻿", lines.map((line) => line.join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }), `${fileSafe(name)}-${stamp()}.csv`);
}

// ---------------------------------------------------------------- PDF

const NAVY: [number, number, number] = [18, 45, 90];
const MUTED: [number, number, number] = [100, 110, 125];
const LIGHT: [number, number, number] = [244, 246, 249];
const LOGO_RATIO = 592 / 97;

/** jsPDF's built-in fonts only cover Latin-1: the rupee sign, arrows and dots become plain text. */
const pdfText = (value: string) =>
  value
    .replace(/₹/g, "Rs. ")
    .replace(/→/g, "->")
    .replace(/[—–]/g, "-")
    .replace(/[·•]/g, "|")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");

async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

/** A landscape A4 report: logo, title, date and row count, then the table with a navy header and page numbers. */
export async function exportTablePdf<T>(name: string, columns: TableColumn<T>[], rows: T[], subtitle?: string) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;
  const cols = exportableColumns(columns);
  const doc = new jsPDF({ orientation: cols.length > 6 ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 32;

  const logo = await loadLogo();
  if (logo) doc.addImage(logo, "PNG", margin, 22, 26 * LOGO_RATIO, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(pdfText(name), pageWidth - margin, 34, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const info = [subtitle, `${rows.length} row${rows.length === 1 ? "" : "s"}`, `Generated ${new Date().toLocaleString("en-IN")}`].filter(Boolean).join("  |  ");
  doc.text(pdfText(info), pageWidth - margin, 50, { align: "right" });

  autoTable(doc, {
    startY: 64,
    margin: { left: margin, right: margin, bottom: 36 },
    head: [cols.map((c) => pdfText(c.header))],
    body: rows.map((row) => cols.map((c) => pdfText(cellText(row, c)))),
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak", valign: "middle" },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: Object.fromEntries(
      cols.map((c, index) => [index, { halign: c.align === "right" ? "right" : c.align === "center" ? "center" : "left" }]),
    ),
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 16, { align: "right" });
      doc.text("FeedXchange", margin, pageHeight - 16);
    },
  });

  doc.save(`${fileSafe(name)}-${stamp()}.pdf`);
}
