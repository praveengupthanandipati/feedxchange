import type { NegotiationAction, NegotiationActor } from "../../../../core/store/scheduleNegotiationApi";
import type { BadgeTone } from "../../../../shared/components/ui";

/** The response status a transporter's freight proposal waits in (DatabaseScripts/AddScheduleFreightNegotiation_2026-11-26.sql). */
export const FREIGHT_PROPOSED = "freightproposed";

/** Status names compared without case / spaces ("FreightProposed", "Freight proposed - awaiting approval"). */
export const isFreightProposed = (statusName: string | null | undefined) =>
  (statusName ?? "").toLowerCase().replace(/[^a-z]/g, "").startsWith(FREIGHT_PROPOSED);

export const ACTION_LABELS: Record<NegotiationAction, string> = {
  RequestSent: "Request sent",
  Accepted: "Accepted",
  CounterProposed: "Proposed a different freight",
  Rejected: "Rejected",
  Revised: "Revised the freight",
  Approved: "Approved the freight",
  AutoApproved: "Auto-approved the freight (no change in 10 minutes)",
  Cancelled: "Cancelled",
};

export const ACTION_TONES: Record<NegotiationAction, BadgeTone> = {
  RequestSent: "neutral",
  Accepted: "success",
  CounterProposed: "warning",
  Rejected: "danger",
  Revised: "info",
  Approved: "success",
  AutoApproved: "success",
  Cancelled: "danger",
};

export const ACTOR_LABELS: Record<NegotiationActor, string> = {
  Admin: "feedXchange",
  Initiator: "Requested by",
  Transporter: "Transporter",
  System: "feedXchange (automatic)",
};

export const rupees = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const mt = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `${value.toLocaleString("en-IN", { maximumFractionDigits: 3 })} MT`;
