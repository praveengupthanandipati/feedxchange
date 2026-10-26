import { useEffect, useMemo, useState } from "react";
import DatePickerInput from "../../../shared/components/dropdown/DatePickerInput";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "../../../shared/components/icon";
import Table from "../../../shared/components/table/Table";
import type { TableColumn } from "../../../shared/components/table/table.types";
import SearchableSelect from "../../../shared/components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../shared/components/dialog/ConfirmDialog";
import {
  useDeleteContractMutation,
  useGetAllContractsByFiltersQuery,
    useGetAllContractStatusesQuery,
  type PendingContractApiResponse,

} from "../../../core/store/contractsApi";
import { buildContractColumns } from "./contracts.columns";
import { useSuccessToast } from "../../../shared/components/toast/useSuccessToast";
import SuccessToast from "../../../shared/components/toast/SuccessToast";
import { dateRangeOptions, type Contract } from "./contracts.data";
import ContractsDashboard from "./dashboard/ContractsDashboard";
import { ATTENTION, inAttention, type AttentionKind, type MonthBar } from "./dashboard/contractsDashboard.utils";
import { ChartColumnIcon } from "../../../shared/components/icon";
import "./Contracts.scss";

import Can from "../../../core/auth/Can";

const PAGE_SIZE = 10;
const DASHBOARD_KEY = "fx-contracts-dashboard"; // "shown" | "hidden"

const readDashboardShown = () => {
  try {
    return localStorage.getItem(DASHBOARD_KEY) !== "hidden";
  } catch {
    return true;
  }
};

/** yyyy-mm-dd in local time, the format the date pickers use. */
const isoDay = (time: number) => {
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const DAY_MS = 24 * 60 * 60 * 1000;
function getExportCellValue(row: Contract, column: TableColumn<Contract>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizeStatus(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapApiContract(row: PendingContractApiResponse): Contract {
  const qtyMeasure = row.basicDetails.quantityMeasure || "mt";
  const quantity = row.basicDetails.quantity ?? 0;
  const contractRate = row.basicDetails.contractRate ?? 0;
  const netRateValue = row.basicDetails.netRate ?? contractRate;
  return {
    id: row.contractNumber,
    contractId: row.contractId,
    contractNumber: row.contractNumber,
    date: row.contractDate ? new Date(row.contractDate).toLocaleDateString("en-IN") : "",
    dateValue: row.contractDate ? new Date(row.contractDate).getTime() : 0,
    status: row.basicDetails.calculatedStatus as Contract["status"],
    seller: row.sellerName ?? "",
    buyer: row.buyerName ?? "",
    product: row.productName ?? "",
    quantityMeasure: qtyMeasure,
    qty: `${quantity} ${qtyMeasure}`,
    qtyValue: quantity,
    poTolerance: "",
    aQty: `${row.basicDetails.arrangedQuantity ?? 0} ${qtyMeasure}`,
    pQty: `${row.basicDetails.pendingQuantity ?? quantity} ${qtyMeasure}`,
    dQty: `${row.basicDetails.dispatchedQuantity ?? 0} ${qtyMeasure}`,
    cRate: `₹${contractRate}`,
    cRateValue: contractRate,
    gst: `${row.basicDetails.gstPercentage ?? 0}%`,
    netRate: `₹${netRateValue}`,
    netRateValue,
    // Not returned by the GetAllContracts summary endpoint.
    indicativeFreight: "",
    rateRemarks: "",
    deliveryType: row.basicDetails.deliveryType ?? "",
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
    approved: false,
  };
}

const ContractsLoader = () => {
  return (
    <div className="contracts-loader" role="status" aria-live="polite" aria-label="Loading contracts">
      <div className="contracts-loader__spinner" />
      <span>Loading contracts...</span>
    </div>
  );
};

const Contracts = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rows, setRows] = useState<Contract[]>([]);
  //const [successMessage, setSuccessMessage] = useState("");
  const { message: successMessage, showSuccessMessage } = useSuccessToast();
  const { data, isLoading, isFetching, isError } = useGetAllContractsByFiltersQuery();
  
  const { data: contractStatuses = [] } = useGetAllContractStatusesQuery();

  const statusOptions = useMemo(
  () =>
    contractStatuses
      .filter((status) => status.isActive)
      .map((status) => ({
        value: status.statusName,
        label: status.displayName || status.statusName,
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
  // Overview above the list: attention group / month picked there (null = none), and whether it is shown
  const [focus, setFocus] = useState<AttentionKind | null>(null);
  const [monthStart, setMonthStart] = useState<number | null>(null);
  const [dashboardShown, setDashboardShown] = useState(readDashboardShown);
  const [now] = useState(() => Date.now());
  const focusIds = useMemo(
    () => (focus && data ? new Set(data.filter((contract) => inAttention(focus, contract, now)).map((contract) => contract.contractNumber)) : null),
    [focus, data, now],
  );
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
  if (!data) return;

    setRows(
      data.map(mapApiContract),
    );
}, [data]);

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
      await deleteContract({ contractNumber: pendingDeleteRow.contractNumber }).unwrap();
      setRows((prev) => prev.filter((row) => row.contractNumber !== pendingDeleteRow.contractNumber));
      setSelectedRowIds((prev) => prev.filter((id) => id !== pendingDeleteRow.contractNumber));
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
    const pageIds = pagedRows.map((row) => row.contractNumber);
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
  }, [keyword, statusFilter, dateRangeFilter, customFrom, customTo, focus]);


const filteredRows = useMemo(() => {
  const searchText = keyword.trim().toLowerCase();
  const selectedStatus = normalizeStatus(statusFilter.trim());

  return rows.filter((row) => {
    if (row.status.toLowerCase() === "deleted") return false;
    // a "needs attention" group picked in the overview
    if (focusIds && !focusIds.has(row.contractNumber)) return false;

    if (selectedStatus) {
      const matchedStatus = contractStatuses.find(
        (status) =>
          normalizeStatus(status.statusName) === selectedStatus ||
          normalizeStatus(status.displayName) === selectedStatus,
      );
      const rowStatus = normalizeStatus(row.status);
      const matchesStatus = matchedStatus
        ? rowStatus === normalizeStatus(matchedStatus.statusName) ||
          rowStatus === normalizeStatus(matchedStatus.displayName)
        : rowStatus === selectedStatus;

      if (!matchesStatus) return false;
    }
    

    // Date filters
    if (dateRangeFilter === "Today") {
      const rowDate = new Date(row.dateValue);
      const today = new Date();

      if (rowDate.toDateString() !== today.toDateString()) {
        return false;
      }
    }

    if (dateRangeFilter === "Last 7 Days") {
       const endOfToday = new Date().setHours(23, 59, 59, 999);
       if (row.dateValue < Date.now() - 7 * DAY_MS || row.dateValue > endOfToday) {
         return false;
       }
      if (row.dateValue < Date.now() - 7 * DAY_MS) {
        return false;
      }
    }

    if (dateRangeFilter === "Last 30 Days") {
      // const endOfToday = new Date().setHours(23, 59, 59, 999);
      // if (row.dateValue < Date.now() - 30 * DAY_MS || row.dateValue > endOfToday) {
      //   return false;
      // }
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
  contractStatuses,
  keyword,
  statusFilter,
  dateRangeFilter,
  customFrom,
  customTo,
  focusIds,
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
      focus ? ATTENTION[focus].label : null,
    ]
      .filter(Boolean)
      .join(" • ") || "All";

  const handleClearFilters = () => {
    setKeyword("");
    setStatusFilter("");
    setDateRangeFilter("All");
    setCustomFrom("");
    setCustomTo("");
    setFocus(null);
    setMonthStart(null);
  };

  // ---------- overview -> the list's filters ----------
  const toggleDashboard = () => {
    setDashboardShown((shown) => {
      try {
        localStorage.setItem(DASHBOARD_KEY, shown ? "hidden" : "shown");
      } catch {
        /* storage blocked: the choice lasts for this visit */
      }
      return !shown;
    });
  };

  /** The overview names a status as the API sends it (its display name); the status filter takes the status name. */
  const pickStatus = (status: string) => {
    const key = normalizeStatus(status);
    const match = contractStatuses.find((item) => normalizeStatus(item.displayName) === key || normalizeStatus(item.statusName) === key);
    const value = match?.statusName ?? status;
    setStatusFilter((current) => (normalizeStatus(current) === normalizeStatus(value) ? "" : value));
  };

  const pickMonth = (month: MonthBar) => {
    if (monthStart === month.start) {
      setMonthStart(null);
      setDateRangeFilter("All");
      setCustomFrom("");
      setCustomTo("");
      return;
    }
    const start = new Date(month.start);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0).getTime();
    setMonthStart(month.start);
    setDateRangeFilter("Custom Date Range");
    setCustomFrom(isoDay(month.start));
    setCustomTo(isoDay(end));
  };

  const pickSearch = (text: string) => setKeyword((current) => (current.toLowerCase() === text.toLowerCase() ? "" : text));

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
      <button type="button" className="contracts-dashboard-toggle" aria-expanded={dashboardShown} onClick={toggleDashboard}>
        <ChartColumnIcon aria-hidden /> {dashboardShown ? "Hide overview" : "Show overview"}
      </button>

      {dashboardShown && (
        <ContractsDashboard
          contracts={data}
          loading={isLoading}
          error={isError}
          now={now}
          active={{
            status: statusFilter,
            focus,
            search: keyword,
            monthStart: dateRangeFilter === "Custom Date Range" ? monthStart : null,
          }}
          onStatus={pickStatus}
          onFocus={setFocus}
          onMonth={pickMonth}
          onSearch={pickSearch}
          onClear={handleClearFilters}
        />
      )}

      {/* the overview has these figures and more; the two tiles stay for anyone who hides it */}
      {!dashboardShown && (
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
      )}

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
              {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="contracts-btn contracts-btn--warning"
              onClick={handleExport}
            >
              <DownloadIcon aria-hidden /> Export
            </button>
            <Can any={["contracts.manage"]}>
              <button
                type="button"
                className="contracts-btn contracts-btn--primary"
                onClick={() => navigate("new")}
              >
                <PlusIcon aria-hidden /> New
              </button>
            </Can>
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
              <SearchIcon aria-hidden />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search by Contract No, Seller, Buyer, Product"
              />
            </div>

            {dateRangeFilter === "Custom Date Range" && (
              <div className="contracts-filters__date-range">
                <DatePickerInput
                  value={customFrom}
                  onChange={(value) => setCustomFrom(value)}
                  ariaLabel="From date"
                  clearable
                />
                <span>to</span>
                <DatePickerInput
                  value={customTo}
                  onChange={(value) => setCustomTo(value)}
                  ariaLabel="To date"
                  clearable
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
              <XIcon aria-hidden />
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
          mobileCards
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
