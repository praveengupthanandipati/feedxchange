import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useConvertAdvanceMutation, type Receipt } from "../../../../core/store/paymentAdviceApi";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";
import { money, receiptUnallocated, round2 } from "./paymentAdvice.data";
import "../../../../shared/components/dialog/ConfirmDialog.scss";

interface ConvertAdvanceDialogProps {
  /** The advance receipt to convert, or null when the dialog is closed. */
  receipt: Receipt | null;
  onClose: () => void;
  /** Called after the conversion; `allocate` = the user chose to go and allocate the money now. */
  onConverted: (regular: Receipt, allocate: boolean) => void;
}

/**
 * Moves (part of) the unallocated amount of an advance to a regular payment. The new regular payment can be allocated to ANY invoice of the
 * seller and buyer (also of another contract); the conversion is recorded against both receipts.
 */
const ConvertAdvanceDialog = ({ receipt, onClose, onConverted }: ConvertAdvanceDialogProps) => {
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [allocateNow, setAllocateNow] = useState(true);
  const [error, setError] = useState("");
  const [convert, { isLoading }] = useConvertAdvanceMutation();

  useEffect(() => {
    if (!receipt) return;
    setAmount(String(receiptUnallocated(receipt)));
    setRemarks("");
    setAllocateNow(true);
    setError("");
  }, [receipt]);

  useEffect(() => {
    if (!receipt) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [receipt, onClose]);

  if (!receipt) return null;
  const available = receiptUnallocated(receipt);
  const value = round2(Number(amount) || 0);
  const invalid = !(value > 0) ? "Enter the amount to convert." : value > available + 0.004 ? `At most ${money(available)} can be converted.` : "";

  const submit = async () => {
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      const regular = await convert({ receiptId: receipt.receiptId, amount: value, remarks: remarks.trim() || undefined }).unwrap();
      onConverted(regular, allocateNow);
    } catch (e) {
      setError(apiErrorMessage(e, "The advance could not be converted."));
    }
  };

  return createPortal(
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="convert-advance-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="convert-advance-title" className="confirm-dialog__title">
          Convert advance to regular payment
        </h2>
        <p className="confirm-dialog__message">
          Advance {receipt.receiptNumber}
          {receipt.contractNumber ? ` for contract ${receipt.contractNumber}` : ""}: {money(available)} is not allocated yet. The amount you convert becomes a regular
          payment that you can allocate to any invoice, also of another contract. The conversion is recorded against both payments.
        </p>
        <div className="confirm-dialog__details" style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 4 }}>
            Amount to convert (₹)
            <input
              className="pa-input"
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value.replace(/[^0-9.]/g, ""));
                setError("");
              }}
              aria-label="Amount to convert"
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            Remarks (optional)
            <input className="pa-input" value={remarks} onChange={(event) => setRemarks(event.target.value)} aria-label="Conversion remarks" maxLength={500} />
          </label>
          <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={allocateNow} onChange={(event) => setAllocateNow(event.target.checked)} />
            Go to allocation after converting
          </label>
          {error && (
            <small className="pa-error" role="alert">
              {error}
            </small>
          )}
        </div>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="button" className="confirm-dialog__confirm" onClick={() => void submit()} disabled={isLoading}>
            {isLoading ? "Converting…" : "Convert"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConvertAdvanceDialog;
