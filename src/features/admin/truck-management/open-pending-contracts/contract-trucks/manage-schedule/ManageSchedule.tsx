import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, BanIcon, CheckIcon, ClockIcon, FileTextIcon, PlusIcon, XIcon } from "../../../../../../shared/components/icon";
import InfoPanel from "../InfoPanel";
import ContractSummaryPanel from "../../../contract-trucks/ContractSummaryPanel";
import PendingContractSelector from "../../../contract-trucks/PendingContractSelector";
import { useGetContractByContractNumberQuery } from "../../../../../../core/store/contractsApi";
import {
  useGetDispatchScheduleTransportersQuery,
  useGetScheduleTrucksDispatchDetailsQuery,
  useGetTransporterScheduleResponseStatusesQuery,
  useUpdateScheduleDispatchMutation,
  useCancelDispatchScheduleTransporterMutation,
  useGetAllTrucksByContractQuery,
  type ScheduleTruckDispatchDetail,
} from "../../../../../../core/store/contractTrucksApi";
import { useSelectedContract } from "../../../../../../core/context/SelectedContractContext";
import { formatApiDateTime } from "../../../../../../shared/utils/apiDateTime";
import "../../../assign-transports/Assigntransports.scss";
import "../../../transporter-review-assign-trucks/ReviewAndAssignTrucks.scss";
import "./ManageSchedule.scss";
import { useNotifyPrompt } from "../../../../../../shared/notifications/useNotifyPrompt";

function statusModifier(statusLabel: string): string {
  const normalized = statusLabel.toLowerCase();
  if (normalized.includes("partially")) return "partially-accepted";
  if (normalized.includes("accepted")) return "accepted";
  if (normalized.includes("rejected")) return "rejected";
  if (normalized.includes("expired")) return "expired";
  if (normalized.includes("cancelled")) return "cancelled";
  return "pending";
}

interface ScheduleRequestRowProps {
  contractNumber: string;
  transporterName: string;
  detail: ScheduleTruckDispatchDetail;
  statusLabelById: Record<number, string>;
  acceptedStatusId: number | undefined;
  partiallyAcceptedStatusId: number | undefined;
  rejectedStatusId: number | undefined;
  cancelledStatusId: number | undefined;
  /** MT already covered by trucks added against this request. */
  assignedQty: number;
  /** MT of each schedule (by dispatchScheduleId) held by transporters' acceptances, net of cancellations. */
  committedBySchedule: Map<number, number>;
}

/** What a transporter's response holds of its schedule: the accepted quantity, less anything cancelled since. */
function committedQty(row: { acceptedQuantityMT: number | null; cancelledQuantityMT: number | null }): number {
  return row.acceptedQuantityMT == null ? 0 : Math.max(row.acceptedQuantityMT - (row.cancelledQuantityMT ?? 0), 0);
}

const ScheduleRequestRow = ({
  contractNumber,
  transporterName,
  detail,
  statusLabelById,
  acceptedStatusId,
  partiallyAcceptedStatusId,
  rejectedStatusId,
  cancelledStatusId,
  assignedQty,
  committedBySchedule,
}: ScheduleRequestRowProps) => {
  const [updateScheduleDispatch, { isLoading: updating }] = useUpdateScheduleDispatchMutation();
  const notify = useNotifyPrompt();
  const [cancelDispatchScheduleTransporter, { isLoading: cancelling }] =
    useCancelDispatchScheduleTransporterMutation();
  const [actionError, setActionError] = useState("");

  // One schedule goes to several transporters, each offered the full quantity. Once some accept (even partly), the others can
  // only take what is left, so offer that rather than the original quantity.
  const scheduleQty = detail.scheduleQuantityMT || detail.offeredQuantityMT;
  const committedByOthers = (committedBySchedule.get(detail.dispatchScheduleId) ?? 0) - committedQty(detail);
  const availableQty = Math.max(Math.min(detail.offeredQuantityMT, scheduleQty - committedByOthers), 0);

  const [acceptQty, setAcceptQty] = useState(String(availableQty));
  // Another transporter's acceptance shrinks what is available: keep the prefilled quantity in step.
  useEffect(() => {
    setAcceptQty(String(availableQty));
  }, [availableQty]);
  const [acceptFreight, setAcceptFreight] = useState(String(detail.offeredFreightPerMT));
  const [cancelQty, setCancelQty] = useState("");

  const statusLabel = statusLabelById[detail.responseStatusId] ?? `Status #${detail.responseStatusId}`;
  const isPending = statusLabel.toLowerCase() === "pending";
  const isAccepted = statusLabel.toLowerCase().includes("accepted");
  const acceptedQty = detail.acceptedQuantityMT ?? 0;
  // What still needs trucks: accepted, less anything cancelled, less what is already assigned.
  const remainingQty = Math.max(acceptedQty - (detail.cancelledQuantityMT ?? 0) - assignedQty, 0);

  const handleAccept = async () => {
    setActionError("");

    const qty = Number(acceptQty);
    if (!acceptQty.trim() || Number.isNaN(qty) || qty <= 0) {
      setActionError("Enter a valid accepted quantity greater than 0.");
      return;
    }
    if (qty > availableQty) {
      setActionError(
        availableQty < detail.offeredQuantityMT
          ? `Only ${availableQty} MT of this schedule is still open; other transporters have accepted the rest.`
          : `Accepted quantity can't exceed the offered ${detail.offeredQuantityMT} MT.`,
      );
      return;
    }

    const freight = Number(acceptFreight);
    if (!acceptFreight.trim() || Number.isNaN(freight) || freight <= 0) {
      setActionError("Enter a valid freight charge greater than 0.");
      return;
    }

    // Taking everything still open counts as a full acceptance.
    const isFullAcceptance = qty === availableQty;
    const nextStatusId =
      (isFullAcceptance ? acceptedStatusId : partiallyAcceptedStatusId) ?? (isFullAcceptance ? 2 : 3);
    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    const nowIso = new Date().toISOString();

    try {
      const succeeded = await updateScheduleDispatch({
        dispatchScheduleTransporterId: detail.dispatchScheduleTransporterId,
        dispatchScheduleId: detail.dispatchScheduleId,
        transporterProfileId: detail.transporterProfileId,
        responseStatusId: nextStatusId,
        notifiedDateTime: detail.notifiedDateTime ?? nowIso,
        offeredQuantityMT: detail.offeredQuantityMT,
        acceptedQuantityMT: qty,
        cancelledQuantityMT: detail.cancelledQuantityMT,
        // A freight other than the one offered is a negotiated response.
        negotiated: detail.negotiated || freight !== detail.offeredFreightPerMT,
        offeredFreightPerMT: detail.offeredFreightPerMT,
        acceptedFreightPerMT: freight,
        responseDateTime: nowIso,
        responseRemarks: detail.responseRemarks ?? "",
        createdBy: detail.createdBy,
        createdOn: detail.createdOn,
        modifiedBy: currentUserId,
        modifiedOn: nowIso,
      }).unwrap();

      if (!succeeded) {
        setActionError("The server rejected this acceptance. Please try again.");
      } else {
        // The admins and whoever created the schedule are told it was accepted.
        notify.ask({ eventCode: "TRANSPORTER_ACCEPTED", title: "Notify about this acceptance", sourceEntityType: "DispatchScheduleTransporter", sourceEntityId: detail.dispatchScheduleTransporterId });
      }
    } catch {
      setActionError("Failed to accept this request. Please try again.");
    }
  };

  // Cancelling an accepted request: everything not yet committed to trucks by default, or just part of it (the server cancels exactly the
  // quantity sent; a partial cancel leaves the rest of the acceptance usable).
  const handleCancel = async () => {
    setActionError("");

    const qty = cancelQty.trim() ? Number(cancelQty) : remainingQty;
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      setActionError("Enter a valid quantity to cancel.");
      return;
    }
    if (qty > remainingQty) {
      setActionError(`Cancelled quantity cannot exceed the ${remainingQty} MT not yet committed to trucks.`);
      return;
    }

    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    const nowIso = new Date().toISOString();

    try {
      const succeeded = await cancelDispatchScheduleTransporter({
        dispatchScheduleTransporterId: detail.dispatchScheduleTransporterId,
        dispatchScheduleId: detail.dispatchScheduleId,
        transporterProfileId: detail.transporterProfileId,
        responseStatusId: cancelledStatusId ?? 6,
        notifiedDateTime: detail.notifiedDateTime ?? nowIso,
        offeredQuantityMT: detail.offeredQuantityMT,
        acceptedQuantityMT: detail.acceptedQuantityMT,
        cancelledQuantityMT: qty,
        negotiated: detail.negotiated,
        offeredFreightPerMT: detail.offeredFreightPerMT,
        acceptedFreightPerMT: detail.acceptedFreightPerMT,
        responseDateTime: detail.responseDateTime ?? nowIso,
        responseRemarks: detail.responseRemarks ?? "",
        createdBy: detail.createdBy,
        createdOn: detail.createdOn,
        modifiedBy: currentUserId,
        modifiedOn: nowIso,
      }).unwrap();

      if (!succeeded) {
        setActionError("The server did not apply this cancellation. Please try again.");
      } else {
        setCancelQty("");
        // The transporter, the admins and whoever created the schedule are told it was cancelled.
        notify.ask({ eventCode: "TRANSPORTER_CANCELLED", title: "Notify about this cancellation", sourceEntityType: "DispatchScheduleTransporter", sourceEntityId: detail.dispatchScheduleTransporterId });
      }
    } catch {
      setActionError("Failed to cancel this request. Please try again.");
    }
  };

  const handleReject = async () => {
    setActionError("");

    const nextStatusId = rejectedStatusId ?? 4;
    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    const nowIso = new Date().toISOString();

    try {
      const succeeded = await updateScheduleDispatch({
        dispatchScheduleTransporterId: detail.dispatchScheduleTransporterId,
        dispatchScheduleId: detail.dispatchScheduleId,
        transporterProfileId: detail.transporterProfileId,
        responseStatusId: nextStatusId,
        notifiedDateTime: detail.notifiedDateTime ?? nowIso,
        offeredQuantityMT: detail.offeredQuantityMT,
        acceptedQuantityMT: null,
        cancelledQuantityMT: detail.cancelledQuantityMT,
        negotiated: detail.negotiated,
        offeredFreightPerMT: detail.offeredFreightPerMT,
        acceptedFreightPerMT: null,
        responseDateTime: nowIso,
        responseRemarks: detail.responseRemarks ?? "",
        createdBy: detail.createdBy,
        createdOn: detail.createdOn,
        modifiedBy: currentUserId,
        modifiedOn: nowIso,
      }).unwrap();

      if (!succeeded) {
        setActionError("The server didn't apply this rejection. Please try again.");
      } else {
        // The admins and whoever created the schedule are told it was rejected.
        notify.ask({ eventCode: "TRANSPORTER_REJECTED", title: "Notify about this rejection", sourceEntityType: "DispatchScheduleTransporter", sourceEntityId: detail.dispatchScheduleTransporterId });
      }
    } catch {
      setActionError("Failed to reject this request. Please try again.");
    }
  };

  return (
    <tr>
      {/* Portalled: a dialog cannot sit inside a table row. */}
      {createPortal(notify.element, document.body)}
      <td>{transporterName}</td>
      <td className="manage-schedule-table__action-cell">
        <div className="manage-schedule-table__actions">
          {isPending && availableQty === 0 && (
            <>
              <span className="manage-schedule-table__muted">
                Fully accepted by other transporters — nothing left to accept.
              </span>
              <span className="manage-schedule-table__buttons">
                <button
                  type="button"
                  className="review-assign-trucks-btn review-assign-trucks-btn--reject"
                  onClick={handleReject}
                  disabled={updating}
                >
                  <XIcon aria-hidden /> Reject
                </button>
              </span>
            </>
          )}
          {isPending && availableQty > 0 && (
            <>
              <label className="manage-schedule-table__input">
                <input
                  type="text"
                  inputMode="decimal"
                  value={acceptQty}
                  onChange={(event) => setAcceptQty(event.target.value)}
                  aria-label={`Accepted quantity in MT for ${transporterName}`}
                />
                <span>MT</span>
              </label>
              <label className="manage-schedule-table__input">
                <span>₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={acceptFreight}
                  onChange={(event) => setAcceptFreight(event.target.value)}
                  aria-label={`Accepted freight per MT for ${transporterName}`}
                />
                <span>/MT</span>
              </label>
              <span className="manage-schedule-table__buttons">
                <button
                  type="button"
                  className="review-assign-trucks-btn review-assign-trucks-btn--accept"
                  onClick={handleAccept}
                  disabled={updating}
                >
                  <CheckIcon aria-hidden /> Accept
                </button>
                <button
                  type="button"
                  className="review-assign-trucks-btn review-assign-trucks-btn--reject"
                  onClick={handleReject}
                  disabled={updating}
                >
                  <XIcon aria-hidden /> Reject
                </button>
              </span>
            </>
          )}
          {isAccepted && (
            <span className="manage-schedule-table__remaining">
              {assignedQty} MT assigned · {remainingQty} MT remaining
            </span>
          )}
          {isAccepted && remainingQty > 0 && (
            <>
              <label className="manage-schedule-table__input">
                <input
                  type="text"
                  inputMode="decimal"
                  value={cancelQty}
                  onChange={(event) => setCancelQty(event.target.value)}
                  placeholder={String(remainingQty || acceptedQty)}
                  aria-label={`Quantity to cancel in MT for ${transporterName}`}
                />
                <span>MT</span>
              </label>
              <span className="manage-schedule-table__buttons">
                <Link
                  to={`/admin/truck-management/open-pending-contracts/add-truck-to-schedule?contract=${encodeURIComponent(
                    contractNumber,
                  )}&transporterId=${detail.transporterProfileId}&dispatchScheduleTransporterId=${detail.dispatchScheduleTransporterId}`}
                  className="review-assign-trucks-btn review-assign-trucks-btn--add"
                >
                  <PlusIcon aria-hidden /> Add Truck
                </Link>
                <button
                  type="button"
                  className="review-assign-trucks-btn review-assign-trucks-btn--reject"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  <BanIcon aria-hidden /> {cancelling ? "Cancelling…" : "Cancel"}
                </button>
              </span>
            </>
          )}
          {isAccepted && remainingQty === 0 && (
            <span className="manage-schedule-table__muted">
              Fully assigned — no trucks left to add on this request.
            </span>
          )}
          {!isPending && !isAccepted && <span className="manage-schedule-table__muted">-</span>}
        </div>
        {actionError && <span className="manage-schedule-table__error">{actionError}</span>}
      </td>
      <td>{formatApiDateTime(detail.scheduleDateTime)}</td>
      <td>
        {isPending && availableQty < detail.offeredQuantityMT ? (
          <>
            {availableQty} MT @ ₹{detail.offeredFreightPerMT}/MT
            <span className="manage-schedule-table__timestamps">
              Remaining of {detail.offeredQuantityMT} MT; others accepted {detail.offeredQuantityMT - availableQty} MT
            </span>
          </>
        ) : (
          <>
            {detail.offeredQuantityMT} MT @ ₹{detail.offeredFreightPerMT}/MT
          </>
        )}
      </td>
      <td>
        {detail.acceptedQuantityMT != null
          ? `${detail.acceptedQuantityMT} MT @ ₹${detail.acceptedFreightPerMT ?? "-"}/MT`
          : "-"}
        {detail.negotiated && <span className="manage-schedule-table__tag">Negotiated</span>}
      </td>
      <td>{detail.cancelledQuantityMT != null ? `${detail.cancelledQuantityMT} MT` : "-"}</td>
      <td>
        <span
          className={`review-assign-trucks-panel__status review-assign-trucks-panel__status--${statusModifier(statusLabel)}`}
        >
          {statusLabel}
        </span>
        <span className="manage-schedule-table__timestamps">
          Notified {formatApiDateTime(detail.notifiedDateTime)}
          {detail.responseDateTime && <> · Responded {formatApiDateTime(detail.responseDateTime)}</>}
        </span>
      </td>
      <td className="manage-schedule-table__remarks">{detail.responseRemarks || "-"}</td>
    </tr>
  );
};

interface TransporterScheduleRowsProps {
  contractNumber: string;
  contractId: number;
  transporterId: number;
  transporterName: string;
  statusLabelById: Record<number, string>;
  acceptedStatusId: number | undefined;
  partiallyAcceptedStatusId: number | undefined;
  rejectedStatusId: number | undefined;
  cancelledStatusId: number | undefined;
  assignedQtyByRequest: Map<number, number>;
  committedBySchedule: Map<number, number>;
}

/** Each transporter's schedule requests are fetched separately but share one table. */
const TransporterScheduleRows = ({
  contractNumber,
  contractId,
  transporterId,
  transporterName,
  statusLabelById,
  acceptedStatusId,
  partiallyAcceptedStatusId,
  rejectedStatusId,
  cancelledStatusId,
  assignedQtyByRequest,
  committedBySchedule,
}: TransporterScheduleRowsProps) => {
  // isLoading, not isFetching: a refetch after a save must keep the rows (and any dialog opened from them) mounted.
  const { data, isLoading } = useGetScheduleTrucksDispatchDetailsQuery(
    { contractId, transporterId },
    { skip: !contractId || !transporterId },
  );

  if (isLoading) {
    return (
      <tr>
        <td>{transporterName}</td>
        <td colSpan={7} className="manage-schedule-table__muted">
          Loading requests…
        </td>
      </tr>
    );
  }

  if (!data || data.length === 0) {
    return (
      <tr>
        <td>{transporterName}</td>
        <td colSpan={7} className="manage-schedule-table__muted">
          No schedule requests yet for this transporter.
        </td>
      </tr>
    );
  }

  return (
    <>
      {data.map((detail) => (
        <ScheduleRequestRow
          key={detail.dispatchScheduleTransporterId}
          contractNumber={contractNumber}
          transporterName={transporterName}
          detail={detail}
          statusLabelById={statusLabelById}
          acceptedStatusId={acceptedStatusId}
          partiallyAcceptedStatusId={partiallyAcceptedStatusId}
          rejectedStatusId={rejectedStatusId}
          cancelledStatusId={cancelledStatusId}
          assignedQty={assignedQtyByRequest.get(detail.dispatchScheduleTransporterId) ?? 0}
          committedBySchedule={committedBySchedule}
        />
      ))}
    </>
  );
};

const ManageScheduleContent = ({ contractNumber }: { contractNumber: string }) => {
  const { data: contract, isError: contractFailed } = useGetContractByContractNumberQuery(contractNumber);
  const { data: responseStatuses } = useGetTransporterScheduleResponseStatusesQuery();

  const contractId = contract?.id ?? 0;

  // First load only (see TransporterScheduleRows); also wait for the contract so "No Schedule Requests Yet" does not flash.
  const { data: scheduleTransporters, isLoading: loadingTransporters } =
    useGetDispatchScheduleTransportersQuery({ contractId }, { skip: !contractId });
  const loadingScheduleTransporters = loadingTransporters || (!contract && !contractFailed);

  // Trucks added against a schedule carry its dispatchScheduleTransporterId, so their
  // quantities tell each request how much of it is still uncovered.
  const { data: contractTrucks } = useGetAllTrucksByContractQuery({ contractId }, { skip: !contractId });
  const assignedQtyByRequest = useMemo(() => {
    const totals = new Map<number, number>();
    (contractTrucks ?? []).forEach((truck) => {
      const requestId = truck.dispatchScheduleTransporterId;
      if (!requestId) return;
      totals.set(requestId, (totals.get(requestId) ?? 0) + truck.quantityMT);
    });
    return totals;
  }, [contractTrucks]);

  // Every transporter's response on this contract, so each pending request can see what the others already took.
  const committedBySchedule = useMemo(() => {
    const totals = new Map<number, number>();
    (scheduleTransporters ?? []).forEach((entry) => {
      totals.set(entry.dispatchScheduleId, (totals.get(entry.dispatchScheduleId) ?? 0) + committedQty(entry));
    });
    return totals;
  }, [scheduleTransporters]);

  const statusLabelById = useMemo(
    () => Object.fromEntries((responseStatuses ?? []).map((s) => [s.responseStatusId, s.displayName])),
    [responseStatuses],
  );
  const acceptedStatusId = responseStatuses?.find((s) => s.statusName.toLowerCase() === "accepted")?.responseStatusId;
  const partiallyAcceptedStatusId = responseStatuses?.find(
    (s) => s.statusName.toLowerCase() === "partiallyaccepted",
  )?.responseStatusId;
  const rejectedStatusId = responseStatuses?.find((s) => s.statusName.toLowerCase() === "rejected")?.responseStatusId;
  const cancelledStatusId = responseStatuses?.find(
    (s) => s.statusName.toLowerCase() === "cancelled",
  )?.responseStatusId;

  const transporterEntries = useMemo(() => {
    const map = new Map<number, string>();
    (scheduleTransporters ?? []).forEach((entry) => {
      map.set(entry.transporterProfileId, entry.legalName);
    });
    return Array.from(map.entries());
  }, [scheduleTransporters]);

  if (loadingScheduleTransporters) {
    return <p className="review-assign-trucks-panel__hint">Loading scheduled transporters…</p>;
  }

  if (transporterEntries.length === 0) {
    return (
      <InfoPanel
        icon={ClockIcon}
        title="No Schedule Requests Yet"
        description="This contract has no scheduled transporters to review yet. Use Schedule Dispatch to notify transporters first."
      />
    );
  }

  return (
    <div className="manage-schedule-table__wrapper">
      <table className="manage-schedule-table">
        <thead>
          <tr>
            <th>Transporter</th>
            <th>Action</th>
            <th>Scheduled For</th>
            <th>Offered</th>
            <th>Accepted</th>
            <th>Cancelled</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {transporterEntries.map(([transporterId, transporterName]) => (
            <TransporterScheduleRows
              key={transporterId}
              contractNumber={contractNumber}
              contractId={contractId}
              transporterId={transporterId}
              transporterName={transporterName}
              statusLabelById={statusLabelById}
              acceptedStatusId={acceptedStatusId}
              partiallyAcceptedStatusId={partiallyAcceptedStatusId}
              rejectedStatusId={rejectedStatusId}
              cancelledStatusId={cancelledStatusId}
              assignedQtyByRequest={assignedQtyByRequest}
              committedBySchedule={committedBySchedule}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** The loading and delivery addresses are the same for every request, so they sit in the summary. */
const ManageScheduleSummary = ({ contractNumber }: { contractNumber: string }) => {
  const { data: contract } = useGetContractByContractNumberQuery(contractNumber);
  const contractId = contract?.id ?? 0;

  const { data: scheduleTransporters } = useGetDispatchScheduleTransportersQuery(
    { contractId },
    { skip: !contractId },
  );
  const firstTransporterId = scheduleTransporters?.[0]?.transporterProfileId ?? 0;

  // Same query the table rows use, so this reads from cache rather than firing another request.
  const { data: firstDetails } = useGetScheduleTrucksDispatchDetailsQuery(
    { contractId, transporterId: firstTransporterId },
    { skip: !contractId || !firstTransporterId },
  );
  const firstDetail = firstDetails?.[0];

  return (
    <ContractSummaryPanel
      contractNumber={contractNumber}
      extraFields={[
        { label: "Loading Address", value: firstDetail?.loadingAddress ?? "" },
        { label: "Delivery Address", value: firstDetail?.deliveryAddress ?? "" },
      ]}
    />
  );
};

const ManageSchedule = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedContract, setSelectedContract } = useSelectedContract();
  // Falls back to the contract picked earlier, so opening this screen from the menu
  // without one in the URL still shows data rather than an empty state.
  const contractNumber = searchParams.get("contract") ?? selectedContract ?? "";

  useEffect(() => {
    if (contractNumber) setSelectedContract(contractNumber);
  }, [contractNumber, setSelectedContract]);

  return (
    <div className="assign-transports-page">
      <div className="assign-transports-card">
        <div className="assign-transports-card__header">
          <h1>
            Manage Schedule (Accept/Reject)
            {contractNumber && (
              <span className="assign-transports-card__contract-no"> — Contract: {contractNumber}</span>
            )}
          </h1>
          <Link to="/admin/truck-management/open-pending-contracts" className="assign-transports-card__back">
            <ArrowLeftIcon aria-hidden /> Back to Open &amp; Pending Contracts
          </Link>
        </div>

        <PendingContractSelector
          value={contractNumber}
          onChange={(value) => setSearchParams({ contract: value })}
        />

        {contractNumber ? (
          <>
            <ManageScheduleSummary contractNumber={contractNumber} />
            <ManageScheduleContent contractNumber={contractNumber} />
          </>
        ) : (
          <InfoPanel
            icon={FileTextIcon}
            title="No Contract Selected"
            description="Open a contract from the Open & Pending Contracts list and use Manage Schedule there."
            action={{ label: "Go to Open & Pending Contracts", to: "/admin/truck-management/open-pending-contracts" }}
          />
        )}
      </div>
    </div>
  );
};

export default ManageSchedule;
