import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import ConfirmDialog from "../../components/dialog/ConfirmDialog";
import {
  useDeleteContractMutation,
  useGetAllContractsQuery,
    useGetAllContractStatusesQuery,   useLazyGetAllContractsByFiltersQuery,
  type GetAllContractsRow,
    type PendingContractApiResponse,

} from "../../store/contractsApi";
import { buildContractColumns } from "./contracts.columns";
import { useSuccessToast } from "../../components/toast/useSuccessToast";
import SuccessToast from "../../components/toast/SuccessToast";
import { dateRangeOptions, type Contract } from "./contracts.data";
import "./Contracts.scss";

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const SUCCESS_MESSAGE_STORAGE_KEY = "contractsSuccessMessage";

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
    //status: row.status as Contract["status"],
    status: row.status ?? "",
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

function mapFilteredContract(row: PendingContractApiResponse): Contract {
  const basic = row.basicDetails;

  const quantity = basic?.quantity ?? 0;
  const quantityMeasure = basic?.quantityMeasure || "mt";
  const contractRate = basic?.contractRate ?? 0;
  const status = basic?.calculatedStatus ?? "";

  return {
    id: row.contractNumber,
    contractId: row.contractId,

    date: row.contractDate
      ? new Date(row.contractDate).toLocaleDateString("en-IN")
      : "",

    dateValue: row.contractDate
      ? new Date(row.contractDate).getTime()
      : 0,

    status: status as Contract["status"],

    seller: row.sellerName ?? "",
    buyer: row.buyerName ?? "",
    product: row.productName ?? "",

    quantityMeasure,

    qty: `${quantity} ${quantityMeasure}`,
    qtyValue: quantity,

    poTolerance: "",

    aQty: "0",
    pQty: `${quantity} ${quantityMeasure}`,
    dQty: "0",

    cRate: `₹${contractRate}`,
    cRateValue: contractRate,

    gst: "0%",
    netRate: `₹${contractRate}`,
    netRateValue: contractRate,

    indicativeFreight: "",
    rateRemarks: "",

    deliveryType: basic?.deliveryType ?? "",

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
      deliverySchedule: basic?.deliverySchedule ?? "ready-loading",
      fromDate: basic?.deliveryFromDate ?? "",
      toDate: basic?.deliveryToDate ?? "",
      specificDays: "",
      qualitySpecSource: "",
      address: "",
      remarks: "",
    },

    buyerConditions: {
      commission: "",
      deliverySchedule: basic?.deliverySchedule ?? "ready-loading",
      fromDate: basic?.deliveryFromDate ?? "",
      toDate: basic?.deliveryToDate ?? "",
      specificDays: "",
      qualitySpecSource: "",
      address: "",
      remarks: "",
    },

    approved: false,
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
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rows, setRows] = useState<Contract[]>([]);
  //const [successMessage, setSuccessMessage] = useState("");
  const { message: successMessage, showSuccessMessage } = useSuccessToast();
  const { data, isLoading, isFetching } = useGetAllContractsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });
  
  const { data: contractStatuses = [] } = useGetAllContractStatusesQuery();

  const [getContractsByFilters, { isFetching: isFiltering }] =
  useLazyGetAllContractsByFiltersQuery();

  const statusOptions = useMemo(
  () =>
    contractStatuses
      .filter((status) => status.isActive)
      .map((status) => ({
        value: status.name,
        label: status.displayName || status.name,
      })),
  [contractStatuses],
);
  const [deleteContract] = useDeleteContractMutation();
  const [dateRangeFilter, setDateRangeFilter] = useState("All");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Contract | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Same toast pattern as Categories.tsx: show the message, auto-clear after 3s.
  // const showSuccessMessage = (message: string) => {
  //   setSuccessMessage(message);
  //   setTimeout(() => {
  //     setSuccessMessage("");
  //   }, 3000);
  // };

  const handleEdit = (contract: Contract) => {
      navigate("new",{
        state:{ contract,isEdit:true }
      });
    };

  // useEffect(() => {
  //   if (!data?.contracts) return;

  //   setRows(data.contracts.map(mapApiContract));
  // }, [data]);

  useEffect(() => {
  if (!data?.contracts) return;

  // Only populate from GetAllContracts when
  // no status filter is selected.
  if (!statusFilter) {
    setRows(data.contracts.map(mapApiContract));
  }
}, [data, statusFilter]);

useEffect(() => {
  const loadContractsByStatus = async () => {
    // When no status is selected, GetAllContractsQuery
    // will provide all contracts.
    if (!statusFilter) {
      return;
    }

    try {
      const result = await getContractsByFilters({
        Status: statusFilter,
      }).unwrap();

setRows(result.map(mapFilteredContract));    } catch (error) {
      console.error("Failed to load contracts by status:", error);
      setRows([]);
    }
  };

  loadContractsByStatus();
}, [statusFilter, getContractsByFilters]);

  //   useEffect(() => {
  //   const incomingMessage =
  //     (location.state as { successMessage?: string } | null)?.successMessage ??
  //     localStorage.getItem(SUCCESS_MESSAGE_STORAGE_KEY);

  //   if (incomingMessage) {
  //     localStorage.removeItem(SUCCESS_MESSAGE_STORAGE_KEY);
  //     showSuccessMessage(incomingMessage);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location.state]);

  
  const handleDelete = (contract: Contract) => {
    setDeleteError(null);
    setPendingDeleteRow(contract);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteRow) return;

    try {
      await deleteContract({ contractId: pendingDeleteRow.contractId }).unwrap();
      setRows((prev) => prev.filter((row) => row.id !== pendingDeleteRow.id));
      setSelectedRowIds((prev) => prev.filter((id) => id !== pendingDeleteRow.id));
      setPendingDeleteRow(null);
      setDeleteError(null);
      showSuccessMessage("Contract deleted successfully");
    } catch (error) {
      console.error("Delete Contract API failed", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete contract."
      );
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
  const searchText = keyword.trim().toLowerCase();

  return rows.filter((row) => {
    

    // Date filters
    if (dateRangeFilter === "Today") {
      const rowDate = new Date(row.dateValue);
      const today = new Date();

      if (rowDate.toDateString() !== today.toDateString()) {
        return false;
      }
    }

    if (dateRangeFilter === "Last 7 Days") {
      if (row.dateValue < Date.now() - 7 * DAY_MS) {
        return false;
      }
    }

    if (dateRangeFilter === "Last 30 Days") {
      if (row.dateValue < Date.now() - 30 * DAY_MS) {
        return false;
      }
    }

    if (dateRangeFilter === "Previous Month") {
      const today = new Date();

      const firstOfThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ).getTime();

      const firstOfPreviousMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      ).getTime();

      if (
        row.dateValue < firstOfPreviousMonth ||
        row.dateValue >= firstOfThisMonth
      ) {
        return false;
      }
    }

    if (dateRangeFilter === "Custom Date Range") {
      if (
        customFrom &&
        row.dateValue < new Date(customFrom).getTime()
      ) {
        return false;
      }

      if (
        customTo &&
        row.dateValue >
          new Date(customTo).getTime() + DAY_MS - 1
      ) {
        return false;
      }
    }

    // Search
    if (searchText) {
      const searchableText = [
        row.id,
        row.seller,
        row.buyer,
        row.product,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(searchText)) {
        return false;
      }
    }

    return true;
  });
}, [
  rows,
  keyword,
  dateRangeFilter,
  customFrom,
  customTo,
]);
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

        {isLoading || isFetching || isFiltering ? (
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
      
      <SuccessToast message={successMessage} />
      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this contract?"
        message={
          deleteError ||
          `This will permanently delete contract "${pendingDeleteRow?.id}". This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDeleteRow(null);
          setDeleteError(null);
        }}
      />

    </div>
  );
};

export default Contracts;
