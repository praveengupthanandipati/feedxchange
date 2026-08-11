import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiEdit2,
  FiCheck,
  FiX,
  FiShare2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Table from "../../../components/table/Table";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import { getContractSummary } from "../assign-transports/assignTransports.data";
import { scheduleTruckRows } from "../assign-transports/schedule-truck-assignment/scheduleTruckAssignment.data";
import {
  freightHistoryRows,
  initialQuantityFreight,
  truckDetailRows as seedTruckRows,
  type TruckDetailRow,
} from "./reviewAndAssignTrucks.data";
import { buildTruckDetailColumns } from "./reviewAndAssignTrucks.columns";
import AddTrucksOffcanvas from "./AddTrucksOffcanvas";
import "./ReviewAndAssignTrucks.scss";

const HISTORY_PREVIEW_COUNT = 1;

type QuantityFreightField = "qty" | "freight";

const ReviewAndAssignTrucks = () => {
  const [searchParams] = useSearchParams();
  const summary = getContractSummary(searchParams.get("contract"));
  const scheduleRow = useMemo(
    () => scheduleTruckRows.find((row) => row.id === searchParams.get("schedule")) ?? scheduleTruckRows[0],
    [searchParams],
  );

  const [detailsVisible, setDetailsVisible] = useState(true);
  const [quantityFreight, setQuantityFreight] = useState(initialQuantityFreight);
  const [editingField, setEditingField] = useState<QuantityFreightField | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [requestStatus, setRequestStatus] = useState<"Pending" | "Accepted" | "Rejected">("Pending");
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const [rows, setRows] = useState<TruckDetailRow[]>(seedTruckRows);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addTrucksOpen, setAddTrucksOpen] = useState(false);
  const [editingTruckRow, setEditingTruckRow] = useState<TruckDetailRow | null>(null);
  const [rowPendingDelete, setRowPendingDelete] = useState<TruckDetailRow | null>(null);

  const startEditing = (field: QuantityFreightField) => {
    setEditingField(field);
    setDraftValue(quantityFreight[field]);
  };

  const confirmEdit = () => {
    if (!editingField) return;
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const updatedOnKey = editingField === "qty" ? "qtyUpdatedOn" : "freightUpdatedOn";
    setQuantityFreight((prev) => ({ ...prev, [editingField]: draftValue, [updatedOnKey]: today }));
    setEditingField(null);
  };

  const cancelEdit = () => setEditingField(null);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => undefined);
  };

  const handleOpenAddTrucks = () => {
    setEditingTruckRow(null);
    setAddTrucksOpen(true);
  };

  const handleOpenEditTruck = (row: TruckDetailRow) => {
    setEditingTruckRow(row);
    setAddTrucksOpen(true);
  };

  const handleSaveTrucks = (formRows: TruckDetailRow[]) => {
    if (editingTruckRow) {
      setRows((prev) => prev.map((row) => (row.id === editingTruckRow.id ? formRows[0] : row)));
    } else {
      setRows((prev) => [...prev, ...formRows]);
    }
    setAddTrucksOpen(false);
    setEditingTruckRow(null);
  };

  const handleConfirmDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((row) => row.id !== rowPendingDelete.id));
    setSelectedRowKeys((prev) => prev.filter((key) => key !== rowPendingDelete.id));
    setRowPendingDelete(null);
  };

  const toggleSelectRow = (key: string) => {
    setSelectedRowKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const columns = useMemo(
    () => buildTruckDetailColumns({ onEdit: handleOpenEditTruck, onDelete: setRowPendingDelete }),
    [],
  );

  const visibleHistory = historyExpanded ? freightHistoryRows : freightHistoryRows.slice(0, HISTORY_PREVIEW_COUNT);

  return (
    <div className="review-assign-trucks-page">
      <div className="review-assign-trucks-card">
        <div className="review-assign-trucks-card__header">
          <h1>Transporter Review &amp; Assign Trucks</h1>
          <button
            type="button"
            className="review-assign-trucks-btn review-assign-trucks-btn--info"
            onClick={() => setDetailsVisible((prev) => !prev)}
          >
            {detailsVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {detailsVisible ? "Hide" : "Show"}
          </button>
        </div>

        {detailsVisible && (
          <div className="review-assign-trucks-details">
            <div className="review-assign-trucks-details__field">
              <span>Seller Name</span>
              <strong>{summary.sellerName}</strong>
            </div>
            <div className="review-assign-trucks-details__field">
              <span>Buyer Name</span>
              <strong>{summary.buyerName}</strong>
            </div>
            <div className="review-assign-trucks-details__field">
              <span>Qty</span>
              <strong>{scheduleRow.qty}</strong>
            </div>
            <div className="review-assign-trucks-details__field">
              <span>Product</span>
              <strong>{summary.productName}</strong>
            </div>
            <div className="review-assign-trucks-details__field">
              <span>Schedule Date &amp; Time</span>
              <strong>{scheduleRow.scheduleDateTime}</strong>
            </div>
            <div className="review-assign-trucks-details__field">
              <span>Loading Address</span>
              <strong>{scheduleRow.loadingAddress}</strong>
            </div>
            <div className="review-assign-trucks-details__field">
              <span>Delivery Address</span>
              <strong>{scheduleRow.deliveryAddress}</strong>
            </div>
          </div>
        )}

        <div className="review-assign-trucks-panels">
          <div className="review-assign-trucks-panel">
            <h2 className="review-assign-trucks-panel__title">Quantity &amp; Freight Charges</h2>

            <div className="review-assign-trucks-panel__fields">
              <div className="review-assign-trucks-field">
                <span className="review-assign-trucks-field__label">Original Qty in MTs</span>
                {editingField === "qty" ? (
                  <div className="review-assign-trucks-field__edit">
                    <input value={draftValue} onChange={(event) => setDraftValue(event.target.value)} autoFocus />
                    <button type="button" onClick={confirmEdit} aria-label="Confirm quantity">
                      <FiCheck aria-hidden />
                    </button>
                    <button type="button" onClick={cancelEdit} aria-label="Cancel editing quantity">
                      <FiX aria-hidden />
                    </button>
                  </div>
                ) : (
                  <div className="review-assign-trucks-field__value">
                    <strong>{quantityFreight.qty}</strong>
                    <button type="button" onClick={() => startEditing("qty")} aria-label="Edit quantity">
                      <FiEdit2 aria-hidden />
                    </button>
                  </div>
                )}
                <span className="review-assign-trucks-field__meta">
                  Last Updated on {quantityFreight.qtyUpdatedOn} by Admin
                </span>
              </div>

              <div className="review-assign-trucks-field">
                <span className="review-assign-trucks-field__label">Original Freight Charges Per MT</span>
                {editingField === "freight" ? (
                  <div className="review-assign-trucks-field__edit">
                    <input value={draftValue} onChange={(event) => setDraftValue(event.target.value)} autoFocus />
                    <button type="button" onClick={confirmEdit} aria-label="Confirm freight">
                      <FiCheck aria-hidden />
                    </button>
                    <button type="button" onClick={cancelEdit} aria-label="Cancel editing freight">
                      <FiX aria-hidden />
                    </button>
                  </div>
                ) : (
                  <div className="review-assign-trucks-field__value">
                    <strong>{quantityFreight.freight}</strong>
                    <button type="button" onClick={() => startEditing("freight")} aria-label="Edit freight">
                      <FiEdit2 aria-hidden />
                    </button>
                  </div>
                )}
                <span className="review-assign-trucks-field__meta">
                  Last Updated on {quantityFreight.freightUpdatedOn} by Admin
                </span>
              </div>
            </div>

            <div className="review-assign-trucks-panel__decision">
              <button
                type="button"
                className="review-assign-trucks-btn review-assign-trucks-btn--accept"
                onClick={() => setRequestStatus("Accepted")}
              >
                <FiCheck aria-hidden /> Accept
              </button>
              <button
                type="button"
                className="review-assign-trucks-btn review-assign-trucks-btn--reject"
                onClick={() => setRequestStatus("Rejected")}
              >
                <FiX aria-hidden /> Reject
              </button>
              {requestStatus !== "Pending" && (
                <span
                  className={`review-assign-trucks-panel__status review-assign-trucks-panel__status--${requestStatus.toLowerCase()}`}
                >
                  {requestStatus}
                </span>
              )}
            </div>
            <p className="review-assign-trucks-panel__hint">
              Once Click on Accept, the Same will updated to Admin
            </p>
          </div>

          <div className="review-assign-trucks-panel">
            <h2 className="review-assign-trucks-panel__title">History</h2>

            <div className="review-assign-trucks-history">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Admin Qty</th>
                    <th>Admin Freight</th>
                    <th>Transporter Qty</th>
                    <th>Transporter Freight</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{entry.adminQty}</td>
                      <td>{entry.adminFreight}</td>
                      <td>{entry.transporterQty}</td>
                      <td>{entry.transporterFreight}</td>
                      <td>
                        <span
                          className={`review-assign-trucks-history__status review-assign-trucks-history__status--${entry.status.toLowerCase()}`}
                        >
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {freightHistoryRows.length > HISTORY_PREVIEW_COUNT && (
              <button
                type="button"
                className="review-assign-trucks-history__toggle"
                onClick={() => setHistoryExpanded((prev) => !prev)}
              >
                {historyExpanded ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
                {historyExpanded ? "Show less" : "View all"}
              </button>
            )}
          </div>
        </div>

        <div className="review-assign-trucks-truck-details">
          <div className="review-assign-trucks-truck-details__header">
            <h2>Truck Details</h2>
            <div className="review-assign-trucks-truck-details__actions">
              <button
                type="button"
                className="review-assign-trucks-btn review-assign-trucks-btn--share"
                onClick={handleShare}
              >
                <FiShare2 aria-hidden /> Share
              </button>
              <button
                type="button"
                className="review-assign-trucks-btn review-assign-trucks-btn--add"
                onClick={handleOpenAddTrucks}
              >
                <FiPlus aria-hidden /> Add Trucks
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            data={rows}
            rowKey={(row) => row.id}
            selectable
            selectedRowKeys={selectedRowKeys}
            onSelectRow={toggleSelectRow}
            onSelectAll={(checked) => setSelectedRowKeys(checked ? rows.map((row) => row.id) : [])}
            emptyMessage="No trucks added yet. Use Add Trucks to assign one."
          />
        </div>
      </div>

      <AddTrucksOffcanvas
        open={addTrucksOpen}
        editingRow={editingTruckRow}
        onClose={() => {
          setAddTrucksOpen(false);
          setEditingTruckRow(null);
        }}
        onSave={handleSaveTrucks}
      />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove Truck"
        message={`Are you sure you want to remove ${rowPendingDelete?.truckNo || "this truck"}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default ReviewAndAssignTrucks;
