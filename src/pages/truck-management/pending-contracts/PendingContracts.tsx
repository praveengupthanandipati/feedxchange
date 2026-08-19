import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  useGetAllContractsByFiltersQuery,
  useLazyGetAllContractsForExcelQuery,
} from "../../../store/contractsApi";
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
import Table from "../../../components/table/Table";
import { buildPendingContractColumns } from "./pendingContracts.columns";
import {
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
                <Link
                  to={`/truck-management/assign-transports?contract=${encodeURIComponent(row.id)}`}
                  className="truck-tracking-drawer__add-btn"
                >
                  <FiPlus aria-hidden /> Add / View Trucks
                </Link>
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

const PendingContracts = () => {


  const [downloadExcel] = useLazyGetAllContractsForExcelQuery();

  const [sellerFilter, setSellerFilter] = useState("All");
  const [buyerFilter, setBuyerFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("All");
  const [keyword, setKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [truckDrawerOpen, setTruckDrawerOpen] = useState(false);
  const [truckDrawerRow, setTruckDrawerRow] = useState<PendingContractRow | null>(null);

  const searchKeyword = keyword.trim();

  const {
    data: pendingContractApiRows,
    isLoading,
    error,
  } = useGetAllContractsByFiltersQuery({
    Status: "Pending",
  });

  const apiRows = useMemo(
    () => (pendingContractApiRows ?? []).map((row) => {
      const quantity = Number(row.basicDetails?.quantity ?? 0);
      const quantityMeasure = row.basicDetails?.quantityMeasure || "MT";
      const contractRate = Number(row.basicDetails?.contractRate ?? 0);
      const dateValue = row.contractDate ? new Date(row.contractDate).getTime() : 0;

      return {
        id: row.contractNumber || String(row.contractId),
        date: row.contractDate ? new Date(row.contractDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "",
        dateValue,
        seller: row.sellerName || "N/A",
        buyer: row.buyerName || "N/A",
        cRate: `₹${contractRate.toLocaleString("en-IN")}`,
        cRateValue: contractRate,
        cQty: `${quantity} ${quantityMeasure}`,
        cQtyValue: quantity,
        dQty: "0 MT",
        dQtyValue: 0,
        aQty: "0 MT",
        aQtyValue: 0,
        pQty: `${quantity} ${quantityMeasure}`,
        pQtyValue: quantity,
        product: row.productName || "N/A",
        fromDate: row.basicDetails?.deliveryFromDate ? new Date(row.basicDetails.deliveryFromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "",
        toDate: row.basicDetails?.deliveryToDate ? new Date(row.basicDetails.deliveryToDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "",
        deliveryType: row.basicDetails?.deliveryType || "N/A",
        deliverySchedule: row.basicDetails?.deliverySchedule || "N/A",
        paymentType: "N/A",
        trucks: [],
      } as PendingContractRow;
    }),
    [pendingContractApiRows],
  );

  const sellerOptions = useMemo(
    () => [{ value: "All", label: "All Sellers" }, ...Array.from(new Set(apiRows.map((row) => row.seller).filter(Boolean))).map((value) => ({ value, label: value }))],
    [apiRows],
  );

  const buyerOptions = useMemo(
    () => [{ value: "All", label: "All Buyers" }, ...Array.from(new Set(apiRows.map((row) => row.buyer).filter(Boolean))).map((value) => ({ value, label: value }))],
    [apiRows],
  );

  useEffect(() => {
  }, [pendingContractApiRows, isLoading, error]);

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
      //console.error("Excel Download Failed", err);
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
    const q = searchKeyword.toLowerCase();

    return apiRows.filter((row) => {
      if (sellerFilter !== "All" && row.seller !== sellerFilter) return false;
      if (buyerFilter !== "All" && row.buyer !== buyerFilter) return false;
      if (scheduleFilter !== "All" && row.deliverySchedule !== scheduleFilter) return false;

      if (dateFrom && row.dateValue < new Date(dateFrom).getTime()) return false;
      if (dateTo && row.dateValue > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1) return false;

      if (q) {
        const haystack = [row.id, row.seller, row.buyer, row.product].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [apiRows, sellerFilter, buyerFilter, scheduleFilter, dateFrom, dateTo, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleClearFilters = () => {
    setSellerFilter("All");
    setBuyerFilter("All");
    setDateFrom("");
    setDateTo("");
    setScheduleFilter("All");
    setKeyword("");
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
              <SearchableSelect
                options={sellerOptions}
                value={sellerFilter}
                onChange={setSellerFilter}
                placeholder="Select Sellers"
                ariaLabel="Select Sellers"
              />
              <SearchableSelect
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