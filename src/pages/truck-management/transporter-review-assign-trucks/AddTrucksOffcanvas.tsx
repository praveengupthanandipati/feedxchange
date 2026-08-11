import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiUpload, FiFile, FiSave } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import {
  createEmptyTruckEntry,
  truckMasterDirectory,
  truckMasterOptions,
  type TruckDetailRow,
} from "./reviewAndAssignTrucks.data";
import "./AddTrucksOffcanvas.scss";

interface AddTrucksOffcanvasProps {
  open: boolean;
  editingRow?: TruckDetailRow | null;
  onClose: () => void;
  onSave: (rows: TruckDetailRow[]) => void;
}

const AddTrucksOffcanvas = ({ open, editingRow = null, onClose, onSave }: AddTrucksOffcanvasProps) => {
  const [entry, setEntry] = useState<TruckDetailRow>(createEmptyTruckEntry);

  useEffect(() => {
    if (!open) return;
    setEntry(editingRow ?? createEmptyTruckEntry());
  }, [open, editingRow]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const updateField = <K extends keyof TruckDetailRow>(field: K, value: TruckDetailRow[K]) => {
    setEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleTruckChange = (truckNo: string) => {
    const master = truckMasterDirectory[truckNo];
    setEntry((prev) => ({ ...prev, truckNo, ...(master ?? {}) }));
  };

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newDocs = Array.from(fileList).map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
    }));
    setEntry((prev) => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
  };

  const handleRemoveDocument = (docId: string) => {
    setEntry((prev) => ({ ...prev, documents: prev.documents.filter((doc) => doc.id !== docId) }));
  };

  const handleSave = () => {
    onSave([entry]);
  };

  return createPortal(
    <>
      <div className={`add-trucks-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`add-trucks-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-trucks-offcanvas-title"
      >
        <div className="add-trucks-offcanvas__header">
          <h2 id="add-trucks-offcanvas-title">{editingRow ? "Edit Truck" : "Add Trucks"}</h2>
          <button type="button" className="add-trucks-offcanvas__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="add-trucks-offcanvas__body">
          <div className="add-trucks-offcanvas__card">
            <div className="add-trucks-offcanvas__grid">
              <div className="add-trucks-offcanvas__field">
                <label>Truck No</label>
                <SearchableSelect
                  options={truckMasterOptions}
                  value={entry.truckNo}
                  onChange={handleTruckChange}
                  placeholder="Select Truck"
                  ariaLabel="Select Truck"
                  allowCustom
                />
              </div>
              <div className="add-trucks-offcanvas__field">
                <label>Truck Capacity</label>
                <input
                  className="add-trucks-offcanvas__control"
                  value={entry.truckCapacity}
                  readOnly
                  placeholder="Auto-filled from truck"
                />
              </div>
              <div className="add-trucks-offcanvas__field">
                <label>Owner Name</label>
                <input
                  className="add-trucks-offcanvas__control"
                  value={entry.ownerName}
                  readOnly
                  placeholder="Auto-filled from truck"
                />
              </div>
              <div className="add-trucks-offcanvas__field">
                <label>Owner Contact</label>
                <input
                  className="add-trucks-offcanvas__control"
                  value={entry.ownerContact}
                  readOnly
                  placeholder="Auto-filled from truck"
                />
              </div>
              <div className="add-trucks-offcanvas__field">
                <label>Driver Name</label>
                <input
                  className="add-trucks-offcanvas__control"
                  value={entry.driverName}
                  onChange={(event) => updateField("driverName", event.target.value)}
                  placeholder="Driver Name"
                />
              </div>
              <div className="add-trucks-offcanvas__field">
                <label>Driver Contact</label>
                <input
                  className="add-trucks-offcanvas__control"
                  value={entry.driverPhone}
                  onChange={(event) => updateField("driverPhone", event.target.value)}
                  placeholder="Driver Contact"
                />
              </div>
              <div className="add-trucks-offcanvas__field">
                <label>Freight / MT</label>
                <input
                  className="add-trucks-offcanvas__control"
                  value={entry.freightPerMt}
                  onChange={(event) => updateField("freightPerMt", event.target.value)}
                  placeholder="₹0"
                />
              </div>
              <div className="add-trucks-offcanvas__field">
                <label>Track URL</label>
                <input
                  className="add-trucks-offcanvas__control"
                  value={entry.trackUrl}
                  onChange={(event) => updateField("trackUrl", event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="add-trucks-offcanvas__documents">
              <label>Documents</label>
              <div className="add-trucks-offcanvas__doc-list">
                {entry.documents.length === 0 ? (
                  <span className="add-trucks-offcanvas__doc-empty">No documents yet</span>
                ) : (
                  entry.documents.map((doc) => (
                    <span className="add-trucks-offcanvas__doc-chip" key={doc.id}>
                      <FiFile aria-hidden /> {doc.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        aria-label={`Remove ${doc.name}`}
                      >
                        <FiX aria-hidden />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <label className="add-trucks-offcanvas__upload">
                <FiUpload aria-hidden /> Add File
                <input type="file" multiple hidden onChange={(event) => handleAddFiles(event.target.files)} />
              </label>
            </div>
          </div>
        </div>

        <div className="add-trucks-offcanvas__footer">
          <button
            type="button"
            className="add-trucks-offcanvas__btn add-trucks-offcanvas__btn--save"
            onClick={handleSave}
          >
            <FiSave aria-hidden /> {editingRow ? "Save Changes" : "Add Trucks"}
          </button>
          <button
            type="button"
            className="add-trucks-offcanvas__btn add-trucks-offcanvas__btn--cancel"
            onClick={onClose}
          >
            <FiX aria-hidden /> Cancel
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AddTrucksOffcanvas;
