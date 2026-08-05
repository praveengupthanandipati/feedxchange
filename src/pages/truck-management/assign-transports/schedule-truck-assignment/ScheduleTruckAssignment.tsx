import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import { buildScheduleTruckColumns } from "./scheduleTruckAssignment.columns";
import { scheduleTruckRows as seedRows, type ScheduleTruckRow } from "./scheduleTruckAssignment.data";
import ScheduleRequestDrawer from "./ScheduleRequestDrawer";
import TransporterAssignmentPanel from "./TransporterAssignmentPanel";
import "./ScheduleTruckAssignment.scss";

const ScheduleTruckAssignment = () => {
  const [rows, setRows] = useState<ScheduleTruckRow[]>(seedRows);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ScheduleTruckRow | null>(null);
  const [rowPendingDelete, setRowPendingDelete] = useState<ScheduleTruckRow | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleToggleTrucks = (row: ScheduleTruckRow) => {
    setExpandedRowId((prev) => (prev === row.id ? null : row.id));
  };

  const handleOpenNew = () => {
    setEditingRow(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (row: ScheduleTruckRow) => {
    setEditingRow(row);
    setDrawerOpen(true);
  };

  const handleSave = (row: ScheduleTruckRow) => {
    setRows((prev) =>
      editingRow ? prev.map((item) => (item.id === row.id ? row : item)) : [row, ...prev],
    );
  };

  const handleDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((row) => row.id !== rowPendingDelete.id));
    setRowPendingDelete(null);
  };

  const columns = useMemo(
    () =>
      buildScheduleTruckColumns({
        onEdit: handleOpenEdit,
        onDelete: (row) => setRowPendingDelete(row),
        expandedRowId,
        onToggleTrucks: handleToggleTrucks,
      }),
    [expandedRowId],
  );

  return (
    <div className="schedule-truck-assignment">
      <div className="schedule-truck-assignment__header">
        <h2>Schedule Truck Assignment ({rows.length})</h2>
        <button
          type="button"
          className="schedule-truck-assignment__add-btn"
          onClick={handleOpenNew}
        >
          <FiPlus aria-hidden /> Schedule New Request
        </button>
      </div>

      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        emptyMessage="No scheduled truck requests yet for this contract."
        expandedRowKey={expandedRowId}
        renderExpandedRow={(row) => <TransporterAssignmentPanel scheduleRow={row} />}
      />

      <ScheduleRequestDrawer
        open={drawerOpen}
        editingRow={editingRow}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove Scheduled Request"
        message={`Are you sure you want to remove the scheduled request for ${rowPendingDelete?.scheduleDateTime ?? ""}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default ScheduleTruckAssignment;
