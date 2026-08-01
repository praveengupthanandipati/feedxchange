import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiUser, FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import { API_URL } from "../../../../api/api";
import { useGetAllActiveCategoriesQuery } from "../../../../store/categoryApi";
import {
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  parseProductFeatures,
} from "../../../../store/productsApi";
import {
  statusOptions,
  weightClauseOptions,
  nutritionalParameterOptions,
  MAX_PRODUCT_IMAGE_SIZE_MB,
  ALLOWED_PRODUCT_IMAGE_TYPES,
  emptySpecRow,
  emptyValueRow,
  nextSpecRowId,
  nextValueRowId,
  type NutritionalSpecRow,
  type NutritionalValueRow,
} from "./productNew.data";
import "../../../contracts/NewContract.scss";
import "./ProductNew.scss";

interface FormErrors {
  category?: string;
  productName?: string;
  sku?: string;
  price?: string;
  status?: string;
  weightClause?: string;
  aboutProduct?: string;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ProductNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useGetAllActiveCategoriesQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const {
    data: existingProduct,
    isFetching: loadingExisting,
    isError: existingLoadError,
  } = useGetProductByIdQuery(editId ?? "", { skip: !editId });

  const categoryOptions = (categories ?? []).map((cat) => ({
    value: String(cat.id),
    label: cat.categoryName ?? "",
  }));

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [seoName, setSeoName] = useState("");
  const [seoNameEdited, setSeoNameEdited] = useState(false);
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minimumQuantity, setMinimumQuantity] = useState("");
  const [maximumQuantity, setMaximumQuantity] = useState("");
  const [status, setStatus] = useState("Active");
  const [weightClause, setWeightClause] = useState("mt");
  const [aboutProduct, setAboutProduct] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [specRows, setSpecRows] = useState<NutritionalSpecRow[]>([emptySpecRow()]);
  const [valueRows, setValueRows] = useState<NutritionalValueRow[]>([emptyValueRow()]);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<{ table: "spec" | "value"; id: string } | null>(
    null,
  );

  useEffect(() => {
    if (!existingProduct || hydrated) return;

    const features = parseProductFeatures(existingProduct.productFeatures);

    setCategory(existingProduct.categoryId ? String(existingProduct.categoryId) : "");
    setProductName(existingProduct.name ?? "");
    setSeoName(existingProduct.seoName ?? "");
    setSeoNameEdited(true);
    setSku(existingProduct.sku ?? "");
    setPrice(existingProduct.price ? String(existingProduct.price) : "");
    setStock(existingProduct.stock != null ? String(existingProduct.stock) : "");
    setMinimumQuantity(existingProduct.minimumQuantity != null ? String(existingProduct.minimumQuantity) : "");
    setMaximumQuantity(existingProduct.maximumQuantity != null ? String(existingProduct.maximumQuantity) : "");
    setStatus(existingProduct.isActive ? "Active" : "Inactive");
    setWeightClause(existingProduct.weightClause ?? "mt");
    setAboutProduct(existingProduct.description ?? "");
    setImagePreview(existingProduct.fileName ? `${API_URL}${existingProduct.fileName}` : "");

    setSpecRows(
      features.nutritionalSpecifications?.length
        ? features.nutritionalSpecifications.map((spec) => ({ id: nextSpecRowId(), ...spec }))
        : [emptySpecRow()],
    );
    setValueRows(
      features.nutritionalValueAndUses?.length
        ? features.nutritionalValueAndUses.map((value) => ({
            id: nextValueRowId(),
            value: value.title,
            description: value.description,
          }))
        : [emptyValueRow()],
    );

    setHydrated(true);
  }, [existingProduct, hydrated]);

  const handleProductNameChange = (value: string) => {
    setProductName(value);
    if (!seoNameEdited) setSeoName(slugify(value));
  };

  const handleSeoNameChange = (value: string) => {
    setSeoNameEdited(true);
    setSeoName(value);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type)) {
      setImageError("Unsupported file format.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_PRODUCT_IMAGE_SIZE_MB}MB.`);
      event.target.value = "";
      return;
    }

    setImageError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const addSpecRow = () => setSpecRows((prev) => [...prev, emptySpecRow()]);
  const updateSpecRow = (id: string, patch: Partial<NutritionalSpecRow>) =>
    setSpecRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addValueRow = () => setValueRows((prev) => [...prev, emptyValueRow()]);
  const updateValueRow = (id: string, patch: Partial<NutritionalValueRow>) =>
    setValueRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const confirmRemoveRow = () => {
    if (!pendingDeleteRow) return;
    if (pendingDeleteRow.table === "spec") {
      setSpecRows((prev) => prev.filter((row) => row.id !== pendingDeleteRow.id));
    } else {
      setValueRows((prev) => prev.filter((row) => row.id !== pendingDeleteRow.id));
    }
    setPendingDeleteRow(null);
  };

  const handleCancel = () => navigate("/products");

  const handleSave = async () => {
    const trimmedName = productName.trim();
    const trimmedAbout = aboutProduct.trim();
    const trimmedSku = sku.trim();

    const nextErrors: FormErrors = {};
    if (!category) nextErrors.category = "Category is required.";
    if (!trimmedName) nextErrors.productName = "Product Name is required.";
    if (!trimmedSku) nextErrors.sku = "SKU is required.";
    if (!price || Number(price) <= 0) nextErrors.price = "Enter a valid price.";
    if (!status) nextErrors.status = "Product Status is required.";
    if (!weightClause) nextErrors.weightClause = "Weight Clause is required.";
    if (!trimmedAbout) nextErrors.aboutProduct = "Please write about the product.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const productFeatures = JSON.stringify({
      nutritionalSpecifications: specRows.filter((row) => row.parameter.trim()),
      nutritionalValueAndUses: valueRows
        .filter((row) => row.value.trim() || row.description.trim())
        .map((row) => ({ title: row.value, description: row.description })),
    });

    const currentUserId = Number(localStorage.getItem("userId")) || 0;

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (isEditing && existingProduct) {
        await updateProduct({
          id: existingProduct.id,
          name: trimmedName,
          seoName: seoName || slugify(trimmedName),
          sku: trimmedSku,
          description: trimmedAbout,
          price: Number(price) || 0,
          reason: "Product updated",
          categoryId: Number(category),
          productFeatures,
          weightClause,
          insertedTime: existingProduct.insertedTime,
          stock: Number(stock) || 0,
          minimumQuantity: Number(minimumQuantity) || 0,
          maximumQuantity: Number(maximumQuantity) || 0,
          isActive: status === "Active",
          isDeleted: existingProduct.isDeleted,
          updatedBy: currentUserId,
          image: imageFile ?? undefined,
        }).unwrap();
      } else {
        await createProduct({
          name: trimmedName,
          seoName: seoName || slugify(trimmedName),
          sku: trimmedSku,
          description: trimmedAbout,
          price: Number(price) || 0,
          categoryId: Number(category),
          productFeatures,
          weightClause,
          stock: Number(stock) || 0,
          minimumQuantity: Number(minimumQuantity) || 0,
          maximumQuantity: Number(maximumQuantity) || 0,
          reason: "New product added",
          isActive: status === "Active",
          actionPerfomedBy: currentUserId,
          image: imageFile ?? undefined,
        }).unwrap();
      }
      navigate("/products");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditing && !hydrated && loadingExisting) {
    return (
      <div className="product-new">
        <div className="product-new__topbar">
          <h1>Edit Product</h1>
          <Link to="/products" className="product-new__back">
            <FiArrowLeft aria-hidden /> Products List
          </Link>
        </div>
        <div className="product-new-form-card">
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  if (isEditing && existingLoadError) {
    return (
      <div className="product-new">
        <div className="product-new__topbar">
          <h1>Edit Product</h1>
          <Link to="/products" className="product-new__back">
            <FiArrowLeft aria-hidden /> Products List
          </Link>
        </div>
        <div className="product-new-form-card">
          <p>Failed to load product for id "{editId}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-new">
      <div className="product-new__topbar">
        <h1>{isEditing ? "Edit Product" : "New Product"}</h1>
        <Link to="/products" className="product-new__back">
          <FiArrowLeft aria-hidden /> Products List
        </Link>
      </div>

      <div className="product-new__layout">
        <div className="product-new-form-card">
          <div className="product-new-upload">
            <div className="product-new-upload__preview">
              {imagePreview ? <img src={imagePreview} alt="Product" /> : <FiUser aria-hidden />}
            </div>
            <button
              type="button"
              className="product-new-upload__btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="form-field__file-input"
              accept={ALLOWED_PRODUCT_IMAGE_TYPES.join(",")}
              onChange={handleImageChange}
            />
          </div>
          {imageError && <p className="form-field__error">{imageError}</p>}

          <h3 className="form-subheading">Product Primary Details</h3>

          <div className="form-field">
            <span className="form-field__label">
              Select Category <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Select Category"
              ariaLabel="Select Category"
            />
            {errors.category && <p className="form-field__error">{errors.category}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="productName">
              Product Name <span className="form-field__required">*</span>
            </label>
            <input
              id="productName"
              type="text"
              className="form-field__control"
              placeholder="Enter Product Name"
              value={productName}
              onChange={(event) => handleProductNameChange(event.target.value)}
            />
            {errors.productName && <p className="form-field__error">{errors.productName}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="seoName">
              SEO Name
            </label>
            <input
              id="seoName"
              type="text"
              className="form-field__control"
              placeholder="seo-friendly-name"
              value={seoName}
              onChange={(event) => handleSeoNameChange(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="sku">
              SKU <span className="form-field__required">*</span>
            </label>
            <input
              id="sku"
              type="text"
              className="form-field__control"
              placeholder="Enter SKU"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
            />
            {errors.sku && <p className="form-field__error">{errors.sku}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="price">
              Price <span className="form-field__required">*</span>
            </label>
            <input
              id="price"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            {errors.price && <p className="form-field__error">{errors.price}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Stock"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="minimumQuantity">
              Minimum Quantity
            </label>
            <input
              id="minimumQuantity"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Minimum Quantity"
              value={minimumQuantity}
              onChange={(event) => setMinimumQuantity(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="maximumQuantity">
              Maximum Quantity
            </label>
            <input
              id="maximumQuantity"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter Maximum Quantity"
              value={maximumQuantity}
              onChange={(event) => setMaximumQuantity(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Product Status <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={statusOptions}
              value={status}
              onChange={setStatus}
              ariaLabel="Product Status"
            />
            {errors.status && <p className="form-field__error">{errors.status}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Weight Clause <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={weightClauseOptions}
              value={weightClause}
              onChange={setWeightClause}
              ariaLabel="Weight Clause"
            />
            {errors.weightClause && <p className="form-field__error">{errors.weightClause}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="aboutProduct">
              Write About Product <span className="form-field__required">*</span>
            </label>
            <textarea
              id="aboutProduct"
              className="form-field__control"
              placeholder="Describe about the Product"
              value={aboutProduct}
              onChange={(event) => setAboutProduct(event.target.value)}
            />
            {errors.aboutProduct && <p className="form-field__error">{errors.aboutProduct}</p>}
          </div>
        </div>

        <div className="product-new-specs-card">
          <div className="product-new-specs-section">
            <h3 className="form-subheading">Nutritional Specifications</h3>
            <div className="nutrition-table nutrition-table--specs">
              <div className="nutrition-table__header">
                <span>Select Parameter</span>
                <span>Min</span>
                <span>Max</span>
                <span>Show in Website</span>
                <span>Add/Delete</span>
              </div>
              {specRows.map((row, index) => (
                <div className="nutrition-table__row" key={row.id}>
                  <SearchableSelect
                    options={nutritionalParameterOptions}
                    value={row.parameter}
                    onChange={(value) => updateSpecRow(row.id, { parameter: value })}
                    placeholder="Select..."
                    ariaLabel="Nutritional parameter"
                    allowCustom
                  />
                  <input
                    type="text"
                    className="form-field__control"
                    placeholder="Ex: 45%"
                    value={row.min}
                    onChange={(event) => updateSpecRow(row.id, { min: event.target.value })}
                  />
                  <input
                    type="text"
                    className="form-field__control"
                    placeholder="Ex: 50%"
                    value={row.max}
                    onChange={(event) => updateSpecRow(row.id, { max: event.target.value })}
                  />
                  <label className="nutrition-table__checkbox">
                    <span className="nutrition-table__checkbox-label">Show in Website</span>
                    <input
                      type="checkbox"
                      checked={row.showInWebsite}
                      onChange={(event) => updateSpecRow(row.id, { showInWebsite: event.target.checked })}
                    />
                  </label>
                  <div className="nutrition-table__row-actions">
                    {specRows.length > 1 && (
                      <button
                        type="button"
                        className="nutrition-table__action-btn nutrition-table__action-btn--delete"
                        onClick={() => setPendingDeleteRow({ table: "spec", id: row.id })}
                        aria-label="Remove row"
                      >
                        <FiTrash2 aria-hidden />
                      </button>
                    )}
                    {index === specRows.length - 1 && (
                      <button
                        type="button"
                        className="nutrition-table__action-btn nutrition-table__action-btn--add"
                        onClick={addSpecRow}
                        aria-label="Add row"
                      >
                        <FiPlus aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="product-new-specs-section">
            <h3 className="form-subheading">Nutritional Value &amp; Uses</h3>
            <div className="nutrition-table nutrition-table--values">
              <div className="nutrition-table__header">
                <span>Nutritional Value</span>
                <span>Nutritional Description</span>
                <span>Add/Delete</span>
              </div>
              {valueRows.map((row, index) => (
                <div className="nutrition-table__row" key={row.id}>
                  <input
                    type="text"
                    className="form-field__control"
                    placeholder="Nutritional Value"
                    value={row.value}
                    onChange={(event) => updateValueRow(row.id, { value: event.target.value })}
                  />
                  <textarea
                    className="form-field__control"
                    placeholder="Nutritional Description"
                    value={row.description}
                    onChange={(event) => updateValueRow(row.id, { description: event.target.value })}
                  />
                  <div className="nutrition-table__row-actions">
                    {valueRows.length > 1 && (
                      <button
                        type="button"
                        className="nutrition-table__action-btn nutrition-table__action-btn--delete"
                        onClick={() => setPendingDeleteRow({ table: "value", id: row.id })}
                        aria-label="Remove row"
                      >
                        <FiTrash2 aria-hidden />
                      </button>
                    )}
                    {index === valueRows.length - 1 && (
                      <button
                        type="button"
                        className="nutrition-table__action-btn nutrition-table__action-btn--add"
                        onClick={addValueRow}
                        aria-label="Add row"
                      >
                        <FiPlus aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <p className="new-contract__error" style={{ color: "#d92d20" }}>
          {submitError}
        </p>
      )}

      <div className="new-contract__actions">
        <button type="button" className="product-new-btn product-new-btn--cancel" onClick={handleCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="product-new-btn product-new-btn--save"
          onClick={handleSave}
          disabled={submitting}
        >
          {submitting ? "Saving…" : isEditing ? "Update Product" : "Save Product"}
        </button>
      </div>

      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this row?"
        message={
          pendingDeleteRow?.table === "spec"
            ? "This will remove this nutritional specification row. This cannot be undone."
            : "This will remove this nutritional value row. This cannot be undone."
        }
        onConfirm={confirmRemoveRow}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default ProductNew;