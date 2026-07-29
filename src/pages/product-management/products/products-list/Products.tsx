import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import ProductsFilters from "./ProductsFilters";
import Pagination from "./Pagination";
import { buildProductColumns } from "./products.columns";
import { products as initialProducts, type Product } from "./products.data";
import "./Products.scss";

const PAGE_SIZE = 10;

function buildCategoryOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: value }));
}

function getExportCellValue(row: Product, column: TableColumn<Product>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Products = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Product[]>(initialProducts);
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);

  const handleView = (product: Product) => {
    navigate(product.id);
  };

  const handleEdit = (product: Product) => {
    navigate(`edit/${product.id}`);
  };

  const handleDelete = (product: Product) => {
    setPendingDeleteProduct(product);
  };

  const confirmDelete = () => {
    if (!pendingDeleteProduct) return;
    setRows((prev) => prev.filter((row) => row.id !== pendingDeleteProduct.id));
    setPendingDeleteProduct(null);
  };

  const columns = useMemo(
    () => buildProductColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const categoryOptions = useMemo(
    () => buildCategoryOptions(rows.map((row) => row.category)),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, category]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (category && row.category !== category) return false;

      if (q) {
        const haystack = [row.productName, row.category].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, category]);

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
    link.download = "products.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="products-list-page">
      <div className="products-list-card">
        <div className="products-list-card__header">
          <h1>All Products</h1>
          <div className="products-list-card__actions">
            <button
              type="button"
              className="products-list-btn products-list-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="products-list-btn products-list-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="products-list-btn products-list-btn--primary"
              onClick={() => navigate("new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <ProductsFilters
            category={category}
            onCategoryChange={setCategory}
            categoryOptions={categoryOptions}
            keyword={keyword}
            onKeywordChange={setKeyword}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No products match the current filters."
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
        open={pendingDeleteProduct !== null}
        title="Remove this product?"
        message={`This will permanently delete "${pendingDeleteProduct?.productName}". This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteProduct(null)}
      />
    </div>
  );
};

export default Products;
