import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import TransportersFilters from "./TransportersFilters";
import Pagination from "./Pagination";
import { buildTransporterColumns } from "./transporters.columns";
import { buildFilterOptions } from "../../businessowners/BusinessList/Businessowners";
import {
  useGetTransporterProfileSummaryQuery,
  useDeleteTransporterProfileMutation,
  type Transporter,
  type TransporterProfileStatus,
} from "../../../../store/transportersApi";
import "./Transporters.scss";

const PAGE_SIZE = 10;
const DEFAULT_STATUS_FILTER: TransporterProfileStatus = "Active";

function getExportCellValue(row: Transporter, column: TableColumn<Transporter>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Transprters = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTransporterProfileSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteTransporterProfile] = useDeleteTransporterProfileMutation();
  const rows = useMemo(() => data ?? [], [data]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>(DEFAULT_STATUS_FILTER);
  const [transporterType, setTransporterType] = useState("All");
  const [state, setState] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Transporter | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = (transporter: Transporter) => {
    navigate(`/transporters/profile?id=${transporter.profileId}`);
  };

  const handleView = (transporter: Transporter) => {
    navigate(`${transporter.profileId}`);
  };

  const handleDelete = (transporter: Transporter) => {
    setDeleteError(null);
    setPendingDeleteRow(transporter);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteRow) return;

    const modifiedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await deleteTransporterProfile({
        profileId: pendingDeleteRow.profileId,
        modifiedOn: new Date().toISOString(),
        modifiedBy,
      }).unwrap();
      setPendingDeleteRow(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete transporter.");
    }
  };

  const columns = useMemo(
    () => buildTransporterColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }),
    [],
  );

  const transporterTypeOptions = useMemo(
    () => buildFilterOptions(rows.map((row) => row.transporterTypeName)),
    [rows],
  );

  const stateOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.stateName)), [rows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, status, transporterType, state]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (status !== "All" && row.status !== status) return false;
      if (transporterType !== "All" && row.transporterTypeName !== transporterType) return false;
      if (state !== "All" && row.stateName !== state) return false;

      if (q) {
        const haystack = [
          row.legalName,
          row.transporterTypeName,
          row.location,
          row.stateName,
          row.mobileNumber,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, status, transporterType, state]);

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
    link.download = "transporters.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="transporters-page">
      <div className="transporters-card">
        <div className="transporters-card__header">
          <h1>Transporters</h1>
          <div className="transporters-card__actions">
            <button
              type="button"
              className="transporters-btn transporters-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="transporters-btn transporters-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="transporters-btn transporters-btn--primary"
              onClick={() => navigate("/transporters/profile")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <TransportersFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            status={status}
            onStatusChange={setStatus}
            transporterType={transporterType}
            onTransporterTypeChange={setTransporterType}
            transporterTypeOptions={transporterTypeOptions}
            state={state}
            onStateChange={setState}
            stateOptions={stateOptions}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.profileId)}
          emptyMessage={
            isLoading
              ? "Loading transporters…"
              : error
                ? "Failed to load transporters."
                : "No transporters match the current filters."
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
        title="Remove this transporter?"
        message={
          deleteError ||
          `This will permanently delete "${pendingDeleteRow?.legalName}". This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default Transprters;
