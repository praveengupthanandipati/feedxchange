import { FiSave, FiTrash2, FiRotateCcw, FiPlus } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../../components/table/table.types";
import { transporterOptions } from "../assignTransportsOptions.data";
import type { TransporterAssignmentRow } from "./transporterAssignment.data";

interface ColumnHandlers {
  onFieldChange: <K extends keyof TransporterAssignmentRow>(
    id: string,
    field: K,
    value: TransporterAssignmentRow[K],
  ) => void;
  onSaveRow: (row: TransporterAssignmentRow) => void;
  onDeleteRow: (row: TransporterAssignmentRow) => void;
  onViewHistory: (row: TransporterAssignmentRow) => void;
  onAddRow: () => void;
  /** Only the last row shows the "+" button, so there's a single, unambiguous way to add a row. */
  lastRowId: string | null;
}

export function buildTransporterAssignmentColumns({
  onFieldChange,
  onSaveRow,
  onDeleteRow,
  onViewHistory,
  onAddRow,
  lastRowId,
}: ColumnHandlers): TableColumn<TransporterAssignmentRow>[] {
  return [
    {
      key: "transporterName",
      header: "Transporter Name",
      render: (row) => (
        <div className="transporter-assignment-table__name-cell">
          <SearchableSelect
            options={transporterOptions}
            value={row.transporterName}
            onChange={(value) => onFieldChange(row.id, "transporterName", value)}
            placeholder="Select Transporter"
            ariaLabel="Select Transporter"
          />
        </div>
      ),
    },
    {
      key: "truckNo",
      header: "Truck Number",
      render: (row) => (
        <input
          type="text"
          className="transporter-assignment-table__control"
          placeholder="Truck No."
          value={row.truckNo}
          onChange={(event) => onFieldChange(row.id, "truckNo", event.target.value)}
        />
      ),
    },
    {
      key: "driverName",
      header: "Driver Name",
      render: (row) => (
        <input
          type="text"
          className="transporter-assignment-table__control"
          placeholder="Driver Name"
          value={row.driverName}
          onChange={(event) => onFieldChange(row.id, "driverName", event.target.value)}
        />
      ),
    },
    {
      key: "driverPhone",
      header: "Driver Contact",
      render: (row) => (
        <input
          type="tel"
          className="transporter-assignment-table__control"
          placeholder="Driver Contact"
          value={row.driverPhone}
          onChange={(event) => onFieldChange(row.id, "driverPhone", event.target.value)}
        />
      ),
    },
    {
      key: "qtyMts",
      header: "Qty Mts",
      render: (row) => (
        <input
          type="text"
          inputMode="decimal"
          className="transporter-assignment-table__control transporter-assignment-table__control--narrow"
          placeholder="0"
          value={row.qtyMts}
          onChange={(event) => onFieldChange(row.id, "qtyMts", event.target.value)}
        />
      ),
    },
    {
      key: "freightPerMt",
      header: "Freight/MT",
      render: (row) => (
        <input
          type="text"
          inputMode="decimal"
          className="transporter-assignment-table__control transporter-assignment-table__control--narrow"
          placeholder="₹0"
          value={row.freightPerMt}
          onChange={(event) => onFieldChange(row.id, "freightPerMt", event.target.value)}
        />
      ),
    },
    {
      key: "trackUrl",
      header: "Track URL",
      render: (row) => (
        <input
          type="text"
          className="transporter-assignment-table__control"
          placeholder="https://..."
          value={row.trackUrl}
          onChange={(event) => onFieldChange(row.id, "trackUrl", event.target.value)}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="transporter-assignment-table__row-actions">
          <RowActionsMenu
            actions={[
              { key: "save", label: "Save", icon: FiSave, onClick: () => onSaveRow(row) },
              { key: "history", label: "Request History", icon: FiRotateCcw, onClick: () => onViewHistory(row) },
              { key: "delete", label: "Delete", icon: FiTrash2, onClick: () => onDeleteRow(row), danger: true },
            ]}
          />
          {row.id === lastRowId && (
            <button
              type="button"
              className="transporter-assignment-table__icon-btn transporter-assignment-table__icon-btn--add"
              onClick={onAddRow}
              aria-label="Add new transporter row"
              title="Add Row"
            >
              <FiPlus aria-hidden />
            </button>
          )}
        </div>
      ),
    },
  ];
}
