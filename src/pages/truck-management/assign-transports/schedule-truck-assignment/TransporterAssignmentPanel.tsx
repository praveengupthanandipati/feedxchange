import { useEffect, useMemo, useState } from "react";
import { FiTruck, FiSave, FiSend, FiCheckCircle, FiAlertTriangle, FiX } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import { buildTransporterAssignmentColumns } from "./transporterAssignment.columns";
import {
  approvedTruckRows,
  createEmptyTransporterRow,
  getMissingTransporterFields,
  getSeedTransporterRows,
  type TransporterAssignmentRow,
} from "./transporterAssignment.data";
import { useGetTransporterProfileSummaryQuery } from "../../../../store/transportersApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../../store/trucksApi";
import { useGetAllActiveDriversQuery } from "../../../../store/driversApi";
import {
  useGetScheduleTrucksDispatchDetailsQuery,
  useGetTransporterScheduleResponseStatusesQuery,
} from "../../../../store/contractTrucksApi";
import type { ContractSummary } from "../assignTransports.data";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";
import RequestHistoryModal from "./RequestHistoryModal";
import ApprovedTrucksOffcanvas from "./ApprovedTrucksOffcanvas";
import SendRequestOffcanvas from "./SendRequestOffcanvas";
import "./TransporterAssignmentPanel.scss";

interface TransporterResponseRowProps {
  contractId: number;
  transporterId: number;
  transporterName: string;
  statusLabelById: Record<number, string>;
}

const TransporterResponseRow = ({
  contractId,
  transporterId,
  transporterName,
  statusLabelById,
}: TransporterResponseRowProps) => {
  const { data, isFetching } = useGetScheduleTrucksDispatchDetailsQuery(
    { contractId, transporterId },
    { skip: !contractId || !transporterId },
  );

  const latest = data?.[0];

  return (
    <div className="transporter-assignment-panel__response-row">
      <span className="transporter-assignment-panel__response-name">{transporterName}</span>
      {isFetching ? (
        <span className="transporter-assignment-panel__response-status">Loading…</span>
      ) : !latest ? (
        <span className="transporter-assignment-panel__response-status">No response yet</span>
      ) : (
        <div className="transporter-assignment-panel__response-details">
          <span className="transporter-assignment-panel__response-status">
            {statusLabelById[latest.responseStatusId] ?? `Status #${latest.responseStatusId}`}
          </span>
          <span>
            Offered: {latest.offeredQuantityMT} MT @ ₹{latest.offeredFreightPerMT}/MT
          </span>
          {latest.acceptedQuantityMT != null && (
            <span>
              Accepted: {latest.acceptedQuantityMT} MT @ ₹{latest.acceptedFreightPerMT ?? "-"}/MT
            </span>
          )}
          {latest.responseRemarks && <span>Remarks: {latest.responseRemarks}</span>}
        </div>
      )}
    </div>
  );
};

interface TransporterAssignmentPanelProps {
  scheduleRow: ScheduleTruckRow;
  summary: ContractSummary;
  contractId: number;
}

const TransporterAssignmentPanel = ({ scheduleRow, summary, contractId }: TransporterAssignmentPanelProps) => {
  const [rows, setRows] = useState<TransporterAssignmentRow[]>(getSeedTransporterRows);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [historyRow, setHistoryRow] = useState<TransporterAssignmentRow | null>(null);
  const [approvedTrucksOpen, setApprovedTrucksOpen] = useState(false);
  const [rowPendingDelete, setRowPendingDelete] = useState<TransporterAssignmentRow | null>(null);
  const [invalidFields, setInvalidFields] = useState<
    Record<string, Set<keyof TransporterAssignmentRow>>
  >({});
  const [saveWarning, setSaveWarning] = useState(false);
  const [sendOffcanvasOpen, setSendOffcanvasOpen] = useState(false);
  const [sendSuccessToast, setSendSuccessToast] = useState(false);

  const { data: transporters } = useGetTransporterProfileSummaryQuery();
  const { data: trucks } = useGetAllActiveTruckDetailsQuery();
  const { data: drivers } = useGetAllActiveDriversQuery();
  const { data: responseStatuses } = useGetTransporterScheduleResponseStatusesQuery();

  const statusLabelById = useMemo(
    () => Object.fromEntries((responseStatuses ?? []).map((s) => [s.responseStatusId, s.displayName])),
    [responseStatuses],
  );

  const notifiedTransporters = useMemo(
    () =>
      scheduleRow.transporterProfileIds
        .map((id) => {
          const transporter = transporters?.find((t) => t.profileId === id);
          return { id, name: transporter?.legalName ?? `Transporter #${id}` };
        }),
    [scheduleRow.transporterProfileIds, transporters],
  );

  const transporterOptions = useMemo(
    () => (transporters ?? []).map((t) => ({ value: t.legalName, label: t.legalName })),
    [transporters],
  );
  const truckOptions = useMemo(
    () => (trucks ?? []).map((t) => ({ value: t.truckNumber, label: t.truckNumber })),
    [trucks],
  );
  const driverOptions = useMemo(
    () => (drivers ?? []).map((d) => ({ value: d.driverName, label: d.driverName })),
    [drivers],
  );
  const driverPhoneByName = useMemo(
    () => Object.fromEntries((drivers ?? []).map((d) => [d.driverName, d.mobileNumber])),
    [drivers],
  );

  useEffect(() => {
    if (!sendSuccessToast) return;
    const timer = setTimeout(() => setSendSuccessToast(false), 3000);
    return () => clearTimeout(timer);
  }, [sendSuccessToast]);

  const handleFieldChange: <K extends keyof TransporterAssignmentRow>(
    id: string,
    field: K,
    value: TransporterAssignmentRow[K],
  ) => void = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    setInvalidFields((prev) => {
      const rowInvalid = prev[id];
      if (!rowInvalid?.has(field)) return prev;
      const next = new Set(rowInvalid);
      next.delete(field);
      return { ...prev, [id]: next };
    });
  };

  const handleDriverNameChange = (id: string, driverName: string) => {
    const driverPhone = driverPhoneByName[driverName];
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, driverName, driverPhone: driverPhone ?? row.driverPhone }
          : row,
      ),
    );
    setInvalidFields((prev) => {
      const rowInvalid = prev[id];
      if (!rowInvalid?.has("driverName") && !rowInvalid?.has("driverPhone")) return prev;
      const next = new Set(rowInvalid);
      next.delete("driverName");
      if (driverPhone) next.delete("driverPhone");
      return { ...prev, [id]: next };
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyTransporterRow()]);
  };

  const handleConfirmDelete = () => {
    if (!rowPendingDelete) return;
    setRows((prev) => prev.filter((item) => item.id !== rowPendingDelete.id));
    setSelectedRowKeys((prev) => prev.filter((key) => key !== rowPendingDelete.id));
    setInvalidFields((prev) => {
      const { [rowPendingDelete.id]: _removed, ...rest } = prev;
      return rest;
    });
    setRowPendingDelete(null);
  };

  const handleSaveRow = (row: TransporterAssignmentRow) => {
    const missing = getMissingTransporterFields(row);
    if (missing.size > 0) {
      setInvalidFields((prev) => ({ ...prev, [row.id]: missing }));
      return;
    }
    setInvalidFields((prev) => ({ ...prev, [row.id]: new Set() }));
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, saved: true } : item)));
  };

  const handleEditRow = (row: TransporterAssignmentRow) => {
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, saved: false } : item)));
  };

  const handleSaveAll = () => {
    const nextInvalid: Record<string, Set<keyof TransporterAssignmentRow>> = {};
    let allValid = true;

    rows.forEach((row) => {
      if (!selectedRowKeys.includes(row.id)) return;
      const missing = getMissingTransporterFields(row);
      nextInvalid[row.id] = missing;
      if (missing.size > 0) allValid = false;
    });

    setInvalidFields((prev) => ({ ...prev, ...nextInvalid }));
    if (!allValid) return;

    setRows((prev) =>
      prev.map((row) => (selectedRowKeys.includes(row.id) ? { ...row, saved: true } : row)),
    );
    setSaveWarning(false);
  };

  const handleSendRequest = () => {
    if (selectedRowKeys.length === 0) return;

    const allSelectedSaved = selectedRowKeys.every(
      (key) => rows.find((row) => row.id === key)?.saved,
    );
    if (!allSelectedSaved) {
      setSaveWarning(true);
      return;
    }

    setSaveWarning(false);
    setSendOffcanvasOpen(true);
  };

  const handleConfirmSend = () => {
    // TODO: wire up to the truck-management API once available.
    setSendOffcanvasOpen(false);
    setSelectedRowKeys([]);
    setSendSuccessToast(true);
  };

  const selectedRows = rows.filter((row) => selectedRowKeys.includes(row.id));

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
        onDriverNameChange: handleDriverNameChange,
        onSaveRow: handleSaveRow,
        onEditRow: handleEditRow,
        onDeleteRow: setRowPendingDelete,
        onViewHistory: setHistoryRow,
        onAddRow: handleAddRow,
        lastRowId,
        invalidFields,
        transporterOptions,
        truckOptions,
        driverOptions,
      }),
    [lastRowId, invalidFields, transporterOptions, truckOptions, driverOptions],
  );

  return (
    <div className="transporter-assignment-panel">
      {sendSuccessToast && (
        <div className="transporter-assignment-panel__toast" role="status">
          <FiCheckCircle aria-hidden />
          Request sent successfully.
        </div>
      )}

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

      {saveWarning && (
        <div className="transporter-assignment-panel__warning">
          <FiAlertTriangle aria-hidden />
          <span>
            Please <strong>Save</strong> all selected rows before sending the request.
          </span>
          <button
            type="button"
            onClick={() => setSaveWarning(false)}
            aria-label="Dismiss warning"
          >
            <FiX aria-hidden />
          </button>
        </div>
      )}

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

      {notifiedTransporters.length > 0 && (
        <div className="transporter-assignment-panel__responses">
          <h4 className="transporter-assignment-panel__responses-title">Transporter Responses</h4>
          {notifiedTransporters.map((transporter) => (
            <TransporterResponseRow
              key={transporter.id}
              contractId={contractId}
              transporterId={transporter.id}
              transporterName={transporter.name}
              statusLabelById={statusLabelById}
            />
          ))}
        </div>
      )}

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

      <SendRequestOffcanvas
        open={sendOffcanvasOpen}
        summary={summary}
        scheduleRow={scheduleRow}
        rows={selectedRows}
        onClose={() => setSendOffcanvasOpen(false)}
        onConfirm={handleConfirmSend}
      />
    </div>
  );
};

export default TransporterAssignmentPanel;
