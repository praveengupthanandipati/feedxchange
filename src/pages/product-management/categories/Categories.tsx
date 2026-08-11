import { useMemo, useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { FiImage, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
//import RowActionsMenu from "../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../components/table/table.types";
import {
  useGetAllActiveCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../store/categoryApi";
import type { Category } from "../../../store/categoryApi";
import "../../contracts/NewContract.scss";
import "./Categories.scss";
import RowActionsMenu from "../../../components/table/RowActionsMenu";

const PAGE_SIZE = 10;
const ALLOWED_CATEGORY_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_CATEGORY_IMAGE_SIZE_MB = 2;


const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

interface FormErrors {
  categoryName?: string;
  seoName?: string;
  status?: string;
}

const StatusBadge = ({ status }: { status: Category["status"] }) => (
  <span className={`categories__status categories__status--${status.toLowerCase()}`}>{status}</span>
);

const Categories = () => {
  const {
  data: apiCategories = [],
  isLoading,
  error,
} = useGetAllActiveCategoriesQuery();

// Add
    const [addCategory] = useAddCategoryMutation();

    // Update
    const [updateCategory] = useUpdateCategoryMutation();

    // Delete
    const [deleteCategory] = useDeleteCategoryMutation();

  const [rows, setRows] = useState<Category[]>([]);

  useEffect(() => {
  if (apiCategories.length > 0) {
    setRows(apiCategories);
  }
}, [apiCategories]);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  //const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [seoName, setSeoName] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setCategoryName("");
    setSeoName("");
    setStatus("Active");
    setDescription("");
    setImagePreview("");
    setSelectedImage(undefined)
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

  // Save the actual file for the API
  setSelectedImage(file);

  // Show preview in the UI
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
     // user hasn't selected a new image yet
     setSelectedImage(undefined);
    setImageError("");
    setErrors({});
  };

//   const handleDelete = async (row: Category) => {
//   try {
//     await deleteCategory({
//       categoryId: Number(row.id),
//       actionPerformedBy: 1,
//     }).unwrap();
//   } catch (err) {
//     console.error(err);
//   }
// };
const handleDelete = (row: Category) => {
  setDeleteError(null);
  setPendingDeleteRow(row);
};

const confirmDelete = async () => {
  if (!pendingDeleteRow) return;

  try {
    await deleteCategory({
      categoryId: Number(pendingDeleteRow.id),
      actionPerformedBy: 1,
    }).unwrap();

    setPendingDeleteRow(null);
  } catch (err) {
    setDeleteError(
      err instanceof Error ? err.message : "Failed to delete category."
    );
  }
};

const handleSave = async () => {
    
    const trimmedName = categoryName.trim();
    const trimmedSeoName = seoName.trim();

    const nextErrors: FormErrors = {};
    if (!trimmedName) nextErrors.categoryName = "Category Name is required.";
    if (!trimmedSeoName) nextErrors.seoName = "SEO Name is required.";
    if (!status) nextErrors.status = "Status is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

     if (!editingId && !selectedImage) {
  setImageError("Please select an image.");
  return;
}
    if (editingId) {
      if (!selectedImage) {
    setImageError("Please upload an image.");
    return;
  }
  try {
    const existingCategory = rows.find((row) => row.id === editingId);

    if (!existingCategory) return;

    await updateCategory({
      Id: Number(editingId),
      Name: trimmedName,
      SEOName: trimmedSeoName,
      Description: description,
      Priority: existingCategory.priority,
      IsActive: status === "Active",
      IsDeleted: false,
      CreatedAt: new Date().toISOString(),
      CreatedBy: 1,
      UpdatedAt: new Date().toISOString(),
      UpdatedBy: 1,
      Image: selectedImage,
    }).unwrap();

    resetForm();
  } catch (err) {
    console.error("Failed to update category:", err);
  }
} else {
  try {
    const priority =
      rows.length > 0
        ? Math.max(...rows.map((row) => row.priority)) + 1
        : 1;

    await addCategory({
      Name: trimmedName,
      SEOName: trimmedSeoName,
      Description: description,
      Priority: priority,
      IsActive: status === "Active",
      ActionPerfomedBy: 1,
      Image: selectedImage!,
    }).unwrap();

    resetForm();
  } catch (err) {
    console.error("Failed to add category:", err);
  }
}
};
  const columns = useMemo<TableColumn<Category>[]>(
    () => [
      {
        key: "categoryName",
        header: "Category Name",
        width: "10%",
        render: (row) => (
          <button type="button" className="categories__link" onClick={() => handleEdit(row)}>
            {row.categoryName}
          </button>
        ),
        exportValue: (row) => row.categoryName,
      },
         {
  key: "actions",
  header: "",
  align: "center",
  width: "15%",
  render: (row) => (
    <RowActionsMenu
      variant="menu"
      onEdit={() => handleEdit(row)}
      onDelete={() => handleDelete(row)}
    />
  ),
},
      {
        key: "status",
        header: "Status",
         width: "15%",
        render: (row) => <StatusBadge status={row.status} />,
        exportValue: (row) => row.status,
      },
      {
        key: "priority",
        header: "Priority",
        width: "10%",
        sortable: true,
        sortValue: (row) => row.priority,
        exportValue: (row) => String(row.priority),
      },
//       {
//   key: "actions",
//   header: "",
//   align: "center",
//   width: "90px",
//   render: (row) => (
//     <RowActionsMenu
//       variant="menu"
//       onEdit={() => handleEdit(row)}
//       onDelete={() => handleDelete(row)}
//     />
//   ),
// },
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

  if (isLoading) {
  return <div>Loading categories...</div>;
}

if (error) {
  return <div>Failed to load categories.</div>;
}
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
      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this category?"
        message={
          deleteError ||
          `This will permanently delete "${pendingDeleteRow?.categoryName}". This cannot be undone.`
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
export default Categories;
