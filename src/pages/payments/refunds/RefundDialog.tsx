import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiX } from "react-icons/fi";
import {
  payTypes,
  validateRefundForm,
  type RefundFormErrors,
  type RefundFormValues,
} from "./refunds.data";
import "./RefundDialog.scss";

export type RefundDialogMode = "new" | "edit" | "view";

const titles: Record<RefundDialogMode, string> = {
  new: "New Refund",
  edit: "Edit Refund",
  view: "Refund Details",
};

interface RefundDialogProps {
  open: boolean;
  mode: RefundDialogMode;
  initialValues: RefundFormValues;
  /** Seller / buyer the refund belongs to, shown for context. */
  seller: string;
  buyer: string;
  onSubmit: (values: RefundFormValues) => void;
  onClose: () => void;
}

const RefundDialog = ({ open, mode, initialValues, seller, buyer, onSubmit, onClose }: RefundDialogProps) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RefundFormErrors>({});
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const readOnly = mode === "view";

  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setErrors({});
    firstFieldRef.current?.focus();
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const setField = <K extends keyof RefundFormValues>(key: K, value: RefundFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _cleared, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = () => {
    const nextErrors = validateRefundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  };

  const fieldClass = (key: keyof RefundFormValues) => (errors[key] ? "has-error" : "");

  return createPortal(
    <div className="refund-dialog__backdrop" onClick={onClose}>
      <div
        className="refund-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="refund-dialog__header">
          <h2 id="refund-dialog-title">{titles[mode]}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <p className="refund-dialog__parties">
          <span>
            <strong>Seller:</strong> {seller}
          </span>
          <span>
            <strong>Buyer:</strong> {buyer}
          </span>
        </p>

        <div className="refund-dialog__grid">
          <div className="refund-dialog__field">
            <label htmlFor="refund-date">Payment Date</label>
            <input
              id="refund-date"
              ref={firstFieldRef}
              type="date"
              className={fieldClass("date")}
              value={values.date}
              disabled={readOnly}
              onChange={(event) => setField("date", event.target.value)}
              aria-invalid={errors.date ? true : undefined}
            />
            {errors.date && <span className="refund-dialog__error">{errors.date}</span>}
          </div>

          <div className="refund-dialog__field">
            <label htmlFor="refund-ref">Ref Number</label>
            <input
              id="refund-ref"
              type="text"
              className={fieldClass("refNumber")}
              placeholder="Enter Ref Number"
              value={values.refNumber}
              disabled={readOnly}
              onChange={(event) => setField("refNumber", event.target.value)}
              aria-invalid={errors.refNumber ? true : undefined}
            />
            {errors.refNumber && <span className="refund-dialog__error">{errors.refNumber}</span>}
          </div>

          <fieldset className="refund-dialog__field refund-dialog__field--wide refund-dialog__pay-types">
            <legend>Pay Type</legend>
            <div>
              {payTypes.map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="refund-pay-type"
                    value={type}
                    checked={values.payType === type}
                    disabled={readOnly}
                    onChange={() => setField("payType", type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="refund-dialog__field">
            <label htmlFor="refund-amount">Amount Paid</label>
            <input
              id="refund-amount"
              type="text"
              inputMode="decimal"
              className={fieldClass("amountPaid")}
              placeholder="Enter Amount"
              value={values.amountPaid}
              disabled={readOnly}
              onChange={(event) => setField("amountPaid", event.target.value.replace(/[^0-9.]/g, ""))}
              aria-invalid={errors.amountPaid ? true : undefined}
            />
            {errors.amountPaid && <span className="refund-dialog__error">{errors.amountPaid}</span>}
          </div>

          <div className="refund-dialog__field">
            <label htmlFor="refund-difference">Difference</label>
            <input
              id="refund-difference"
              type="text"
              className={fieldClass("difference")}
              placeholder="0"
              value={values.difference}
              disabled={readOnly}
              onChange={(event) => setField("difference", event.target.value.replace(/[^0-9.-]/g, ""))}
              aria-invalid={errors.difference ? true : undefined}
              aria-describedby="refund-difference-hint"
            />
            {errors.difference ? (
              <span className="refund-dialog__error">{errors.difference}</span>
            ) : (
              <span className="refund-dialog__hint" id="refund-difference-hint">
                Positive: balance to refund. Negative: excess refunded.
              </span>
            )}
          </div>

          <div className="refund-dialog__field refund-dialog__field--wide">
            <label htmlFor="refund-remarks">Remarks</label>
            <input
              id="refund-remarks"
              type="text"
              placeholder="Enter Remarks"
              value={values.remarks}
              disabled={readOnly}
              onChange={(event) => setField("remarks", event.target.value)}
            />
          </div>
        </div>

        <div className="refund-dialog__actions">
          <button type="button" className="refund-dialog__cancel" onClick={onClose}>
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly && (
            <button type="button" className="refund-dialog__save" onClick={handleSubmit}>
              <FiCheck aria-hidden /> {mode === "edit" ? "Update" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RefundDialog;
