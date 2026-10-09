import { useState, type SubmitEvent } from "react";
import { FiSave, FiX } from "react-icons/fi";
import DatePickerInput from "../../../../components/dropdown/DatePickerInput";
import type { Estimation, EstimationEdit } from "../viewEstimation.data";
import { EMPTY_VALUE } from "../viewEstimation.utils";
import EstimationModal from "./EstimationModal";

interface EditEstimationModalProps {
  estimation: Estimation;
  onSave: (changes: EstimationEdit) => void;
  onClose: () => void;
}

const EditEstimationModal = ({ estimation, onSave, onClose }: EditEstimationModalProps) => {
  const [form, setForm] = useState<EstimationEdit>({ fromDate: estimation.fromDate, toDate: estimation.toDate, remarks: estimation.remarks });
  const [error, setError] = useState("");

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fromDate) return setError("Select the From Date.");
    if (form.toDate && form.toDate < form.fromDate) return setError("To Date cannot be before From Date.");
    onSave({ ...form, remarks: form.remarks.trim() });
  };

  return (
    <EstimationModal titleId="edit-estimation-title" title={`Edit ${estimation.estimateNo}`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <p className="estimations-modal__sub">
          {estimation.partyName || EMPTY_VALUE} · {estimation.qty} MT
        </p>
        <div className="estimations-modal__grid">
          <div className="estimations-modal__field">
            <label htmlFor="edit-estimation-from">From Date</label>
            <DatePickerInput id="edit-estimation-from" value={form.fromDate} onChange={(fromDate) => setForm({ ...form, fromDate })} max={form.toDate || undefined} ariaLabel="From Date" />
          </div>
          <div className="estimations-modal__field">
            <label htmlFor="edit-estimation-to">To Date</label>
            <DatePickerInput id="edit-estimation-to" value={form.toDate} onChange={(toDate) => setForm({ ...form, toDate })} min={form.fromDate || undefined} ariaLabel="To Date" />
          </div>
          <div className="estimations-modal__field estimations-modal__field--wide">
            <label htmlFor="edit-estimation-remarks">Remarks</label>
            <textarea id="edit-estimation-remarks" rows={3} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
          </div>
        </div>
        {error && (
          <p className="estimations-modal__error" role="alert">
            {error}
          </p>
        )}
        <div className="estimations-modal__actions">
          <button type="button" className="view-estimations__btn view-estimations__btn--ghost" onClick={onClose}>
            <FiX aria-hidden /> Cancel
          </button>
          <button type="submit" className="view-estimations__btn view-estimations__btn--navy">
            <FiSave aria-hidden /> Update
          </button>
        </div>
      </form>
    </EstimationModal>
  );
};

export default EditEstimationModal;
