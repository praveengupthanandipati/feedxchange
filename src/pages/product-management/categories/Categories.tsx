import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FiImage, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import RowActionsMenu from "../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../components/table/table.types";
import {
  categories as initialCategories,
  statusOptions,
  nextCategoryId,
  MAX_CATEGORY_IMAGE_SIZE_MB,
  ALLOWED_CATEGORY_IMAGE_TYPES,
  type Category,
} from "./categories.data";
import "../../contracts/NewContract.scss";
import "./Categories.scss";

const PAGE_SIZE = 10;

interface FormErrors {
  categoryName?: string;
  seoName?: string;
  status?: string;
}

const StatusBadge = ({ status }: { status: Category["status"] }) => (
  <span className={`categories__status categories__status--${status.toLowerCase()}`}>{status}</span>
);

const Categories = () => {
  const [rows, setRows] = useState<Category[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [seoName, setSeoName] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setEditingId(null);
    setCategoryName("");
    setSeoName("");
    setStatus("Active");
    setDescription("");
    setImagePreview("");
    setImageError("");
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_CATEGORY_IMAGE_TYPES.includes(file.type)) {
      setImageError("Unsupported file format.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_CATEGORY_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_CATEGORY_IMAGE_SIZE_MB}MB.`);
      event.target.value = "";
      return;
    }

    setImageError("");
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const handleEdit = (row: Category) => {
    setEditingId(row.id);
    setCategoryName(row.categoryName);
    setSeoName(row.seoName);
    setStatus(row.status);
    setDescription(row.description);
    setImagePreview(row.imageUrl);
    setImageError("");
    setErrors({});
  };

  const handleDelete = (row: Category) => {
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    if (editingId === row.id) resetForm();
  };

  const handleSave = () => {
    const trimmedName = categoryName.trim();
    const trimmedSeoName = seoName.trim();

    const nextErrors: FormErrors = {};
    if (!trimmedName) nextErrors.categoryName = "Category Name is required.";
    if (!trimmedSeoName) nextErrors.seoName = "SEO Name is required.";
    if (!status) nextErrors.status = "Status is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (editingId) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === editingId
            ? {
                ...row,
                categoryName: trimmedName,
                seoName: trimmedSeoName,
                status: status as Category["status"],
                description,
                imageUrl: imagePreview,
              }
            : row,
        ),
      );
    } else {
      const priority = rows.length ? Math.max(...rows.map((row) => row.priority)) + 1 : 1;
      setRows((prev) => [
        ...prev,
        {
          id: nextCategoryId(),
          categoryName: trimmedName,
          seoName: trimmedSeoName,
          status: status as Category["status"],
          priority,
          description,
          imageUrl: imagePreview,
        },
      ]);
    }

    resetForm();
  };

  const columns = useMemo<TableColumn<Category>[]>(
    () => [
      {
        key: "categoryName",
        header: "Category Name",
        render: (row) => (
          <button type="button" className="categories__link" onClick={() => handleEdit(row)}>
            {row.categoryName}
          </button>
        ),
        exportValue: (row) => row.categoryName,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <RowActionsMenu onEdit={() => handleEdit(row)} onDelete={() => handleDelete(row)} />
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
        exportValue: (row) => row.status,
      },
      {
        key: "priority",
        header: "Priority",
        sortable: true,
        sortValue: (row) => row.priority,
        exportValue: (row) => String(row.priority),
      },
    ],
    [rows],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = rows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );
  const startResult = rows.length === 0 ? 0 : (currentPageClamped - 1) * PAGE_SIZE + 1;
  const endResult = Math.min(currentPageClamped * PAGE_SIZE, rows.length);

  return (
    <div className="categories-page">
      <div className="categories-form-card">
        <h2 className="categories-form-card__title">
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>

        <div className="categories-upload">
          <div className="categories-upload__preview">
            {imagePreview ? <img src={imagePreview} alt="Category" /> : <FiImage aria-hidden />}
          </div>
          <button
            type="button"
            className="categories-upload__btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Picture
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="form-field__file-input"
            accept={ALLOWED_CATEGORY_IMAGE_TYPES.join(",")}
            onChange={handleImageChange}
          />
        </div>
        {imageError && <p className="form-field__error">{imageError}</p>}

        <div className="form-field">
          <label className="form-field__label" htmlFor="categoryName">
            Category Name <span className="form-field__required">*</span>
          </label>
          <input
            id="categoryName"
            type="text"
            className="form-field__control"
            placeholder="Category Name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
          />
          {errors.categoryName && <p className="form-field__error">{errors.categoryName}</p>}
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="seoName">
            SEO Name <span className="form-field__required">*</span>
          </label>
          <input
            id="seoName"
            type="text"
            className="form-field__control"
            placeholder="SEO Name"
            value={seoName}
            onChange={(event) => setSeoName(event.target.value)}
          />
          {errors.seoName && <p className="form-field__error">{errors.seoName}</p>}
        </div>

        <div className="form-field">
          <span className="form-field__label">
            Status <span className="form-field__required">*</span>
          </span>
          <SearchableSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
            ariaLabel="Status"
          />
          {errors.status && <p className="form-field__error">{errors.status}</p>}
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="form-field__control"
            placeholder="Describe about Category"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="categories-form-card__actions">
          <button type="button" className="categories-btn categories-btn--cancel" onClick={resetForm}>
            Cancel
          </button>
          <button type="button" className="categories-btn categories-btn--save" onClick={handleSave}>
            Save Category
          </button>
        </div>
      </div>

      <div className="categories-table-card">
        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No categories found."
        />

        <div className="categories-pagination">
          <p>
            {rows.length === 0
              ? "Showing 0 Results"
              : `Showing ${startResult}-${endResult} of ${rows.length} Results`}
          </p>
          <div className="categories-pagination__controls">
            <button
              type="button"
              disabled={currentPageClamped === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPageClamped - 1))}
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPageClamped + 1))}
              aria-label="Next page"
            >
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
