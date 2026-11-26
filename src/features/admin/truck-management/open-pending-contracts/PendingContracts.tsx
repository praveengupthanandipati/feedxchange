import { useEffect, useMemo, useState } from "react";
import { useOpenAndPendingContracts } from "../../../../core/store/useOpenAndPendingContracts";
import PartyName from "../../../../shared/components/party/PartyName";
import { Button, Input } from "../../../../shared/components/ui";
import SearchableSelectField from "../../../../shared/components/dropdown/SearchableSelectField";
import { describePeriod, type Period } from "../../business-dashboard/businessDashboard.utils";
import BusinessPeriodFields from "../../common/business-period/BusinessPeriodFields";
import { useBusinessFilter } from "../../common/business-period/useBusinessFilter";
import { ALL_TIME, inPeriod } from "../../common/business-period/period";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  useGetAllContractsQuery,
} from "../../../../core/store/contractsApi";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  HouseIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  SearchIcon,
  TruckIcon,
  UserIcon,
  XIcon,
} from "../../../../shared/components/icon";
import Table from "../../../../shared/components/table/Table";
import ExportButtons from "../../../../shared/components/table/ExportButtons";
import { buildPendingContractColumns } from "./pendingContracts.columns";
import { mapOpenAndPendingContract, type PendingContractRow } from "./pendingContracts.data";
import { useContractTruckDetails } from "../contract-trucks/useContractTruckDetails";
import TruckList from "../contract-trucks/TruckList";
import { useSelectedContract } from "../../../../core/context/SelectedContractContext";
import { ContractCards, DashboardInsights, DashboardSummary } from "./ContractDashboard";
import "../pending-contracts/PendingContracts.scss";
import "./PendingContracts.scss";

const PAGE_SIZE = 10;
const CARD_PAGE_SIZE = 12;

type ViewMode = "cards" | "table";
type SortMode = "latest" | "pending" | "qty";
type StatusFilter = "All" | PendingContractRow["status"];

/** An open contract can be old, so the list starts on "All time" (unlike the Business Dashboard's financial year). */
const DEFAULT_PERIOD: Period = ALL_TIME;

interface TruckTrackingDrawerProps {
  open: boolean;
  row: PendingContractRow | null;
  onClose: () => void;
}

const TruckTrackingDrawer = ({ open, row, onClose }: TruckTrackingDrawerProps) => {
  const { trucks, isLoading: trucksLoading, isError: trucksFailed } = useContractTruckDetails(row?.id ?? "", open && Boolean(row));

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
                <XIcon aria-hidden />
              </button>
            </div>

            <div className="truck-tracking-drawer__body">
              <div className="truck-tracking-drawer__parties">
                <p>
                  <HouseIcon aria-hidden /> Seller: <strong><PartyName name={row.seller} /></strong>
                </p>
                <p>
                  <UserIcon aria-hidden /> Buyer: <strong><PartyName name={row.buyer} /></strong>
                </p>
              </div>

              <div className="truck-tracking-drawer__section-header">
                <h3>
                  <TruckIcon aria-hidden /> Truck Tracking Details
                </h3>
                <div className="truck-tracking-drawer__actions">
                  <Link
                    to={`/admin/truck-management/open-pending-contracts/instant-truck?contract=${encodeURIComponent(row.id)}`}
                    className="truck-tracking-drawer__add-btn"
                  >
                    <PlusIcon aria-hidden /> Add Instant Truck
                  </Link>
                  <Link
                    to={`/admin/truck-management/open-pending-contracts/schedule-dispatch?contract=${encodeURIComponent(row.id)}`}
                    className="truck-tracking-drawer__add-btn"
                  >
                    <PlusIcon aria-hidden /> Schedule Dispatch
                  </Link>
                  <Link
                    to={`/admin/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(row.id)}`}
                    className="truck-tracking-drawer__add-btn"
                  >
                    <EyeIcon aria-hidden /> View All Trucks
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

              <TruckList trucks={trucks} isLoading={trucksLoading} loadFailed={trucksFailed} />
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
};

const PendingContracts = () => {
  // Business: "All" = every business the caller may see (staff: all; an owner: own + linked), owners start on their own
  const business = useBusinessFilter();
  const matchesBusiness = business.matches;
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<ViewMode>("cards");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [truckDrawerOpen, setTruckDrawerOpen] = useState(false);
  const [truckDrawerRow, setTruckDrawerRow] = useState<PendingContractRow | null>(null);
  const { setSelectedContract } = useSelectedContract();

  const { data: openAndPendingContracts, isLoading: listLoading, isFetching, isError: listFailed } = useOpenAndPendingContracts();

  // The list endpoint also returns contracts still pending approval, which cannot take trucks.
  // Only Open and Partially Dispatched contracts are shown; the real status comes from GetAllContracts.
  const { data: allContracts, isLoading: statusesLoading } = useGetAllContractsQuery();
  const isLoading = listLoading || statusesLoading;

  const pendingContracts = useMemo(() => {
    const statusByNumber = new Map<string, PendingContractRow["status"]>();
    (allContracts?.contracts ?? []).forEach((c) => {
      if (c.approvalStatus === false) return; // still awaiting approval
      const status = (c.status ?? "").replace(/\s+/g, "").toLowerCase();
      if (status === "open") statusByNumber.set(c.contractNumber, "Open");
      else if (status === "partiallydispatched") statusByNumber.set(c.contractNumber, "Partially Dispatched");
    });
    return (openAndPendingContracts ?? [])
      .filter((row) => statusByNumber.has(row.contractNumber))
      .map((row) => mapOpenAndPendingContract(row, statusByNumber.get(row.contractNumber)));
  }, [openAndPendingContracts, allContracts]);

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
  }, [business.selectedId, period, statusFilter, keyword, view, sortMode]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return pendingContracts.filter((row) => {
      // a contract belongs to a business when it is its seller or its buyer
      if (!matchesBusiness(row.sellerId, row.buyerId)) return false;
      if (statusFilter !== "All" && row.status !== statusFilter) return false;
      if (!inPeriod(period, row.dateValue)) return false;

      if (q) {
        const haystack = [row.id, row.seller, row.buyer, row.product].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [pendingContracts, matchesBusiness, statusFilter, period, keyword]);

  const filtersActive =
    business.value !== business.defaultValue || period.key !== DEFAULT_PERIOD.key || statusFilter !== "All" || keyword.trim() !== "";

  // the cards follow the chosen sort; the table keeps its own column sorting
  const orderedRows = useMemo(() => {
    if (view === "table") return filteredRows;
    const rows = [...filteredRows];
    if (sortMode === "pending") rows.sort((a, b) => b.pQtyValue - a.pQtyValue);
    else if (sortMode === "qty") rows.sort((a, b) => b.cQtyValue - a.cQtyValue);
    else rows.sort((a, b) => b.dateValue - a.dateValue);
    return rows;
  }, [filteredRows, view, sortMode]);

  const pageSize = view === "cards" ? CARD_PAGE_SIZE : PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(orderedRows.length / pageSize));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = orderedRows.slice(
    (currentPageClamped - 1) * pageSize,
    currentPageClamped * pageSize,
  );
  const emptyMessage =
    isLoading || isFetching
      ? "Loading open & pending contracts…"
      : listFailed
        ? "Open & pending contracts could not be loaded. Please try again."
        : "No open or pending contracts match the current filters.";

  const handleClearFilters = () => {
    business.reset();
    setPeriod(DEFAULT_PERIOD);
    setStatusFilter("All");
    setKeyword("");
  };

  // Cards view has no table toolbar, so its CSV / PDF buttons (ExportButtons) sit in the header; Table view uses the toolbar
  const EXPORT_NAME = "Open and Pending Contracts";

  return (
    <div className="pending-contracts-page">
      <div className="pending-contracts-card">
        <div className="pending-contracts-card__header">
          <h1>
            Open &amp; Pending Contract Transport
            <span className="pending-contracts-card__badge">New</span>
          </h1>
          {view === "cards" && (
            <div className="pending-contracts-card__actions">
              <ExportButtons name={EXPORT_NAME} columns={pendingContractColumns} rows={filteredRows} />
            </div>
          )}
        </div>

        <div className="bp-filters" role="search" aria-label="Filter contracts">
          <BusinessPeriodFields business={business} period={period} onPeriodChange={setPeriod} />
          <SearchableSelectField
            label="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            options={[
              { value: "All", label: "Open and partially dispatched" },
              { value: "Open", label: "Open" },
              { value: "Partially Dispatched", label: "Partially dispatched" },
            ]}
          />
          <Input
            label="Search"
            type="search"
            icon={SearchIcon}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Contract no, seller, buyer, product"
            fieldClassName="bp-filters__search"
          />
          <Button icon={XIcon} onClick={handleClearFilters} disabled={!filtersActive} title="Clear filters">
            Clear
          </Button>
        </div>
        <p className="bp-filters__summary" aria-live="polite">
          {describePeriod(period.from, period.to)}
          {business.selectedName && ` · ${business.selectedName} as seller or buyer`}
          {business.failed && " · The business list could not be loaded; showing every contract you can see."}
        </p>

        <DashboardSummary rows={filteredRows} />
        <DashboardInsights rows={filteredRows} />

        <div className="cd-toolbar">
          <h2 className="cd-toolbar__title">Contracts ({filteredRows.length})</h2>
          <div className="cd-toolbar__tools">
            {view === "cards" && (
              <select className="cd-select" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} aria-label="Sort contracts">
                <option value="latest">Latest first</option>
                <option value="pending">Most pending first</option>
                <option value="qty">Largest contract first</option>
              </select>
            )}
            <div className="cd-switch" role="group" aria-label="View">
              <button type="button" className={view === "cards" ? "is-active" : ""} onClick={() => setView("cards")} aria-pressed={view === "cards"}>
                <LayoutGridIcon aria-hidden /> Cards
              </button>
              <button type="button" className={view === "table" ? "is-active" : ""} onClick={() => setView("table")} aria-pressed={view === "table"}>
                <ListIcon aria-hidden /> Table
              </button>
            </div>
          </div>
        </div>

        {view === "cards" ? (
          <ContractCards rows={pagedRows} onOpenTruckDetails={handleOpenTruckDetails} emptyMessage={emptyMessage} />
        ) : (
          <Table
            exportName={EXPORT_NAME}
            exportData={orderedRows}
            columnToggle
            columns={pendingContractColumns}
            data={pagedRows}
            rowKey={(row) => row.id}
            emptyMessage={emptyMessage}
            minHeight
          />
        )}

        <div className="pending-contracts-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * pageSize + 1}-${Math.min(
                  currentPageClamped * pageSize,
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
              <ChevronLeftIcon aria-hidden />
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
              <ChevronRightIcon aria-hidden />
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
