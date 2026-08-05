import { useMemo, useState } from "react";
import { FiTruck, FiSave, FiSend, FiCheckCircle } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import { buildTransporterAssignmentColumns } from "./transporterAssignment.columns";
import {
  approvedTruckRows,
  createEmptyTransporterRow,
  getSeedTransporterRows,
  type TransporterAssignmentRow,
} from "./transporterAssignment.data";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";
import RequestHistoryModal from "./RequestHistoryModal";
import ApprovedTrucksOffcanvas from "./ApprovedTrucksOffcanvas";
import "./TransporterAssignmentPanel.scss";

interface TransporterAssignmentPanelProps {
  scheduleRow: ScheduleTruckRow;
}

const TransporterAssignmentPanel = ({ scheduleRow }: TransporterAssignmentPanelProps) => {
  const [rows, setRows] = useState<TransporterAssignmentRow[]>(getSeedTransporterRows);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [historyRow, setHistoryRow] = useState<TransporterAssignmentRow | null>(null);
  const [approvedTrucksOpen, setApprovedTrucksOpen] = useState(false);
  const [rowPendingDelete, setRowPendingDelete] = useState<TransporterAssignmentRow | null>(null);

  const handleFieldChange: <K extends keyof TransporterAssignmentRow>(
    id: string,
    field: K,
    value: TransporterAssignmentRow[K],
  ) => void = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyTransporterRow()]);
  };

  const handleConfirmDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((item) => item.id !== rowPendingDelete.id));
    setSelectedRowKeys((prev) => prev.filter((key) => key !== rowPendingDelete.id));
    setRowPendingDelete(null);
  };

  // TODO: wire up to the truck-management API once available.
  const handleSaveRow = (_row: TransporterAssignmentRow) => undefined;
  const handleSaveAll = () => undefined;
  const handleSendRequest = () => undefined;

  const toggleSelectRow = (key: string) => {
    setSelectedRowKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedRowKeys(checked ? rows.map((row) => row.id) : []);
  };

  const lastRowId = rows.length > 0 ? rows[rows.length - 1].id : null;
  const hasSelection = selectedRowKeys.length > 0;

  const columns = useMemo(
    () =>
      buildTransporterAssignmentColumns({
        onFieldChange: handleFieldChange,
        onSaveRow: handleSaveRow,
        onDeleteRow: setRowPendingDelete,
        onViewHistory: setHistoryRow,
        onAddRow: handleAddRow,
        lastRowId,
      }),
    [lastRowId],
  );

  return (
    <div className="transporter-assignment-panel">
      <div className="transporter-assignment-panel__header">
        <h3>
          <FiTruck aria-hidden /> Add / View Transporters
        </h3>
        <div className="transporter-assignment-panel__header-actions">
          <button
            type="button"
            className="transporter-assignment-panel__btn transporter-assignment-panel__btn--save"
            onClick={handleSaveAll}
            disabled={!hasSelection}
          >
            <FiSave aria-hidden /> Save All
          </button>
          <button
            type="button"
            className="transporter-assignment-panel__btn transporter-assignment-panel__btn--send"
            onClick={handleSendRequest}
            disabled={!hasSelection}
          >
            <FiSend aria-hidden /> Send Request
          </button>
        </div>
      </div>

      <div className="transporter-assignment-panel__table">
        <Table
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedRowKeys}
          onSelectRow={toggleSelectRow}
          onSelectAll={toggleSelectAll}
          emptyMessage="No transporters added yet. Use the + button to add one."
        />
      </div>

      <div className="transporter-assignment-panel__footer">
        <button
          type="button"
          className="transporter-assignment-panel__approved-link"
          onClick={() => setApprovedTrucksOpen(true)}
        >
          <FiCheckCircle aria-hidden /> View All Approved Trucks: {approvedTruckRows.length}
        </button>
      </div>

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove Transporter Row"
        message={`Are you sure you want to remove ${rowPendingDelete?.transporterName || "this transporter row"}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />

      <RequestHistoryModal
        open={historyRow !== null}
        transporterName={historyRow?.transporterName ?? ""}
        onClose={() => setHistoryRow(null)}
      />

      <ApprovedTrucksOffcanvas
        open={approvedTrucksOpen}
        scheduleRow={scheduleRow}
        onClose={() => setApprovedTrucksOpen(false)}
      />
    </div>
  );
};

export default TransporterAssignmentPanel;
