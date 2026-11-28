import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  SearchIcon,
} from "../../../../shared/components/icon";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import Table from "../../../../shared/components/table/Table";
import {
  Amount,
  ContractRate,
  DoNumberCell,
  buildPendingDeliveryOrderColumns,
  contractPath,
} from "./pendingDeliveryOrders.columns";
import {
  pendingDeliveryOrderRows,
  type PendingDeliveryOrderRow,
} from "./pendingDeliveryOrders.data";
import { isTransporterRole } from "../../../../core/auth/session";
import TransporterDeliveryOrders from "./TransporterDeliveryOrders";
import "./PendingDeliveryOrders.scss";

const PAGE_SIZE = 10;



interface MobileCardsProps {
  rows: PendingDeliveryOrderRow[];
  onAddDo: (row: PendingDeliveryOrderRow) => void;
}

/** Card layout used below the md breakpoint, where an 11-column table is unreadable. */
const PendingDoCards = ({ rows, onAddDo }: MobileCardsProps) => {
  if (rows.length === 0) {
    return (
      <div className="pending-dos-cards__empty" role="status">
        <CircleAlertIcon aria-hidden /> No pending DOs match the current filters.
      </div>
    );
  }

  return (
    <ul className="pending-dos-cards">
      {rows.map((row) => (
        <li key={row.id} className="pending-dos-card">
          <div className="pending-dos-card__top">
            <Link to={contractPath(row)} className="pending-dos-table__contract">
              {row.contractNo}
            </Link>
            <span className="pending-dos-card__status">{row.status}</span>
          </div>

          <dl className="pending-dos-card__grid">
            <div className="pending-dos-card__full">
              <dt>Seller</dt>
              <dd>{row.seller}</dd>
            </div>
            <div className="pending-dos-card__full">
              <dt>Buyer</dt>
              <dd>{row.buyer}</dd>
            </div>
            <div>
              <dt>Truck Number</dt>
              <dd>{row.truckNumber}</dd>
            </div>
            <div>
              <dt>Product</dt>
              <dd>{row.product}</dd>
            </div>
            <div>
              <dt>Contract Rate</dt>
              <dd>
                <ContractRate row={row} />
              </dd>
            </div>
            <div>
              <dt>Qty</dt>
              <dd className="pending-dos-table__qty">
                {row.qty} {row.qtyUnit}
              </dd>
            </div>
            <div>
              <dt>Freight</dt>
              <dd>
                <Amount value={row.freight} className="pending-dos-table__amount--strong" />
              </dd>
            </div>
            <div>
              <dt>Delivery type</dt>
              <dd>{row.deliveryType}</dd>
            </div>
          </dl>

          <div className="pending-dos-card__action">
            <DoNumberCell row={row} onAddDo={onAddDo} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const SellerPendingDeliveryOrders = () => {
  const [sellerFilter, setSellerFilter] = useState("All");
  const [buyerFilter, setBuyerFilter] = useState("All");
  const [keyword, setKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rows = pendingDeliveryOrderRows;

  const sellerOptions = useMemo(
    () => [
      { value: "All", label: "All Sellers" },
      ...Array.from(new Set(rows.map((row) => row.seller))).map((value) => ({ value, label: value })),
    ],
    [rows],
  );

  const buyerOptions = useMemo(
    () => [
      { value: "All", label: "All Buyers" },
      ...Array.from(new Set(rows.map((row) => row.buyer))).map((value) => ({ value, label: value })),
    ],
    [rows],
  );

  const navigate = useNavigate();

  const handleAddDo = (row: PendingDeliveryOrderRow) =>
    navigate(`/admin/truck-management/pending-delivery-orders/seller-truck-review/${encodeURIComponent(row.id)}`);

  const columns = useMemo(
    () => buildPendingDeliveryOrderColumns({ onAddDo: handleAddDo }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sellerFilter, buyerFilter, keyword]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (sellerFilter !== "All" && row.seller !== sellerFilter) return false;
      if (buyerFilter !== "All" && row.buyer !== buyerFilter) return false;
      if (q) {
        const haystack = [row.contractNo, row.seller, row.buyer, row.product, row.truckNumber]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, sellerFilter, buyerFilter, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleResetFilters = () => {
    setSellerFilter("All");
    setBuyerFilter("All");
    setKeyword("");
  };


  return (
    <div className="pending-dos-page">
      <div className="pending-dos-card-wrap">
        <div className="pending-dos-card-wrap__header">
          <h1>Pending DO of Seller Trucks</h1>
          <div className="pending-dos-card-wrap__actions">
            <button
              type="button"
              className="pending-dos-btn pending-dos-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
              aria-expanded={filtersVisible}
              aria-controls="pending-dos-filters"
            >
              {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div id="pending-dos-filters" className="pending-dos-filters">
            <SearchableSelect
              options={sellerOptions}
              value={sellerFilter}
              onChange={setSellerFilter}
              placeholder="Select Seller"
              ariaLabel="Select Seller"
            />
            <SearchableSelect
              options={buyerOptions}
              value={buyerFilter}
              onChange={setBuyerFilter}
              placeholder="Select Buyer"
              ariaLabel="Select Buyer"
            />
            <div className="pending-dos-filters__search-row">
              <div className="pending-dos-filters__search">
                <SearchIcon aria-hidden />
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search by Contract No, Seller, Buyer, Product Name"
                  aria-label="Search pending DOs"
                />
              </div>
              <button
                type="button"
                className="pending-dos-filters__reset"
                onClick={handleResetFilters}
                title="Reset filters"
                aria-label="Reset filters"
              >
                <RefreshCwIcon aria-hidden />
              </button>
            </div>
          </div>
        )}

        <div className="pending-dos-table-view">
          <Table
            exportName="Pending Delivery Orders"
            exportData={filteredRows}
            columnToggle
            columns={columns}
            data={pagedRows}
            rowKey={(row) => row.id}
            emptyMessage="No pending DOs match the current filters."
            className="pending-dos-table"
          />
        </div>

        <div className="pending-dos-cards-view">
          <PendingDoCards rows={pagedRows} onAddDo={handleAddDo} />
        </div>

        <div className="pending-dos-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  filteredRows.length,
                )} of ${filteredRows.length} Results`}
          </p>
          <div className="pending-dos-pagination__controls">
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
                aria-current={page === currentPageClamped ? "page" : undefined}
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
    </div>
  );
};

/** A transporter sees its own Assigned trucks split by whether the seller has entered the DO; everyone else keeps the seller view. */
const PendingDeliveryOrders = () => (isTransporterRole() ? <TransporterDeliveryOrders /> : <SellerPendingDeliveryOrders />);

export default PendingDeliveryOrders;
