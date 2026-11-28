import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PartyName from "../../../../shared/components/party/PartyName";
import { CircleCheckBigIcon, CircleXIcon, EyeIcon, EyeOffIcon, PenIcon, SearchIcon } from "../../../../shared/components/icon";
import { Badge, Input, Select, type BadgeTone } from "../../../../shared/components/ui";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import EditInvoiceOffcanvas from "./EditInvoiceOffcanvas";
import {
  apiErrorMessage,
  useCancelInvoiceMutation,
  useGetInvoicesQuery,
  type Invoice,
} from "../../../../core/store/sellerInvoiceApi";
import { useNotifyPrompt } from "../../../../shared/notifications/useNotifyPrompt";
// the dashboards' table toolbar (bd-toolbar) and note (bd-note) styles
import "../../business-dashboard/BusinessDashboard.scss";
import { DATE_PRESETS, presetRange } from "../dateRanges";
import { useBusinessFilter } from "../../common/business-period/useBusinessFilter";
import "./EditSellerInvoices.scss";

/** Rows per page of the table (the same as the dashboards' tables). */
const PAGE_SIZE = 10;
/** Invoices loaded at once (the API's limit); the table then searches, sorts and pages them on screen. */
const MAX_ROWS = 200;

const statusTone = (status: string): BadgeTone =>
  status === "Paid" ? "success" : status === "Partially Paid" ? "info" : status === "Pending" ? "warning" : status === "Cancelled" ? "danger" : "neutral";

/** "2026-6" before "2026-11": the year and the running number compared as numbers. */
const contractSortKey = (contractNumber: string): string | number => {
  const m = /^(\d+)-(\d+)$/.exec(contractNumber.trim());
  return m ? Number(m[1]) * 1_000_000 + Number(m[2]) : contractNumber;
};

const matches = (needle: string, ...values: (string | number | null | undefined)[]) =>
  !needle || values.some((value) => value != null && String(value).toLowerCase().includes(needle));

const STATUS_FILTERS = [
  { value: "Uncleared", label: "Uncleared (can be edited)" },
  { value: "Pending", label: "Pending" },
  { value: "Partially Paid", label: "Partially Paid" },
  { value: "Paid", label: "Paid (cleared)" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "", label: "All except cancelled" },
];

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

/**
 * The deductions and additions of one invoice, set out as a statement:
 * invoice amount, each adjustment (deductions in red with a minus, additions in green with a plus), the total of the adjustments and the amount to be paid.
 */
const DeductionLines = ({ invoice }: { invoice: Invoice }) => {
  const good = "var(--color-success, #15803d)";
  const bad = "var(--color-danger, #b91c1c)";
  const cell: React.CSSProperties = { border: "1px solid var(--color-border, #d4d8de)", padding: "3px 10px", lineHeight: 1.3, fontSize: "var(--fx-text-sm)", color: "var(--color-text, inherit)" };
  const num: React.CSSProperties = { ...cell, textAlign: "right", whiteSpace: "nowrap", fontWeight: 600 };
  const signed = (amount: number) => (amount < 0 ? `+ ${money(-amount)}` : `− ${money(amount)}`);
  const colorOf = (amount: number) => (amount < 0 ? good : bad);
  const net = invoice.deductionsTotal;
  const lines = invoice.deductions;
  return (
    <div className="edit-invoices__deduction-lines">
      <div className="edit-invoices__deduction-card" style={{ overflowX: "auto", fontSize: "var(--fx-text-sm)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <th colSpan={4} style={{ ...cell, textAlign: "center", fontWeight: 700 }}>Invoice amount ({invoice.invoiceNumber})</th>
              <td style={{ ...num, fontWeight: 700 }}>{money(invoice.totalAmount)}</td>
            </tr>
            {lines.map((d, index) => (
              <tr key={d.deductionId}>
                {index === 0 && (
                  <th scope="rowgroup" rowSpan={lines.length} style={{ ...cell, textAlign: "left", fontWeight: 600, verticalAlign: "middle" }}>
                    Adjustments:
                  </th>
                )}
                <td style={{ ...cell, whiteSpace: "nowrap" }}>{formatDate(d.date)}</td>
                <td style={cell}>
                  {d.remarks || (d.amount < 0 ? "Addition" : "Deduction")}
                  {d.isTdsTcs && <span className="edit-invoices__tag"> TDS/TCS</span>}
                </td>
                <td style={{ ...num, color: colorOf(d.amount) }}>{signed(d.amount)}</td>
                <td style={cell} />
              </tr>
            ))}
            <tr>
              <th colSpan={4} style={{ ...cell, textAlign: "left", fontWeight: 600 }}>Total adjustments (less deductions, plus additions)</th>
              <td style={{ ...num, color: net === 0 ? undefined : colorOf(net) }}>{net === 0 ? money(0) : signed(net)}</td>
            </tr>
            <tr>
              <th colSpan={4} style={{ ...cell, textAlign: "center", fontWeight: 700 }}>Amount to be paid</th>
              <td style={{ ...num, fontWeight: 700 }}>{money(invoice.payableAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** View Seller Invoices: invoices that are not cleared can be edited or cancelled; cleared (paid) and cancelled ones are locked. */
const EditSellerInvoices = () => {
  // opened from a report with ?invoice=<number>&invoiceId=<id>: that invoice is searched, whatever its status, and its adjustments are opened
  const [linkParams] = useSearchParams();
  const linkedInvoice = linkParams.get("invoice") ?? "";
  const [status, setStatus] = useState(linkedInvoice ? "" : "Uncleared");
  const [search, setSearch] = useState(linkedInvoice);
  // Business: staff start on "All", an owner on their own business; "include linked" adds the businesses linked under the chosen one
  const business = useBusinessFilter();
  const [includeLinked, setIncludeLinked] = useState(false);
  // Seller and Buyer are optional filters (chosen from the parties of the loaded invoices)
  const [sellerFilter, setSellerFilter] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");
  const [datePreset, setDatePreset] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const dateRange = datePreset === "custom" ? { from: customFrom || undefined, to: customTo || undefined } : presetRange(datePreset);

  const [editing, setEditing] = useState<Invoice | null>(null);
  const [cancelling, setCancelling] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  // Invoices whose deductions are open in a row below them.
  const [openDeductions, setOpenDeductions] = useState<string[]>(() => (linkParams.get("invoiceId") ? [linkParams.get("invoiceId") as string] : []));
  const toggleDeductions = (key: string) =>
    setOpenDeductions((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

  const { data, isFetching, isError, error } = useGetInvoicesQuery(
    { status, businessProfileId: business.selectedId ?? undefined, includeLinked: business.selectedId !== null && includeLinked, from: dateRange.from, to: dateRange.to, page: 1, pageSize: MAX_ROWS },
    { refetchOnMountOrArgChange: true },
  );
  const [cancelInvoice, { isLoading: cancelBusy }] = useCancelInvoiceMutation();
  const notify = useNotifyPrompt();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const total = data?.total ?? 0;
  const truncated = total > (data?.items.length ?? 0);
  const sellerOptions = useMemo(() => {
    const map = new Map<string, string>();
    (data?.items ?? []).forEach((i) => map.set(String(i.sellerId), i.sellerName));
    return [...map.entries()].sort((x, y) => x[1].localeCompare(y[1]));
  }, [data]);
  const buyerOptions = useMemo(() => {
    const map = new Map<string, string>();
    (data?.items ?? []).forEach((i) => map.set(String(i.buyerId), i.buyerName));
    return [...map.entries()].sort((x, y) => x[1].localeCompare(y[1]));
  }, [data]);
  const items = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (data?.items ?? []).filter(
      (i) =>
        (!sellerFilter || String(i.sellerId) === sellerFilter) &&
        (!buyerFilter || String(i.buyerId) === buyerFilter) &&
        matches(needle, i.invoiceNumber, i.contractNumber, i.sellerName, i.buyerName, i.truckNumber, i.financialYear, i.status),
    );
  }, [data, search, sellerFilter, buyerFilter]);

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await cancelInvoice({ invoiceId: cancelling.invoiceId, reason: cancelReason.trim() || undefined }).unwrap();
      setToast({ kind: "ok", text: `Invoice ${cancelling.invoiceNumber} cancelled.` });
      // The buyer may already have been told about this invoice, so offer to tell them it is cancelled (the seller can be added in the dialog).
      notify.ask({
        eventCode: "INVOICE_CANCELLED",
        title: `Notify the buyer that invoice ${cancelling.invoiceNumber} is cancelled`,
        sourceEntityType: "ContractInvoice",
        sourceEntityId: cancelling.invoiceId,
        contractNumber: cancelling.contractNumber,
      });
    } catch (e) {
      setToast({ kind: "error", text: apiErrorMessage(e, "The invoice could not be cancelled.") });
    } finally {
      setCancelling(null);
      setCancelReason("");
    }
  };

  const columns: TableColumn<Invoice>[] = [
    // First column: an icon that opens the invoice's deductions in a row below it (only when it has any).
    {
      key: "viewDeductions",
      header: "",
      width: "3rem",
      render: (row) => {
        if (row.deductions.length === 0) return null;
        const open = openDeductions.includes(String(row.invoiceId));
        return (
          <button
            type="button"
            className="edit-invoices__view-deductions"
            onClick={() => toggleDeductions(String(row.invoiceId))}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "View"} deductions on invoice ${row.invoiceNumber}`}
            title="Deductions"
          >
            {open ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
          </button>
        );
      },
    },
    { key: "invoiceNumber", header: "Invoice #", sortable: true, hideable: false },
    { key: "contractNumber", header: "Contract #", sortable: true, sortValue: (row) => contractSortKey(row.contractNumber) },
    {
      key: "sellerName",
      header: "Seller",
      sortable: true,
      render: (row) => <PartyName name={row.sellerName} id={row.sellerId} />,
      sortValue: (row) => row.sellerName ?? "",
      exportValue: (row) => row.sellerName ?? "",
    },
    {
      key: "buyerName",
      header: "Buyer",
      sortable: true,
      render: (row) => <PartyName name={row.buyerName} id={row.buyerId} />,
      sortValue: (row) => row.buyerName ?? "",
      exportValue: (row) => row.buyerName ?? "",
    },
    {
      key: "invoiceDate",
      header: "Date",
      sortable: true,
      render: (row) => formatDate(row.invoiceDate),
      sortValue: (row) => row.invoiceDate,
      exportValue: (row) => formatDate(row.invoiceDate),
    },
    { key: "financialYear", header: "FY", sortable: true, priority: "low" },
    { key: "truckNumber", header: "Truck", sortable: true, render: (row) => row.truckNumber ?? "—", sortValue: (row) => row.truckNumber ?? "" },
    { key: "invoiceQty", header: "Qty (MT)", sortable: true, align: "right" },
    { key: "totalAmount", header: "Total", sortable: true, align: "right", render: (row) => money(row.totalAmount), sortValue: (row) => row.totalAmount },
    {
      key: "deductions",
      header: "Deductions / additions",
      sortable: true,
      align: "right",
      render: (row) => (row.deductions.length === 0 ? "—" : row.deductionsTotal < 0 ? `+ ${money(-row.deductionsTotal)}` : `− ${money(row.deductionsTotal)}`),
      sortValue: (row) => row.deductionsTotal,
      exportValue: (row) => (row.deductions.length === 0 ? "" : money(row.deductionsTotal)),
    },
    { key: "payableAmount", header: "Payable", sortable: true, align: "right", render: (row) => money(row.payableAmount), sortValue: (row) => row.payableAmount },
    { key: "paidAmount", header: "Paid", sortable: true, align: "right", render: (row) => money(row.paidAmount), sortValue: (row) => row.paidAmount },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge>,
      sortValue: (row) => row.status,
      exportValue: (row) => row.status,
    },
    {
      key: "actions",
      header: "Actions",
      hideable: false,
      exportable: false,
      render: (row) => (
        <div className="edit-invoices__actions">
          <button
            type="button"
            className="edit-invoices__btn"
            disabled={!row.isEditable}
            onClick={() => setEditing(row)}
            title={row.isEditable ? "Edit invoice" : row.status === "Paid" ? "Cleared invoices cannot be edited" : "Cancelled invoices cannot be edited"}
            aria-label={`Edit invoice ${row.invoiceNumber}`}
          >
            <PenIcon aria-hidden /> Edit
          </button>
          <button
            type="button"
            className="edit-invoices__btn edit-invoices__btn--danger"
            disabled={!row.isCancellable}
            onClick={() => setCancelling(row)}
            title={row.isCancellable ? "Cancel invoice" : "Only an invoice with no payment can be cancelled"}
            aria-label={`Cancel invoice ${row.invoiceNumber}`}
          >
            <CircleXIcon aria-hidden /> Cancel
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="edit-invoices">
      {notify.element}
      {toast && (
        <div className={`edit-invoices__toast edit-invoices__toast--${toast.kind}`} role="status">
          {toast.kind === "ok" && <CircleCheckBigIcon aria-hidden />} {toast.text}
        </div>
      )}

      <div className="edit-invoices__card">
        <div className="edit-invoices__header">
          <h1>View Seller Invoices</h1>
        </div>

        {isError && <p className="edit-invoices__error">{apiErrorMessage(error, "Could not load the invoices.")}</p>}
        {truncated && (
          <p className="bd-note" role="note">
            Showing the latest {data?.items.length} of {total} invoices. Choose a financial year or a status to see the others.
          </p>
        )}

        <Table
          toolbar={
            <div className="bd-toolbar">
              <div className="bd-toolbar__filters" style={{ alignItems: "center" }}>
                <Select aria-label="Invoice date" value={datePreset} onChange={(event) => setDatePreset(event.target.value)}>
                  {DATE_PRESETS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
                {datePreset === "custom" && (
                  <>
                    <Input type="date" aria-label="From date" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} />
                    <Input type="date" aria-label="To date" value={customTo} min={customFrom || undefined} onChange={(event) => setCustomTo(event.target.value)} />
                  </>
                )}
                <Select aria-label="Seller" value={sellerFilter} onChange={(event) => setSellerFilter(event.target.value)}>
                  <option value="">All sellers</option>
                  {sellerOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </Select>
                <Select aria-label="Buyer" value={buyerFilter} onChange={(event) => setBuyerFilter(event.target.value)}>
                  <option value="">All buyers</option>
                  {buyerOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </Select>
                <Input
                  icon={SearchIcon}
                  type="search"
                  placeholder="Invoice, contract, seller, buyer, truck…"
                  aria-label="Search invoices"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fieldClassName="bd-toolbar__search"
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {business.options.length > 0 && (
                    <Select aria-label="Business" value={business.value} onChange={(event) => business.setValue(event.target.value)}>
                      <option value="all">All businesses</option>
                      {business.options.map((o) => (
                        <option key={o.profileId} value={String(o.profileId)}>
                          {o.name}
                          {o.city ? ` (${o.city})` : ""}
                          {o.isOwn ? " – your business" : ""}
                        </option>
                      ))}
                    </Select>
                  )}
                  {business.selectedId !== null && (
                    <label className="bd-toolbar__check" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, whiteSpace: "nowrap" }}>
                      <input type="checkbox" checked={includeLinked} onChange={(event) => setIncludeLinked(event.target.checked)} />
                      Include linked businesses
                    </label>
                  )}
                </div>
                <Select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {STATUS_FILTERS.map((f) => (
                    <option key={f.label} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          }
          exportName="Seller Invoices"
          columns={columns}
          data={items}
          rowKey={(row) => String(row.invoiceId)}
          expandedRowKeys={openDeductions}
          renderExpandedRow={(row) => <DeductionLines invoice={row} />}
          pageSize={PAGE_SIZE}
          variant="light"
          mobileCards
          columnToggle
          loading={isFetching && !data}
          emptyMessage={isFetching ? "Loading…" : "No invoices match these filters."}
          className="edit-invoices__table"
        />
      </div>

      <EditInvoiceOffcanvas
        invoice={editing}
        onClose={() => setEditing(null)}
        onSaved={(invoice) => {
          setEditing(null);
          setToast({ kind: "ok", text: `Invoice ${invoice.invoiceNumber} updated.` });
          // The buyer may already have been told about this invoice, so offer to send the corrected figures (the seller can be added in the dialog).
          notify.ask({
            eventCode: "INVOICE_EDITED",
            title: `Notify the buyer that invoice ${invoice.invoiceNumber} was amended`,
            sourceEntityType: "ContractInvoice",
            sourceEntityId: invoice.invoiceId,
            contractNumber: invoice.contractNumber,
          });
        }}
      />

      <ConfirmDialog
        open={cancelling !== null}
        title={`Cancel invoice ${cancelling?.invoiceNumber ?? ""}?`}
        message="The invoice is marked as cancelled and its quantity goes back to the contract. This cannot be undone."
        confirmLabel={cancelBusy ? "Cancelling…" : "Cancel invoice"}
        cancelLabel="Keep"
        reasonLabel="Reason (optional)"
        reasonValue={cancelReason}
        onReasonChange={setCancelReason}
        confirmDisabled={cancelBusy}
        onConfirm={() => void confirmCancel()}
        onCancel={() => {
          setCancelling(null);
          setCancelReason("");
        }}
      />
    </div>
  );
};

export default EditSellerInvoices;
