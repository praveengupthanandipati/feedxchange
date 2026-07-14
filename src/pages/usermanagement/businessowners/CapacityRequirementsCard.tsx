import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { productOptions } from "../../contracts/newContract.data";

interface CapacityRow {
  id: string;
  product: string;
  tpd: string;
  tpm: string;
}

let rowSeq = 0;
const nextRowId = () => `capacity-${Date.now()}-${rowSeq++}`;

const CapacityRequirementsCard = () => {
  const [rows, setRows] = useState<CapacityRow[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextRowId(), product: "", tpd: "", tpm: "" }]);
  };

  const confirmRemoveRow = () => {
    setRows((prev) => prev.filter((row) => row.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };

  const updateRow = (id: string, patch: Partial<CapacityRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="new-contract__condition-card">
      <h3>Capacity and Monthly Requirements</h3>

      {rows.length === 0 ? (
        <EmptyRowsState onAdd={addRow} />
      ) : (
        <div className="repeatable-rows">
          <div className="repeatable-rows__header">
            <span>Product</span>
            <span>TPD</span>
            <span>TPM</span>
            <span>Actions</span>
          </div>
          {rows.map((row, index) => (
            <div className="repeatable-rows__row" key={row.id}>
              <SearchableSelect
                options={productOptions}
                value={row.product}
                onChange={(value) => updateRow(row.id, { product: value })}
                ariaLabel="Product"
              />
              <input
                type="number"
                min="0"
                className="form-field__control"
                placeholder="TPD"
                value={row.tpd}
                onChange={(event) => updateRow(row.id, { tpd: event.target.value })}
              />
              <input
                type="number"
                min="0"
                className="form-field__control"
                placeholder="TPM"
                value={row.tpm}
                onChange={(event) => updateRow(row.id, { tpm: event.target.value })}
              />
              <div className="repeatable-rows__actions">
                <button
                  type="button"
                  className="repeatable-rows__delete"
                  onClick={() => setPendingDeleteId(row.id)}
                  aria-label="Remove row"
                >
                  <FiTrash2 aria-hidden />
                </button>
                {index === rows.length - 1 && (
                  <button
                    type="button"
                    className="repeatable-rows__add"
                    onClick={addRow}
                    aria-label="Add row"
                  >
                    <FiPlus aria-hidden />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this row?"
        message="This will remove the capacity requirement for this product. This cannot be undone."
        onConfirm={confirmRemoveRow}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default CapacityRequirementsCard;
