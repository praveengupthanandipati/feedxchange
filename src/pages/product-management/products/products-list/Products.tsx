import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import ProductsFilters from "./ProductsFilters";
import Pagination from "./Pagination";
import { buildProductColumns, getProductStatus } from "./products.columns";
import { useGetProductsQuery, useDeleteProductMutation, type Product } from "../../../../store/productsApi";
import "./Products.scss";

const PAGE_SIZE = 10;
const DEFAULT_STATUS_FILTER = "Active";
const statusFilterOptions = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Deleted", label: "Deleted" },
];

function buildFilterOptions(values: string[], allLabel = "All") {
  const unique = Array.from(new Set(values.filter(Boolean))).sort();
  return [{ value: "All", label: allLabel }, ...unique.map((value) => ({ value, label: value }))];
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
  const { data, isLoading, error } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteProduct] = useDeleteProductMutation();
  const rows = useMemo(() => data ?? [], [data]);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>(DEFAULT_STATUS_FILTER);
  const [category, setCategory] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleView = (product: Product) => {
    navigate(`${product.id}`);
  };

  const handleEdit = (product: Product) => {
    navigate(`new?id=${product.id}`);
  };

  const handleDelete = (product: Product) => {
    setDeleteError(null);
    setPendingDeleteProduct(product);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteProduct) return;

    const actionPerformedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await deleteProduct({ productId: pendingDeleteProduct.id, actionPerformedBy }).unwrap();
      setPendingDeleteProduct(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete product.");
    }
  };

  const columns = useMemo(
    () => buildProductColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const categoryOptions = useMemo(
    () =>
      buildFilterOptions(
        rows.map((row) => row.categoryName).filter((name): name is string => Boolean(name)),
        "Category",
      ),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, status, category]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (status !== "All" && getProductStatus(row) !== status) return false;
      if (category !== "All" && row.categoryName !== category) return false;

      if (q) {
        const haystack = [row.name, row.categoryName, row.sku].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, status, category]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleClearFilters = () => {
    setKeyword("");
    setStatus(DEFAULT_STATUS_FILTER);
    setCategory("All");
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
              {filtersVisible ? "Hide Filters" : "Show Filters"}
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
            status={status}
            onStatusChange={setStatus}
            statusOptions={statusFilterOptions}
            category={category}
            onCategoryChange={setCategory}
            categoryOptions={categoryOptions}
            keyword={keyword}
            onKeywordChange={setKeyword}
            onClear={handleClearFilters}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.id)}
          emptyMessage={
            isLoading
              ? "Loading products…"
              : error
                ? "Failed to load products."
                : "No products match the current filters."
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
        open={pendingDeleteProduct !== null}
        title="Remove this product?"
        message={
          deleteError ||
          `This will permanently delete "${pendingDeleteProduct?.name ?? ""}". This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteProduct(null)}
      />
    </div>
  );
};

export default Products;
