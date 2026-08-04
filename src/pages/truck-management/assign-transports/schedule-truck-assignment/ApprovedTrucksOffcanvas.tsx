import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiPackage,
  FiCreditCard,
  FiSearch,
  FiExternalLink,
  FiDownload,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";
import { approvedTruckRows as seedRows, type ApprovedTruckRow } from "./transporterAssignment.data";
import "./ApprovedTrucksOffcanvas.scss";

const PAGE_SIZE = 5;

interface ApprovedTrucksOffcanvasProps {
  open: boolean;
  scheduleRow: ScheduleTruckRow | null;
  onClose: () => void;
}

const ApprovedTrucksOffcanvas = ({ open, scheduleRow, onClose }: ApprovedTrucksOffcanvasProps) => {
  const [rows, setRows] = useState<ApprovedTruckRow[]>(seedRows);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowPendingDelete, setRowPendingDelete] = useState<ApprovedTruckRow | null>(null);

  useEffect(() => {
    if (!open) return;
    setKeyword("");
    setCurrentPage(1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.transporter, row.truckNo, row.driverName, row.driverContact].join(" ").toLowerCase().includes(q),
    );
  }, [rows, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleConfirmDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((item) => item.id !== rowPendingDelete.id));
    setRowPendingDelete(null);
  };

  const handleDownload = (row: ApprovedTruckRow) => {
    window.open(row.trackUrl, "_blank", "noopener,noreferrer");
  };

  return createPortal(
    <>
      <div
        className={`approved-trucks-offcanvas__backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
      />
      <div
        className={`approved-trucks-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approved-trucks-offcanvas-title"
      >
        <div className="approved-trucks-offcanvas__header">
          <h2 id="approved-trucks-offcanvas-title">
            <FiCheckCircle aria-hidden /> All Approved Trucks
          </h2>
          <button
            type="button"
            className="approved-trucks-offcanvas__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div className="approved-trucks-offcanvas__body">
          {scheduleRow && (
            <div className="approved-trucks-offcanvas__stats">
              <div className="approved-trucks-offcanvas__stat approved-trucks-offcanvas__stat--navy">
                <span className="approved-trucks-offcanvas__stat-icon">
                  <FiCalendar aria-hidden />
                </span>
                <span className="approved-trucks-offcanvas__stat-body">
                  <span>Schedule Date &amp; Time</span>
                  <strong>{scheduleRow.scheduleDateTime}</strong>
                </span>
              </div>
              <div className="approved-trucks-offcanvas__stat approved-trucks-offcanvas__stat--info">
                <span className="approved-trucks-offcanvas__stat-icon">
                  <FiMapPin aria-hidden />
                </span>
                <span className="approved-trucks-offcanvas__stat-body">
                  <span>Loading Address</span>
                  <strong>{scheduleRow.loadingAddress}</strong>
                </span>
              </div>
              <div className="approved-trucks-offcanvas__stat approved-trucks-offcanvas__stat--success">
                <span className="approved-trucks-offcanvas__stat-icon">
                  <FiUser aria-hidden />
                </span>
                <span className="approved-trucks-offcanvas__stat-body">
                  <span>Delivery Address</span>
                  <strong>{scheduleRow.deliveryAddress}</strong>
                </span>
              </div>
              <div className="approved-trucks-offcanvas__stat approved-trucks-offcanvas__stat--warning">
                <span className="approved-trucks-offcanvas__stat-icon">
                  <FiPackage aria-hidden />
                </span>
                <span className="approved-trucks-offcanvas__stat-body">
                  <span>Qty</span>
                  <strong>{scheduleRow.qty}</strong>
                </span>
              </div>
              <div className="approved-trucks-offcanvas__stat approved-trucks-offcanvas__stat--danger">
                <span className="approved-trucks-offcanvas__stat-icon">
                  <FiCreditCard aria-hidden />
                </span>
                <span className="approved-trucks-offcanvas__stat-body">
                  <span>Freight</span>
                  <strong>{scheduleRow.freight}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="approved-trucks-offcanvas__search">
            <FiSearch aria-hidden />
            <input
              type="text"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={`${rows.length} records...`}
            />
          </div>

          <div className="approved-trucks-offcanvas__table-wrapper">
            <table className="approved-trucks-offcanvas__table">
              <thead>
                <tr>
                  <th>Transporter</th>
                  <th>Truck No</th>
                  <th>Driver Name</th>
                  <th>Driver Contact</th>
                  <th>Qty</th>
                  <th>Freight / MT</th>
                  <th>Track URL</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="approved-trucks-offcanvas__empty">
                      No approved trucks match the current search.
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.transporter}</td>
                      <td>{row.truckNo}</td>
                      <td>{row.driverName}</td>
                      <td>{row.driverContact}</td>
                      <td>{row.qty}</td>
                      <td>{row.freightPerMt}</td>
                      <td>
                        <a
                          className="approved-trucks-offcanvas__track-link"
                          href={row.trackUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FiExternalLink aria-hidden /> Track
                        </a>
                      </td>
                      <td>
                        <RowActionsMenu
                          actions={[
                            { key: "download", label: "Download", icon: FiDownload, onClick: () => handleDownload(row) },
                            { key: "delete", label: "Delete", icon: FiTrash2, onClick: () => setRowPendingDelete(row), danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="approved-trucks-offcanvas__pagination">
            <p>
              {filteredRows.length === 0
                ? "Showing 0 Results"
                : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                    currentPageClamped * PAGE_SIZE,
                    filteredRows.length,
                  )} of ${filteredRows.length} Results`}
            </p>
            <div className="approved-trucks-offcanvas__pagination-controls">
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
      </div>

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove Approved Truck"
        message={`Are you sure you want to remove ${rowPendingDelete?.truckNo ?? "this truck"}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </>,
    document.body,
  );
};

export default ApprovedTrucksOffcanvas;
