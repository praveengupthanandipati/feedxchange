import { useState } from "react";
import { useApproveFreightMutation, useReviseFreightMutation } from "../../../../core/store/scheduleNegotiationApi";
import { getErrorMessage } from "../../../../core/api/getErrorMessage";
import { CheckIcon, SendIcon } from "../../../../shared/components/icon";
import { mt, rupees } from "./negotiation";
import "./Negotiation.scss";

interface FreightDecisionProps {
  dispatchScheduleTransporterId: number;
  offeredFreightPerMT: number;
  /** The transporter's open proposal; null while the request is simply waiting for the transporter (then only Revise is offered). */
  proposedFreightPerMT: number | null;
  proposedQuantityMT: number | null;
  proposedRemarks?: string | null;
}

/**
 * For FeedXchange admins and the schedule's initiator: approve the transporter's proposed freight (the request is accepted and trucks can be
 * added) or send a revised freight back to the transporter. Both notify the transporter automatically.
 */
const FreightDecision = ({ dispatchScheduleTransporterId, offeredFreightPerMT, proposedFreightPerMT, proposedQuantityMT, proposedRemarks }: FreightDecisionProps) => {
  const [approve, { isLoading: approving }] = useApproveFreightMutation();
  const [revise, { isLoading: revising }] = useReviseFreightMutation();
  const [freight, setFreight] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const busy = approving || revising;
  const hasProposal = proposedFreightPerMT !== null;

  const doApprove = async () => {
    setError("");
    try {
      await approve({ dispatchScheduleTransporterId, remarks: remarks.trim() || undefined }).unwrap();
      setDone(`Approved at ${rupees(proposedFreightPerMT)}/MT. The transporter has been told and can add trucks.`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not approve the freight. Please try again."));
    }
  };

  const doRevise = async () => {
    setError("");
    const value = Number(freight);
    if (!freight.trim() || Number.isNaN(value) || value <= 0) return setError("Enter the freight per MT to send back.");
    try {
      await revise({ dispatchScheduleTransporterId, freightPerMT: value, remarks: remarks.trim() || undefined }).unwrap();
      setDone(`Revised freight of ${rupees(value)}/MT sent to the transporter.`);
      setFreight("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not send the revised freight. Please try again."));
    }
  };

  if (done) return <p className="freight-decision__done" role="status">{done}</p>;

  return (
    <div className="freight-decision">
      {hasProposal ? (
        <p className="freight-decision__proposal">
          Transporter proposes <strong>{rupees(proposedFreightPerMT)}/MT</strong> for {mt(proposedQuantityMT)} (offered {rupees(offeredFreightPerMT)}/MT).
          {proposedRemarks && <span className="freight-decision__remark"> “{proposedRemarks}”</span>}
          <span className="freight-decision__note">No trucks can be added until it is approved.</span>
        </p>
      ) : (
        <p className="freight-decision__proposal">Offered at {rupees(offeredFreightPerMT)}/MT. You can send a different freight before the transporter answers.</p>
      )}
      <div className="freight-decision__row">
        {hasProposal && (
          <button type="button" className="freight-decision__approve" onClick={doApprove} disabled={busy}>
            <CheckIcon aria-hidden /> {approving ? "Approving…" : `Approve ${rupees(proposedFreightPerMT)}`}
          </button>
        )}
        <label className="freight-decision__field">
          <span className="visually-hidden">Revised freight per MT</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder={hasProposal ? "Counter ₹/MT" : "New ₹/MT"}
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
            disabled={busy}
          />
        </label>
        <button type="button" className="freight-decision__revise" onClick={doRevise} disabled={busy}>
          <SendIcon aria-hidden /> {revising ? "Sending…" : hasProposal ? "Revise & send back" : "Send revised freight"}
        </button>
      </div>
      <input
        type="text"
        className="freight-decision__remarks"
        placeholder="Remarks for the transporter (optional)"
        value={remarks}
        maxLength={500}
        onChange={(e) => setRemarks(e.target.value)}
        disabled={busy}
      />
      {error && <p className="freight-decision__error" role="alert">{error}</p>}
    </div>
  );
};

export default FreightDecision;
