import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import DriversFilters from "./DriversFilters";
import Pagination from "./Pagination";
import { buildDriverColumns } from "./drivers.columns";
import { MOCK_DRIVERS } from "./drivers.mock";
import type { Driver } from "./drivers.types";
import "./Drivers.scss";

const PAGE_SIZE = 10;

interface FilterOption {
  value: string;
  label: string;
}

function buildStringOptions(values: string[], allLabel: string): FilterOption[] {
  const unique = Array.from(new Set(values.filter(Boolean))).sort();
  return [{ value: "All", label: allLabel }, ...unique.map((value) => ({ value, label: value }))];
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
  // TODO: replace with a real driversApi (RTK Query) once the backend exposes
  // a GetAllDrivers summary endpoint; see drivers.mock.ts.
  const [rows, setRows] = useState<Driver[]>(MOCK_DRIVERS);
  const [keyword, setKeyword] = useState("");
  const [experienceYears, setExperienceYears] = useState("All");
  const [state, setState] = useState("All");
  const [transporter, setTransporter] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Driver | null>(null);

  const handleEdit = (driver: Driver) => {
    // TODO: point at the real edit route once the Driver edit page is built.
    navigate(`/truck-management/transporters/driver-master/edit/${driver.driverId}`);
  };

  const handleDelete = (driver: Driver) => {
    setPendingDeleteRow(driver);
  };

  const confirmDelete = () => {
    if (!pendingDeleteRow) return;
    // TODO: call the real delete mutation once the backend exposes one.
    setRows((prev) => prev.filter((row) => row.driverId !== pendingDeleteRow.driverId));
    setPendingDeleteRow(null);
  };

  const columns = useMemo(
    () => buildDriverColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const experienceYearsOptions = useMemo(
    () => buildExperienceOptions(rows.map((row) => row.experienceYears), "Filter by Experience"),
    [rows],
  );
  const stateOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.stateName), "Filter by State"),
    [rows],
  );
  const transporterOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.transporterName), "Filter by Transporter"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, experienceYears, state, transporter]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (experienceYears !== "All" && String(row.experienceYears) !== experienceYears) return false;
      if (state !== "All" && row.stateName !== state) return false;
      if (transporter !== "All" && row.transporterName !== transporter) return false;

      if (q) {
        const haystack = [row.driverName, row.mobileNumber, row.licenseNumber, row.stateName, row.transporterName]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, experienceYears, state, transporter]);

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
            state={state}
            onStateChange={setState}
            stateOptions={stateOptions}
            transporter={transporter}
            onTransporterChange={setTransporter}
            transporterOptions={transporterOptions}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.driverId)}
          emptyMessage="No drivers match the current filters."
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
        message={`This will permanently delete "${pendingDeleteRow?.driverName}". This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default DriversList;
