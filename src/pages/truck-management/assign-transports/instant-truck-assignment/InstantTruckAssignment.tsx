import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import { buildInstantTruckColumns } from "./instantTruckAssignment.columns";
import { instantTruckRows as seedRows, type InstantTruckRow } from "./instantTruckAssignment.data";
import AssignNewTruckDrawer from "./AssignNewTruckDrawer";
import "./InstantTruckAssignment.scss";

const InstantTruckAssignment = () => {
  const [rows, setRows] = useState<InstantTruckRow[]>(seedRows);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<InstantTruckRow | null>(null);
  const [rowPendingDelete, setRowPendingDelete] = useState<InstantTruckRow | null>(null);

  const handleOpenNew = () => {
    setEditingRow(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (row: InstantTruckRow) => {
    setEditingRow(row);
    setDrawerOpen(true);
  };

  const handleSave = (row: InstantTruckRow) => {
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
      buildInstantTruckColumns({
        onEdit: handleOpenEdit,
        onDelete: (row) => setRowPendingDelete(row),
      }),
    [],
  );

  return (
    <div className="instant-truck-assignment">
      <div className="instant-truck-assignment__header">
        <h2>Instant Truck Assignment ({rows.length})</h2>
        <button
          type="button"
          className="instant-truck-assignment__add-btn"
          onClick={handleOpenNew}
        >
          <FiPlus aria-hidden /> Assign New Truck
        </button>
      </div>

      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        emptyMessage="No trucks assigned yet for this contract."
      />

      <AssignNewTruckDrawer
        open={drawerOpen}
        editingRow={editingRow}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove Truck Assignment"
        message={`Are you sure you want to remove truck ${rowPendingDelete?.truckNo ?? ""}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default InstantTruckAssignment;
