import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { productOptions } from "../../../contracts/newContract.data";

interface BrokerageRow {
  id: string;
  product: string;
  buyCharge: string;
  sellCharge: string;
}

let rowSeq = 0;
const nextRowId = () => `brokerage-${Date.now()}-${rowSeq++}`;

const BrokerageChargesCard = () => {
  const [buyBrokerageCharges, setBuyBrokerageCharges] = useState("");
  const [sellBrokerageCharges, setSellBrokerageCharges] = useState("");
  const [rows, setRows] = useState<BrokerageRow[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextRowId(), product: "", buyCharge: buyBrokerageCharges, sellCharge: sellBrokerageCharges },
    ]);
  };

  const handleBuyBrokerageChange = (value: string) => {
    setBuyBrokerageCharges(value);
    setRows((prev) => prev.map((row) => ({ ...row, buyCharge: value })));
  };

  const handleSellBrokerageChange = (value: string) => {
    setSellBrokerageCharges(value);
    setRows((prev) => prev.map((row) => ({ ...row, sellCharge: value })));
  };

  const confirmRemoveRow = () => {
    setRows((prev) => prev.filter((row) => row.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };

  const updateRow = (id: string, patch: Partial<BrokerageRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="new-contract__condition-card">
      <h3>Brokerage Charges</h3>

      <div className="new-contract__grid new-contract__grid--condition">
        <div className="form-field">
          <span className="form-field__label">
            Buy Brokerage Charges
            <InfoTooltip text="Default brokerage charged when buying from this business." />
          </span>
          <input
            type="number"
            min="0"
            className="form-field__control"
            placeholder="Buy Brokerage Charges"
            value={buyBrokerageCharges}
            onChange={(event) => handleBuyBrokerageChange(event.target.value)}
          />
        </div>
        <div className="form-field">
          <span className="form-field__label">
            Sell Brokerage Charges
            <InfoTooltip text="Default brokerage charged when selling to this business." />
          </span>
          <input
            type="number"
            min="0"
            className="form-field__control"
            placeholder="Sell Brokerage Charges"
            value={sellBrokerageCharges}
            onChange={(event) => handleSellBrokerageChange(event.target.value)}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyRowsState onAdd={addRow} />
      ) : (
        <div className="repeatable-rows">
          <div className="repeatable-rows__header">
            <span>Product</span>
            <span>Buy Charges</span>
            <span>Sell Charges</span>
            <span>Actions</span>
          </div>
          {rows.map((row, index) => {
            const usedProducts = rows
              .filter((otherRow) => otherRow.id !== row.id)
              .map((otherRow) => otherRow.product);
            const availableProductOptions = productOptions.filter(
              (option) => !usedProducts.includes(option.value),
            );

            return (
              <div className="repeatable-rows__row" key={row.id}>
                <SearchableSelect
                  options={availableProductOptions}
                  value={row.product}
                  onChange={(value) => updateRow(row.id, { product: value })}
                  ariaLabel="Product"
                />
                <input
                  type="number"
                  min="0"
                  className="form-field__control"
                  placeholder="Buy Charges"
                  value={row.buyCharge}
                  onChange={(event) => updateRow(row.id, { buyCharge: event.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="form-field__control"
                  placeholder="Sell Charges"
                  value={row.sellCharge}
                  onChange={(event) => updateRow(row.id, { sellCharge: event.target.value })}
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
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this row?"
        message="This will remove the brokerage charges for this product. This cannot be undone."
        onConfirm={confirmRemoveRow}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default BrokerageChargesCard;
