import type { ContractFullConditions, ContractFullDetails, ContractFullParty } from "../../../../core/store/contractsApi";
import logoUrl from "../../../../shared/assets/img/logo.png";
import { date, dateTime, humanize, num, percent, qty, travelTime } from "./format";
import { withCity } from "../../../../shared/hooks/useProfileCities";

/**
 * Builds the complete contract summary report as a PDF and downloads it. Runs entirely in the browser from the details already
 * loaded on the page (no extra request). jsPDF is loaded on demand so it never weighs on the rest of the app.
 *
 * jsPDF's built-in fonts only cover Latin-1, so the rupee sign, arrows, middle dots and the like are replaced with plain text.
 */

const NAVY: [number, number, number] = [18, 45, 90];
const ORANGE: [number, number, number] = [240, 140, 30];
const MUTED: [number, number, number] = [100, 110, 125];
const LIGHT: [number, number, number] = [244, 246, 249];

const clean = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value)
    .replace(/₹/g, "Rs. ")
    .replace(/→/g, "->")
    .replace(/[—–]/g, "-")
    .replace(/[·•]/g, "|")
    .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ]/g, "");
};

const inr = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rs = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? "-" : `Rs. ${inr.format(value)}`;

/** Amount without the currency prefix, for dense tables whose headers say "(Rs.)". */
const rsn = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? "-" : inr.format(value);

const d = (value: string | null | undefined) => clean(date(value));
const dt = (value: string | null | undefined) => clean(dateTime(value));

type Row = (string | number)[];

/** The logo as a data URL for jsPDF; null (report is still produced, just without it) if it cannot be loaded. */
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

const LOGO_RATIO = 592 / 97; // width / height of logo.png

export async function downloadContractPdf(data: ContractFullDetails): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;

  const logo = await loadLogo();
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const o = data.overview;
  const s = data.summary;
  const number = o.contractNumber;

  let y = 0;
  const lastY = () => (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;

  /* ------------------------------------------------ title band (first page) */
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 78, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, 78, pageWidth, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(clean(`Contract ${number}`), margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(clean(`${withCity(data.seller.legalName ?? "Seller", data.seller.contractAddress?.city)}  ->  ${withCity(data.buyer.legalName ?? "Buyer", data.buyer.contractAddress?.city)}`), margin, 56);
  doc.text(clean(`Status: ${o.status ?? "-"}   |   ${o.productName ?? ""}`), margin, 69);
  doc.setFontSize(9);
  doc.text(`Summary report - generated ${clean(dateTime(new Date().toISOString()))}`, pageWidth - margin, 69, { align: "right" });
  // Logo on a white plate in the top-right corner (the logo has its own navy panel, which would vanish on the navy band).
  if (logo) {
    const logoW = 128;
    const logoH = logoW / LOGO_RATIO;
    const padX = 8;
    const padY = 7;
    const plateW = logoW + padX * 2;
    const plateH = logoH + padY * 2;
    const plateX = pageWidth - margin - plateW;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(plateX, 14, plateW, plateH, 4, 4, "F");
    doc.addImage(logo, "PNG", plateX + padX, 14 + padY, logoW, logoH);
  }
  y = 100;
  doc.setTextColor(0, 0, 0);

  /* ------------------------------------------------ helpers */
  const heading = (title: string) => {
    y += 8;
    if (y > pageHeight - 110) {
      doc.addPage();
      y = margin;
    }
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

  const subHeading = (title: string) => {
    if (y > pageHeight - 90) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(clean(title), margin, y + 4);
    doc.setTextColor(0, 0, 0);
    y += 10;
  };

  const note = (message: string) => {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(clean(message), margin, y + 8);
    doc.setTextColor(0, 0, 0);
    y += 22;
  };

  /** Label / value pairs laid out two per row. */
  const keyValues = (pairs: [string, unknown][]) => {
    const rows: Row[] = [];
    for (let i = 0; i < pairs.length; i += 2) {
      const a = pairs[i];
      const b = pairs[i + 1];
      rows.push([clean(a[0]), clean(a[1]), b ? clean(b[0]) : "", b ? clean(b[1]) : ""]);
    }
    autoTable(doc, {
      startY: y,
      body: rows,
      theme: "plain",
      margin: { left: margin, right: margin },
      styles: { fontSize: 8.5, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, valign: "top", overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.19, textColor: MUTED, fontStyle: "normal" },
        1: { cellWidth: contentWidth * 0.31, fontStyle: "bold", textColor: NAVY },
        2: { cellWidth: contentWidth * 0.19, textColor: MUTED, fontStyle: "normal" },
        3: { cellWidth: contentWidth * 0.31, fontStyle: "bold", textColor: NAVY },
      },
      alternateRowStyles: { fillColor: LIGHT },
    });
    y = lastY() + 12;
  };

  const table = (head: string[], body: Row[], opts: { rightAlign?: number[]; foot?: Row } = {}) => {
    const columnStyles: Record<number, { halign: "right" }> = {};
    (opts.rightAlign ?? []).forEach((i) => (columnStyles[i] = { halign: "right" }));
    autoTable(doc, {
      startY: y,
      head: [head.map(clean)],
      body: body.map((r) => r.map(clean)),
      foot: opts.foot ? [opts.foot.map(clean)] : undefined,
      theme: "striped",
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3.5, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: LIGHT, textColor: NAVY, fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles,
      // headers / footers of number columns line up with their values
      didParseCell: (cell) => {
        if ((opts.rightAlign ?? []).includes(cell.column.index) && cell.section !== "body") cell.cell.styles.halign = "right";
      },
      showFoot: "lastPage",
    });
    y = lastY() + 12;
  };

  /* ------------------------------------------------ 1. summary */
  heading("1. Summary");
  keyValues([
    ["Contract Value", rs(s.contractValue)],
    ["Invoiced (incl. GST)", rs(s.invoiceTotal)],
    ["Paid / Adjusted", rs(s.paidAgainstInvoices)],
    ["Outstanding", rs(s.outstandingAmount)],
    ["Receipts Received", rs(s.receiptsTotal)],
    ["Refunds", rs(s.refundsTotal)],
    ["Total Quantity", qty(s.totalQuantityMT)],
    ["Arranged", qty(s.arrangedQuantityMT)],
    ["Dispatched", qty(s.dispatchedQuantityMT)],
    ["Pending", qty(s.pendingQuantityMT)],
    ["Received (goods receipts)", qty(s.receivedQuantityMT)],
    ["Rejected", qty(s.rejectedQuantityMT)],
    ["Trucks", `${s.truckCount} (${s.trucksAssigned} assigned, ${s.trucksLoaded} loaded, ${s.trucksCancelled} cancelled)`],
    ["Invoices / Receipts", `${s.invoiceCount} / ${s.receiptCount}`],
  ]);

  /* ------------------------------------------------ 2. contract details */
  heading("2. Contract Details");
  keyValues([
    ["Contract Number", o.contractNumber],
    ["Status", o.status],
    ["Contract Date", d(o.contractDate)],
    ["Approval Required", o.approvalRequired ? "Yes" : "No"],
    ["Product", o.productName],
    ["SKU", o.productSku],
    ["Total Quantity", qty(o.totalQuantityMT)],
    ["Min / Max Quantity", `${qty(o.minQuantityMT)} / ${qty(o.maxQuantityMT)}`],
    ["PO Tolerance", percent(o.tolerancePercentage)],
    ["Delivery Type", o.deliveryType],
    ["Contract Rate (per MT)", rs(o.pricePerMT)],
    ["GST", `${percent(o.gstPercentage)}${o.gstDetails ? ` (${o.gstDetails})` : ""}`],
    ["GST per MT", rs(o.gstAmountPerMT)],
    ["Net Rate (per MT)", rs(o.netRatePerMT)],
    ["Approx. Travel Time", travelTime(o.approxTravelDays, o.approxTravelHours)],
    ["Currency", o.currencyCode],
    ["Loading Address", data.seller.contractAddress?.fullAddress],
    ["Delivery Address", data.buyer.contractAddress?.fullAddress],
    ["Created By / On", `${o.createdByName ?? `User #${o.createdBy}`}, ${dt(o.createdOn)}`],
    ["Last Modified", o.modifiedOn ? `${o.modifiedByName ?? `User #${o.modifiedBy}`}, ${dt(o.modifiedOn)}` : "-"],
    ["Remarks", o.remarks],
    ["Product Description", o.productDescription],
  ]);

  subHeading("Payment terms");
  const t = data.paymentTerms;
  if (!t) {
    note("No payment terms recorded.");
  } else {
    keyValues([
      ["Payment Terms", t.paymentTermName],
      ["Payment Before", d(t.paymentBeforeDate)],
      ["Seller Payment Due", t.sellerPaymentDueDays != null ? `${t.sellerPaymentDueDays} days` : "-"],
      ["Buyer Payment Due", t.buyerPaymentDueDays != null ? `${t.buyerPaymentDueDays} days` : "-"],
      ["Immediate Advance", `${percent(t.immediateAdvancePercentage)} on ${d(t.immediateAdvanceDate)}`],
      ["Balance Advance", `${percent(t.balanceAdvancePercentage)} on ${d(t.balanceAdvanceDate)}`],
      ["Payment Remarks", t.remarks],
    ]);
  }

  /* ------------------------------------------------ 3. parties */
  const party = (label: string, p: ContractFullParty, addressLabel: string) => {
    subHeading(`${label}: ${p.legalName ?? "-"}`);
    keyValues([
      ["Trading Name", p.tradingName],
      ["Profile Type", p.profileType],
      ["GST Number", p.gstNumber],
      ["PAN", p.panNumber],
      ["Mobile", p.mobileNumber],
      ["Alternate Contact", p.alternativeContactNumber],
      ["Email", p.emailId],
      ["Status", p.status],
      [addressLabel, p.contractAddress?.fullAddress],
    ]);
    if (p.contacts.length > 0) {
      table(
        ["Contact", "Role", "Mobile", "Email"],
        p.contacts.map((c) => [
          `${c.contactPerson ?? "-"}${c.isUnloadingContact ? " (unloading)" : ""}`,
          [c.contactType, c.designation].filter(Boolean).join(" | ") || "-",
          c.mobileNumber ?? "-",
          c.emailId ?? "-",
        ]),
      );
    }
    if (p.bankAccounts.length > 0) {
      table(
        ["Bank", "Account", "IFSC", "Holder"],
        p.bankAccounts.map((b) => [
          `${b.bankName ?? "-"}${b.isPrimary ? " (primary)" : ""}${b.branchName ? `, ${b.branchName}` : ""}`,
          `${b.accountNumberMasked ?? "-"}${b.accountType ? ` (${b.accountType})` : ""}`,
          b.ifscCode ?? "-",
          b.accountHolderName ?? "-",
        ]),
      );
    }
  };
  heading("3. Seller & Buyer");
  party("Seller", data.seller, "Loading Address");
  party("Buyer", data.buyer, "Delivery Address");

  /* ------------------------------------------------ 4. conditions & quality */
  const conditions = (label: string, c: ContractFullConditions) => {
    subHeading(`${label} conditions`);
    keyValues([
      ["Commission", num(c.commission)],
      ["Delivery Schedule", humanize(c.deliverySchedule)],
      ["From", d(c.fromDate)],
      ["To", d(c.toDate)],
      ["Specific Days", c.specificDays ?? "-"],
      ["Quality Spec Source", c.qualitySpecSource],
      ["Remarks / Special Conditions", c.remarksSpecialConditions],
    ]);
    if (c.qualitySpecifications.length > 0) {
      table(
        ["Quality parameter", "Min", "Max", "Unit"],
        c.qualitySpecifications.map((q) => [q.parameter ?? "-", num(q.minValue), num(q.maxValue), q.unit ?? "-"]),
        { rightAlign: [1, 2] },
      );
    }
  };
  heading("4. Conditions & Quality Specifications");
  conditions("Seller", data.sellerConditions);
  conditions("Buyer", data.buyerConditions);

  /* ------------------------------------------------ 5. trucks & schedules */
  heading("5. Trucks & Dispatch");
  if (data.trucks.length === 0) {
    note("No trucks have been assigned to this contract.");
  } else {
    table(
      ["Truck", "Driver", "Transporter", "LR No.", "Assigned On", "Qty", "Freight", "Route", "Status"],
      data.trucks.map((x) => [
        `${x.truckNumber ?? "-"}${x.truckType ? `\n${x.truckType}` : ""}`,
        `${x.driverName ?? "-"}${x.driverMobile ? `\n${x.driverMobile}` : ""}`,
        `${x.transporterName ?? "-"}\n${x.assignmentType ?? ""}${x.isReassigned ? " (re-assigned)" : ""}`,
        x.lrNumber ?? "-",
        dt(x.assignedOn),
        qty(x.quantityMT),
        `${rs(x.freightAmount)}\n${rs(x.freightPerMT)}/MT`,
        `${x.fromAddress ?? "-"}\n-> ${x.toAddress ?? "-"}`,
        x.status ?? "-",
      ]),
      { rightAlign: [5, 6] },
    );
  }

  const goods = data.trucks.flatMap((x) => x.receipts.map((r) => [x.truckNumber ?? "-", d(r.receivedDate), qty(r.receivedQuantity), qty(r.rejectedQuantity), qty(r.acceptedQuantity), r.warehouse ?? "-", r.remarks ?? "-"]));
  if (goods.length > 0) {
    subHeading("Goods receipts");
    table(["Truck", "Received", "Qty received", "Rejected", "Accepted", "Warehouse", "Remarks"], goods, { rightAlign: [2, 3, 4] });
  }

  if (data.schedules.length > 0) {
    subHeading("Dispatch schedules");
    table(
      ["Schedule", "Qty", "Remaining", "Freight/MT", "From", "To", "Status"],
      data.schedules.map((x) => [dt(x.scheduleDateTime), qty(x.quantityMT), qty(x.remainingQuantityMT), x.freightPerMT != null ? rs(x.freightPerMT) : "-", x.fromAddress ?? "-", x.toAddress ?? "-", x.status ?? "-"]),
      { rightAlign: [1, 2, 3] },
    );
    const responses = data.schedules.flatMap((x) =>
      x.transporters.map((r) => [dt(x.scheduleDateTime), r.transporterName ?? "-", `${r.responseStatus ?? "-"}${r.negotiated ? " (negotiated)" : ""}`, qty(r.offeredQuantityMT), qty(r.acceptedQuantityMT), qty(r.cancelledQuantityMT), rs(r.acceptedFreightPerMT ?? r.offeredFreightPerMT)]),
    );
    if (responses.length > 0) {
      subHeading("Transporter responses");
      table(["Schedule", "Transporter", "Response", "Offered", "Accepted", "Cancelled", "Freight/MT"], responses, { rightAlign: [3, 4, 5, 6] });
    }
  }

  /* ------------------------------------------------ 6. invoices */
  heading("6. Invoices");
  if (data.invoices.length === 0) {
    note("No invoices have been raised against this contract.");
  } else {
    table(
      ["Invoice", "Date", "Truck", "Qty (MT)", "Amount (Rs.)", "GST (Rs.)", "Total (Rs.)", "Deduct. (Rs.)", "Paid (Rs.)", "Balance (Rs.)", "Status"],
      data.invoices.map((i) => [
        `${i.invoiceNumber ?? "-"}\n${i.financialYear ?? ""}`,
        d(i.invoiceDate),
        i.truckNumber ?? "-",
        num(i.quantityMT),
        rsn(i.invoiceAmount),
        rsn(i.gstAmount),
        rsn(i.totalAmount),
        rsn(i.deductionsTotal),
        rsn(i.paidAmount + i.allocatedFromReceipts),
        rsn(i.balanceAmount),
        i.status ?? "-",
      ]),
      {
        rightAlign: [3, 4, 5, 6, 7, 8, 9],
        foot: ["Totals", "", "", "", rsn(s.invoicedAmount), rsn(s.invoicedGst), rsn(s.invoiceTotal), rsn(s.deductionsTotal), rsn(s.paidAgainstInvoices), rsn(s.outstandingAmount), ""],
      },
    );
    const deductions = data.invoices.flatMap((i) => i.deductions.map((x) => [i.invoiceNumber ?? "-", d(x.deductionDate), x.isTdsTcs ? "TDS / TCS" : "Other", rs(x.amount), x.remarks ?? "-"]));
    if (deductions.length > 0) {
      subHeading("Deductions");
      table(["Invoice", "Date", "Type", "Amount", "Remarks"], deductions, { rightAlign: [3] });
    }
  }

  /* ------------------------------------------------ 7. payments */
  heading("7. Payments");
  if (data.receipts.length === 0) {
    note("No payment receipts are linked to this contract.");
  } else {
    table(
      ["Receipt", "Date", "Mode / Reference", "Amount", "Applied here", "Applied to", "Status"],
      data.receipts.map((r) => [
        `${r.receiptNumber ?? "-"}\n${r.kind ?? ""}${r.towards ? ` | ${r.towards}` : ""}`,
        d(r.receiptDate),
        `${r.paymentMode ?? "-"}${r.reference ? `\n${r.reference}` : ""}${r.bankName ? `\n${r.bankName}` : ""}`,
        rs(r.amount),
        rs(r.allocatedToThisContract),
        r.allocations.length === 0 ? "-" : r.allocations.map((a) => `${a.invoiceNumber ?? "-"}: ${rs(a.amount)} (${a.allocationType ?? "-"}${a.status !== "Active" ? `, ${a.status}` : ""})`).join("\n"),
        r.status ?? "-",
      ]),
      { rightAlign: [3, 4] },
    );
  }
  const invoicePayments = data.invoices.flatMap((i) => i.payments.map((p) => [i.invoiceNumber ?? "-", d(p.paidDate), p.paymentMode ?? "-", p.paymentReference ?? "-", rs(p.amountPaid), p.paymentStatus ?? "-"]));
  if (invoicePayments.length > 0) {
    subHeading("Payments against invoices");
    table(["Invoice", "Paid on", "Mode", "Reference", "Amount", "Status"], invoicePayments, { rightAlign: [4] });
  }
  if (data.refunds.length > 0) {
    subHeading("Refunds");
    table(
      ["Refund", "Receipt", "Date", "Mode / Reference", "Amount", "Status"],
      data.refunds.map((r) => [`#${r.refundId}`, r.receiptNumber ?? "-", d(r.refundDate), `${r.paymentMode ?? "-"}${r.reference ? ` | ${r.reference}` : ""}`, rs(r.amount), r.status ?? "-"]),
      { rightAlign: [4] },
    );
  }

  /* ------------------------------------------------ 8. history & records */
  heading("8. Status History, Documents & Notifications");
  if (data.statusHistory.length === 0) {
    note("No status changes recorded.");
  } else {
    table(
      ["When", "From", "To", "Changed by", "Remarks"],
      data.statusHistory.map((h) => [dt(h.changedOn), h.oldStatus ?? "-", h.newStatus ?? "-", h.changedByName ?? "-", h.remarks ?? "-"]),
    );
  }
  if (data.documents.length > 0) {
    subHeading("Documents");
    table(["Document", "Type", "Version", "Uploaded"], data.documents.map((x) => [x.documentName ?? "-", x.documentType ?? "-", x.version ?? "-", d(x.uploadedAt)]));
  }
  if (data.notifications.length > 0) {
    subHeading("Notifications sent");
    table(["Channel", "Status", "Sent", "Remarks"], data.notifications.map((n) => [n.channel ?? "-", n.status ?? "-", dt(n.sentOn), n.remarks ?? "-"]));
  }

  /* ------------------------------------------------ footer on every page */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(clean(`Contract ${number} - summary report`), margin, pageHeight - 16);
    doc.text(`Page ${p} of ${pages}`, pageWidth - margin, pageHeight - 16, { align: "right" });
  }

  doc.save(`Contract-${number.replace(/[^A-Za-z0-9-_]/g, "_")}-Summary.pdf`);
}
