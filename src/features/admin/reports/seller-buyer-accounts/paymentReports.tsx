import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, XIcon } from "../../../../shared/components/icon";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { useGetInvoiceAgingQuery, type InvoiceAging } from "../../../../core/store/sellerInvoiceApi";
import { useSearchReceiptsQuery, type Receipt } from "../../../../core/store/paymentAdviceApi";
import ReportPanel from "./ReportPanel";
import AdjustmentsInfo from "./AdjustmentsInfo";
import { daysBetween, money, shortDate, todayIso, type AccountContext, type ReportDef } from "./sellerBuyerAccounts.data";

interface Props {
  report: ReportDef;
  ctx: AccountContext;
}

const useAging = (ctx: AccountContext) =>
  useGetInvoiceAgingQuery({ sellerId: ctx.sellerId, buyerId: ctx.buyerId, from: ctx.range.from, to: ctx.range.to }, { refetchOnMountOrArgChange: true });

const contractCell = (r: InvoiceAging) => (
  <Link to={`/admin/contracts/${r.contractNumber}`} className="sba-link">
    {r.contractNumber}
  </Link>
);

/** The columns every invoice report starts with. */
const invoiceColumns: TableColumn<InvoiceAging>[] = [
  { key: "invoiceNumber", header: "Invoice #", sortable: true, hideable: false },
  { key: "invoiceDate", header: "Invoice date", sortable: true, render: (r) => shortDate(r.invoiceDate), sortValue: (r) => r.invoiceDate, exportValue: (r) => shortDate(r.invoiceDate) },
  { key: "contractNumber", header: "Contract", sortable: true, render: contractCell, exportValue: (r) => r.contractNumber },
  { key: "sellerName", header: "Seller", sortable: true },
  { key: "buyerName", header: "Buyer", sortable: true },
];

const amountColumns: TableColumn<InvoiceAging>[] = [
  { key: "payableAmount", header: "Invoice amount", sortable: true, align: "right", render: (r) => money(r.payableAmount), sortValue: (r) => r.payableAmount, exportValue: (r) => money(r.payableAmount) },
  { key: "paidAmount", header: "Paid", sortable: true, align: "right", render: (r) => money(r.paidAmount), sortValue: (r) => r.paidAmount, exportValue: (r) => money(r.paidAmount) },
  { key: "balanceAmount", header: "Balance", sortable: true, align: "right", render: (r) => <strong>{money(r.balanceAmount)}</strong>, sortValue: (r) => r.balanceAmount, exportValue: (r) => money(r.balanceAmount) },
];

const sum = (rows: InvoiceAging[], pick: (r: InvoiceAging) => number) => rows.reduce((total, r) => total + pick(r), 0);
const unpaid = (rows: InvoiceAging[]) => rows.filter((r) => r.balanceAmount > 0.004);

// ---------------------------------------------------------------- Payments Pending: totals, age groups, pivot

interface PivotLine {
  id: number;
  name: string;
  cells: number[];
  invoices: number;
}

/** "30, 60, 90" -> [30, 60, 90] (positive whole days, sorted, no repeats). */
const parseBuckets = (text: string): number[] =>
  [...new Set(text.split(/[^0-9]+/).map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0))].sort((x, y) => x - y);

/** The age groups of a list of limits: 0-30, 31-60, 61-90, Over 90. */
const bucketLabels = (limits: number[]) => [
  ...limits.map((limit, i) => `${i === 0 ? 0 : limits[i - 1] + 1}-${limit} days`),
  `Over ${limits.length ? limits[limits.length - 1] : 0} days`,
];

const bucketIndex = (age: number, limits: number[]) => {
  const i = limits.findIndex((limit) => age <= limit);
  return i === -1 ? limits.length : i;
};

/**
 * What is still unpaid, as the filters say: how much is to be received (the business is the seller) and to be paid (it is the buyer),
 * the unpaid invoices grouped by age (the age limits can be changed), and a pivot of businesses by age group where any business can be left out.
 */
export const PaymentsPendingReport = ({ report, ctx }: Props) => {
  const range = { from: ctx.range.from, to: ctx.range.to };
  // as a seller the business receives, as a buyer it pays: both totals follow the business owner and the dates picked
  const asSeller = useGetInvoiceAgingQuery({ sellerId: ctx.aId, buyerId: ctx.bId, ...range }, { skip: !ctx.aId, refetchOnMountOrArgChange: true });
  const asBuyer = useGetInvoiceAgingQuery({ buyerId: ctx.aId, sellerId: ctx.bId, ...range }, { skip: !ctx.aId, refetchOnMountOrArgChange: true });
  const current = ctx.aRole === "Seller" ? asSeller : asBuyer;
  const today = todayIso();

  const [limitsText, setLimitsText] = useState("30, 60, 90");
  const [limits, setLimits] = useState<number[]>([30, 60, 90]);
  const [removed, setRemoved] = useState<number[]>([]);
  const labels = bucketLabels(limits);

  const allRows = useMemo(() => unpaid(current.data ?? []).sort((x, y) => x.invoiceDate.localeCompare(y.invoiceDate)), [current.data]);
  // the business on the other side of each invoice (the buyer when the owner sells, the seller when the owner buys)
  const partyOf = (r: InvoiceAging) => (ctx.aRole === "Seller" ? { id: r.buyerId, name: r.buyerName } : { id: r.sellerId, name: r.sellerName });
  const ageOf = (r: InvoiceAging) => Math.max(daysBetween(r.invoiceDate.slice(0, 10), today), 0);
  const rows = useMemo(() => allRows.filter((r) => !removed.includes(partyOf(r).id)), [allRows, removed]); // eslint-disable-line react-hooks/exhaustive-deps

  // pivot: one line per business, one column per age group
  const pivot = useMemo(() => {
    const map = new Map<number, PivotLine>();
    allRows.forEach((r) => {
      const party = partyOf(r);
      const line = map.get(party.id) ?? { id: party.id, name: party.name, cells: labels.map(() => 0), invoices: 0 };
      line.cells[bucketIndex(ageOf(r), limits)] += r.balanceAmount;
      line.invoices += 1;
      map.set(party.id, line);
    });
    return [...map.values()].sort((x, y) => y.cells.reduce((t, v) => t + v, 0) - x.cells.reduce((t, v) => t + v, 0));
  }, [allRows, limits]); // eslint-disable-line react-hooks/exhaustive-deps
  const kept = pivot.filter((line) => !removed.includes(line.id));
  const colTotals = labels.map((_, i) => kept.reduce((t, line) => t + line.cells[i], 0));

  const applyLimits = () => {
    const parsed = parseBuckets(limitsText);
    if (parsed.length === 0) return;
    setLimits(parsed);
    setLimitsText(parsed.join(", "));
  };

  const receivable = sum(unpaid(asSeller.data ?? []), (r) => r.balanceAmount);
  const payable = sum(unpaid(asBuyer.data ?? []), (r) => r.balanceAmount);
  const receivableCount = unpaid(asSeller.data ?? []).length;
  const payableCount = unpaid(asBuyer.data ?? []).length;

  const columns: TableColumn<InvoiceAging>[] = [
    ...invoiceColumns,
    { key: "productName", header: "Product", sortable: true, priority: "low" },
    ...amountColumns,
    { key: "status", header: "Status", sortable: true },
    {
      key: "age",
      header: "Age",
      headerTooltip: "Days since the invoice date",
      sortable: true,
      align: "right",
      render: (r) => (
        <>
          {ageOf(r)} days <small className="sba-sub">{labels[bucketIndex(ageOf(r), limits)]}</small>
        </>
      ),
      sortValue: (r) => ageOf(r),
      exportValue: (r) => `${ageOf(r)} days (${labels[bucketIndex(ageOf(r), limits)]})`,
    },
  ];

  const pivotColumns: TableColumn<PivotLine>[] = [
    {
      key: "name",
      header: ctx.aRole === "Seller" ? "Buyer" : "Seller",
      sortable: true,
      hideable: false,
      render: (line) => {
        const out = removed.includes(line.id);
        return (
          <span className="sba-pivot__party">
            <button
              type="button"
              className="sba-pivot__x"
              onClick={() => setRemoved((prev) => (out ? prev.filter((id) => id !== line.id) : [...prev, line.id]))}
              title={out ? "Put this business back in the report" : "Leave this business out of the report"}
              aria-label={out ? `Include ${line.name}` : `Leave out ${line.name}`}
            >
              {out ? <PlusIcon aria-hidden /> : <XIcon aria-hidden />}
            </button>
            <span style={out ? { opacity: 0.4, textDecoration: "line-through" } : undefined}>{line.name}</span>
          </span>
        );
      },
      sortValue: (line) => line.name,
      exportValue: (line) => line.name,
    },
    { key: "invoices", header: "Invoices", sortable: true, align: "right", render: (line) => line.invoices, sortValue: (line) => line.invoices, exportValue: (line) => String(line.invoices) },
    ...labels.map(
      (label, i): TableColumn<PivotLine> => ({
        key: `b${i}`,
        header: label,
        sortable: true,
        align: "right",
        render: (line) => (line.cells[i] > 0 ? <span className={removed.includes(line.id) ? "sba-pivot__muted" : bucketTone(i) === "bad" ? "sba-bad" : bucketTone(i) === "warn" ? "sba-warn" : undefined}>{money(line.cells[i])}</span> : "—"),
        sortValue: (line) => line.cells[i],
        exportValue: (line) => (line.cells[i] > 0 ? money(line.cells[i]) : ""),
      }),
    ),
    {
      key: "total",
      header: "Total",
      sortable: true,
      align: "right",
      render: (line) => <strong>{money(line.cells.reduce((t, v) => t + v, 0))}</strong>,
      sortValue: (line) => line.cells.reduce((t, v) => t + v, 0),
      exportValue: (line) => money(line.cells.reduce((t, v) => t + v, 0)),
    },
  ];

  const bucketTone = (i: number): "good" | "warn" | "bad" | "default" => (i === 0 ? "default" : i === labels.length - 1 ? "bad" : "warn");

  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={columns}
      rows={rows}
      rowKey={(r) => String(r.invoiceId)}
      hideTable
      loading={current.isFetching}
      error={current.isError ? "The invoices could not be loaded." : null}
      emptyMessage="No payment is pending for these filters."
      summary={[
        { label: "To receive (as seller)", value: money(receivable), note: plural(receivableCount, "invoice"), tone: "good" },
        { label: "To pay (as buyer)", value: money(payable), note: plural(payableCount, "invoice"), tone: "warn" },
        { label: "Net", value: money(receivable - payable), note: receivable - payable >= 0 ? "to receive" : "to pay", tone: receivable - payable >= 0 ? "good" : "bad" },
        { label: "Invoices with balance", value: String(rows.length) },
        { label: "Balance in this report", value: money(sum(rows, (r) => r.balanceAmount)), tone: "warn" },
      ]}
    >
      <Table
        exportName="Payments Pending by age"
        exportSubtitle={`${ctx.aLabel} (${ctx.aRole}) | ${ctx.bLabel || "All " + (ctx.aRole === "Seller" ? "buyers" : "sellers")} | ${ctx.range.label} | Age groups: ${labels.join(", ")}`}
        exportData={kept}
        columnToggle
        toolbar={
          <div className="sba-pivot__bar">
            <label>
              Age groups (days)
              <input
                value={limitsText}
                onChange={(event) => setLimitsText(event.target.value)}
                onBlur={applyLimits}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyLimits();
                }}
                placeholder="30, 60, 90"
                aria-label="Age group limits in days, separated by commas"
              />
            </label>
            <small>Age = days since the invoice date. X removes a business from the report.</small>
            {removed.length > 0 && (
              <button type="button" className="sba-pivot__reset" onClick={() => setRemoved([])}>
                Show all businesses again ({removed.length} left out)
              </button>
            )}
          </div>
        }
        columns={pivotColumns}
        data={kept}
        rowKey={(line) => String(line.id)}
        totalsLabel={`Total (${kept.length} business${kept.length === 1 ? "" : "es"})`}
        totals={{
          ...Object.fromEntries(labels.map((_, i) => [`b${i}`, money(colTotals[i])])),
          total: money(colTotals.reduce((t, v) => t + v, 0)),
          invoices: String(kept.reduce((t, line) => t + line.invoices, 0)),
        }}
        variant="light"
        emptyMessage={current.isFetching ? "Loading…" : "No payment is pending for these filters."}
      />
    </ReportPanel>
  );
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const mt = (value: number) => `${value.toLocaleString("en-IN", { maximumFractionDigits: 3 })} MT`;
const moneyColumn = (key: string, header: string, pick: (r: InvoiceAging) => number, bold = false): TableColumn<InvoiceAging> => ({
  key,
  header,
  sortable: true,
  align: "right",
  render: (r) => (bold ? <strong>{money(pick(r))}</strong> : money(pick(r))),
  sortValue: pick,
  exportValue: (r) => money(pick(r)),
});
const dueDaysText = (r: InvoiceAging) => (r.daysToDue === null ? "—" : r.daysToDue < 0 ? `Over due by ${plural(-r.daysToDue, "day")}` : r.daysToDue === 0 ? "Due today" : plural(r.daysToDue, "day"));

/** Due Payments columns; the business shown is the other side of business owner A (A as seller shows the buyer, and the other way round). */
const duePaymentColumns = (aRole: AccountContext["aRole"]): TableColumn<InvoiceAging>[] => {
  const party = (r: InvoiceAging) => (aRole === "Seller" ? r.buyerName : r.sellerName);
  return [
    { key: "invoiceDate", header: "Invoice date", sortable: true, render: (r) => shortDate(r.invoiceDate), sortValue: (r) => r.invoiceDate, exportValue: (r) => shortDate(r.invoiceDate) },
    { key: "invoiceNumber", header: "Invoice no.", sortable: true, hideable: false },
    { key: "party", header: aRole === "Seller" ? "Buyer" : "Seller", sortable: true, render: party, sortValue: party, exportValue: party },
    { key: "invoiceQty", header: "Quantity", sortable: true, align: "right", render: (r) => mt(r.invoiceQty), sortValue: (r) => r.invoiceQty, exportValue: (r) => mt(r.invoiceQty) },
    moneyColumn("freightAmount", "Freight", (r) => r.freightAmount),
    moneyColumn("invoiceTotal", "Invoice amount", (r) => r.invoiceTotal),
    {
      ...moneyColumn("adjustmentsTotal", "Adjustments", (r) => r.adjustmentsTotal),
      // an info icon shows the adjustment lines on hover (only when the invoice has any)
      render: (r) =>
        r.adjustments?.length ? (
          <span className="sba-adj-cell">
            {money(r.adjustmentsTotal)}
            <AdjustmentsInfo invoiceNumber={r.invoiceNumber} lines={r.adjustments} />
          </span>
        ) : (
          money(r.adjustmentsTotal)
        ),
    },
    moneyColumn("paidAmount", "Paid", (r) => r.paidAmount),
    moneyColumn("balanceAmount", "Pending", (r) => r.balanceAmount, true),
    { key: "committedDays", header: "Committed days", sortable: true, align: "right", render: (r) => (r.committedDays === null ? "—" : `${r.committedDays}`), sortValue: (r) => r.committedDays ?? -1, exportValue: (r) => (r.committedDays === null ? "" : String(r.committedDays)) },
    { key: "dueDate", header: "Due date", sortable: true, render: (r) => shortDate(r.dueDate), sortValue: (r) => r.dueDate ?? "9999", exportValue: (r) => shortDate(r.dueDate) },
    {
      key: "dueIn",
      header: "Due in days",
      sortable: true,
      align: "right",
      render: (r) => <span className={r.daysToDue !== null && r.daysToDue < 0 ? "sba-bad" : r.daysToDue !== null && r.daysToDue <= 7 ? "sba-warn" : undefined}>{dueDaysText(r)}</span>,
      sortValue: (r) => r.daysToDue ?? 99999,
      exportValue: dueDaysText,
    },
  ];
};

/**
 * Every unpaid invoice of the chosen business owners, whatever its contract or invoice date (the date filter does not apply here):
 * over due ones first, then due today, due soon, due later.
 */
export const DuePaymentsReport = ({ report, ctx }: Props) => {
  const allDates = useMemo(() => ({ ...ctx, range: { label: "All pending invoices" } }), [ctx]);
  const { data, isFetching, isError } = useGetInvoiceAgingQuery({ sellerId: ctx.sellerId, buyerId: ctx.buyerId }, { refetchOnMountOrArgChange: true });
  const rows = useMemo(() => unpaid(data ?? []).sort((a, b) => (a.daysToDue ?? 99999) - (b.daysToDue ?? 99999)), [data]);
  const overdue = rows.filter((r) => r.daysToDue !== null && r.daysToDue < 0);
  const today = rows.filter((r) => r.daysToDue === 0);
  const soon = rows.filter((r) => r.daysToDue !== null && r.daysToDue >= 0 && r.daysToDue <= 7);
  const noTerms = rows.filter((r) => r.daysToDue === null);
  // All Dues / Over Dues: which invoices the table (and its downloads) shows; the key figures always cover every pending invoice
  const [view, setView] = useState<"all" | "overdue">("all");
  const shown = view === "overdue" ? overdue : rows;
  return (
    <ReportPanel
      report={view === "overdue" ? { ...report, label: `${report.label} - Over Dues` } : report}
      ctx={allDates}
      columns={duePaymentColumns(ctx.aRole)}
      rows={shown}
      rowKey={(r) => String(r.invoiceId)}
      loading={isFetching}
      error={isError ? "The invoices could not be loaded." : null}
      emptyMessage={view === "overdue" ? "No invoice is over due for these business owners." : "No invoice is pending for these business owners."}
      actions={
        <div className="sba-toggle" role="group" aria-label="Which dues to show">
          {([
            ["all", `All Dues (${rows.length})`],
            ["overdue", `Over Dues (${overdue.length})`],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" className={view === key ? "is-active" : ""} aria-pressed={view === key} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </div>
      }
      summary={[
        { label: "Total pending", value: money(sum(rows, (r) => r.balanceAmount)), note: plural(rows.length, "invoice") },
        { label: "Over due", value: money(sum(overdue, (r) => r.balanceAmount)), note: plural(overdue.length, "invoice"), tone: overdue.length ? "bad" : "default" },
        { label: "Due today", value: money(sum(today, (r) => r.balanceAmount)), note: plural(today.length, "invoice"), tone: today.length ? "warn" : "default" },
        { label: "Due in 7 days", value: money(sum(soon, (r) => r.balanceAmount)), note: plural(soon.length, "invoice"), tone: soon.length ? "warn" : "default" },
        ...(noTerms.length ? [{ label: "No payment days set", value: money(sum(noTerms, (r) => r.balanceAmount)), note: plural(noTerms.length, "invoice") }] : []),
      ]}
    />
  );
};

/** How many days payments really took, against the days the contract committed. */
export const AvgPaymentDaysReport = ({ report, ctx }: Props) => {
  const { data, isFetching, isError } = useAging(ctx);
  const rows = useMemo(() => (data ?? []).filter((r) => r.avgPaymentDays !== null).sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate)), [data]);
  // one line per business on the other side of business owner A (A as seller: its buyers; as buyer: its sellers)
  const partyOf = (r: InvoiceAging) => (ctx.aRole === "Seller" ? { id: r.buyerId, name: r.buyerName } : { id: r.sellerId, name: r.sellerName });
  const lines = useMemo(() => {
    const groups = new Map<number, { id: number; name: string; invoices: InvoiceAging[] }>();
    rows.forEach((r) => {
      const party = partyOf(r);
      const group = groups.get(party.id) ?? { id: party.id, name: party.name, invoices: [] };
      group.invoices.push(r);
      groups.set(party.id, group);
    });
    return [...groups.values()]
      .map((g) => {
        const avg = (pick: (r: InvoiceAging) => number | null) => {
          const list = g.invoices.filter((r) => pick(r) !== null);
          const weight = sum(list, (r) => r.paidAmount);
          return weight > 0 ? Math.round((sum(list, (r) => (pick(r) as number) * r.paidAmount) / weight) * 10) / 10 : null;
        };
        const avgDays = avg((r) => r.avgPaymentDays);
        const committed = avg((r) => r.committedDays);
        const withTerms = g.invoices.filter((r) => r.delayDays !== null);
        const dates = (pick: (r: InvoiceAging) => string | null) => g.invoices.map(pick).filter((d): d is string => Boolean(d)).sort();
        return {
          id: g.id,
          name: g.name,
          invoices: g.invoices.length,
          paid: sum(g.invoices, (r) => r.paidAmount),
          committed,
          avgDays,
          delay: avgDays !== null && committed !== null ? Math.round((avgDays - committed) * 10) / 10 : null,
          onTime: withTerms.filter((r) => (r.delayDays ?? 0) <= 0).length,
          withTerms: withTerms.length,
          first: dates((r) => r.firstPaymentDate)[0] ?? null,
          last: dates((r) => r.lastPaymentDate).slice(-1)[0] ?? null,
        };
      })
      .sort((a, b) => b.paid - a.paid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, ctx.aRole]);
  type Line = (typeof lines)[number];
  const lateText = (l: Line) => (l.delay === null ? "No committed days" : l.delay > 0 ? `${l.delay} days late` : l.delay < 0 ? `${-l.delay} days early` : "On time");
  const days = (value: number | null) => (value === null ? "—" : `${value}`);
  const columns: TableColumn<Line>[] = [
    { key: "name", header: ctx.aRole === "Seller" ? "Buyer" : "Seller", sortable: true, hideable: false },
    { key: "invoices", header: "Invoices paid", sortable: true, align: "right", render: (l) => String(l.invoices), sortValue: (l) => l.invoices, exportValue: (l) => String(l.invoices) },
    { key: "paid", header: "Paid", sortable: true, align: "right", render: (l) => money(l.paid), sortValue: (l) => l.paid, exportValue: (l) => money(l.paid) },
    { key: "committed", header: "Committed days", headerTooltip: "Average of the contracts' payment days, weighted by the money paid", sortable: true, align: "right", render: (l) => days(l.committed), sortValue: (l) => l.committed ?? -1, exportValue: (l) => days(l.committed) },
    { key: "avgDays", header: "Average days taken", headerTooltip: "Days from invoice to payment, weighted by the money paid", sortable: true, align: "right", render: (l) => <strong>{days(l.avgDays)}</strong>, sortValue: (l) => l.avgDays ?? -1, exportValue: (l) => days(l.avgDays) },
    {
      key: "delay",
      header: "Against committed",
      sortable: true,
      render: (l) => <span className={l.delay !== null && l.delay > 0 ? "sba-bad" : l.delay !== null ? "sba-good" : undefined}>{lateText(l)}</span>,
      sortValue: (l) => l.delay ?? 0,
      exportValue: lateText,
    },
    { key: "onTime", header: "Paid on time", sortable: true, align: "right", render: (l) => (l.withTerms ? `${l.onTime} of ${l.withTerms}` : "—"), sortValue: (l) => (l.withTerms ? l.onTime / l.withTerms : -1), exportValue: (l) => (l.withTerms ? `${l.onTime} of ${l.withTerms}` : "") },
    { key: "first", header: "First payment", sortable: true, priority: "low", render: (l) => shortDate(l.first), sortValue: (l) => l.first ?? "", exportValue: (l) => shortDate(l.first) },
    { key: "last", header: "Last payment", sortable: true, priority: "low", render: (l) => shortDate(l.last), sortValue: (l) => l.last ?? "", exportValue: (l) => shortDate(l.last) },
  ];
  // averages are weighted by the money paid, so a large invoice counts for more than a small one
  const paidTotal = sum(rows, (r) => r.paidAmount);
  const weighted = (pick: (r: InvoiceAging) => number | null) => {
    const list = rows.filter((r) => pick(r) !== null);
    const weight = sum(list, (r) => r.paidAmount);
    return weight > 0 ? Math.round((sum(list, (r) => (pick(r) as number) * r.paidAmount) / weight) * 10) / 10 : null;
  };
  const avgDays = weighted((r) => r.avgPaymentDays);
  const avgCommitted = weighted((r) => r.committedDays);
  const withTerms = rows.filter((r) => r.delayDays !== null);
  const onTime = withTerms.filter((r) => (r.delayDays ?? 0) <= 0);
  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={columns}
      rows={lines}
      rowKey={(l) => String(l.id)}
      loading={isFetching}
      error={isError ? "The invoices could not be loaded." : null}
      emptyMessage="No invoice has been paid yet for these filters."
      summary={[
        { label: "Average days taken", value: avgDays === null ? "—" : `${avgDays} days`, note: `across ${money(paidTotal)} paid` },
        { label: "Average committed days", value: avgCommitted === null ? "—" : `${avgCommitted} days` },
        {
          label: "Against committed",
          value:
            avgDays === null || avgCommitted === null
              ? "—"
              : avgDays - avgCommitted > 0.05
                ? `${Math.round((avgDays - avgCommitted) * 10) / 10} days late`
                : avgCommitted - avgDays > 0.05
                  ? `${Math.round((avgCommitted - avgDays) * 10) / 10} days early`
                  : "On time",
          tone: avgDays === null || avgCommitted === null ? "default" : avgDays > avgCommitted + 0.05 ? "bad" : "good",
        },
        { label: "Invoices paid on time", value: withTerms.length ? `${onTime.length} of ${withTerms.length}` : "—", tone: withTerms.length && onTime.length < withTerms.length ? "warn" : "good" },
      ]}
    />
  );
};

// ---------------------------------------------------------------- payment advices

const receiptColumns = (withAllocation: boolean): TableColumn<Receipt>[] => [
  { key: "receiptNumber", header: "Receipt #", sortable: true, hideable: false },
  { key: "receiptDate", header: "Date", sortable: true, render: (r) => shortDate(r.receiptDate), sortValue: (r) => r.receiptDate, exportValue: (r) => shortDate(r.receiptDate) },
  {
    key: "kind",
    header: "Type",
    sortable: true,
    render: (r) => (
      <>
        {r.kind === "Advance" ? `Advance${r.contractNumber ? ` · ${r.contractNumber}` : ""}` : "Payment"}
        {r.convertedFromReceiptNumber && <small className="sba-sub">Converted from advance {r.convertedFromReceiptNumber}</small>}
        {r.groupPartCount > 1 && <small className="sba-sub">One payment of {money(r.groupTotalAmount ?? r.amount)} in {r.groupPartCount} parts</small>}
      </>
    ),
    sortValue: (r) => r.kind,
    exportValue: (r) => (r.kind === "Advance" ? `Advance ${r.contractNumber ?? ""}`.trim() : "Payment"),
  },
  { key: "paymentMode", header: "Mode / Reference", sortable: true, render: (r) => `${r.paymentMode}${r.reference ? ` · ${r.reference}` : ""}`, sortValue: (r) => r.paymentMode, exportValue: (r) => `${r.paymentMode}${r.reference ? ` · ${r.reference}` : ""}` },
  { key: "towards", header: "Towards", sortable: true, priority: "low", render: (r) => r.towards ?? "—", sortValue: (r) => r.towards ?? "", exportValue: (r) => r.towards ?? "" },
  { key: "amount", header: "Amount", sortable: true, align: "right", render: (r) => money(r.amount), sortValue: (r) => r.amount, exportValue: (r) => money(r.amount) },
  ...(withAllocation
    ? ([
        { key: "allocatedAmount", header: "Allocated", sortable: true, align: "right", render: (r) => money(r.allocatedAmount), sortValue: (r) => r.allocatedAmount, exportValue: (r) => money(r.allocatedAmount) },
        { key: "refundedAmount", header: "Refunded", sortable: true, align: "right", render: (r) => money(r.refundedAmount), sortValue: (r) => r.refundedAmount, exportValue: (r) => money(r.refundedAmount) },
      ] as TableColumn<Receipt>[])
    : []),
  { key: "unallocatedAmount", header: "Un-allocated", sortable: true, align: "right", render: (r) => <strong>{money(r.unallocatedAmount)}</strong>, sortValue: (r) => r.unallocatedAmount, exportValue: (r) => money(r.unallocatedAmount) },
];

/** Money received (payments and advances) that has not been adjusted to invoices yet. */
export const UnallocatedAdvicesReport = ({ report, ctx }: Props) => {
  const { data = [], isFetching, isError } = useSearchReceiptsQuery({ sellerId: ctx.sellerId, buyerId: ctx.buyerId, from: ctx.range.from, to: ctx.range.to }, { refetchOnMountOrArgChange: true });
  const rows = useMemo(() => [...data].sort((a, b) => b.receiptDate.localeCompare(a.receiptDate)), [data]);
  const advance = rows.filter((r) => r.kind === "Advance");
  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={receiptColumns(true)}
      rows={rows}
      rowKey={(r) => String(r.receiptId)}
      loading={isFetching}
      error={isError ? "The payment advices could not be loaded." : null}
      emptyMessage="Every payment advice has been allocated for these filters."
      summary={[
        { label: "Advices with money left", value: String(rows.length) },
        { label: "Un-allocated in all", value: money(sum2(rows, (r) => r.unallocatedAmount)), tone: "warn" },
        { label: "Of it, advances", value: money(sum2(advance, (r) => r.unallocatedAmount)) },
        { label: "Of it, regular payments", value: money(sum2(rows.filter((r) => r.kind === "Regular"), (r) => r.unallocatedAmount)) },
      ]}
    />
  );
};

/** Every payment advice received in the period, with what was allocated, refunded and left. */
export const PaymentAdvicesReport = ({ report, ctx }: Props) => {
  const { data = [], isFetching, isError } = useSearchReceiptsQuery(
    { sellerId: ctx.sellerId, buyerId: ctx.buyerId, from: ctx.range.from, to: ctx.range.to, includeFullyAllocated: true },
    { refetchOnMountOrArgChange: true },
  );
  const rows = useMemo(() => [...data].sort((a, b) => b.receiptDate.localeCompare(a.receiptDate)), [data]);
  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={receiptColumns(true)}
      rows={rows}
      rowKey={(r) => String(r.receiptId)}
      loading={isFetching}
      error={isError ? "The payment advices could not be loaded." : null}
      emptyMessage="No payment advice for these filters."
      summary={[
        { label: "Payment advices", value: String(rows.length) },
        { label: "Received", value: money(sum2(rows, (r) => r.amount)) },
        { label: "Allocated to invoices", value: money(sum2(rows, (r) => r.allocatedAmount)), tone: "good" },
        { label: "Refunded", value: money(sum2(rows, (r) => r.refundedAmount)) },
        { label: "Un-allocated", value: money(sum2(rows, (r) => r.unallocatedAmount)), tone: "warn" },
      ]}
    />
  );
};

function sum2<T>(rows: T[], pick: (r: T) => number) {
  return rows.reduce((total, r) => total + pick(r), 0);
}
