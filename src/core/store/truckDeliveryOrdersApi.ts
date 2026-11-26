import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

// Shapes of the /api/TruckDeliveryOrders endpoints (Re-assign Truck screen): the seller's contracts with trucks that have no Delivery Order (DO) yet,
// and entering the DO against a truck. The DO is copied to every leg of the truck's re-assignment chain by the server.

export interface DoTruck {
  contractDispatchId: number;
  truckNumber: string;
  truckType: string | null;
  driverName: string | null;
  driverMobile: string | null;
  transporterId: number;
  transporter: string;
  quantityMT: number;
  lrNumber: string | null;
  assignedOn: string;
  fromCity: string | null;
  toCity: string | null;
  /** This leg was created by re-assigning the truck from another contract. */
  isReassigned: boolean;
  /** How many contracts the truck serves (1 = not re-assigned). */
  chainLegs: number;
  doNumber: string | null;
  doDate: string | null;
  doMessage: string | null;
  doEnteredOn: string | null;
}

export interface DoContract {
  contractId: number;
  contractNumber: string;
  contractDate: string;
  sellerId: number;
  seller: string;
  buyerId: number;
  buyer: string;
  productId: number;
  productName: string;
  totalQuantityMT: number;
  trucks: DoTruck[];
}

export interface EnterDoPayload {
  contractDispatchId: number;
  doNumber: string;
  /** yyyy-MM-dd */
  doDate: string;
  doMessage?: string;
}

export interface DoEntered {
  doNumber: string;
  /** How many legs of the truck's chain now carry the DO. */
  legsUpdated: number;
  /** The contracts of those legs. */
  contracts: string[];
  notifiedTransporters: number;
}

export const truckDeliveryOrdersApi = createApi({
  reducerPath: "truckDeliveryOrdersApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["DoContracts"],
  endpoints: (builder) => ({
    getDoContracts: builder.query<DoContract[], { issued: boolean; profileId?: number | null }>({
      query: ({ issued, profileId }) =>
        `/api/TruckDeliveryOrders/Contracts?issued=${issued}${profileId ? `&profileId=${profileId}` : ""}`,
      providesTags: ["DoContracts"],
    }),
    enterDeliveryOrder: builder.mutation<DoEntered, EnterDoPayload>({
      query: (body) => ({ url: "/api/TruckDeliveryOrders/Enter", method: "POST", body }),
      invalidatesTags: ["DoContracts"],
    }),
  }),
});

export const { useGetDoContractsQuery, useEnterDeliveryOrderMutation } = truckDeliveryOrdersApi;
