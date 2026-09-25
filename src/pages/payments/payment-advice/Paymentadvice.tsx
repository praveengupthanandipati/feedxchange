import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiMinusCircle,
  FiX,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import { buildPaymentAdviceColumns } from "./paymentAdvice.columns";
import {
  buyerOptions,
  createEmptyPaymentForm,
  defaultBuyer,
  defaultSeller,
  modeFields,
  nextPaymentId,
  paymentModeLabels,
  paymentModes,
  seedPaymentRows,
  sellerOptions,
  validatePaymentForm,
  type PaymentAdviceRow,
  type PaymentAdviceViewRow,
  type PaymentFieldKey,
  type PaymentFormErrors,
  type PaymentFormValues,
  type PaymentMode,
} from "./paymentAdvice.data";
import "./Paymentadvice.scss";

const PAGE_SIZE = 8;

const modeIcons: Record<PaymentMode, IconType> = {
  online: FiCreditCard,
  cheque: FiFileText,
  cash: FiDollarSign,
  none: FiMinusCircle,
};

const Paymentadvice = () => {
  const [seller, setSeller] = useState(defaultSeller);
  const [buyer, setBuyer] = useState(defaultBuyer);
  const [partyError, setPartyError] = useState(false);

  const [values, setValues] = useState<PaymentFormValues>(() => createEmptyPaymentForm());
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rows, setRows] = useState<PaymentAdviceRow[]>(seedPaymentRows);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowPendingDelete, setRowPendingDelete] = useState<PaymentAdviceViewRow | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const formRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!saveToast) return;
    const timer = setTimeout(() => setSaveToast(null), 3000);
    return () => clearTimeout(timer);
  }, [saveToast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [seller, buyer]);

  const viewRows = useMemo<PaymentAdviceViewRow[]>(() => {
    let running = 0;
    return rows
      .filter((row) => row.seller === seller && row.buyer === buyer)
      .map((row) => {
        running += row.amount;
        return { ...row, unAccountBalance: running };
      });
  }, [rows, seller, buyer]);

  const totalPages = Math.max(1, Math.ceil(viewRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = viewRows.slice((currentPageClamped - 1) * PAGE_SIZE, currentPageClamped * PAGE_SIZE);

  const resetForm = (mode: PaymentMode = values.mode) => {
    setValues(createEmptyPaymentForm(mode));
    setErrors({});
    setEditingId(null);
  };

  const handleModeChange = (mode: PaymentMode) => {
    setValues((prev) => ({ ...prev, mode, reference: "", bankName: "" }));
    setErrors({});
  };

  const handleFieldChange = (key: PaymentFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: key === "amount" ? value.replace(/[^0-9.]/g, "") : value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _cleared, ...rest } = prev;
      return rest;
    });
  };

  const handleSave = () => {
    const nextErrors = validatePaymentForm(values);
    const missingParty = !seller || !buyer;
    setErrors(nextErrors);
    setPartyError(missingParty);
    if (missingParty || Object.keys(nextErrors).length > 0) return;

    const shown = new Set(modeFields[values.mode].map((field) => field.key));
    const row: PaymentAdviceRow = {
      id: editingId ?? nextPaymentId(),
      seller,
      buyer,
      date: values.date,
      mode: values.mode,
      reference: shown.has("reference") ? values.reference.trim() : "",
      bankName: shown.has("bankName") ? values.bankName.trim() : "",
      amount: Number(values.amount),
      towards: values.towards.trim(),
      remarks: values.remarks.trim(),
    };

    // TODO: wire up to the payments API once available.
    setRows((prev) => (editingId ? prev.map((item) => (item.id === editingId ? row : item)) : [...prev, row]));
    if (!editingId) setCurrentPage(Math.max(1, Math.ceil((viewRows.length + 1) / PAGE_SIZE)));
    setSaveToast(editingId ? "Payment updated successfully." : "Payment saved successfully.");
    resetForm();
  };

  const handleEdit = (row: PaymentAdviceViewRow) => {
    setSeller(row.seller);
    setBuyer(row.buyer);
    setPartyError(false);
    setEditingId(row.id);
    setErrors({});
    setValues({
      mode: row.mode,
      date: row.date,
      reference: row.reference,
      bankName: row.bankName,
      amount: String(row.amount),
      towards: row.towards,
      remarks: row.remarks,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleConfirmDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((row) => row.id !== rowPendingDelete.id));
    if (editingId === rowPendingDelete.id) resetForm();
    setRowPendingDelete(null);
  };

  const columns = useMemo(
    () =>
      buildPaymentAdviceColumns({
        // TODO: open the allocation flow once the Payment Allocation page exists.
        onAllocate: () => undefined,
        onEdit: handleEdit,
        onDelete: setRowPendingDelete,
      }),
    [],
  );

  const fields = modeFields[values.mode];

  return (
    <div className="payment-advice-page">
      {saveToast && (
        <div className="payment-advice-page__toast" role="status">
          <FiCheckCircle aria-hidden />
          {saveToast}
        </div>
      )}

      <section className="payment-advice-card" ref={formRef} aria-labelledby="payment-advice-title">
        <h1 id="payment-advice-title" className="payment-advice-card__title">
          Payment Advice.
        </h1>

        <div className="payment-advice-parties">
          <SearchableSelect
            options={sellerOptions}
            value={seller}
            onChange={(value) => {
              setSeller(value);
              setPartyError(false);
            }}
            placeholder="Select Seller"
            ariaLabel="Select Seller"
          />
          <SearchableSelect
            options={buyerOptions}
            value={buyer}
            onChange={(value) => {
              setBuyer(value);
              setPartyError(false);
            }}
            placeholder="Select Buyer"
            ariaLabel="Select Buyer"
          />
        </div>
        {partyError && (
          <p className="payment-advice-card__error" role="alert">
            Select both a seller and a buyer.
          </p>
        )}

        <fieldset className="payment-advice-mode">
          <legend className="payment-advice-mode__legend">Select Mode</legend>
          <div className="payment-advice-mode__options">
            {paymentModes.map((mode) => {
              const Icon = modeIcons[mode];
              return (
                <label className="payment-advice-mode__option" key={mode}>
                  <input
                    type="radio"
                    name="payment-advice-mode"
                    value={mode}
                    checked={values.mode === mode}
                    onChange={() => handleModeChange(mode)}
                  />
                  <span className="payment-advice-mode__pill">
                    <Icon aria-hidden />
                    {paymentModeLabels[mode]}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="payment-advice-fields">
          {fields.map((field) => {
            const id = `payment-advice-${field.key}`;
            const error = errors[field.key];
            return (
              <div className="payment-advice-field" key={field.key}>
                <label htmlFor={id}>{field.label}</label>
                <input
                  id={id}
                  type={field.type}
                  inputMode={field.inputMode}
                  className={error ? "has-error" : ""}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
                {error && (
                  <span className="payment-advice-field__error" id={`${id}-error`}>
                    {error}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="payment-advice-actions">
          <button type="button" className="payment-advice-actions__cancel" onClick={() => resetForm()}>
            <FiX aria-hidden /> Cancel
          </button>
          <button type="button" className="payment-advice-actions__save" onClick={handleSave}>
            <FiCheck aria-hidden /> {editingId ? "Update Payment" : "Save Payments"}
          </button>
        </div>
      </section>

      <section className="payment-advice-card" aria-labelledby="payment-allocation-title">
        <h2 id="payment-allocation-title" className="payment-advice-card__title">
          Payments Allocation
        </h2>

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage={
            seller && buyer
              ? "No payments recorded for these parties yet."
              : "Select a seller and buyer to view their payments."
          }
          className="payment-advice-table"
        />

        <div className="payment-advice-pagination">
          <p>
            {viewRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  viewRows.length,
                )} of ${viewRows.length} Results`}
          </p>
          <div className="payment-advice-pagination__controls">
            <button
              type="button"
              disabled={currentPageClamped === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
            >
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Delete this payment?"
        message="This will remove the payment entry. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default Paymentadvice;
