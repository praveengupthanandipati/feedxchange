import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { useGetAllContractsByFiltersQuery, type PendingContractApiResponse } from "../../../../core/store/contractsApi";
import Table from "../../../../shared/components/table/Table";
import RowActionsMenu, { type RowAction } from "../../../../shared/components/table/RowActionsMenu";
import { useAuth } from "../../../../core/auth/AuthContext";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, CircleCheckBigIcon, ListChecksIcon, ScrollTextIcon, SendIcon, TruckIcon } from "../../../../shared/components/icon";
import { useGetInvoiceAgingQuery, type InvoiceAging } from "../../../../core/store/sellerInvoiceApi";
import ReportPanel from "./ReportPanel";
import { PENDING_STATUSES, contractsFor, money, shortDate, type AccountContext, type ReportDef } from "./sellerBuyerAccounts.data";

interface Props {
  report: ReportDef;
  ctx: AccountContext;
}

/** Quantity not yet dispatched (contract quantity less what has gone out). */
const balance = (r: PendingContractApiResponse) => Math.max((r.basicDetails.quantity ?? 0) - (r.basicDetails.dispatchedQuantity ?? 0), 0);

const qty = (value: number | null | undefined, measure?: string) => `${(value ?? 0).toLocaleString("en-IN")} ${(measure || "MT").toUpperCase()}`;

const contractLink = (row: PendingContractApiResponse) => (
  <Link to={`/admin/contracts/${row.contractNumber}`} className="sba-link">
    {row.contractNumber}
  </Link>
);

const baseColumns: TableColumn<PendingContractApiResponse>[] = [
  { key: "contractNumber", header: "Contract", sortable: true, hideable: false, render: contractLink, exportValue: (r) => r.contractNumber },
  { key: "contractDate", header: "Date", sortable: true, render: (r) => shortDate(r.contractDate), sortValue: (r) => r.contractDate, exportValue: (r) => shortDate(r.contractDate) },
  { key: "status", header: "Status", sortable: true, render: (r) => r.basicDetails.calculatedStatus, sortValue: (r) => r.basicDetails.calculatedStatus, exportValue: (r) => r.basicDetails.calculatedStatus },
  { key: "seller", header: "Seller", sortable: true, render: (r) => r.sellerName ?? "—", sortValue: (r) => r.sellerName ?? "", exportValue: (r) => r.sellerName ?? "" },
  { key: "buyer", header: "Buyer", sortable: true, render: (r) => r.buyerName ?? "—", sortValue: (r) => r.buyerName ?? "", exportValue: (r) => r.buyerName ?? "" },
  { key: "product", header: "Product", sortable: true, render: (r) => r.productName ?? "—", sortValue: (r) => r.productName ?? "", exportValue: (r) => r.productName ?? "" },
  { key: "deliveryType", header: "Delivery", headerTooltip: "Delivery type", sortable: true, render: (r) => r.basicDetails.deliveryType || "—", sortValue: (r) => r.basicDetails.deliveryType ?? "", exportValue: (r) => r.basicDetails.deliveryType ?? "" },
];

// ---------------------------------------------------------------- the invoices of one contract

const STATUS_LABEL: Record<InvoiceAging["status"], string> = { Paid: "Paid", "Partially Paid": "Partially paid", Pending: "Unpaid" };
const STATUS_COLOR: Record<InvoiceAging["status"], string> = { Paid: "#15803d", "Partially Paid": "#b45309", Pending: "#b91c1c" };

/** "− ₹2,500" (deducted), "+ ₹5,000" (added) or "—". */
const adjustmentText = (value: number) => (Math.abs(value) < 0.005 ? "—" : value > 0 ? `− ${money(value)}` : `+ ${money(-value)}`);

const StatusTag = ({ status }: { status: InvoiceAging["status"] }) => (
  <span className="sba-status" style={{ color: STATUS_COLOR[status], background: `${STATUS_COLOR[status]}1a` }}>
    {STATUS_LABEL[status]}
  </span>
);

const invoiceTableColumns: TableColumn<InvoiceAging>[] = [
  { key: "invoiceNumber", header: "Invoice #", sortable: true, hideable: false },
  { key: "invoiceDate", header: "Invoice date", sortable: true, render: (r) => shortDate(r.invoiceDate), sortValue: (r) => r.invoiceDate, exportValue: (r) => shortDate(r.invoiceDate) },
  { key: "truckNumber", header: "Truck number", sortable: true, render: (r) => r.truckNumber || "—", sortValue: (r) => r.truckNumber ?? "", exportValue: (r) => r.truckNumber ?? "" },
  { key: "numberOfBags", header: "No. of bags", sortable: true, align: "right", render: (r) => (r.numberOfBags == null ? "—" : r.numberOfBags.toLocaleString("en-IN")), sortValue: (r) => r.numberOfBags ?? 0, exportValue: (r) => (r.numberOfBags == null ? "" : String(r.numberOfBags)) },
  { key: "invoiceQty", header: "Invoice qty", sortable: true, align: "right", render: (r) => `${r.invoiceQty.toLocaleString("en-IN", { maximumFractionDigits: 3 })} MT`, sortValue: (r) => r.invoiceQty, exportValue: (r) => `${r.invoiceQty} MT` },
  { key: "status", header: "Status", sortable: true, render: (r) => <StatusTag status={r.status} />, sortValue: (r) => r.status, exportValue: (r) => STATUS_LABEL[r.status] },
  {
    key: "adjustmentsTotal",
    header: "Adjustments",
    sortable: true,
    align: "right",
    render: (r) => (
      <span className="sba-adjust">
        <span className={r.adjustmentsTotal < 0 ? "sba-good" : r.adjustmentsTotal > 0 ? "sba-bad" : undefined}>{adjustmentText(r.adjustmentsTotal)}</span>
        <Link
          to={`/admin/payments/seller-invoice/view?invoice=${encodeURIComponent(r.invoiceNumber)}&invoiceId=${r.invoiceId}`}
          className="sba-adjust__link"
          title="Open the deductions and additions of this invoice (View Seller Invoices)"
          aria-label={`Adjustments of invoice ${r.invoiceNumber}`}
        >
          <ScrollTextIcon aria-hidden />
        </Link>
      </span>
    ),
    sortValue: (r) => r.adjustmentsTotal,
    exportValue: (r) => adjustmentText(r.adjustmentsTotal),
  },
  { key: "payableAmount", header: "Invoice amount", sortable: true, align: "right", render: (r) => money(r.payableAmount), sortValue: (r) => r.payableAmount, exportValue: (r) => money(r.payableAmount) },
  { key: "paidAmount", header: "Paid", sortable: true, align: "right", render: (r) => <span className={r.paidAmount > 0 ? "sba-good" : undefined}>{money(r.paidAmount)}</span>, sortValue: (r) => r.paidAmount, exportValue: (r) => money(r.paidAmount) },
  { key: "balanceAmount", header: "Balance", sortable: true, align: "right", render: (r) => <strong className={r.balanceAmount > 0 ? "sba-bad" : undefined}>{money(r.balanceAmount)}</strong>, sortValue: (r) => r.balanceAmount, exportValue: (r) => money(r.balanceAmount) },
  { key: "paidDate", header: "Paid date", sortable: true, render: (r) => (r.lastPaymentDate ? (r.firstPaymentDate === r.lastPaymentDate ? shortDate(r.lastPaymentDate) : `${shortDate(r.firstPaymentDate)} to ${shortDate(r.lastPaymentDate)}`) : "—"), sortValue: (r) => r.lastPaymentDate ?? "", exportValue: (r) => (r.lastPaymentDate ? `${shortDate(r.firstPaymentDate)} - ${shortDate(r.lastPaymentDate)}` : "") },
  { key: "dueDate", header: "Due date", sortable: true, render: (r) => shortDate(r.dueDate), sortValue: (r) => r.dueDate ?? "9999", exportValue: (r) => shortDate(r.dueDate) },
  {
    key: "timing",
    header: "Payment",
    sortable: true,
    render: (r) =>
      r.status === "Paid" || r.status === "Partially Paid" ? (
        r.delayDays === null ? (
          `${r.avgPaymentDays ?? 0} days`
        ) : (
          <span className={r.delayDays > 0 ? "sba-bad" : "sba-good"}>{r.delayDays > 0 ? `${r.delayDays} days late` : r.delayDays < 0 ? `${-r.delayDays} days early` : "On time"}</span>
        )
      ) : r.daysToDue !== null && r.daysToDue < 0 ? (
        <span className="sba-bad">Over due by {-r.daysToDue} days</span>
      ) : r.daysToDue !== null ? (
        `Due in ${r.daysToDue} days`
      ) : (
        "—"
      ),
    sortValue: (r) => r.daysToDue ?? 99999,
    exportValue: (r) => (r.delayDays === null ? "" : String(r.delayDays)),
  },
];

/** What fills a contract's expanded row: its invoices, split into paid / partly paid / unpaid, with the totals of each. */
const ContractInvoices = ({ invoices, loading, failed, ctx }: { invoices: InvoiceAging[]; loading: boolean; failed: boolean; ctx: AccountContext }) => {
  if (loading) return <div className="sba-expanded">Loading the invoices…</div>;
  if (failed) return <div className="sba-expanded sba-error">The invoices could not be loaded.</div>;
  if (invoices.length === 0) return <div className="sba-expanded sba-note">No invoice has been raised against this contract.</div>;
  const sumOf = (pick: (i: InvoiceAging) => number) => invoices.reduce((total, i) => total + pick(i), 0);
  return (
    <div className="sba-expanded">
      <Table
        exportName={`Invoices of contract ${invoices[0].contractNumber}`}
        exportSubtitle={`${ctx.aLabel} (${ctx.aRole}) | ${ctx.bLabel || "All"}`}
        columns={invoiceTableColumns}
        totalsLabel={`Total (${invoices.length} invoice${invoices.length === 1 ? "" : "s"})`}
        totals={{
          invoiceNumber: undefined,
          numberOfBags: sumOf((i) => i.numberOfBags ?? 0).toLocaleString("en-IN"),
          invoiceQty: `${sumOf((i) => i.invoiceQty).toLocaleString("en-IN", { maximumFractionDigits: 3 })} MT`,
          adjustmentsTotal: adjustmentText(sumOf((i) => i.adjustmentsTotal)),
          payableAmount: money(sumOf((i) => i.payableAmount)),
          paidAmount: money(sumOf((i) => i.paidAmount)),
          balanceAmount: money(sumOf((i) => i.balanceAmount)),
          status: (
            <span className="sba-totals-status">
              {(["Paid", "Partially Paid", "Pending"] as const).map((st) => {
                const n = invoices.filter((i) => i.status === st).length;
                return n > 0 ? (
                  <span key={st} className="sba-status" style={{ color: STATUS_COLOR[st], background: `${STATUS_COLOR[st]}1a` }}>
                    {n} {STATUS_LABEL[st].toLowerCase()}
                  </span>
                ) : null;
              })}
            </span>
          ),
        }}
        data={[...invoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate))}
        rowKey={(r) => String(r.invoiceId)}
        variant="light"
        emptyMessage="No invoice."
      />
    </div>
  );
};

/** Every contract of the chosen business owners in the period, whatever its status. */
export const AllContractsReport = ({ report, ctx }: Props) => {
  const { data, isFetching, isError } = useGetAllContractsByFiltersQuery();
  // the invoices of the chosen seller / buyer (whatever their date), grouped by contract for the expanded rows
  const invoicesQuery = useGetInvoiceAgingQuery({ sellerId: ctx.sellerId, buyerId: ctx.buyerId }, { refetchOnMountOrArgChange: true });
  const invoicesByContract = useMemo(() => {
    const map = new Map<string, InvoiceAging[]>();
    (invoicesQuery.data ?? []).forEach((i) => map.set(i.contractNumber, [...(map.get(i.contractNumber) ?? []), i]));
    return map;
  }, [invoicesQuery.data]);
  const [openContracts, setOpenContracts] = useState<string[]>([]);
  const toggle = (key: string) => setOpenContracts((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const rows = useMemo(() => contractsFor(data ?? [], ctx).sort((a, b) => b.contractDate.localeCompare(a.contractDate)), [data, ctx]);
  const columns: TableColumn<PendingContractApiResponse>[] = [
    {
      key: "contractNumber",
      header: "Contract",
      sortable: true,
      hideable: false,
      render: (r) => (
        <span className="sba-expander">
          <button type="button" onClick={() => toggle(String(r.contractId))} aria-expanded={openContracts.includes(String(r.contractId))} title="Show or hide the invoices of this contract">
            {openContracts.includes(String(r.contractId)) ? <ChevronDownIcon aria-hidden /> : <ChevronRightIcon aria-hidden />}
          </button>
          {contractLink(r)}
        </span>
      ),
      exportValue: (r) => r.contractNumber,
    },
    ...baseColumns.slice(1),
    { key: "qty", header: "Qty", sortable: true, align: "right", render: (r) => qty(r.basicDetails.quantity, r.basicDetails.quantityMeasure), sortValue: (r) => r.basicDetails.quantity, exportValue: (r) => qty(r.basicDetails.quantity, r.basicDetails.quantityMeasure) },
    { key: "dispatched", header: "Disp.", headerTooltip: "Dispatched quantity", sortable: true, align: "right", render: (r) => qty(r.basicDetails.dispatchedQuantity, r.basicDetails.quantityMeasure), sortValue: (r) => r.basicDetails.dispatchedQuantity ?? 0, exportValue: (r) => qty(r.basicDetails.dispatchedQuantity, r.basicDetails.quantityMeasure) },
    { key: "pending", header: "Balance", headerTooltip: "Balance to dispatch", sortable: true, align: "right", render: (r) => qty(balance(r), r.basicDetails.quantityMeasure), sortValue: (r) => balance(r), exportValue: (r) => qty(balance(r), r.basicDetails.quantityMeasure) },
    { key: "rate", header: "Rate", headerTooltip: "Contract rate per MT", sortable: true, align: "right", render: (r) => money(r.basicDetails.contractRate), sortValue: (r) => r.basicDetails.contractRate, exportValue: (r) => money(r.basicDetails.contractRate) },
    { key: "value", header: "Contract value", sortable: true, align: "right", render: (r) => money(r.basicDetails.quantity * r.basicDetails.contractRate), sortValue: (r) => r.basicDetails.quantity * r.basicDetails.contractRate, exportValue: (r) => money(r.basicDetails.quantity * r.basicDetails.contractRate) },
  ];
  const open = rows.filter((r) => PENDING_STATUSES.includes(r.basicDetails.calculatedStatus)).length;
  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={columns}
      rows={rows}
      rowKey={(r) => String(r.contractId)}
      actions={
        <span className="sba-expand-actions">
          <button type="button" className="table-toolbar__btn" onClick={() => setOpenContracts(rows.map((r) => String(r.contractId)))} disabled={rows.length === 0 || openContracts.length === rows.length} title="Open the invoices of every contract">
            <ChevronDownIcon aria-hidden /> Expand all
          </button>
          <button type="button" className="table-toolbar__btn" onClick={() => setOpenContracts([])} disabled={openContracts.length === 0} title="Close every opened contract">
            <ChevronRightIcon aria-hidden /> Collapse all
          </button>
        </span>
      }
      expandedRowKeys={openContracts}
      renderExpandedRow={(r) => <ContractInvoices invoices={invoicesByContract.get(r.contractNumber) ?? []} loading={invoicesQuery.isFetching} failed={invoicesQuery.isError} ctx={ctx} />}
      loading={isFetching}
      error={isError ? "The contracts could not be loaded." : null}
      emptyMessage="No contract for these filters."
      summary={[
        { label: "Contracts", value: String(rows.length), note: `${open} pending · ${rows.length - open} finished` },
        { label: "Contracted quantity", value: qty(rows.reduce((s, r) => s + (r.basicDetails.quantity ?? 0), 0)) },
        { label: "Dispatched", value: qty(rows.reduce((s, r) => s + (r.basicDetails.dispatchedQuantity ?? 0), 0)), tone: "good" },
        { label: "Balance to dispatch", value: qty(rows.filter((r) => PENDING_STATUSES.includes(r.basicDetails.calculatedStatus)).reduce((s, r) => s + balance(r), 0)), tone: "warn" },
      ]}
    />
  );
};

/** The ... menu of a pending contract: approve it, or take it on to trucks and schedules; each item opens that screen for the contract. */
const PendingRowActions = ({ row }: { row: PendingContractApiResponse }) => {
  const { can } = useAuth();
  const navigate = useNavigate();
  const status = row.basicDetails.calculatedStatus;
  const number = encodeURIComponent(row.contractNumber);
  const dispatch = "/admin/truck-management/open-pending-contracts";
  const approved = ["Open", "Partially Dispatched"].includes(status) && balance(row) > 0;
  const actions: RowAction[] = [
    ...(status === "Pending for Approval" && can("contract-status")
      ? [{ key: "approve", label: "Approve", icon: CircleCheckBigIcon, onClick: () => navigate(`/admin/contract-status?contract=${number}&status=Open`) }]
      : []),
    ...(approved && can("pending-contracts", "PENDING_CONTRACT", "ADD_INSTANT_TRUCK")
      ? [{ key: "instant", label: "Add Instant Truck", icon: TruckIcon, onClick: () => navigate(`${dispatch}/instant-truck?contract=${number}`) }]
      : []),
    ...(approved && can("pending-contracts", "PENDING_CONTRACT", "SCHEDULE_TRUCK_TO_TRANSPORTER")
      ? [{ key: "schedule", label: "Add Schedule", icon: SendIcon, onClick: () => navigate(`${dispatch}/schedule-dispatch?contract=${number}`) }]
      : []),
    ...(approved && can("pending-contracts", "PENDING_CONTRACT", "ARRANGEMENT_ADD_TRUCKS_TO_SCHEDULES", "freight-approval")
      ? [{ key: "truck-to-schedule", label: "Add Truck to Schedule", icon: ListChecksIcon, onClick: () => navigate("/admin/truck-management/arrangement/add-trucks-to-schedules") }]
      : []),
    ...(approved && can("pending-contracts", "PENDING_CONTRACT", "UPDATE_SCHEDULE")
      ? [{ key: "accept", label: "Accept Schedule", icon: CheckIcon, onClick: () => navigate(`${dispatch}/manage-schedule?contract=${number}`) }]
      : []),
  ];
  return actions.length ? <RowActionsMenu actions={actions} /> : <>—</>;
};

/** Contracts that are not finished yet: waiting for approval, open, or partly dispatched. */
export const PendingContractsReport = ({ report, ctx }: Props) => {
  const { data, isFetching, isError } = useGetAllContractsByFiltersQuery();
  const rows = useMemo(
    () => contractsFor(data ?? [], ctx).filter((r) => PENDING_STATUSES.includes(r.basicDetails.calculatedStatus)).sort((a, b) => b.contractDate.localeCompare(a.contractDate)),
    [data, ctx],
  );
  const columns: TableColumn<PendingContractApiResponse>[] = [
    ...baseColumns,
    { key: "qty", header: "Qty", sortable: true, align: "right", render: (r) => qty(r.basicDetails.quantity, r.basicDetails.quantityMeasure), sortValue: (r) => r.basicDetails.quantity, exportValue: (r) => qty(r.basicDetails.quantity, r.basicDetails.quantityMeasure) },
    { key: "dispatched", header: "Disp.", headerTooltip: "Dispatched quantity", sortable: true, align: "right", render: (r) => qty(r.basicDetails.dispatchedQuantity, r.basicDetails.quantityMeasure), sortValue: (r) => r.basicDetails.dispatchedQuantity ?? 0, exportValue: (r) => qty(r.basicDetails.dispatchedQuantity, r.basicDetails.quantityMeasure) },
    { key: "pending", header: "Balance", headerTooltip: "Balance to dispatch", sortable: true, align: "right", render: (r) => qty(balance(r), r.basicDetails.quantityMeasure), sortValue: (r) => balance(r), exportValue: (r) => qty(balance(r), r.basicDetails.quantityMeasure) },
    { key: "rate", header: "Rate", headerTooltip: "Contract rate per MT", sortable: true, align: "right", render: (r) => money(r.basicDetails.contractRate), sortValue: (r) => r.basicDetails.contractRate, exportValue: (r) => money(r.basicDetails.contractRate) },
    {
      key: "actions",
      header: "Actions",
      hideable: false,
      exportable: false,
      render: (r) => <PendingRowActions row={r} />,
    },
  ];
  const count = (status: string) => rows.filter((r) => r.basicDetails.calculatedStatus === status).length;
  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={columns}
      rows={rows}
      rowKey={(r) => String(r.contractId)}
      loading={isFetching}
      error={isError ? "The contracts could not be loaded." : null}
      emptyMessage="No pending contracts for these filters."
      summary={[
        { label: "Pending contracts", value: String(rows.length) },
        { label: "Waiting for approval", value: String(count("Pending for Approval")), tone: "warn" },
        { label: "Open", value: String(count("Open")) },
        { label: "Partially dispatched", value: String(count("Partially Dispatched")) },
        { label: "Quantity to dispatch", value: qty(rows.reduce((s, r) => s + (balance(r)), 0)) },
      ]}
    />
  );
};
