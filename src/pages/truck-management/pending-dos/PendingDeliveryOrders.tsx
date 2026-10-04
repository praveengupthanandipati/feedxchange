import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiDownload,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
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
import "./PendingDeliveryOrders.scss";

const PAGE_SIZE = 10;

function getExportCellValue(
  row: PendingDeliveryOrderRow,
  column: TableColumn<PendingDeliveryOrderRow>,
): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface MobileCardsProps {
  rows: PendingDeliveryOrderRow[];
  onAddDo: (row: PendingDeliveryOrderRow) => void;
}

/** Card layout used below the md breakpoint, where an 11-column table is unreadable. */
const PendingDoCards = ({ rows, onAddDo }: MobileCardsProps) => {
  if (rows.length === 0) {
    return (
      <div className="pending-dos-cards__empty" role="status">
        <FiAlertCircle aria-hidden /> No pending DOs match the current filters.
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

const PendingDeliveryOrders = () => {
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
    navigate(`/truck-management/pending-delivery-orders/seller-truck-review/${encodeURIComponent(row.id)}`);

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

  const handleExportToExcel = () => {
    const headerRow = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = columns
          .map((column) => `<td>${escapeHtml(getExportCellValue(row, column))}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<meta charset="utf-8"><table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pending-delivery-orders.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="pending-dos-btn pending-dos-btn--warning"
              onClick={handleExportToExcel}
            >
              <FiDownload aria-hidden /> Export
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
                <FiSearch aria-hidden />
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
                <FiRefreshCw aria-hidden />
              </button>
            </div>
          </div>
        )}

        <div className="pending-dos-table-view">
          <Table
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
              <FiChevronLeft aria-hidden />
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
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingDeliveryOrders;
