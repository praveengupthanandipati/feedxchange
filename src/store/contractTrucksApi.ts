import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/api";
import { unwrapArray } from "./userProfilesCommonApi";

export interface AddContractTruckPayload {
  contractId: number;
  truckAssignmentTypeId: number;
  dispatchScheduleTransporterId: number;
  transporterProfileId: number;
  truckId: number;
  driverId: number;
  assignedOn: string;
  lrNumber: string;
  quantityMT: number;
  freightPerMT: number;
  fromAddressId: number;
  toAddressId: number;
  dispatchStatusId: number;
  createdBy: number;
}

export interface UpdateContractTruckPayload {
  contractDispatchId: number;
  contractId: number;
  truckAssignmentTypeId: number;
  // UpdateContractTrucks still takes this under its older name; AddContractTrucks wants
  // dispatchScheduleTransporterId.
  scheduledNotificationId: number;
  transporterProfileId: number;
  truckId: number;
  driverId: number;
  assignedOn: string;
  lrNumber: string;
  quantityMT: number;
  freightPerMT: number;
  fromAddressId: number;
  toAddressId: number;
  dispatchStatusId: number;
  createdBy: number;
  createdOn: string;
  modifiedBy: number;
  modifiedOn: string;
}

export interface UpdateContractTruckRequest {
  contractTruckId: number;
  updateContractTruck: UpdateContractTruckPayload;
}

export interface ScheduleContractTruckPayload {
  transporters: number[];
  contractId: number;
  scheduleDateTime: string;
  quantityMT: number;
  remainingQuantityMT: number;
  fromAddressId: number;
  toAddressId: number;
  scheduleStatusId: number;
  remarks: string;
  freightPerMT: number;
  autoApprove:boolean;
  createdBy: number;
  createdOn: string;
}

export interface TransporterScheduleResponseStatus {
  responseStatusId: number;
  statusName: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ContractTruckDispatchStatus {
  dispatchStatusId: number;
  statusName: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DispatchScheduleTransporter {
  dispatchScheduleId: number;
  contractId: number;
  contractNumber: string;
  dispatchScheduleTransporterId: number;
  transporterProfileId: number;
  legalName: string;
  responseStatusId: number;
  displayName: string;
  notifiedDateTime: string | null;
  offeredQuantityMT: number;
  acceptedQuantityMT: number | null;
  cancelledQuantityMT: number | null;
  negotiated: boolean;
  acceptedFreightPerMT: number | null;
  responseDateTime: string | null;
  responseRemarks: string | null;
  createdBy: number;
  firstName: string;
  createdOn: string;
  modifiedBy: number | null;
  modifiedOn: string | null;
}

export interface GetDispatchScheduleTransportersParams {
  contractId: number;
  dispatchScheduleId?: number;
}

export interface ScheduleTruckDispatchDetail {
  dispatchScheduleTransporterId: number;
  dispatchScheduleId: number;
  transporterProfileId: number;
  seller: string | null;
  buyer: string | null;
  scheduleQuantityMT: number;
  remainingQuantityMT: number;
  scheduleStatusId: number;
  scheduleDateTime: string;
  fromAddressId: number;
  toAddressId: number;
  responseStatusId: number;
  notifiedDateTime: string | null;
  offeredQuantityMT: number;
  acceptedQuantityMT: number | null;
  cancelledQuantityMT: number | null;
  negotiated: boolean;
  offeredFreightPerMT: number;
  acceptedFreightPerMT: number | null;
  responseDateTime: string | null;
  responseRemarks: string | null;
  productId: number;
  productName: string;
  buyerId: number;
  sellerId: number;
  contractId: number;
  contractNumber: string;
  loadingAddress: string;
  deliveryAddress: string;
  createdBy: number;
  createdOn: string;
}

export interface GetScheduleTrucksDispatchDetailsParams {
  contractId: number;
  transporterId: number;
}

export interface UpdateScheduleDispatchPayload {
  dispatchScheduleTransporterId: number;
  dispatchScheduleId: number;
  transporterProfileId: number;
  responseStatusId: number;
  notifiedDateTime: string;
  offeredQuantityMT: number;
  acceptedQuantityMT: number | null;
  cancelledQuantityMT: number | null;
  negotiated: boolean;
  offeredFreightPerMT: number;
  acceptedFreightPerMT: number | null;
  responseDateTime: string | null;
  responseRemarks: string;
  createdBy: number;
  createdOn: string;
  modifiedBy: number;
  modifiedOn: string;
}

export interface TruckByContract {
  contractDispatchId: number;
  contractId: number;
  contractNumber: string;
  truckAssignmentTypeId: number;
  truckAssignmentTypeName: string;
  dispatchScheduleTransporterId: number | null;
  transporterProfileId: number;
  legalName: string;
  truckId: number;
  registrationNumber: string;
  driverId: number;
  driverName: string;
  assignedOn: string;
  lrNumber: string;
  quantityMT: number;
  freightPerMT: number;
  fromAddressId: number;
  loadingAddress: string;
  toAddressId: number;
  deliveryAddress: string;
  dispatchStatusId: number;
  displayName: string;
  createdBy: number;
  firstName: string;
  createdOn: string;
}

/** One contract in a truck's chain, as returned by GetContractTruckChainOverview. */
export interface ContractTruckChainLeg {
  contractDispatchId: number;
  contractId: number;
  contractNumber: string;
  /** 0 is the head; negative is upstream, positive downstream. */
  chainPosition: number;
  chainLevel: number;
  sourceContractDispatchId: number | null;
  reassignmentDirectionId: number | null;
  reassignmentDirectionName: string | null;
  positionLabel: string;
  sellerProfileId: number;
  sellerName: string;
  buyerProfileId: number;
  buyerName: string;
  fromAddressId: number;
  loadingAddress: string;
  loadingCity: string;
  toAddressId: number;
  deliveryAddress: string;
  deliveryCity: string;
  lrNumber: string;
  quantityMT: number;
  freightPerMT: number;
  assignedOn: string;
  dispatchStatusId: number;
  dispatchStatusName: string;
  reassignedByProfileId: number | null;
  reassignedByName: string | null;
  /** Where the truck really loads and unloads, as opposed to a contract address. */
  isPhysicalLoadingPoint: boolean;
  isPhysicalUnloadingPoint: boolean;
  isOriginalArrangement: boolean;
}

/**
 * A leg as returned by GetContractTruckChain, which answers for one viewer: it carries
 * the truck and transporter on every row, the resolved ends of the trip, and the role
 * the caller holds on that leg.
 */
export interface ContractTruckChainViewerLeg extends ContractTruckChainLeg {
  rootContractDispatchId: number;
  truckAssignmentTypeId: number;
  truckAssignmentTypeName: string;
  transporterProfileId: number;
  transporterName: string;
  truckId: number;
  registrationNumber: string;
  driverId: number;
  driverName: string;
  loadingOffice: string;
  deliveryOffice: string;
  actualFromAddressId: number;
  actualLoadingAddress: string;
  actualToAddressId: number;
  actualDeliveryAddress: string;
  viewerRole: string;
  createdBy: number;
  createdOn: string;
}

export interface ContractTruckChainTruck {
  rootContractDispatchId: number;
  truckId: number;
  registrationNumber: string;
  driverId: number;
  driverName: string;
  transporterProfileId: number;
  transporterName: string;
  quantityMT: number;
  dispatchStatusId: number;
  dispatchStatusName: string;
  legCount: number;
  chainShape: string | null;
}

/** A contract address the load passes through on paper — never a stop on the road. */
export interface ContractTruckChainPassThrough {
  addressId: number;
  address: string;
  city: string;
  ownerProfileId: number;
  ownerName: string;
}

export interface ContractTruckChainTrip {
  originAddressId: number;
  originAddress: string;
  originCity: string;
  destinationAddressId: number;
  destinationAddress: string;
  destinationCity: string;
  quantityMT: number;
  isDirect: boolean;
  passThroughAddresses: ContractTruckChainPassThrough[];
}

/** What one party is shown of the chain: only the legs of contracts they are on. */
export interface ContractTruckChainParticipant {
  profileId: number;
  name: string;
  role: string;
  legCount: number;
  contracts: string[];
  loadingShown: string[];
  deliveryShown: string[];
  getsRealOrigin: boolean;
  getsRealDestination: boolean;
  isTransporter: boolean;
}

export interface ContractTruckChainDisclosure {
  firstSellerProfileId: number;
  firstSellerName: string;
  finalBuyerProfileId: number;
  finalBuyerName: string;
  originAddressSharedWithAll: boolean;
  originOwnerDisclosed: boolean;
  destinationSharedWithTradingParties: boolean;
  middleParties: string[];
}

export interface ContractTruckChainOverview {
  truck: ContractTruckChainTruck;
  legs: ContractTruckChainLeg[];
  trip: ContractTruckChainTrip;
  participants: ContractTruckChainParticipant[];
  disclosure: ContractTruckChainDisclosure;
}

/** Puts an existing dispatch onto a neighbouring contract, adding a leg to its chain. */
export interface ReassignContractTruckPayload {
  sourceContractDispatchId: number;
  targetContractId: number;
  /** The party doing the reassignment: the head seller upstream, the head buyer downstream. */
  reassignedByProfileId: number;
  loadingAddressId: number;
  deliveryAddressId: number;
  lrNumber: string;
  assignedOn: string;
  freightPerMT: number;
  createdBy: number;
}

export interface UpdateContractTruckStatusPayload {
  contractDispatchId: number;
  dispatchStatusId: number;
  modifiedBy: number;
}

export const contractTrucksApi = createApi({
  reducerPath: "contractTrucksApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),

  tagTypes: ["ContractTruck"],

  endpoints: (builder) => ({
    addContractTrucks: builder.mutation<boolean, AddContractTruckPayload>({
      query: (body) => ({
        url: "/api/ContractTrucks/AddContractTrucks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContractTruck"],
    }),

    updateContractTrucks: builder.mutation<boolean, UpdateContractTruckRequest>({
      query: ({ contractTruckId, updateContractTruck }) => ({
        url: "/api/ContractTrucks/UpdateContractTrucks",
        method: "PUT",
        params: { contractTruckId },
        body: updateContractTruck,
      }),
      invalidatesTags: ["ContractTruck"],
    }),

    // Status-only update; UpdateContractTrucks resends the whole dispatch record.
    updateContractTruckStatus: builder.mutation<boolean, UpdateContractTruckStatusPayload>({
      query: (body) => ({
        url: "/api/ContractTrucks/UpdateContractTruckStatus",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ContractTruck"],
    }),

    scheduleContractTrucks: builder.mutation<boolean, ScheduleContractTruckPayload>({
      query: (body) => ({
        url: "/api/ContractTrucks/ScheduleContractTrucks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContractTruck"],
    }),

    getTransporterScheduleResponseStatuses: builder.query<TransporterScheduleResponseStatus[], void>({
      query: () => ({
        url: "/api/ContractTrucks/GetTransporterScheduleResponseStatuses",
        method: "GET",
      }),
      transformResponse: unwrapArray<TransporterScheduleResponseStatus>,
    }),

    getScheduleTrucksDispatchDetails: builder.query<
      ScheduleTruckDispatchDetail[],
      GetScheduleTrucksDispatchDetailsParams
    >({
      query: (params) => ({
        url: "/api/ContractTrucks/GetScheduleTrucksDispatchDetails",
        method: "GET",
        params,
      }),
      transformResponse: unwrapArray<ScheduleTruckDispatchDetail>,
      providesTags: ["ContractTruck"],
    }),

    updateScheduleDispatch: builder.mutation<boolean, UpdateScheduleDispatchPayload>({
      query: (body) => ({
        url: "/api/ContractTrucks/UpdateScheduleDispatchAsync",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContractTruck"],
    }),

    // The legs one party is allowed to see, newest reassignment included.
    getContractTruckChain: builder.query<
      ContractTruckChainViewerLeg[],
      { contractDispatchId: number; requestingProfileId: number; requestingUserId: number }
    >({
      query: (params) => ({
        url: "/api/ContractTrucks/GetContractTruckChain",
        method: "GET",
        params,
      }),
      transformResponse: unwrapArray<ContractTruckChainViewerLeg>,
      providesTags: ["ContractTruck"],
    }),

    // The whole chain: truck, legs, resolved trip, who sees what, and what stays hidden.
    getContractTruckChainOverview: builder.query<
      ContractTruckChainOverview | null,
      { contractDispatchId: number; requestingUserId: number }
    >({
      query: (params) => ({
        url: "/api/ContractTrucks/GetContractTruckChainOverview",
        method: "GET",
        params,
      }),
      providesTags: ["ContractTruck"],
    }),

    reassignContractTruck: builder.mutation<boolean, ReassignContractTruckPayload>({
      query: (body) => ({
        url: "/api/ContractTrucks/ReassignContractTruck",
        method: "POST",
        body,
      }),
      // The endpoint documents no response body, so anything but an explicit false counts
      // as done — a 2xx with no body must not read as a rejection.
      transformResponse: (payload: unknown) => payload !== false,
      invalidatesTags: ["ContractTruck"],
    }),

    // Same DispatchScheduleTransporterDto body as UpdateScheduleDispatchAsync.
    cancelDispatchScheduleTransporter: builder.mutation<boolean, UpdateScheduleDispatchPayload>({
      query: (body) => ({
        url: "/api/ContractTrucks/CancelDispatchScheduleTransporter",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContractTruck"],
    }),

    getAllTrucksByContract: builder.query<TruckByContract[], { contractId: number }>({
      query: (params) => ({
        url: "/api/ContractTrucks/GetAllTrucksByContract",
        method: "GET",
        params,
      }),
      transformResponse: unwrapArray<TruckByContract>,
      providesTags: ["ContractTruck"],
    }),

    getContractTruckDispatchStatuses: builder.query<ContractTruckDispatchStatus[], void>({
      query: () => ({
        url: "/api/ContractTrucks/GetContractTruckDispatchStatuses",
        method: "GET",
      }),
      transformResponse: unwrapArray<ContractTruckDispatchStatus>,
    }),

    getDispatchScheduleTransporters: builder.query<
      DispatchScheduleTransporter[],
      GetDispatchScheduleTransportersParams
    >({
      query: (params) => ({
        url: "/api/ContractTrucks/GetDispatchScheduleTransporters",
        method: "GET",
        params,
      }),
      transformResponse: unwrapArray<DispatchScheduleTransporter>,
      providesTags: ["ContractTruck"],
    }),
  }),
});

export const {
  useAddContractTrucksMutation,
  useUpdateContractTrucksMutation,
  useUpdateContractTruckStatusMutation,
  useScheduleContractTrucksMutation,
  useGetTransporterScheduleResponseStatusesQuery,
  useGetScheduleTrucksDispatchDetailsQuery,
  useUpdateScheduleDispatchMutation,
  useCancelDispatchScheduleTransporterMutation,
  useReassignContractTruckMutation,
  useGetContractTruckChainQuery,
  useGetContractTruckChainOverviewQuery,
  useGetAllTrucksByContractQuery,
  useGetContractTruckDispatchStatusesQuery,
  useGetDispatchScheduleTransportersQuery,
} = contractTrucksApi;
