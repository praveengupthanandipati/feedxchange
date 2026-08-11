import { FiSave, FiEdit2, FiTrash2, FiRotateCcw, FiPlus } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../../components/table/table.types";
import { transporterOptions, truckOptions, driverNameOptions } from "../assignTransportsOptions.data";
import type { TransporterAssignmentRow } from "./transporterAssignment.data";

interface ColumnHandlers {
  onFieldChange: <K extends keyof TransporterAssignmentRow>(
    id: string,
    field: K,
    value: TransporterAssignmentRow[K],
  ) => void;
  onDriverNameChange: (id: string, driverName: string) => void;
  onSaveRow: (row: TransporterAssignmentRow) => void;
  onEditRow: (row: TransporterAssignmentRow) => void;
  onDeleteRow: (row: TransporterAssignmentRow) => void;
  onViewHistory: (row: TransporterAssignmentRow) => void;
  onAddRow: () => void;
  /** Only the last row shows the "+" button, so there's a single, unambiguous way to add a row. */
  lastRowId: string | null;
  /** Field keys still missing a value per row id, set after a failed Save. */
  invalidFields: Record<string, Set<keyof TransporterAssignmentRow>>;
}

function controlClass(row: TransporterAssignmentRow, field: keyof TransporterAssignmentRow, invalidFields: ColumnHandlers["invalidFields"]) {
  const hasError = invalidFields[row.id]?.has(field);
  return `transporter-assignment-table__control${hasError ? " has-error" : ""}`;
}

function dropdownCellClass(row: TransporterAssignmentRow, field: keyof TransporterAssignmentRow, invalidFields: ColumnHandlers["invalidFields"]) {
  const hasError = invalidFields[row.id]?.has(field);
  return `transporter-assignment-table__name-cell${hasError ? " has-error" : ""}`;
}

export function buildTransporterAssignmentColumns({
  onFieldChange,
  onDriverNameChange,
  onSaveRow,
  onEditRow,
  onDeleteRow,
  onViewHistory,
  onAddRow,
  lastRowId,
  invalidFields,
}: ColumnHandlers): TableColumn<TransporterAssignmentRow>[] {
  return [
    {
      key: "transporterName",
      header: "Transporter Name",
      render: (row) =>
        row.saved ? (
          <span className="transporter-assignment-table__text">{row.transporterName || "—"}</span>
        ) : (
          <div className={dropdownCellClass(row, "transporterName", invalidFields)}>
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
      render: (row) =>
        row.saved ? (
          <span className="transporter-assignment-table__text">{row.truckNo || "—"}</span>
        ) : (
          <div className={dropdownCellClass(row, "truckNo", invalidFields)}>
            <SearchableSelect
              options={truckOptions}
              value={row.truckNo}
              onChange={(value) => onFieldChange(row.id, "truckNo", value)}
              placeholder="Select Truck"
              ariaLabel="Select Truck"
            />
          </div>
        ),
    },
    {
      key: "driverName",
      header: "Driver Name",
      render: (row) =>
        row.saved ? (
          <span className="transporter-assignment-table__text">{row.driverName || "—"}</span>
        ) : (
          <div className={dropdownCellClass(row, "driverName", invalidFields)}>
            <SearchableSelect
              options={driverNameOptions}
              value={row.driverName}
              onChange={(value) => onDriverNameChange(row.id, value)}
              placeholder="Select Driver"
              ariaLabel="Select Driver"
            />
          </div>
        ),
    },
    {
      key: "driverPhone",
      header: "Driver Contact",
      render: (row) =>
        row.saved ? (
          <span className="transporter-assignment-table__text">{row.driverPhone || "—"}</span>
        ) : (
          <input
            type="tel"
            className={controlClass(row, "driverPhone", invalidFields)}
            placeholder="Driver Contact"
            value={row.driverPhone}
            onChange={(event) => onFieldChange(row.id, "driverPhone", event.target.value)}
          />
        ),
    },
    {
      key: "qtyMts",
      header: "Qty Mts",
      render: (row) =>
        row.saved ? (
          <span className="transporter-assignment-table__text">{row.qtyMts || "—"}</span>
        ) : (
          <input
            type="text"
            inputMode="decimal"
            className={`${controlClass(row, "qtyMts", invalidFields)} transporter-assignment-table__control--narrow`}
            placeholder="0"
            value={row.qtyMts}
            onChange={(event) => onFieldChange(row.id, "qtyMts", event.target.value)}
          />
        ),
    },
    {
      key: "freightPerMt",
      header: "Freight/MT",
      render: (row) =>
        row.saved ? (
          <span className="transporter-assignment-table__text">{row.freightPerMt || "—"}</span>
        ) : (
          <input
            type="text"
            inputMode="decimal"
            className={`${controlClass(row, "freightPerMt", invalidFields)} transporter-assignment-table__control--narrow`}
            placeholder="₹0"
            value={row.freightPerMt}
            onChange={(event) => onFieldChange(row.id, "freightPerMt", event.target.value)}
          />
        ),
    },
    {
      key: "trackUrl",
      header: "Track URL",
      render: (row) =>
        row.saved ? (
          <span className="transporter-assignment-table__text">{row.trackUrl || "—"}</span>
        ) : (
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
              row.saved
                ? { key: "edit", label: "Edit", icon: FiEdit2, onClick: () => onEditRow(row) }
                : { key: "save", label: "Save", icon: FiSave, onClick: () => onSaveRow(row) },
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
