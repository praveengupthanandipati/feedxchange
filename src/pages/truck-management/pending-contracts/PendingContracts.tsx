import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  
  useGetAllContractsByFiltersQuery,
  useLazyGetAllContractsForExcelQuery,
 
} from "../../../store/pendingContractApi";
import {
  FiEye,
  FiEyeOff,
  FiDownload,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiHome,
  FiUser,
  FiTruck,
  FiPlus,
  FiShare2,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import MultiSelect from "../../../components/dropdown/MultiSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { buildPendingContractColumns } from "./pendingContracts.columns";
import {
  pendingContracts,
  sellerOptions,
  buyerOptions,
  deliveryScheduleOptions,
  type PendingContractRow,
  type TruckAssignment,
} from "./pendingContracts.data";
import "./PendingContracts.scss";

const PAGE_SIZE = 10;

interface TruckTrackingDrawerProps {
  open: boolean;
  row: PendingContractRow | null;
  onClose: () => void;
}

const TruckTrackingDrawer = ({ open, row, onClose }: TruckTrackingDrawerProps) => {
  const [expandedTrucks, setExpandedTrucks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !row) return;
    const last = row.trucks[row.trucks.length - 1];
    setExpandedTrucks(last ? new Set([last.truckNumber]) : new Set());
  }, [open, row]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const toggleTruck = (truckNumber: string) => {
    setExpandedTrucks((prev) => {
      const next = new Set(prev);
      if (next.has(truckNumber)) next.delete(truckNumber);
      else next.add(truckNumber);
      return next;
    });
  };

  const handleExpandAll = () => {
    if (!row) return;
    setExpandedTrucks(new Set(row.trucks.map((truck) => truck.truckNumber)));
  };

  const handleShare = (truck: TruckAssignment) => {
    navigator.clipboard
      .writeText(`${truck.truckNumber} — Final Qty: ${truck.finalQty}`)
      .catch(() => undefined);
  };

  return createPortal(
    <>
      <div className={`truck-tracking-drawer__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`truck-tracking-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="truck-tracking-drawer-title"
      >
        {row && (
          <>
            <div className="truck-tracking-drawer__header">
              <h2 id="truck-tracking-drawer-title">
                Contract Number: <strong>{row.id}</strong>
              </h2>
              <button
                type="button"
                className="truck-tracking-drawer__close"
                onClick={onClose}
                aria-label="Close"
              >
                <FiX aria-hidden />
              </button>
            </div>

            <div className="truck-tracking-drawer__body">
              <div className="truck-tracking-drawer__parties">
                <p>
                  <FiHome aria-hidden /> Seller: <strong>{row.seller}</strong>
                </p>
                <p>
                  <FiUser aria-hidden /> Buyer: <strong>{row.buyer}</strong>
                </p>
              </div>

              <div className="truck-tracking-drawer__section-header">
                <h3>
                  <FiTruck aria-hidden /> Truck Tracking Details
                </h3>
                <button
                  type="button"
                  className="truck-tracking-drawer__add-btn"
                  onClick={handleExpandAll}
                >
                  <FiPlus aria-hidden /> Add / View Trucks
                </button>
              </div>

              <div className="truck-tracking-drawer__stats">
                <div className="truck-tracking-drawer__stat truck-tracking-drawer__stat--total">
                  <span>Total Qty</span>
                  <strong>{row.cQty}</strong>
                </div>
                <div className="truck-tracking-drawer__stat truck-tracking-drawer__stat--success">
                  <span>Despatched</span>
                  <strong>{row.dQty}</strong>
                </div>
                <div className="truck-tracking-drawer__stat truck-tracking-drawer__stat--info">
                  <span>Arranged</span>
                  <strong>{row.aQty}</strong>
                </div>
                <div className="truck-tracking-drawer__stat truck-tracking-drawer__stat--danger">
                  <span>Pending</span>
                  <strong>{row.pQty}</strong>
                </div>
              </div>

              {row.trucks.length === 0 ? (
                <p className="truck-tracking-drawer__empty">
                  No trucks arranged yet for this contract.
                </p>
              ) : (
                <div className="truck-tracking-drawer__truck-list">
                  {row.trucks.map((truck) => {
                    const expanded = expandedTrucks.has(truck.truckNumber);
                    return (
                      <div className="truck-tracking-drawer__truck-card" key={truck.truckNumber}>
                        <button
                          type="button"
                          className="truck-tracking-drawer__truck-header"
                          onClick={() => toggleTruck(truck.truckNumber)}
                          aria-expanded={expanded}
                        >
                          <span className="truck-tracking-drawer__truck-title">
                            <FiTruck aria-hidden />
                            <strong>{truck.truckNumber}</strong>
                            <span>(Final Qty: {truck.finalQty})</span>
                          </span>
                          <span className="truck-tracking-drawer__truck-meta">
                            <span
                              className="truck-tracking-drawer__share-btn"
                              role="button"
                              tabIndex={0}
                              aria-label={`Share ${truck.truckNumber} details`}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleShare(truck);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.stopPropagation();
                                  handleShare(truck);
                                }
                              }}
                            >
                              <FiShare2 aria-hidden />
                            </span>
                            <span className="truck-tracking-drawer__status-badge">
                              {truck.status}
                            </span>
                            {expanded ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
                          </span>
                        </button>

                        {expanded && (
                          <div className="truck-tracking-drawer__truck-details">
                            <div>
                              <span>Transporter Name:</span>
                              <p>{truck.transporterName}</p>
                            </div>
                            <div>
                              <span>
                                <FiMapPin aria-hidden /> Transporter Location:
                              </span>
                              <p>{truck.transporterLocation}</p>
                            </div>
                            <div>
                              <span>Assignment Type:</span>
                              <p className="truck-tracking-drawer__assignment-badge">
                                {truck.assignmentType}
                              </p>
                            </div>

                            <div>
                              <span>Driver Name:</span>
                              <p>{truck.driverName}</p>
                            </div>
                            <div>
                              <span>
                                <FiPhone aria-hidden /> Driver Phone:
                              </span>
                              <p>{truck.driverPhone}</p>
                            </div>
                            <div>
                              <span>Maximum Capacity:</span>
                              <p>{truck.maxCapacity}</p>
                            </div>

                            <div>
                              <span>Start Date &amp; Time:</span>
                              <p>{truck.startDateTime}</p>
                            </div>
                            <div>
                              <span>
                                <FiMapPin aria-hidden /> Start Location:
                              </span>
                              <p>{truck.startLocation}</p>
                            </div>
                            <div>
                              <span>
                                <FiMapPin aria-hidden /> Destination:
                              </span>
                              <p>{truck.destination}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
};

function getExportCellValue(row: PendingContractRow, column: TableColumn<PendingContractRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const PendingContracts = () => {


  const [downloadExcel] = useLazyGetAllContractsForExcelQuery();

  const [sellerFilter, setSellerFilter] = useState<string[]>([]);
  const [buyerFilter, setBuyerFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("Pending");
  const [keyword, setKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [truckDrawerOpen, setTruckDrawerOpen] = useState(false);
  const [truckDrawerRow, setTruckDrawerRow] = useState<PendingContractRow | null>(null);

  const searchKeyword = keyword.trim();

  // Single source of truth for the filters query — backend only accepts
  // Status and SearchText (confirmed via Swagger). Fires whenever there's
  // a search keyword; skipped when the search box is empty.
  const {
    data: filteredContracts,
    isLoading, 
    error,
  } = useGetAllContractsByFiltersQuery(
    {
      Status: scheduleFilter,
      SearchText: keyword.trim(),
    });

  useEffect(() => {
    console.log("Filtered Data:", filteredContracts);
    console.log("Filter Loading:", isLoading);
    console.log("Filter Error:", error);
  }, [filteredContracts, isLoading, error]);

  const handleDownloadExcel = async () => {
    try {
      const result = await downloadExcel().unwrap();
      const url = window.URL.createObjectURL(result);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Contracts.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel Download Failed", err);
    }
  };


  const handleOpenTruckDetails = (row: PendingContractRow) => {
    setTruckDrawerRow(row);
    setTruckDrawerOpen(true);
  };

  const pendingContractColumns = useMemo(
    () => buildPendingContractColumns({ onOpenTruckDetails: handleOpenTruckDetails }),
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sellerFilter, buyerFilter, dateFrom, dateTo, scheduleFilter, keyword]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return pendingContracts.filter((row) => {
      if (sellerFilter.length > 0 && !sellerFilter.includes(row.seller)) return false;
      if (buyerFilter.length > 0 && !buyerFilter.includes(row.buyer)) return false;
      if (scheduleFilter !== "All" && row.deliverySchedule !== scheduleFilter) return false;

      if (dateFrom && row.dateValue < new Date(dateFrom).getTime()) return false;
      if (dateTo && row.dateValue > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1) return false;

      if (q) {
        const haystack = [row.id, row.seller, row.buyer, row.product].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [sellerFilter, buyerFilter, scheduleFilter, dateFrom, dateTo, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleClearFilters = () => {
    setSellerFilter([]);
    setBuyerFilter([]);
    setDateFrom("");
    setDateTo("");
    setScheduleFilter("All");
    setKeyword("");
  };

  const handleExportToExcel = () => {
    const headerRow = pendingContractColumns
      .map((column) => `<th>${escapeHtml(column.header)}</th>`)
      .join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = pendingContractColumns
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
    link.download = "pending-contracts.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pending-contracts-page">
      <div className="pending-contracts-card">
        <div className="pending-contracts-card__header">
          <h1>Pending Contract Transport</h1>
          <div className="pending-contracts-card__actions">
            <button
              type="button"
              className="pending-contracts-btn pending-contracts-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="pending-contracts-btn pending-contracts-btn--warning"
              onClick={handleDownloadExcel}
            >
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="pending-contracts-filters">
            <div className="pending-contracts-filters__row">
              <MultiSelect
                options={sellerOptions}
                value={sellerFilter}
                onChange={setSellerFilter}
                placeholder="Select Sellers"
                ariaLabel="Select Sellers"
              />
              <MultiSelect
                options={buyerOptions}
                value={buyerFilter}
                onChange={setBuyerFilter}
                placeholder="Select Buyers"
                ariaLabel="Select Buyers"
              />
              <div className="pending-contracts-filters__date-range">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  aria-label="Contract date range from"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  aria-label="Contract date range to"
                />
              </div>
              <SearchableSelect
                options={deliveryScheduleOptions}
                value={scheduleFilter}
                onChange={setScheduleFilter}
                placeholder="Delivery Schedule"
                ariaLabel="Filter by delivery schedule"
              />
            </div>

            <div className="pending-contracts-filters__search-row">
              <div className="pending-contracts-filters__search">
                <FiSearch aria-hidden />
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search by Contract No, Seller, Buyer, Product Name"
                />
              </div>
              <button
                type="button"
                className="pending-contracts-filters__clear"
                onClick={handleClearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FiX aria-hidden />
              </button>
            </div>
          </div>
        )}

        <Table
          columns={pendingContractColumns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No pending contracts match the current filters."
          minHeight
        />

        <div className="pending-contracts-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  filteredRows.length,
                )} of ${filteredRows.length} Results`}
          </p>
          <div className="pending-contracts-pagination__controls">
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

      <TruckTrackingDrawer
        open={truckDrawerOpen}
        row={truckDrawerRow}
        onClose={() => setTruckDrawerOpen(false)}
      />
    </div>
  );
};

export default PendingContracts;