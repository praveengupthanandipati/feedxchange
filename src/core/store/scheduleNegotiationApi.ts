import { contractTrucksApi } from "./contractTrucksApi";

// Freight bargaining on truck requests (/api/ScheduleNegotiation). Injected into the contract trucks API so its "ContractTruck" tag refreshes
// Manage Schedule, the transporter's requests and the accepted schedules after an approval or a revised price.

/** RequestSent | Accepted | CounterProposed | Rejected | Revised | Approved | Cancelled */
export type NegotiationAction = "RequestSent" | "Accepted" | "CounterProposed" | "Rejected" | "Revised" | "Approved" | "AutoApproved" | "Cancelled";
/** Admin | Initiator | Transporter */
export type NegotiationActor = "Admin" | "Initiator" | "Transporter" | "System";

export interface NegotiationStep {
  sequence: number;
  action: NegotiationAction;
  actorRole: NegotiationActor;
  actorName: string | null;
  /** The business, for a step by the schedule's initiator. */
  actorCompany: string | null;
  quantityMT: number | null;
  freightPerMT: number | null;
  previousFreightPerMT: number | null;
  remarks: string | null;
  /** Where the step left the request ("Pending", "Freight proposed - awaiting approval", "Accepted", ...). */
  statusDisplay: string | null;
  /** UTC */
  createdOn: string;
}

export interface Negotiation {
  dispatchScheduleTransporterId: number;
  transporterName: string;
  responseStatusId: number;
  statusName: string;
  statusDisplay: string;
  offeredQuantityMT: number | null;
  offeredFreightPerMT: number | null;
  acceptedQuantityMT: number | null;
  acceptedFreightPerMT: number | null;
  proposedQuantityMT: number | null;
  proposedFreightPerMT: number | null;
  /** The signed-in user may approve the proposal or revise the freight now (admins and the schedule's initiator). */
  canDecide: boolean;
  isTransporter: boolean;
  steps: NegotiationStep[];
}

export interface NegotiationSummary {
  dispatchScheduleTransporterId: number;
  steps: number;
  rounds: number;
  awaitingApproval: boolean;
  proposedQuantityMT: number | null;
  proposedFreightPerMT: number | null;
  proposedRemarks: string | null;
  proposedOn: string | null;
  canDecide: boolean;
}

export interface NegotiationDecision {
  dispatchScheduleTransporterId: number;
  /** Revise only: the new freight per MT for the transporter. */
  freightPerMT?: number;
  remarks?: string;
}

export const scheduleNegotiationApi = contractTrucksApi.injectEndpoints({
  endpoints: (builder) => ({
    getNegotiationHistory: builder.query<Negotiation, number>({
      query: (id) => `/api/ScheduleNegotiation/History?dispatchScheduleTransporterId=${id}`,
      providesTags: ["ContractTruck"],
    }),
    getNegotiationsByContract: builder.query<NegotiationSummary[], number>({
      query: (contractId) => `/api/ScheduleNegotiation/ByContract?contractId=${contractId}`,
      providesTags: ["ContractTruck"],
    }),
    approveFreight: builder.mutation<boolean, NegotiationDecision>({
      query: (body) => ({ url: "/api/ScheduleNegotiation/Approve", method: "POST", body }),
      invalidatesTags: ["ContractTruck"],
    }),
    reviseFreight: builder.mutation<boolean, NegotiationDecision>({
      query: (body) => ({ url: "/api/ScheduleNegotiation/Revise", method: "POST", body }),
      invalidatesTags: ["ContractTruck"],
    }),
  }),
});

export const {
  useGetNegotiationHistoryQuery,
  useGetNegotiationsByContractQuery,
  useApproveFreightMutation,
  useReviseFreightMutation,
} = scheduleNegotiationApi;
