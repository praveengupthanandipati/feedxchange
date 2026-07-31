import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiEye,
  FiEyeOff,
  FiDownload,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiUser,
  FiMapPin,
  FiTruck,
} from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import MultiSelect from "../../../components/dropdown/MultiSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { buildBulkFreightColumns } from "./bulkFreightApproval.columns";
import {
  bulkFreightRows,
  sellerOptions,
  buyerOptions,
  assignedByOptions,
  contractOptions,
  type BulkFreightRow,
} from "./bulkFreightApproval.data";
import "./BulkFreightApproval.scss";

const PAGE_SIZE = 10;

type ActionVariant = "approve" | "reject";

interface FreightActionModalProps {
  variant: ActionVariant;
  open: boolean;
  rows: BulkFreightRow[];
  onClose: () => void;
  onConfirm: (comments: string) => void;
}

const FreightActionModal = ({ variant, open, rows, onClose, onConfirm }: FreightActionModalProps) => {
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (open) setComments("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const uniqueSellers = Array.from(new Set(rows.map((row) => row.seller)));
  const isApprove = variant === "approve";

  return createPortal(
    <div className="freight-action-modal__backdrop" onClick={onClose}>
      <div
        className="freight-action-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="freight-action-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="freight-action-modal__header">
          <h2 id="freight-action-modal-title">{isApprove ? "Approve Trucks" : "Reject Trucks"}</h2>
          <button type="button" className="freight-action-modal__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="freight-action-modal__body">
          <p className="freight-action-modal__notice">
            The {isApprove ? "approval" : "rejection"} information will be intimated to Seller, Buyer,
          </p>
          <ul className="freight-action-modal__list">
            {uniqueSellers.map((seller) => (
              <li key={seller}>{seller}</li>
            ))}
          </ul>

          <div className="freight-action-modal__field">
            <label className="freight-action-modal__label" htmlFor="freight-action-comments">
              Comments (Optional)
            </label>
            <textarea
              id="freight-action-comments"
              className="freight-action-modal__textarea"
              placeholder="Enter any comments..."
              value={comments}
              onChange={(event) => setComments(event.target.value)}
            />
          </div>
        </div>

        <div className="freight-action-modal__footer">
          <button type="button" className="freight-action-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`freight-action-modal__confirm freight-action-modal__confirm--${variant}`}
            onClick={() => onConfirm(comments)}
          >
            <FiCheck aria-hidden /> {isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

interface ContractDetailsDrawerProps {
  open: boolean;
  row: BulkFreightRow | null;
  onClose: () => void;
}

const ContractDetailsDrawer = ({ open, row, onClose }: ContractDetailsDrawerProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return createPortal(
    <>
      <div className={`contract-details-drawer__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`contract-details-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-details-drawer-title"
      >
        {row && (
          <>
            <div className="contract-details-drawer__header">
              <h2 id="contract-details-drawer-title">
                Contract Number: <strong>{row.contractNumber}</strong>
              </h2>
              <button
                type="button"
                className="contract-details-drawer__close"
                onClick={onClose}
                aria-label="Close"
              >
                <FiX aria-hidden />
              </button>
            </div>

            <div className="contract-details-drawer__body">
              <div className="contract-details-drawer__parties">
                <p>
                  <FiHome aria-hidden /> Seller: <strong>{row.seller}</strong>
                </p>
                <p>
                  <FiUser aria-hidden /> Buyer: <strong>{row.buyer}</strong>
                </p>
              </div>

              <div className="contract-details-drawer__stats">
                <div className="contract-details-drawer__stat">
                  <span>Qty (MT)</span>
                  <strong>
                    {row.qtyOriginal && (
                      <span className="contract-details-drawer__stat-original">{row.qtyOriginal}</span>
                    )}
                    {row.qtyCurrent}
                  </strong>
                </div>
                <div className="contract-details-drawer__stat">
                  <span>Freight</span>
                  <strong>
                    {row.freightOriginal && (
                      <span className="contract-details-drawer__stat-original">{row.freightOriginal}</span>
                    )}
                    {row.freightCurrent}
                  </strong>
                </div>
              </div>

              <div className="contract-details-drawer__section">
                <h3>
                  <FiTruck aria-hidden /> Transporter
                </h3>
                <p>{row.transporter}</p>
              </div>

              <div className="contract-details-drawer__section">
                <h3>
                  <FiMapPin aria-hidden /> Loading Address
                </h3>
                <p>{row.loadingAddress}</p>
              </div>

              <div className="contract-details-drawer__section">
                <h3>
                  <FiMapPin aria-hidden /> Delivery Address
                </h3>
                <p>{row.deliveryAddress}</p>
              </div>

              <div className="contract-details-drawer__meta">
                <span>
                  Assigned Date: <strong>{row.assignedDate}</strong>
                </span>
                <span>
                  Assigned By: <strong>{row.assignedBy}</strong>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
};

function getExportCellValue(row: BulkFreightRow, column: TableColumn<BulkFreightRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const BulkFreightApproval = () => {
  const [sellerFilter, setSellerFilter] = useState<string[]>([]);
  const [buyerFilter, setBuyerFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [rows, setRows] = useState(bulkFreightRows);
  const [actionModal, setActionModal] = useState<ActionVariant | null>(null);
  const [detailsRow, setDetailsRow] = useState<BulkFreightRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleOpenDetails = (row: BulkFreightRow) => {
    setDetailsRow(row);
    setDetailsOpen(true);
  };

  const bulkFreightColumns = useMemo(
    () => buildBulkFreightColumns({ onOpenDetails: handleOpenDetails }),
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sellerFilter, buyerFilter, dateFrom, dateTo, contractFilter, assignedFilter]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (sellerFilter.length > 0 && !sellerFilter.includes(row.seller)) return false;
      if (buyerFilter.length > 0 && !buyerFilter.includes(row.buyer)) return false;
      if (contractFilter && row.contractNumber !== contractFilter) return false;
      if (assignedFilter && row.assignedBy !== assignedFilter) return false;

      if (dateFrom && row.assignedDateValue < new Date(dateFrom).getTime()) return false;
      if (dateTo && row.assignedDateValue > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1)
        return false;

      return true;
    });
  }, [rows, sellerFilter, buyerFilter, contractFilter, assignedFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedKeys.includes(row.lineId)),
    [rows, selectedKeys],
  );

  const handleSelectRow = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    const visibleKeys = pagedRows.map((row) => row.lineId);
    setSelectedKeys((prev) =>
      checked
        ? Array.from(new Set([...prev, ...visibleKeys]))
        : prev.filter((key) => !visibleKeys.includes(key)),
    );
  };

  const handleClearFilters = () => {
    setSellerFilter([]);
    setBuyerFilter([]);
    setDateFrom("");
    setDateTo("");
    setContractFilter("");
    setAssignedFilter("");
  };

  const handleConfirmAction = (variant: ActionVariant, _comments: string) => {
    const nextStatus = variant === "approve" ? "Accepted" : "Rejected";
    const targetKeys = new Set(selectedKeys);
    setRows((prev) =>
      prev.map((row) => (targetKeys.has(row.lineId) ? { ...row, status: nextStatus } : row)),
    );
    setSelectedKeys([]);
    setActionModal(null);
  };

  const handleExport = () => {
    const headerRow = bulkFreightColumns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = bulkFreightColumns
          .map((column) => `<td>${escapeHtml(getExportCellValue(row, column))}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulk-freight-approval.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bulk-freight-approval-page">
      <div className="bulk-freight-approval-card">
        <div className="bulk-freight-approval-card__header">
          <h1>Bulk Freight Approval</h1>
          <div className="bulk-freight-approval-card__actions">
            <button
              type="button"
              className="bulk-freight-approval-btn bulk-freight-approval-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="bulk-freight-approval-btn bulk-freight-approval-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="bulk-freight-approval-filters">
            <div className="bulk-freight-approval-filters__row">
              <MultiSelect
                options={sellerOptions}
                value={sellerFilter}
                onChange={setSellerFilter}
                placeholder="Select Seller..."
                ariaLabel="Select Seller"
              />
              <MultiSelect
                options={buyerOptions}
                value={buyerFilter}
                onChange={setBuyerFilter}
                placeholder="Select Buyer..."
                ariaLabel="Select Buyer"
              />
              <div className="bulk-freight-approval-filters__date-range">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  aria-label="Assigned date range from"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  aria-label="Assigned date range to"
                />
              </div>
              <SearchableSelect
                options={contractOptions}
                value={contractFilter}
                onChange={setContractFilter}
                placeholder="Filter by Contracts..."
                ariaLabel="Filter by Contracts"
              />
              <SearchableSelect
                options={assignedByOptions}
                value={assignedFilter}
                onChange={setAssignedFilter}
                placeholder="Filter by Assigned..."
                ariaLabel="Filter by Assigned"
              />
            </div>

            <div className="bulk-freight-approval-filters__clear-row">
              <button
                type="button"
                className="bulk-freight-approval-filters__clear"
                onClick={handleClearFilters}
              >
                <FiX aria-hidden /> Clear
              </button>
            </div>
          </div>
        )}

        <div className="bulk-freight-approval-actions">
          <button
            type="button"
            className="bulk-freight-approval-action bulk-freight-approval-action--approve"
            disabled={selectedKeys.length === 0}
            onClick={() => setActionModal("approve")}
          >
            <FiCheck aria-hidden /> Approve
          </button>
          <button
            type="button"
            className="bulk-freight-approval-action bulk-freight-approval-action--reject"
            disabled={selectedKeys.length === 0}
            onClick={() => setActionModal("reject")}
          >
            <FiX aria-hidden /> Reject
          </button>
        </div>

        <Table
          columns={bulkFreightColumns}
          data={pagedRows}
          rowKey={(row) => row.lineId}
          selectable
          selectedRowKeys={selectedKeys}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          emptyMessage="No freight approvals match the current filters."
          minHeight
        />

        <div className="bulk-freight-approval-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  filteredRows.length,
                )} of ${filteredRows.length} Results`}
          </p>
          <div className="bulk-freight-approval-pagination__controls">
            <button
              type="button"
              disabled={currentPageClamped === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
            >
              <FiChevronLeft aria-hidden />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={page === currentPageClamped ? "is-active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPageClamped === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
            >
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <FreightActionModal
        variant={actionModal ?? "approve"}
        open={actionModal !== null}
        rows={selectedRows}
        onClose={() => setActionModal(null)}
        onConfirm={(comments) => actionModal && handleConfirmAction(actionModal, comments)}
      />

      <ContractDetailsDrawer open={detailsOpen} row={detailsRow} onClose={() => setDetailsOpen(false)} />
    </div>
  );
};

export default BulkFreightApproval;
