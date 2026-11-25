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
  truckNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  quantityMT: number;
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
  /** Set when the truck is on another trip right now: it cannot be added until then. */
  busyMessage: string | null;
}

export interface LookupDriver {
  driverId: number;
  driverName: string;
  mobileNumber: string;
  /** Set when the driver is on another trip right now: the driver cannot be added until then. */
  busyMessage?: string | null;
}

export interface TruckLookups {
  trucks: LookupTruck[];
  drivers: LookupDriver[];
}

export interface AddTrucksPayload {
  dispatchScheduleTransporterId: number;
  trucks: { truckId: number; driverId: number; quantityMT: number; lrNumber?: string; trackingUrl?: string }[];
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

    getAcceptedSchedules: builder.query<AcceptedSchedule[], void>({
      query: () => ({ url: "/api/TransporterRequests/AcceptedSchedules", method: "GET" }),
      transformResponse: unwrapArray<AcceptedSchedule>,
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
  useAddTrucksToScheduleMutation,
} = transporterRequestsApi;
