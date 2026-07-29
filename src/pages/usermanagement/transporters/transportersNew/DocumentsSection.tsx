import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import {
  documentTypeOptions,
  MAX_DOCUMENT_FILE_SIZE_MB,
  ALLOWED_DOCUMENT_FILE_TYPES,
} from "./newTransporter.data";

export interface DocumentEntry {
  id: string;
  documentType: string;
  documentNumber: string;
  issuingAuthorityName: string;
  issuedDate: string;
  fileName: string;
  fileError: string;
  // The picked File, held only until save — cleared once uploaded. Absent
  // for hydrated rows whose file wasn't replaced, in which case the save
  // step reuses meta.filePath/fileSize/contentType instead of re-uploading.
  file?: File;
  // Present only for rows loaded from an existing profile — tells the save
  // step to call UpdateProfileDocument instead of bundling this row into the
  // next CreateProfileDocument call.
  meta?: {
    documentId: number;
    createdBy: number;
    createdOn: string;
    filePath: string;
    fileSize: number;
    contentType: string;
    uploadDate: string;
  };
}

let seq = 0;
export const nextDocumentId = () => `document-${Date.now()}-${seq++}`;

const emptyEntry = (): DocumentEntry => ({
  id: nextDocumentId(),
  documentType: "",
  documentNumber: "",
  issuingAuthorityName: "",
  issuedDate: "",
  fileName: "",
  fileError: "",
});

interface DocumentsSectionProps {
  entries: DocumentEntry[];
  onEntriesChange: (entries: DocumentEntry[]) => void;
}

const DocumentsSection = ({ entries, onEntriesChange }: DocumentsSectionProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addEntry = () => onEntriesChange([...entries, emptyEntry()]);
  const confirmRemoveEntry = () => {
    onEntriesChange(entries.filter((entry) => entry.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };
  const updateEntry = (id: string, patch: Partial<DocumentEntry>) =>
    onEntriesChange(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const handleFileChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      updateEntry(id, { fileName: "", fileError: "", file: undefined });
      return;
    }

    if (!ALLOWED_DOCUMENT_FILE_TYPES.includes(file.type)) {
      updateEntry(id, { fileName: "", fileError: "Unsupported file format.", file: undefined });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_DOCUMENT_FILE_SIZE_MB * 1024 * 1024) {
      updateEntry(id, { fileName: "", fileError: `File must be under ${MAX_DOCUMENT_FILE_SIZE_MB}MB.`, file: undefined });
      event.target.value = "";
      return;
    }

    updateEntry(id, { fileName: file.name, fileError: "", file });
  };

  return (
    <div>
      <h3 className="form-subheading">Add and Attach the Legal &amp; Other Documents</h3>

      {entries.length === 0 ? (
        <EmptyRowsState onAdd={addEntry} message="No Data available" />
      ) : (
        <>
          <div className="repeatable-entries">
            {entries.map((entry) => (
              <div className="repeatable-entry" key={entry.id}>
                <div className="new-contract__grid">
                  <div className="form-field">
                    <span className="form-field__label">Select Document</span>
                    <SearchableSelect
                      options={documentTypeOptions}
                      value={entry.documentType}
                      onChange={(value) => updateEntry(entry.id, { documentType: value })}
                      placeholder="Select or type document type..."
                      ariaLabel="Select Document"
                      allowCustom
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Document Number</label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Ex: 1234ABCD5678E9"
                      value={entry.documentNumber}
                      onChange={(event) =>
                        updateEntry(entry.id, { documentNumber: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Issuing Authority Name</label>
                    <input
                      type="text"
                      className="form-field__control"
                      placeholder="Ex: Registration Authority"
                      value={entry.issuingAuthorityName}
                      onChange={(event) =>
                        updateEntry(entry.id, { issuingAuthorityName: event.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Issued Date</label>
                    <input
                      type="date"
                      className="form-field__control"
                      value={entry.issuedDate}
                      onChange={(event) => updateEntry(entry.id, { issuedDate: event.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Upload File</label>
                    <div className="form-field__file">
                      <button
                        type="button"
                        className="form-field__file-btn"
                        onClick={() => fileInputRefs.current[entry.id]?.click()}
                      >
                        Choose File
                      </button>
                      <span className="form-field__file-name">
                        {entry.fileName || "No file chosen"}
                      </span>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[entry.id] = el;
                        }}
                        type="file"
                        className="form-field__file-input"
                        accept={ALLOWED_DOCUMENT_FILE_TYPES.join(",")}
                        onChange={(event) => handleFileChange(entry.id, event)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="repeatable-entry__delete repeatable-entry__delete--inline"
                    onClick={() => setPendingDeleteId(entry.id)}
                    aria-label="Remove document"
                  >
                    <FiTrash2 aria-hidden />
                  </button>
                </div>

                <p className="form-field__hint">
                  {entry.fileError || "File size should be less than 5MB, format should be .jpg, .jpeg, .png, pdf"}
                </p>
              </div>
            ))}
          </div>

          <button type="button" className="repeatable-entries__add" onClick={addEntry}>
            + Add
          </button>
        </>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this document?"
        message="This will remove this document entry. This cannot be undone."
        onConfirm={confirmRemoveEntry}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default DocumentsSection;
