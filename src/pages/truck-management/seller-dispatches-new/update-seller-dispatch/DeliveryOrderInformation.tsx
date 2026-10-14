import { useState, type SubmitEvent } from "react";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import DatePickerInput from "../../../../components/dropdown/DatePickerInput";
import type { DeliveryOrderInfo } from "./updateSellerDispatch.data";

interface DeliveryOrderInformationProps {
  initialValue: DeliveryOrderInfo;
}

/** Shows the default DO details; "Edit Info" swaps in a form, and Save writes the new values back. */
const DeliveryOrderInformation = ({ initialValue }: DeliveryOrderInformationProps) => {
  const [saved, setSaved] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const startEditing = () => {
    setDraft(saved);
    setError("");
    setEditing(true);
  };

  const handleSave = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.doNumber.trim() || !draft.doDate) {
      setError("Delivery Order Number and Delivery Order Date are required.");
      return;
    }
    // TODO: save to the API once the endpoint is available.
    setSaved({ ...draft, doNumber: draft.doNumber.trim(), remarks: draft.remarks.trim() });
    setEditing(false);
  };

  return (
    <section className="dispatch-section">
      <header className="dispatch-section__header">
        <h2>Default Delivery Order Information</h2>
        {!editing && (
          <button type="button" className="do-info__btn do-info__btn--primary" onClick={startEditing}>
            <FiEdit2 aria-hidden /> Edit Info
          </button>
        )}
      </header>

      {editing ? (
        <form className="do-info__form" onSubmit={handleSave} noValidate>
          <div className="do-info__grid">
            <div className="do-info__field">
              <label htmlFor="do-info-number">Delivery Order Number</label>
              <input
                id="do-info-number"
                type="text"
                value={draft.doNumber}
                onChange={(event) => setDraft({ ...draft, doNumber: event.target.value })}
                autoFocus
              />
            </div>
            <div className="do-info__field">
              <label htmlFor="do-info-date">Delivery Order Date</label>
              <DatePickerInput
                id="do-info-date"
                value={draft.doDate}
                onChange={(doDate) => setDraft({ ...draft, doDate })}
                ariaLabel="Delivery Order Date"
              />
            </div>
            <div className="do-info__field">
              <label htmlFor="do-info-remarks">Remarks</label>
              <input
                id="do-info-remarks"
                type="text"
                value={draft.remarks}
                onChange={(event) => setDraft({ ...draft, remarks: event.target.value })}
              />
            </div>
          </div>

          {error && (
            <p className="do-info__error" role="alert">
              {error}
            </p>
          )}

          <div className="do-info__actions">
            <button type="submit" className="do-info__btn do-info__btn--primary">
              <FiSave aria-hidden /> Save
            </button>
            <button type="button" className="do-info__btn do-info__btn--ghost" onClick={() => setEditing(false)}>
              <FiX aria-hidden /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="do-info__grid">
          <div className="do-info__item">
            <dt>Delivery Order Number</dt>
            <dd>{saved.doNumber}</dd>
          </div>
          <div className="do-info__item">
            <dt>Delivery Order Date</dt>
            <dd>{saved.doDate ? formatDisplayDate(saved.doDate) : "--"}</dd>
          </div>
          <div className="do-info__item">
            <dt>Remarks</dt>
            <dd>{saved.remarks || "--"}</dd>
          </div>
        </dl>
      )}
    </section>
  );
};

export default DeliveryOrderInformation;
