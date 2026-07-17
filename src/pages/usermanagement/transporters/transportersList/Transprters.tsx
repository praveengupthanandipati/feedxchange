import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import TransportersFilters from "./TransportersFilters";
import Pagination from "./Pagination";
import { buildTransporterColumns } from "./transporters.columns";
import { transporters as initialTransporters, type Transporter } from "./transporters.data";
import "./Transporters.scss";

const PAGE_SIZE = 10;

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
  const [rows, setRows] = useState<Transporter[]>(initialTransporters);
  const [keyword, setKeyword] = useState("");
  const [transporterType, setTransporterType] = useState("All");
  const [state, setState] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (_transporter: Transporter) => {
    // TODO: open the edit-transporter form once it exists.
  };

  const handleView = (transporter: Transporter) => {
    navigate(`${transporter.id}`);
  };

  const handleDelete = (transporter: Transporter) => {
    setRows((prev) => prev.filter((row) => row.id !== transporter.id));
  };

  const columns = useMemo(
    () => buildTransporterColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }),
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, transporterType, state]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (transporterType !== "All" && row.transporterType !== transporterType) return false;
      if (state !== "All" && row.state !== state) return false;

      if (q) {
        const haystack = [
          row.companyName,
          row.transporterType,
          row.location,
          row.state,
          row.mobile,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, transporterType, state]);

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
              onClick={() => navigate("new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <TransportersFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            transporterType={transporterType}
            onTransporterTypeChange={setTransporterType}
            state={state}
            onStateChange={setState}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No transporters match the current filters."
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
    </div>
  );
};

export default Transprters;
