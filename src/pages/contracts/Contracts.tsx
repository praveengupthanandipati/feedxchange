import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiPlus,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Table from "../../components/table/Table";
import type { TableColumn } from "../../components/table/table.types";
import SearchableSelect from "../../components/dropdown/SearchableSelect";
import {
  useDeleteContractMutation,
  useGetAllContractsQuery,
  type GetAllContractsRow,
} from "../../store/contractsApi";
import { buildContractColumns } from "./contracts.columns";
import { dateRangeOptions, statusOptions, type Contract } from "./contracts.data";
import "./Contracts.scss";

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function getExportCellValue(row: Contract, column: TableColumn<Contract>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mapApiContract(row: GetAllContractsRow): Contract {
  const qtyMeasure = row.quantityMeasure || "mt";
  return {
    id: row.contractNumber,
    contractId: row.id,
    date: row.contractDate ? new Date(row.contractDate).toLocaleDateString("en-IN") : "",
    dateValue: row.contractDate ? new Date(row.contractDate).getTime() : 0,
    status: row.status as Contract["status"],
    seller: row.sellerName ?? "",
    buyer: row.buyerName ?? "",
    product: row.productName ?? "",
    quantityMeasure: qtyMeasure,
    qty: `${row.quantity} ${qtyMeasure}`,
    qtyValue: row.quantity,
    poTolerance: "",
    aQty: `${row.arrangedQuantity ?? 0} ${qtyMeasure}`,
    pQty: `${row.pendingQuantity ?? 0} ${qtyMeasure}`,
    dQty: `${row.dispatchedQuantity ?? 0} ${qtyMeasure}`,
    cRate: `₹${row.contractRate}`,
    cRateValue: row.contractRate,
    gst: `${row.gstPercentage ?? 0}%`,
    netRate: `₹${row.netRate ?? 0}`,
    netRateValue: row.netRate ?? 0,
    // Not returned by the GetAllContracts summary endpoint — populated when the
    // full contract is loaded (e.g. via GetContractByContractId on edit).
    indicativeFreight: "",
    rateRemarks: "",
    deliveryType: row.deliveryType ?? "",
    paymentTerms: "",
    paymentBeforeDate: "",
    immediateAdvancePercent: "",
    immediateAdvanceDate: "",
    balanceAdvancePercent: "",
    balanceAdvanceDate: "",
    sellerPaymentDueDays: "",
    buyerPaymentDueDays: "",
    paymentRemarks: "",
    iFreight: "",
    iFreightValue: 0,
    sellerConditions: {
      commission: "",
      deliverySchedule: "ready-loading",
      fromDate: "",
      toDate: "",
      specificDays: "",
      qualitySpecSource: "",
      address: "",
      remarks: "",
    },
    buyerConditions: {
      commission: "",
      deliverySchedule: "ready-loading",
      fromDate: "",
      toDate: "",
      specificDays: "",
      qualitySpecSource: "",
      address: "",
      remarks: "",
    },
    approved: row.approvalStatus,
  };
}

const ContractsLoader = () => {
  return (
    <div className="contracts-loader">
      <div className="contracts-loader__spinner" />
    </div>
  );
};

const Contracts = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rows, setRows] = useState<Contract[]>([]);
  const { data, isLoading, isFetching } = useGetAllContractsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });
  const [deleteContract] = useDeleteContractMutation();
  const [dateRangeFilter, setDateRangeFilter] = useState("All");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (contract: Contract) => {
      navigate("new",{
        state:{ contract,isEdit:true }
      });
    };

  useEffect(() => {
    if (!data?.contracts) return;

    setRows(data.contracts.map(mapApiContract));
  }, [data]);

  const handleDelete = async (contract: Contract) => {
    try {
      await deleteContract({ contractId: contract.contractId }).unwrap();
      setRows((prev) => prev.filter((row) => row.id !== contract.id));
      setSelectedRowIds((prev) => prev.filter((id) => id !== contract.id));
    } catch (error) {
      console.error("Delete Contract API failed", error);
    }
  };  

  const handleToggleRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    const pageIds = pagedRows.map((row) => row.id);
    setSelectedRowIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...pageIds]))
        : prev.filter((id) => !pageIds.includes(id)),
    );
  };

  const columns = useMemo(
    () => buildContractColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, statusFilter, dateRangeFilter, customFrom, customTo]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (dateRangeFilter === "Today") {
        const rowDate = new Date(row.dateValue);
        const today = new Date();
        if (rowDate.toDateString() !== today.toDateString()) return false;
      } else if (dateRangeFilter === "Last 7 Days") {
        if (row.dateValue < Date.now() - 7 * DAY_MS) return false;
      } else if (dateRangeFilter === "Last 30 Days") {
        if (row.dateValue < Date.now() - 30 * DAY_MS) return false;
      } else if (dateRangeFilter === "Previous Month") {
        const today = new Date();
        const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
        const firstOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
        if (row.dateValue < firstOfPrevMonth || row.dateValue >= firstOfThisMonth) return false;
      } else if (dateRangeFilter === "Custom Date Range") {
        if (customFrom && row.dateValue < new Date(customFrom).getTime()) return false;
        if (customTo && row.dateValue > new Date(customTo).getTime() + DAY_MS - 1) return false;
      }

      return true;
    });
  }, [rows, statusFilter, keyword, dateRangeFilter, customFrom, customTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const totalQuantityValue = rows.reduce((sum, row) => sum + row.qtyValue, 0);

  const dataShowingLabel =
    [
      statusFilter && statusFilter !== "All" ? statusFilter : null,
      dateRangeFilter !== "All" ? dateRangeFilter : null,
    ]
      .filter(Boolean)
      .join(" • ") || "All";

  const handleClearFilters = () => {
    setKeyword("");
    setStatusFilter("");
    setDateRangeFilter("All");
    setCustomFrom("");
    setCustomTo("");
  };

  const handleExport = () => {
    const exportColumns = columns.filter((column) => column.key !== "actions");
    const headerRow = exportColumns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = exportColumns
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
    link.download = "contracts.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const totalContractsValue = rows.length;

  return (
    <div className="contracts-page">
      <div className="contracts-page__summary">
        <div className="contracts-summary contracts-summary--primary">
          <span>Total Contracts</span>
          <strong>{totalContractsValue}</strong>
        </div>
        <div className="contracts-summary contracts-summary--success">
          <span>Total Quantity</span>
          <strong>{totalQuantityValue.toLocaleString("en-IN")} MT</strong>
        </div>
      </div>

      <div className="contracts-card">
        <div className="contracts-card__header">
          <div>
            <h2>All Contracts</h2>
            <p>Data Showing: {dataShowingLabel}</p>
          </div>
          <div className="contracts-card__actions">
            <button
              type="button"
              className="contracts-btn contracts-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="contracts-btn contracts-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="contracts-btn contracts-btn--primary"
              onClick={() => navigate("new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="contracts-filters">
            <SearchableSelect
              options={dateRangeOptions}
              value={dateRangeFilter}
              onChange={setDateRangeFilter}
              ariaLabel="Filter by date range"
            />

            <div className="contracts-filters__search">
              <FiSearch aria-hidden />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search by Contract No, Seller, Buyer, Product"
              />
            </div>

            {dateRangeFilter === "Custom Date Range" && (
              <div className="contracts-filters__date-range">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  aria-label="From date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  aria-label="To date"
                />
              </div>
            )}

            <SearchableSelect
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Select Status"
              ariaLabel="Filter by status"
            />

            <button
              type="button"
              className="contracts-filters__clear"
              onClick={handleClearFilters}
              title="Clear filters"
              aria-label="Clear filters"
            >
              <FiX aria-hidden />
            </button>
          </div>
        )}

        {isLoading || isFetching ? (
  <ContractsLoader />
) : (
        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedRowIds}
          onSelectRow={handleToggleRow}
          onSelectAll={handleSelectAll}
          emptyMessage="No contracts match the current filters."
          minHeight
        />
)}

        <div className="contracts-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  filteredRows.length,
                )} of ${filteredRows.length} Results`}
          </p>
          <div className="contracts-pagination__controls">
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
  );
};

export default Contracts;
