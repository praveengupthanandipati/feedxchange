import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  useGetAllOpenAndPendingContractsQuery,
  type OpenAndPendingContract,
} from "../../../store/contractsApi";
import {
  FiEye,
  FiEyeOff,
  FiDownload,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiUser,
  FiTruck,
  FiPlus,
} from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { buildPendingContractColumns } from "./pendingContracts.columns";
import { type PendingContractRow } from "./pendingContracts.data";
import { useContractTruckDetails } from "../contract-trucks/useContractTruckDetails";
import TruckList from "../contract-trucks/TruckList";
import { useSelectedContract } from "../../../context/SelectedContractContext";
import "../pending-contracts/PendingContracts.scss";
import "./PendingContracts.scss";

const PAGE_SIZE = 10;
const ALL_OPTION = { value: "All", label: "All" };

const formatShortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

function mapOpenAndPendingContract(row: OpenAndPendingContract): PendingContractRow {
  const dispatched = row.dispatchedQuantityMT ?? 0;
  const pending = row.pendingQuantityMT ?? 0;
  const total = row.totalQuantityMT ?? 0;
  const arranged = Math.max(total - dispatched - pending, 0);
  const dateValue = new Date(row.contractDate).getTime();

  return {
    id: row.contractNumber,
    date: formatShortDate(row.contractDate),
    dateValue: Number.isNaN(dateValue) ? 0 : dateValue,
    seller: row.seller ?? "-",
    buyer: row.buyer ?? "-",
    cRate: `₹${row.pricePerKg.toLocaleString("en-IN")}`,
    cRateValue: row.pricePerKg,
    cQty: `${total} MT`,
    cQtyValue: total,
    dQty: `${dispatched} MT`,
    dQtyValue: dispatched,
    aQty: `${arranged} MT`,
    aQtyValue: arranged,
    pQty: `${pending} MT`,
    pQtyValue: pending,
    product: row.productName,
    fromDate: formatShortDate(row.effectiveFrom),
    toDate: formatShortDate(row.effectiveTo),
    deliverySchedule: row.deliverySchedule,
    paymentType: row.paymentTermName,
  };
}

interface TruckTrackingDrawerProps {
  open: boolean;
  row: PendingContractRow | null;
  onClose: () => void;
}

const TruckTrackingDrawer = ({ open, row, onClose }: TruckTrackingDrawerProps) => {
  const { trucks, isLoading: trucksLoading } = useContractTruckDetails(row?.id ?? "", open && Boolean(row));

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
                <div className="truck-tracking-drawer__actions">
                  <Link
                    to={`/truck-management/open-pending-contracts/instant-truck?contract=${encodeURIComponent(row.id)}`}
                    className="truck-tracking-drawer__add-btn"
                  >
                    <FiPlus aria-hidden /> Add Instant Truck
                  </Link>
                  <Link
                    to={`/truck-management/open-pending-contracts/schedule-dispatch?contract=${encodeURIComponent(row.id)}`}
                    className="truck-tracking-drawer__add-btn"
                  >
                    <FiPlus aria-hidden /> Schedule Dispatch
                  </Link>
                  <Link
                    to={`/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(row.id)}`}
                    className="truck-tracking-drawer__add-btn"
                  >
                    <FiEye aria-hidden /> View All Trucks
                  </Link>
                </div>
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

              <TruckList trucks={trucks} isLoading={trucksLoading} />
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
  const { setSelectedContract } = useSelectedContract();

  const { data: openAndPendingContracts, isLoading, isFetching } = useGetAllOpenAndPendingContractsQuery();

  const pendingContracts = useMemo(
    () => (openAndPendingContracts ?? []).map(mapOpenAndPendingContract),
    [openAndPendingContracts],
  );

  const sellerOptions = useMemo(() => {
    const names = Array.from(new Set(pendingContracts.map((row) => row.seller))).filter(
      (name) => name && name !== "-",
    );
    return [ALL_OPTION, ...names.map((name) => ({ value: name, label: name }))];
  }, [pendingContracts]);

  const buyerOptions = useMemo(() => {
    const names = Array.from(new Set(pendingContracts.map((row) => row.buyer))).filter(
      (name) => name && name !== "-",
    );
    return [ALL_OPTION, ...names.map((name) => ({ value: name, label: name }))];
  }, [pendingContracts]);

  const deliveryScheduleOptions = useMemo(() => {
    const schedules = Array.from(new Set(pendingContracts.map((row) => row.deliverySchedule))).filter(
      Boolean,
    );
    return [ALL_OPTION, ...schedules.map((schedule) => ({ value: schedule, label: schedule }))];
  }, [pendingContracts]);

  const handleOpenTruckDetails = (row: PendingContractRow) => {
    setTruckDrawerRow(row);
    setTruckDrawerOpen(true);
    setSelectedContract(row.id);
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
  }, [pendingContracts, sellerFilter, buyerFilter, scheduleFilter, dateFrom, dateTo, keyword]);

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
    link.download = "open-pending-contracts.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pending-contracts-page">
      <div className="pending-contracts-card">
        <div className="pending-contracts-card__header">
          <h1>
            Open &amp; Pending Contract Transport
            <span className="pending-contracts-card__badge">New</span>
          </h1>
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
              onClick={handleExportToExcel}
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
          emptyMessage={
            isLoading || isFetching
              ? "Loading open & pending contracts…"
              : "No open or pending contracts match the current filters."
          }
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
