import { useEffect, useState } from "react";
import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiEdit2, FiXCircle } from "react-icons/fi";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import EditInvoiceOffcanvas from "./EditInvoiceOffcanvas";
import {
  apiErrorMessage,
  useCancelInvoiceMutation,
  useGetInvoiceFinancialYearsQuery,
  useGetInvoicesQuery,
  type Invoice,
} from "../../../store/sellerInvoiceApi";
import "./EditSellerInvoices.scss";

const PAGE_SIZE = 10;

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

/** Edit Seller Invoices: invoices that are not cleared can be edited or cancelled; cleared (paid) and cancelled ones are locked. */
const EditSellerInvoices = () => {
  const [status, setStatus] = useState("Uncleared");
  const [financialYear, setFinancialYear] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [appliedContract, setAppliedContract] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Invoice | null>(null);
  const [cancelling, setCancelling] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const { data: years = [] } = useGetInvoiceFinancialYearsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data, isFetching, isError, error } = useGetInvoicesQuery(
    { status, financialYear: financialYear || undefined, contractNumber: appliedContract || undefined, page, pageSize: PAGE_SIZE },
    { refetchOnMountOrArgChange: true },
  );
  const [cancelInvoice, { isLoading: cancelBusy }] = useCancelInvoiceMutation();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await cancelInvoice({ invoiceId: cancelling.invoiceId, reason: cancelReason.trim() || undefined }).unwrap();
      setToast({ kind: "ok", text: `Invoice ${cancelling.invoiceNumber} cancelled.` });
    } catch (e) {
      setToast({ kind: "error", text: apiErrorMessage(e, "The invoice could not be cancelled.") });
    } finally {
      setCancelling(null);
      setCancelReason("");
    }
  };

  const columns: TableColumn<Invoice>[] = [
    { key: "invoiceNumber", header: "Invoice #" },
    { key: "contractNumber", header: "Contract #" },
    { key: "sellerName", header: "Seller" },
    { key: "buyerName", header: "Buyer" },
    { key: "invoiceDate", header: "Date", render: (row) => formatDate(row.invoiceDate) },
    { key: "financialYear", header: "FY" },
    { key: "truckNumber", header: "Truck", render: (row) => row.truckNumber ?? "—" },
    { key: "invoiceQty", header: "Qty (MT)", align: "right" },
    { key: "totalAmount", header: "Total", align: "right", render: (row) => money(row.totalAmount) },
    { key: "payableAmount", header: "Payable", align: "right", render: (row) => money(row.payableAmount) },
    { key: "paidAmount", header: "Paid", align: "right", render: (row) => money(row.paidAmount) },
    {
      key: "status",
      header: "Status",
      render: (row) => <span className={`edit-invoices__status edit-invoices__status--${row.status.toLowerCase().replace(/\s+/g, "-")}`}>{row.status}</span>,
    },
    {
      key: "actions",
      header: "Actions",
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
            <FiEdit2 aria-hidden /> Edit
          </button>
          <button
            type="button"
            className="edit-invoices__btn edit-invoices__btn--danger"
            disabled={!row.isCancellable}
            onClick={() => setCancelling(row)}
            title={row.isCancellable ? "Cancel invoice" : "Only an invoice with no payment can be cancelled"}
            aria-label={`Cancel invoice ${row.invoiceNumber}`}
          >
            <FiXCircle aria-hidden /> Cancel
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="edit-invoices">
      {toast && (
        <div className={`edit-invoices__toast edit-invoices__toast--${toast.kind}`} role="status">
          {toast.kind === "ok" && <FiCheckCircle aria-hidden />} {toast.text}
        </div>
      )}

      <div className="edit-invoices__card">
        <div className="edit-invoices__header">
          <h1>Edit Seller Invoices</h1>
        </div>

        <div className="edit-invoices__filters">
          <label>
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Financial year</span>
            <select
              value={financialYear}
              onChange={(e) => {
                setFinancialYear(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedContract(contractNumber.trim());
              setPage(1);
            }}
          >
            <label>
              <span>Contract #</span>
              <input value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} placeholder="Contract number" />
            </label>
            <button type="submit">Search</button>
          </form>
        </div>

        {isError && <p className="edit-invoices__error">{apiErrorMessage(error, "Could not load the invoices.")}</p>}

        <Table
          columns={columns}
          data={items}
          rowKey={(row) => String(row.invoiceId)}
          emptyMessage={isFetching ? "Loading…" : "No invoices match these filters."}
          className="edit-invoices__table"
        />

        <div className="edit-invoices__pagination">
          <p>{total === 0 ? "Showing 0 Results" : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total} Results`}</p>
          <div>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              <FiChevronLeft aria-hidden />
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <EditInvoiceOffcanvas
        invoice={editing}
        onClose={() => setEditing(null)}
        onSaved={(invoice) => {
          setEditing(null);
          setToast({ kind: "ok", text: `Invoice ${invoice.invoiceNumber} updated.` });
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
