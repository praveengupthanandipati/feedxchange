import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import SuccessToast from "../../../../components/toast/SuccessToast";
import { useSuccessToast } from "../../../../components/toast/useSuccessToast";
import DriversFilters from "./DriversFilters";
import Pagination from "./Pagination";
import { buildDriverColumns } from "./drivers.columns";
import {
  useGetAllActiveDriversQuery,
  useDeleteDriverMutation,
  type Driver,
} from "../../../../store/driversApi";
import "./Drivers.scss";

const PAGE_SIZE = 10;

interface FilterOption {
  value: string;
  label: string;
}

function buildExperienceOptions(values: number[], allLabel: string): FilterOption[] {
  const unique = Array.from(new Set(values)).sort((a, b) => a - b);
  return [
    { value: "All", label: allLabel },
    ...unique.map((value) => ({ value: String(value), label: `${value} yrs` })),
  ];
}

function getExportCellValue(row: Driver, column: TableColumn<Driver>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const DriversList = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAllActiveDriversQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteDriver] = useDeleteDriverMutation();
  const rows = useMemo(() => data ?? [], [data]);

  const [keyword, setKeyword] = useState("");
  const [experienceYears, setExperienceYears] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Driver | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { message: successMessage, showSuccessMessage } = useSuccessToast();

  const handleEdit = (driver: Driver) => {
    navigate(`/truck-management/transporters/driver-master/new?id=${driver.driverId}`);
  };

  const handleView = (driver: Driver) => {
    navigate(`/truck-management/transporters/driver-master/${driver.driverId}`);
  };

  const handleDelete = (driver: Driver) => {
    setDeleteError(null);
    setPendingDeleteRow(driver);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteRow) return;

    const actionPerformedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await deleteDriver({
        driverId: pendingDeleteRow.driverId,
        actionPerformedBy,
      }).unwrap();
      setPendingDeleteRow(null);
      showSuccessMessage("Driver deleted successfully");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete driver.");
    }
  };

  const columns = useMemo(
    () => buildDriverColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }),
    [],
  );

  const experienceYearsOptions = useMemo(
    () => buildExperienceOptions(rows.map((row) => row.experienceYears), "Filter by Experience"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, experienceYears]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (experienceYears !== "All" && String(row.experienceYears) !== experienceYears) return false;

      if (q) {
        const haystack = [row.driverName, row.mobileNumber, row.licenseNumber].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, experienceYears]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

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
    link.download = "drivers.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="drivers-page">
      <SuccessToast message={successMessage} />
      <div className="drivers-card">
        <div className="drivers-card__header">
          <h1>Drivers</h1>
          <div className="drivers-card__actions">
            <button
              type="button"
              className="drivers-btn drivers-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="drivers-btn drivers-btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="drivers-btn drivers-btn--primary"
              onClick={() => navigate("/truck-management/transporters/driver-master/new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <DriversFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            experienceYears={experienceYears}
            onExperienceYearsChange={setExperienceYears}
            experienceYearsOptions={experienceYearsOptions}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.driverId)}
          emptyMessage={
            isLoading
              ? "Loading drivers…"
              : error
                ? "Failed to load drivers."
                : "No drivers match the current filters."
          }
          minHeight
        />

        <Pagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          totalResults={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this driver?"
        message={
          deleteError ||
          `This will permanently delete "${pendingDeleteRow?.driverName}". This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default DriversList;
