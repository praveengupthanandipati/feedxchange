import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import BusinessOwnersFilters from "./BusinessOwnersFilters";
import Pagination from "./Pagination";
import { buildBusinessOwnerColumns } from "./businessOwners.columns";
import { businessOwners as initialBusinessOwners, type BusinessOwner } from "./businessOwners.data";
import "./Businessowners.scss";

const PAGE_SIZE = 10;

function getExportCellValue(row: BusinessOwner, column: TableColumn<BusinessOwner>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Businessowners = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<BusinessOwner[]>(initialBusinessOwners);
  const [keyword, setKeyword] = useState("");
  const [businessType, setBusinessType] = useState("All");
  const [state, setState] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (_owner: BusinessOwner) => {
    // TODO: open the edit-business-owner form once it exists.
  };

  const handleDelete = (owner: BusinessOwner) => {
    setRows((prev) => prev.filter((row) => row.id !== owner.id));
  };

  const columns = useMemo(
    () => buildBusinessOwnerColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, businessType, state]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (businessType !== "All" && row.businessType !== businessType) return false;
      if (state !== "All" && row.state !== state) return false;

      if (q) {
        const haystack = [row.companyName, row.location, row.mobile].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, businessType, state]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleClearFilters = () => {
    setKeyword("");
    setBusinessType("All");
    setState("All");
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
    link.download = "business-owners.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="business-owners-page">
      <div className="business-owners-card">
        <div className="business-owners-card__header">
          <h1>Business Owners</h1>
          <div className="business-owners-card__actions">
            <button
              type="button"
              className="business-owners-btn business-owners-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              type="button"
              className="business-owners-btn business-owners-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="business-owners-btn business-owners-btn--primary"
              onClick={() => navigate("new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <BusinessOwnersFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            businessType={businessType}
            onBusinessTypeChange={setBusinessType}
            state={state}
            onStateChange={setState}
            onClear={handleClearFilters}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No business owners match the current filters."
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

export default Businessowners;
