import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import {
  categoryOptions,
  statusOptions,
  weightClauseOptions,
  nutritionalParameterOptions,
  MAX_PRODUCT_IMAGE_SIZE_MB,
  ALLOWED_PRODUCT_IMAGE_TYPES,
  emptySpecRow,
  emptyValueRow,
  type NutritionalSpecRow,
  type NutritionalValueRow,
} from "./productNew.data";
import "../../../contracts/NewContract.scss";
import "./ProductNew.scss";

interface FormErrors {
  category?: string;
  productName?: string;
  status?: string;
  weightClause?: string;
  aboutProduct?: string;
}

const ProductNew = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [status, setStatus] = useState("Active");
  const [weightClause, setWeightClause] = useState("mt");
  const [gstPercent, setGstPercent] = useState("");
  const [aboutProduct, setAboutProduct] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [specRows, setSpecRows] = useState<NutritionalSpecRow[]>([emptySpecRow()]);
  const [valueRows, setValueRows] = useState<NutritionalValueRow[]>([emptyValueRow()]);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<{ table: "spec" | "value"; id: string } | null>(
    null,
  );

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

  const handleSave = () => {
    const trimmedName = productName.trim();
    const trimmedAbout = aboutProduct.trim();

    const nextErrors: FormErrors = {};
    if (!category) nextErrors.category = "Category is required.";
    if (!trimmedName) nextErrors.productName = "Product Name is required.";
    if (!status) nextErrors.status = "Product Status is required.";
    if (!weightClause) nextErrors.weightClause = "Weight Clause is required.";
    if (!trimmedAbout) nextErrors.aboutProduct = "Please write about the product.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    navigate("/products");
  };

  return (
    <div className="product-new">
      <div className="product-new__topbar">
        <h1>New Product</h1>
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
              onChange={(event) => setProductName(event.target.value)}
            />
            {errors.productName && <p className="form-field__error">{errors.productName}</p>}
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
            <label className="form-field__label" htmlFor="gstPercent">
              GST %
            </label>
            <input
              id="gstPercent"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Enter GST %"
              value={gstPercent}
              onChange={(event) => setGstPercent(event.target.value)}
            />
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

      <div className="new-contract__actions">
        <button type="button" className="product-new-btn product-new-btn--cancel" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" className="product-new-btn product-new-btn--save" onClick={handleSave}>
          Save Product
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
