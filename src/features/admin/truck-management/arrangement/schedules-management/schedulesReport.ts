import type { AssignedTruck, ScheduleDashboardRow } from "../../../../../core/store/transporterRequestsApi";
import { formatApiDateTime } from "../../../../../shared/utils/apiDateTime";
import logoUrl from "../../../../../shared/assets/img/logo.png";

/**
 * Schedules Management reports: a PDF and a CSV of every request in the chosen period, with its trucks and freight. Built in the
 * browser from what the page already loaded (no extra request); jsPDF is loaded only when a PDF is asked for. Same look as the
 * contract summary PDF (navy band, feedXchange logo, orange accent).
 *
 * Freight: a truck added to a schedule always carries the freight agreed on that schedule (the server refuses any other), so a truck's
 * freight amount is its quantity x the agreed rate per MT.
 */

export interface ReportMeta {
  /** e.g. "This Month" or "Custom". */
  periodLabel: string;
  /** yyyy-MM-dd */
  from: string;
  to: string;
  /** feedXchange staff see every transporter and the contract number; a transporter only its own. */
  showTransporter: boolean;
  /** Set when the report holds only the requests matching the screen's filters: a short description of them. */
  filtersNote?: string;
}

// ------------------------------------------------------------------------------------------------ shared figures

const RESPONSE_LABEL: Record<string, string> = {
  Pending: "Awaiting response",
  Accepted: "Accepted",
  PartiallyAccepted: "Partly accepted",
  Rejected: "Rejected",
  Expired: "Expired",
  Cancelled: "Cancelled",
};
const responseLabel = (status: string) => RESPONSE_LABEL[status] ?? status;
const isAccepted = (row: ScheduleDashboardRow) => row.responseStatus === "Accepted" || row.responseStatus === "PartiallyAccepted";

/** Freight per MT agreed for the request: the accepted rate, else the offered one. */
const ratePerMT = (row: ScheduleDashboardRow) => row.request.acceptedFreightPerMT ?? row.request.offeredFreightPerMT;
const truckStatus = (t: AssignedTruck) => (t.cancelled ? "Cancelled" : t.status === "Assigned" ? "On the way" : t.status);
const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
const dayLabel = (key: string) => (key ? `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}` : "");
const periodText = (m: ReportMeta) => (m.from === m.to ? dayLabel(m.from) : `${dayLabel(m.from)} to ${dayLabel(m.to)}`);
const fileStem = (m: ReportMeta) => `feedXchange-Schedules-${m.from}${m.from === m.to ? "" : `_to_${m.to}`}`;
const nowText = () => formatApiDateTime(new Date().toISOString());

/** Totals over the requests (cancelled trucks never count). */
const totalsOf = (rows: ScheduleDashboardRow[]) => {
  const t = { requests: rows.length, schedules: new Set<number>(), pending: 0, accepted: 0, committed: 0, onTheWay: 0, loaded: 0, left: 0, trucksOnTheWay: 0, trucksLoaded: 0, agreedFreight: 0, arrangedFreight: 0 };
  for (const row of rows) {
    t.schedules.add(row.request.dispatchScheduleId);
    if (row.responseStatus === "Pending") t.pending += 1;
    if (isAccepted(row)) t.accepted += 1;
    t.committed += row.committedQuantityMT;
    t.onTheWay += row.assignedQuantityMT;
    t.loaded += row.loadedQuantityMT;
    t.left += row.leftToAssignMT;
    t.agreedFreight += row.committedQuantityMT * ratePerMT(row);
    for (const truck of row.trucks) {
      if (truck.cancelled) continue;
      if (truck.status === "Assigned") t.trucksOnTheWay += 1;
      else if (truck.status === "Loaded") t.trucksLoaded += 1;
      t.arrangedFreight += truck.quantityMT * ratePerMT(row);
    }
  }
  return t;
};

const save = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ------------------------------------------------------------------------------------------------ CSV

const csvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * CSV for Excel: a few feedXchange title lines, then one line per truck with the request's details repeated on each; a request
 * without trucks gets one line with the truck columns empty. Quantities in MT and amounts in rupees are plain numbers.
 */
export function downloadSchedulesCsv(rows: ScheduleDashboardRow[], meta: ReportMeta): void {
  const t = totalsOf(rows);
  const lines: unknown[][] = [
    ["feedXchange - Schedules Report"],
    ["Period", `${meta.periodLabel} (${periodText(meta)})`],
    ["Generated", nowText()],
    ...(meta.filtersNote ? [["Filters", meta.filtersNote]] : []),
    ["Requests", t.requests, "Schedules", t.schedules.size, "Accepted (MT)", round3(t.committed), "On trucks (MT)", round3(t.onTheWay + t.loaded), "Left to arrange (MT)", round3(t.left)],
    [],
  ];

  const head = [
    "Schedule ID", "Request ID", "Scheduled for", "Product", "Bill change required",
    ...(meta.showTransporter ? ["Transporter", "Contract"] : []),
    "Seller", "Loading place", "Loading address", "Buyer", "Delivery place", "Delivery address",
    "Response", "Requested on", "Responded on",
    "Offered (MT)", "Offered freight (Rs/MT)", "Accepted (MT)", "Accepted freight (Rs/MT)", "Cancelled (MT)",
    "On the way (MT)", "Loaded (MT)", "Left to arrange (MT)", "Agreed freight value (Rs)",
    "feedXchange remarks", "Transporter remarks",
    "Truck", "Driver", "Driver phone", "Truck quantity (MT)", "LR number", "Truck status", "Truck freight (Rs/MT)", "Truck freight amount (Rs)", "Tracking URL",
  ];
  lines.push(head);

  for (const row of rows) {
    const r = row.request;
    const rate = ratePerMT(row);
    const base = [
      r.dispatchScheduleId, r.dispatchScheduleTransporterId, formatApiDateTime(r.scheduleDateTime), r.productName ?? "", r.billChange ? "Yes" : "No",
      ...(meta.showTransporter ? [r.transporterName, row.contractNumber ?? ""] : []),
      r.sellerName ?? "", r.loadingPlace ?? "", r.loadingAddress ?? "", r.buyerName ?? "", r.deliveryPlace ?? "", r.deliveryAddress ?? "",
      responseLabel(row.responseStatus), r.notifiedDateTime ? formatApiDateTime(r.notifiedDateTime) : "", r.responseDateTime ? formatApiDateTime(r.responseDateTime) : "",
      r.offeredQuantityMT, r.offeredFreightPerMT, isAccepted(row) ? row.committedQuantityMT : "", r.acceptedFreightPerMT ?? "", r.cancelledQuantityMT ?? "",
      row.assignedQuantityMT, row.loadedQuantityMT, row.leftToAssignMT, isAccepted(row) ? round2(row.committedQuantityMT * rate) : "",
      r.requestRemarks ?? "", r.responseRemarks ?? "",
    ];
    if (row.trucks.length === 0) {
      lines.push([...base, "", "", "", "", "", "", "", "", ""]);
      continue;
    }
    for (const truck of row.trucks) {
      lines.push([
        ...base,
        truck.truckNumber ?? "", truck.driverName ?? "", truck.driverPhone ?? "", truck.quantityMT, truck.lrNumber ?? "", truckStatus(truck),
        rate, truck.cancelled ? 0 : round2(truck.quantityMT * rate), truck.trackingUrl ?? "",
      ]);
    }
  }

  // BOM so Excel reads UTF-8 (rupee sign, names); CRLF line ends.
  const text = "﻿" + lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
  save(new Blob([text], { type: "text/csv;charset=utf-8" }), `${fileStem(meta)}.csv`);
}

// ------------------------------------------------------------------------------------------------ PDF

const NAVY: [number, number, number] = [18, 45, 90];
const ORANGE: [number, number, number] = [240, 140, 30];
const MUTED: [number, number, number] = [100, 110, 125];
const LIGHT: [number, number, number] = [244, 246, 249];
const LOGO_RATIO = 592 / 97; // width / height of logo.png

/** jsPDF's built-in fonts cover Latin-1 only: the rupee sign, dashes, dots and arrows become plain text. */
const clean = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value)
    .replace(/₹/g, "Rs. ")
    .replace(/→/g, "->")
    .replace(/[—–]/g, "-")
    .replace(/[·•]/g, "|")
    .replace(/[^\t\n\r -~ -ÿ]/g, "");
};
const inr = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rs = (n: number | null | undefined) => (n === null || n === undefined || Number.isNaN(n) ? "-" : `Rs. ${inr.format(n)}`);
const rsn = (n: number | null | undefined) => (n === null || n === undefined || Number.isNaN(n) ? "-" : inr.format(n));
const mt = (n: number | null | undefined) => (n === null || n === undefined ? "-" : `${round3(n)} MT`);

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

type Row = (string | number)[];

export async function downloadSchedulesPdf(rows: ScheduleDashboardRow[], meta: ReportMeta): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;
  const logo = await loadLogo();

  // Landscape: the overview table is wide.
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 32;
  const contentWidth = pageWidth - margin * 2;
  const t = totalsOf(rows);
  const transporterName = !meta.showTransporter ? rows[0]?.request.transporterName : undefined;

  let y = 0;
  const lastY = () => (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  const ensure = (space: number) => {
    if (y > pageHeight - space) {
      doc.addPage();
      y = margin;
    }
  };

  /* ------------------------------------------------ title band */
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 78, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, 78, pageWidth, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Schedules Report", margin, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(clean(`${meta.periodLabel}: ${periodText(meta)}${transporterName ? `   |   ${transporterName}` : ""}`), margin, 54);
  doc.setFontSize(9);
  doc.text(clean(meta.filtersNote ? `Filtered: ${meta.filtersNote}` : "All requests scheduled in the period"), margin, 68);
  doc.text(clean(`Generated ${nowText()}`), pageWidth - margin, 68, { align: "right" });
  // The logo has its own navy panel, so it sits on a white plate to stay visible on the navy band.
  if (logo) {
    const logoW = 128;
    const logoH = logoW / LOGO_RATIO;
    const plateW = logoW + 16;
    const plateX = pageWidth - margin - plateW;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(plateX, 12, plateW, logoH + 14, 4, 4, "F");
    doc.addImage(logo, "PNG", plateX + 8, 19, logoW, logoH);
  }
  doc.setTextColor(0, 0, 0);
  y = 100;

  /* ------------------------------------------------ helpers */
  const heading = (title: string) => {
    ensure(110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    doc.text(clean(title), margin, y);
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(1.2);
    doc.line(margin, y + 4, margin + 34, y + 4);
    doc.setTextColor(0, 0, 0);
    y += 14;
  };
  const keyValues = (pairs: [string, unknown][], columns = 3) => {
    const body: Row[] = [];
    for (let i = 0; i < pairs.length; i += columns) {
      const line: Row = [];
      for (let c = 0; c < columns; c++) {
        const p = pairs[i + c];
        line.push(p ? clean(p[0]) : "", p ? clean(p[1]) : "");
      }
      body.push(line);
    }
    const labelW = (contentWidth / columns) * 0.42;
    const valueW = contentWidth / columns - labelW;
    const columnStyles: Record<number, { cellWidth: number; textColor?: [number, number, number]; fontStyle?: "bold" | "normal" }> = {};
    for (let c = 0; c < columns; c++) {
      columnStyles[c * 2] = { cellWidth: labelW, textColor: MUTED, fontStyle: "normal" };
      columnStyles[c * 2 + 1] = { cellWidth: valueW, textColor: NAVY, fontStyle: "bold" };
    }
    autoTable(doc, {
      startY: y,
      body,
      theme: "plain",
      margin: { left: margin, right: margin },
      styles: { fontSize: 8.5, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, valign: "top", overflow: "linebreak" },
      columnStyles,
      alternateRowStyles: { fillColor: LIGHT },
    });
    y = lastY() + 10;
  };
  const table = (head: string[], body: Row[], opts: { rightAlign?: number[]; foot?: Row; widths?: Record<number, number> } = {}) => {
    const right = opts.rightAlign ?? [];
    const columnStyles: Record<number, { halign?: "right"; cellWidth?: number }> = {};
    right.forEach((i) => (columnStyles[i] = { ...columnStyles[i], halign: "right" }));
    Object.entries(opts.widths ?? {}).forEach(([i, w]) => (columnStyles[Number(i)] = { ...columnStyles[Number(i)], cellWidth: w }));
    autoTable(doc, {
      startY: y,
      head: [head.map(clean)],
      body: body.map((r) => r.map(clean)),
      // empty totals cells stay empty (clean() would print "-")
      foot: opts.foot ? [opts.foot.map((v) => (v === "" ? "" : clean(v)))] : undefined,
      theme: "striped",
      margin: { left: margin, right: margin, top: margin },
      styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: LIGHT, textColor: NAVY, fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles,
      didParseCell: (cell) => {
        if (right.includes(cell.column.index) && cell.section !== "body") cell.cell.styles.halign = "right";
      },
      showFoot: "lastPage",
    });
    y = lastY() + 12;
  };

  /* ------------------------------------------------ 1. summary */
  heading("1. Summary");
  keyValues([
    ["Requests", `${t.requests} (${t.schedules.size} schedule${t.schedules.size === 1 ? "" : "s"})`],
    ["Awaiting response", String(t.pending)],
    ["Accepted requests", String(t.accepted)],
    ["Accepted quantity", mt(t.committed)],
    ["Arranged on trucks", `${mt(t.onTheWay + t.loaded)} (${mt(t.loaded)} loaded, ${mt(t.onTheWay)} on the way)`],
    ["Left to arrange", mt(t.left)],
    ["Trucks", `${t.trucksOnTheWay + t.trucksLoaded} (${t.trucksLoaded} loaded, ${t.trucksOnTheWay} on the way)`],
    ["Agreed freight value", rs(t.agreedFreight)],
    ["Freight on arranged trucks", rs(t.arrangedFreight)],
  ]);

  /* ------------------------------------------------ 2. overview: one line per request */
  heading("2. Schedules Overview");
  if (rows.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("No truck requests are scheduled in this period.", margin, y + 6);
    doc.setTextColor(0, 0, 0);
    y += 20;
  } else {
    const head = [
      "#", "Scheduled for", "Product", "From (loading)", "To (delivery)",
      ...(meta.showTransporter ? ["Transporter / Contract"] : []),
      "Offered", "Accepted", "Arranged", "Left", "Freight value (Rs.)", "Trucks", "Response",
    ];
    const body: Row[] = rows.map((row, i) => {
      const r = row.request;
      const live = row.trucks.filter((x) => !x.cancelled);
      return [
        i + 1,
        `${formatApiDateTime(r.scheduleDateTime)}${r.billChange ? "\nBill change required" : ""}`,
        r.productName ?? "-",
        `${r.sellerName ?? "-"}${r.loadingPlace ? `\n${r.loadingPlace}` : ""}`,
        `${r.buyerName ?? "-"}${r.deliveryPlace ? `\n${r.deliveryPlace}` : ""}`,
        ...(meta.showTransporter ? [`${r.transporterName}${row.contractNumber ? `\n${row.contractNumber}` : ""}`] : []),
        `${mt(r.offeredQuantityMT)}\n@ Rs. ${inr.format(r.offeredFreightPerMT)}/MT`,
        isAccepted(row) ? `${mt(row.committedQuantityMT)}\n@ Rs. ${inr.format(ratePerMT(row))}/MT` : "-",
        isAccepted(row) ? mt(row.assignedQuantityMT + row.loadedQuantityMT) : "-",
        isAccepted(row) ? mt(row.leftToAssignMT) : "-",
        isAccepted(row) ? rsn(row.committedQuantityMT * ratePerMT(row)) : "-",
        String(live.length),
        responseLabel(row.responseStatus),
      ];
    });
    const firstNum = meta.showTransporter ? 6 : 5;
    table(head, body, {
      rightAlign: [firstNum, firstNum + 1, firstNum + 2, firstNum + 3, firstNum + 4, firstNum + 5],
      widths: { 0: 20 },
      foot: [
        "", "Totals", "", "", "", ...(meta.showTransporter ? [""] : []),
        "", mt(t.committed), mt(t.onTheWay + t.loaded), mt(t.left), rsn(t.agreedFreight), String(t.trucksOnTheWay + t.trucksLoaded), "",
      ],
    });
  }

  /* ------------------------------------------------ 3. each schedule in full, with its trucks */
  if (rows.length > 0) {
    heading("3. Schedule Details & Arranged Trucks");
    rows.forEach((row, i) => {
      const r = row.request;
      const rate = ratePerMT(row);
      ensure(150);
      // a navy strip naming the request
      doc.setFillColor(...NAVY);
      doc.rect(margin, y - 2, contentWidth, 18, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(clean(`${i + 1}. ${formatApiDateTime(r.scheduleDateTime)}  |  ${r.productName ?? "-"}  |  ${r.sellerName ?? "-"} -> ${r.buyerName ?? "-"}`), margin + 6, y + 10);
      doc.text(clean(responseLabel(row.responseStatus)), pageWidth - margin - 6, y + 10, { align: "right" });
      doc.setTextColor(0, 0, 0);
      y += 22;

      keyValues([
        ...(meta.showTransporter ? ([["Transporter", r.transporterName], ["Contract", row.contractNumber ?? "-"]] as [string, unknown][]) : []),
        ["Schedule / Request", `#${r.dispatchScheduleId} / #${r.dispatchScheduleTransporterId}`],
        ["Loading address", r.loadingAddress],
        ["Delivery address", r.deliveryAddress],
        ["Bill change", r.billChange ? "Required" : "Not required"],
        ["Offered", `${mt(r.offeredQuantityMT)} @ ${rs(r.offeredFreightPerMT)}/MT`],
        ["Accepted", isAccepted(row) ? `${mt(row.committedQuantityMT)} @ ${rs(rate)}/MT` : "-"],
        ["Cancelled quantity", r.cancelledQuantityMT ? mt(r.cancelledQuantityMT) : "-"],
        ["Arranged", isAccepted(row) ? `${mt(row.loadedQuantityMT)} loaded, ${mt(row.assignedQuantityMT)} on the way` : "-"],
        ["Left to arrange", isAccepted(row) ? mt(row.leftToAssignMT) : "-"],
        ["Agreed freight value", isAccepted(row) ? rs(row.committedQuantityMT * rate) : "-"],
        ["Requested on", r.notifiedDateTime ? formatApiDateTime(r.notifiedDateTime) : "-"],
        ["Responded on", r.responseDateTime ? formatApiDateTime(r.responseDateTime) : "-"],
        ["feedXchange remarks", r.requestRemarks],
        ["Transporter remarks", r.responseRemarks],
      ]);

      if (row.trucks.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text(isAccepted(row) ? "No trucks arranged yet." : "Trucks are arranged once the request is accepted.", margin, y + 4);
        doc.setTextColor(0, 0, 0);
        y += 18;
      } else {
        const live = row.trucks.filter((x) => !x.cancelled);
        table(
          ["Truck", "Driver", "Phone", "Quantity", "LR number", "Status", "Freight/MT (Rs.)", "Freight amount (Rs.)", "Tracking link"],
          row.trucks.map((x) => [
            x.truckNumber ?? "-",
            x.driverName ?? "-",
            x.driverPhone ?? "-",
            mt(x.quantityMT),
            x.lrNumber ?? "-",
            truckStatus(x),
            rsn(rate),
            x.cancelled ? "-" : rsn(x.quantityMT * rate),
            x.trackingUrl ?? "-",
          ]),
          {
            rightAlign: [3, 6, 7],
            widths: { 8: 170 },
            foot: ["Total", "", "", mt(live.reduce((s, x) => s + x.quantityMT, 0)), "", `${live.length} truck${live.length === 1 ? "" : "s"}`, "", rsn(live.reduce((s, x) => s + x.quantityMT * rate, 0)), ""],
          },
        );
      }
      y += 4;
    });
  }

  /* ------------------------------------------------ footer on every page */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(clean(`feedXchange - Schedules Report - ${periodText(meta)}`), margin, pageHeight - 14);
    doc.text(`Page ${p} of ${pages}`, pageWidth - margin, pageHeight - 14, { align: "right" });
  }

  doc.save(`${fileStem(meta)}.pdf`);
}
