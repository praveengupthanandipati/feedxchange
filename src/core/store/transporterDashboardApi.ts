import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";
import type { DashboardAddress, DashboardContact, DashboardProfileOption } from "./businessDashboardApi";

// Shapes of the /api/TransporterDashboard endpoints (FeedXchange -> Transporter Dashboard). The server works out every figure;
// the screen only formats, filters and sorts them. Needs the TRANSPORTER_DASHBOARD permission.

export interface TransporterProfile {
  profileId: number;
  name: string;
  legalName: string | null;
  tradingName: string | null;
  profilePictureUrl: string | null;
  status: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  email: string | null;
  mobile: string | null;
  alternativeMobile: string | null;
  website: string | null;
  groupName: string | null;
  about: string | null;
  memberSince: string;
  transporterLine: string | null;
  transporterType: string | null;
  transporterSubType: string | null;
  isVerified: boolean;
  verifiedOn: string | null;
  operatingSince: string | null;
  declaredFleetCount: number | null;
  serviceDescription: string | null;
  /** Serving Locations: states goods are picked up from / delivered to. */
  sourceStates: string[];
  destinationStates: string[];
  primaryAddress: DashboardAddress | null;
  primaryContact: DashboardContact | null;
  addressCount: number;
  contactCount: number;
  bankAccountCount: number;
  documentCount: number;
  verifiedDocumentCount: number;
  userCount: number;
}

export interface TransporterSummary {
  totalTrips: number;
  tripsAssigned: number;
  tripsLoaded: number;
  tripsCancelled: number;
  /** Quantity and freight leave out cancelled trips. */
  quantityMT: number;
  loadedQuantityMT: number;
  freightEarned: number;
  freightPending: number;
  averageFreightPerMT: number;
  customerCount: number;
  routeCount: number;
  trucksUsed: number;
  driversUsed: number;
  contractCount: number;
  fleetTotal: number;
  fleetActive: number;
  fleetOnTrip: number;
  totalRequests: number;
  requestsPending: number;
  requestsAwaitingApproval: number;
  requestsAccepted: number;
  requestsRejected: number;
  requestsOther: number;
  requestsNegotiated: number;
  acceptanceRatePercent: number;
}

export interface TransporterTripStatus {
  statusName: string;
  displayName: string;
  count: number;
  quantityMT: number;
}

export interface TransporterMonth {
  /** yyyy-MM */
  month: string;
  trips: number;
  quantityMT: number;
  freight: number;
}

export interface TransporterTrip {
  contractDispatchId: number;
  contractId: number;
  contractNumber: string;
  sellerId: number;
  seller: string;
  buyerId: number;
  buyer: string;
  productName: string;
  truckNumber: string;
  truckType: string | null;
  capacity: number | null;
  driverName: string | null;
  driverMobile: string | null;
  assignmentType: string;
  assignedOn: string;
  lrNumber: string | null;
  quantityMT: number;
  freightPerMT: number;
  freightValue: number;
  fromCity: string | null;
  toCity: string | null;
  /** Assigned / Loaded / Cancelled */
  statusName: string;
  statusDisplay: string;
  trackingUrl: string | null;
  hasInvoice: boolean;
  /** The Delivery Order entered for the truck (null while the DO is pending). */
  doNumber: string | null;
  doDate: string | null;
}

export interface TransporterRequest {
  dispatchScheduleTransporterId: number;
  dispatchScheduleId: number;
  contractId: number;
  contractNumber: string;
  seller: string;
  buyer: string;
  productName: string;
  scheduleDateTime: string;
  notifiedOn: string;
  respondedOn: string | null;
  fromCity: string | null;
  toCity: string | null;
  offeredQuantityMT: number | null;
  acceptedQuantityMT: number | null;
  cancelledQuantityMT: number | null;
  offeredFreightPerMT: number | null;
  acceptedFreightPerMT: number | null;
  negotiated: boolean;
  /** Pending / Accepted / PartiallyAccepted / Rejected / Expired / Cancelled / FreightProposed */
  statusName: string;
  statusDisplay: string;
  remarks: string | null;
}

export interface TransporterTruck {
  truckId: number;
  truckNumber: string;
  truckType: string | null;
  makeModel: string | null;
  capacity: number | null;
  ownershipType: string | null;
  status: string;
  isActive: boolean;
  trackingUrl: string | null;
  trips: number;
  quantityMT: number;
  freight: number;
  lastTripOn: string | null;
  onTrip: boolean;
}

export interface TransporterCustomer {
  profileId: number;
  name: string;
  city: string | null;
  contracts: number;
  trips: number;
  quantityMT: number;
  freight: number;
  lastTripOn: string | null;
}

export interface TransporterRoute {
  fromCity: string;
  toCity: string;
  trips: number;
  quantityMT: number;
  freight: number;
  averageFreightPerMT: number;
}

export interface TransporterDashboard {
  fromDate: string | null;
  toDate: string | null;
  generatedAt: string;
  profile: TransporterProfile;
  summary: TransporterSummary;
  tripStatuses: TransporterTripStatus[];
  monthlyTrend: TransporterMonth[];
  trips: TransporterTrip[];
  requests: TransporterRequest[];
  fleet: TransporterTruck[];
  customers: TransporterCustomer[];
  routes: TransporterRoute[];
  tripsTruncated: boolean;
  requestsTruncated: boolean;
  maxRows: number;
}

export interface TransporterDashboardArgs {
  profileId?: number | null;
  /** yyyy-MM-dd, inclusive; leave out for no limit. */
  fromDate?: string | null;
  toDate?: string | null;
}

const toQuery = ({ profileId, fromDate, toDate }: TransporterDashboardArgs) => {
  const params = new URLSearchParams();
  if (profileId) params.set("profileId", String(profileId));
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  const text = params.toString();
  return text ? `?${text}` : "";
};

export const transporterDashboardApi = createApi({
  reducerPath: "transporterDashboardApi",
  baseQuery: apiBaseQuery,
  // figures change as trucks move: refetch when the screen is opened again after a while
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getTransporterDashboardProfiles: builder.query<DashboardProfileOption[], void>({ query: () => "/api/TransporterDashboard/GetProfiles" }),
    getTransporterDashboard: builder.query<TransporterDashboard, TransporterDashboardArgs>({
      query: (args) => `/api/TransporterDashboard/GetDashboard${toQuery(args)}`,
    }),
  }),
});

export const { useGetTransporterDashboardProfilesQuery, useGetTransporterDashboardQuery } = transporterDashboardApi;
