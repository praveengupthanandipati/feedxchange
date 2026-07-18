import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import PromotersFilters from "./PromotersFilters";
import Pagination from "./Pagination";
import { buildPromoterColumns } from "./promoters.columns";
import { promoters as initialPromoters, type Promoter } from "./promoters.data";
import "./Promoters.scss";

const PAGE_SIZE = 10;

function getExportCellValue(row: Promoter, column: TableColumn<Promoter>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Promoterlist = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Promoter[]>(initialPromoters);
  const [keyword, setKeyword] = useState("");
  const [state, setState] = useState("All");
  const [district, setDistrict] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (_promoter: Promoter) => {
    // TODO: open the edit-promoter form once it exists.
  };

  const handleView = (_promoter: Promoter) => {
    // TODO: open the promoter detail view once it exists.
  };

  const handleDelete = (promoter: Promoter) => {
    setRows((prev) => prev.filter((row) => row.id !== promoter.id));
  };

  const columns = useMemo(
    () => buildPromoterColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }),
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, state, district]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (state !== "All" && row.state !== state) return false;
      if (district !== "All" && row.district !== district) return false;

      if (q) {
        const haystack = [row.promoterName, row.referralCode, row.phone, row.email]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, state, district]);

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
    link.download = "promoters.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="promoters-page">
      <div className="promoters-card">
        <div className="promoters-card__header">
          <h1>Promoters</h1>
          <div className="promoters-card__actions">
            <button
              type="button"
              className="promoters-btn promoters-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="promoters-btn promoters-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="promoters-btn promoters-btn--primary"
              onClick={() => navigate("new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <PromotersFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            state={state}
            onStateChange={setState}
            district={district}
            onDistrictChange={setDistrict}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No promoters match the current filters."
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

export default Promoterlist;
