import { contractTrucksApi } from "./contractTrucksApi";
import { unwrapArray } from "./userProfilesCommonApi";

/** A truck request sent to a transporter: parties, addresses and the response (no contract number). */
export interface TransporterRequest {
  dispatchScheduleTransporterId: number;
  dispatchScheduleId: number;
  transporterProfileId: number;
  transporterName: string;
  productName: string | null;
  /** Seller (loading side) and buyer (unloading side). */
  sellerName: string | null;
  buyerName: string | null;
  /** Short form (city, district) for the compact view. */
  loadingPlace: string | null;
  deliveryPlace: string | null;
  loadingAddress: string | null;
  deliveryAddress: string | null;
  /** What FeedXchange wrote on the request. */
  requestRemarks: string | null;
  /** The request involves a re-assigned truck: a bill change is needed. */
  billChange: boolean;
  scheduleDateTime: string;
  offeredQuantityMT: number;
  offeredFreightPerMT: number;
  /** What can still be accepted (the offer, less what other transporters already hold of the same schedule). */
  availableQuantityMT: number;
  acceptedQuantityMT: number | null;
  acceptedFreightPerMT: number | null;
  cancelledQuantityMT: number | null;
  negotiated: boolean;
  responseStatusId: number;
  notifiedDateTime: string | null;
  responseDateTime: string | null;
  responseRemarks: string | null;
  /** The transporter's freight proposal waiting for approval (only while the status is "FreightProposed"). */
  proposedQuantityMT?: number | null;
  proposedFreightPerMT?: number | null;
  /** Proposals and revisions so far (0 = no bargaining). */
  negotiationRounds?: number;
}

export interface TransporterRequestFilters {
  /** yyyy-mm-dd, by the date the trucks are scheduled for. */
  from?: string;
  to?: string;
  statusId?: number;
  search?: string;
}

export interface RespondToRequestPayload {
  dispatchScheduleTransporterId: number;
  accept: boolean;
  acceptedQuantityMT?: number;
  acceptedFreightPerMT?: number;
  remarks?: string;
}

/** A truck already added to an accepted schedule. */
export interface AssignedTruck {
  contractDispatchId: number;
  truckId: number;
  /** Null when the trip has no driver. */
  driverId: number | null;
  trackingUrl: string | null;
  /** True while the truck is still Assigned (not Loaded / Cancelled) and the signed-in user is the transporter. */
  editable: boolean;
  /** Part of a re-assignment chain (also serves other contracts): truck, driver and quantity changes apply to every contract of it. */
  inChain?: boolean;
  truckNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  quantityMT: number;
  /** Its delivery locations in order, when it unloads at more than one (empty otherwise). */
  deliveryStops?: { stopNo: number; label: string; quantityMT: number | null }[];
  lrNumber: string | null;
  status: string;
  cancelled: boolean;
}

/** An accepted (or partly accepted) request with the trucks added so far and what is left to add. */
export interface AcceptedSchedule {
  dispatchScheduleTransporterId: number;
  transporterProfileId: number;
  transporterName: string;
  productName: string | null;
  scheduleDateTime: string;
  sellerName: string | null;
  buyerName: string | null;
  loadingPlace: string | null;
  deliveryPlace: string | null;
  loadingAddress: string | null;
  deliveryAddress: string | null;
  /** The schedule's delivery address: delivery location 1 of a truck that unloads at more than one place. */
  toAddressId?: number;
  /** The buyer's active addresses (not the loading one): where else a truck may unload. */
  buyerAddresses?: { addressId: number; label: string }[];
  billChange: boolean;
  acceptedQuantityMT: number;
  acceptedFreightPerMT: number;
  assignedQuantityMT: number;
  remainingQuantityMT: number;
  trucks: AssignedTruck[];
}

export interface LookupTruck {
  truckId: number;
  truckNumber: string;
  trackingUrl: string | null;
  defaultDriverId: number | null;
  /** Set when the truck is on another trip right now: it can be added only after the user confirms (confirmBusy). */
  busyMessage: string | null;
  /** The Assigned trips a busy truck is on, shown in the confirmation. */
  busyTrips?: BusyTrip[];
}

/** A trip an occupied truck is on. Only the transporter's own trips carry the contract, route and load. */
export interface BusyTrip {
  /** 0 when the trip is not the transporter's own. */
  contractDispatchId: number;
  ownTrip: boolean;
  contractNumber: string | null;
  productName: string | null;
  fromCity: string | null;
  toCity: string | null;
  driverName: string | null;
  quantityMT: number | null;
  lrNumber: string | null;
  assignedOn: string;
  /** Null: busy until that trip is Loaded or Cancelled. */
  busyUntil: string | null;
}

export interface LookupDriver {
  driverId: number;
  driverName: string;
  mobileNumber: string;
  /** Set when the driver is on another trip right now: the driver cannot be added until then. */
  busyMessage?: string | null;
  /** The trucks of the driver's Assigned trips: a busy driver may go with a confirmed occupied truck when all of them are that truck. */
  busyTruckIds?: number[];
}

export interface TruckLookups {
  trucks: LookupTruck[];
  drivers: LookupDriver[];
}

/** An instant truck: added straight to a contract, not through a schedule. */
export interface InstantTruck {
  contractDispatchId: number;
  transporterName: string;
  /** Only for FeedXchange staff. */
  contractNumber: string | null;
  assignedOn: string;
  productName: string | null;
  sellerName: string | null;
  buyerName: string | null;
  loadingPlace: string | null;
  deliveryPlace: string | null;
  loadingAddress: string | null;
  deliveryAddress: string | null;
  freightPerMT: number;
  /** The contract's quantity not on any truck yet: how far this truck's quantity may be raised. */
  contractPendingQuantityMT: number;
  truck: AssignedTruck;
}

/** Query string for an optional yyyy-MM-dd range. */
const dateParams = (arg: { from?: string; to?: string } | void) => ({ ...(arg?.from ? { from: arg.from } : {}), ...(arg?.to ? { to: arg.to } : {}) });

/** One request on the Schedules Management dashboard: the request, where its truck arrangement stands, and its trucks. */
export interface ScheduleDashboardRow {
  request: TransporterRequest;
  /** Pending, Accepted, PartiallyAccepted, Rejected, Expired or Cancelled. */
  responseStatus: string;
  /** Only for FeedXchange staff; null for a transporter. */
  contractNumber: string | null;
  /** Accepted, less what was cancelled: what trucks have to be put on. */
  committedQuantityMT: number;
  /** On trucks still Assigned (not loaded yet). */
  assignedQuantityMT: number;
  loadedQuantityMT: number;
  leftToAssignMT: number;
  trucks: AssignedTruck[];
}

/** After an edit or delete: how many contracts the truck is on (more than one when re-assigned) and how many had their buyer and seller notified. */
export interface TruckChangeResult {
  contracts: number;
  notifiedContracts: number;
}

export interface UpdateScheduleTruckPayload {
  contractDispatchId: number;
  truckId: number;
  driverId: number;
  quantityMT: number;
  lrNumber?: string;
  /** Blank removes the link. */
  trackingUrl?: string;
  /** The new truck is on another trip and the user confirmed using it anyway. */
  confirmBusy?: boolean;
}

export interface AddTrucksPayload {
  dispatchScheduleTransporterId: number;
  /** confirmBusy: the user saw that the truck is on another trip and confirmed adding it anyway. */
  trucks: {
    truckId: number;
    driverId: number;
    quantityMT: number;
    lrNumber?: string;
    trackingUrl?: string;
    confirmBusy?: boolean;
    /** Optional: two or more delivery locations in order (the first is the schedule's delivery address). */
    deliveryPoints?: { addressId: number; quantityMT?: number }[];
  }[];
}

// Added to the contract trucks API so the existing ContractTruck cache tag refreshes both lists after a response.
export const transporterRequestsApi = contractTrucksApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransporterRequests: builder.query<TransporterRequest[], TransporterRequestFilters | void>({
      query: (filters) => ({
        url: "/api/TransporterRequests",
        method: "GET",
        params: {
          from: filters?.from || undefined,
          to: filters?.to || undefined,
          statusId: filters?.statusId,
          search: filters?.search || undefined,
        },
      }),
      transformResponse: unwrapArray<TransporterRequest>,
      providesTags: ["ContractTruck"],
    }),

    /** Optional schedule-date range (yyyy-MM-dd, whole days). */
    getAcceptedSchedules: builder.query<AcceptedSchedule[], { from?: string; to?: string } | void>({
      query: (arg) => ({ url: "/api/TransporterRequests/AcceptedSchedules", method: "GET", params: dateParams(arg) }),
      transformResponse: unwrapArray<AcceptedSchedule>,
      providesTags: ["ContractTruck"],
    }),

    /** Instant trucks (added straight to a contract) of the signed-in transporter; staff see all. Optional assigned-date range. */
    getInstantTrucks: builder.query<InstantTruck[], { from?: string; to?: string } | void>({
      query: (arg) => ({ url: "/api/TransporterRequests/InstantTrucks", method: "GET", params: dateParams(arg) }),
      transformResponse: unwrapArray<InstantTruck>,
      providesTags: ["ContractTruck"],
    }),

    /** Requests whose schedule falls within from..to (yyyy-MM-dd, whole days; either may be left out). */
    getScheduleDashboard: builder.query<ScheduleDashboardRow[], { from?: string; to?: string }>({
      query: ({ from, to }) => ({ url: "/api/TransporterRequests/Dashboard", method: "GET", params: { ...(from ? { from } : {}), ...(to ? { to } : {}) } }),
      transformResponse: unwrapArray<ScheduleDashboardRow>,
      providesTags: ["ContractTruck"],
    }),

    getTruckLookups: builder.query<TruckLookups, void>({
      query: () => ({ url: "/api/TransporterRequests/TruckLookups", method: "GET" }),
      providesTags: ["ContractTruck"],
    }),

    addTrucksToSchedule: builder.mutation<{ contractDispatchIds: number[] }, AddTrucksPayload>({
      query: (body) => ({ url: "/api/TransporterRequests/AddTrucks", method: "POST", body }),
      invalidatesTags: ["ContractTruck"],
    }),

    updateScheduleTruck: builder.mutation<TruckChangeResult, UpdateScheduleTruckPayload>({
      query: (body) => ({ url: "/api/TransporterRequests/UpdateTruck", method: "POST", body }),
      invalidatesTags: ["ContractTruck"],
    }),

    /** Takes a still-Assigned truck off the schedule (kept as Cancelled); its quantity goes back to "left to assign". */
    deleteScheduleTruck: builder.mutation<TruckChangeResult, { contractDispatchId: number }>({
      query: (body) => ({ url: "/api/TransporterRequests/DeleteTruck", method: "POST", body }),
      invalidatesTags: ["ContractTruck"],
    }),

    respondToTransporterRequest: builder.mutation<boolean, RespondToRequestPayload>({
      query: (body) => ({ url: "/api/TransporterRequests/Respond", method: "POST", body }),
      invalidatesTags: ["ContractTruck"],
    }),
  }),
});

export const {
  useGetTransporterRequestsQuery,
  useRespondToTransporterRequestMutation,
  useGetAcceptedSchedulesQuery,
  useGetTruckLookupsQuery,
  useGetScheduleDashboardQuery,
  useGetInstantTrucksQuery,
  useAddTrucksToScheduleMutation,
  useUpdateScheduleTruckMutation,
  useDeleteScheduleTruckMutation,
} = transporterRequestsApi;
