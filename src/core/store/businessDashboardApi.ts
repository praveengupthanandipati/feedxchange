import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

// Shapes of the /api/BusinessDashboard endpoints (FeedXchange -> Business Dashboard). The server works out every figure;
// the screen only formats, filters and sorts them. Needs the BUSINESS_DASHBOARD permission.

/** PendingApproval / Executing (Open, Partially Dispatched) / Executed (Dispatched, Closed) / Rejected. */
export type ContractStage = "PendingApproval" | "Executing" | "Executed" | "Rejected";
export type PartyRole = "Seller" | "Buyer";

export interface DashboardProfileOption {
  profileId: number;
  name: string;
  city: string | null;
  status: string | null;
  isOwn: boolean;
}

export interface DashboardAddress {
  officeName: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  googleLocationUrl: string | null;
}

export interface DashboardContact {
  name: string | null;
  designation: string | null;
  mobile: string | null;
  email: string | null;
}

export interface DashboardProfile {
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
  yearOfEstablishment: string | null;
  groupName: string | null;
  about: string | null;
  memberSince: string;
  businessLine: string | null;
  businessType: string | null;
  businessSubType: string | null;
  isVerified: boolean;
  verifiedOn: string | null;
  annualTurnover: number | null;
  employeeCount: number | null;
  primaryAddress: DashboardAddress | null;
  primaryContact: DashboardContact | null;
  addressCount: number;
  unloadingLocationCount: number;
  contactCount: number;
  bankAccountCount: number;
  documentCount: number;
  verifiedDocumentCount: number;
  userCount: number;
  childBusinesses: DashboardProfileOption[];
}

export interface DashboardSummary {
  totalContracts: number;
  executingContracts: number;
  executedContracts: number;
  pendingApprovalContracts: number;
  rejectedContracts: number;
  contractsAsSeller: number;
  contractsAsBuyer: number;
  /** Quantities and values cover executing + executed contracts only. */
  contractedQuantityMT: number;
  dispatchedQuantityMT: number;
  pendingQuantityMT: number;
  contractValue: number;
  salesValue: number;
  purchaseValue: number;
  fulfilmentPercent: number;
  totalTrucks: number;
  trucksAssigned: number;
  trucksLoaded: number;
  trucksCancelled: number;
  truckQuantityMT: number;
  transporterCount: number;
  productCount: number;
  counterpartyCount: number;
}

export interface DashboardStatusCount {
  statusName: string;
  displayName: string;
  stage: ContractStage | "";
  count: number;
}

export interface DashboardMonth {
  /** yyyy-MM */
  month: string;
  contracts: number;
  quantityMT: number;
  dispatchedMT: number;
  value: number;
}

export interface DashboardContract {
  contractId: number;
  contractNumber: string;
  contractDate: string;
  effectiveFrom: string;
  effectiveTo: string;
  role: PartyRole;
  counterpartyId: number;
  counterparty: string;
  counterpartyCity: string | null;
  productId: number;
  productName: string;
  totalQuantityMT: number;
  dispatchedQuantityMT: number;
  pendingQuantityMT: number;
  pricePerMT: number;
  contractValue: number;
  progressPercent: number;
  statusName: string;
  statusDisplay: string;
  stage: ContractStage | "";
  deliveryType: string | null;
  truckCount: number;
  loadedTruckCount: number;
}

export interface DashboardTruck {
  contractDispatchId: number;
  contractId: number;
  contractNumber: string;
  role: PartyRole | "";
  truckNumber: string;
  truckType: string | null;
  capacity: number | null;
  driverName: string | null;
  driverMobile: string | null;
  transporter: string | null;
  assignmentType: string;
  assignedOn: string;
  lrNumber: string | null;
  quantityMT: number;
  freightPerMT: number;
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

export interface DashboardProduct {
  productId: number;
  name: string;
  category: string | null;
  sku: string | null;
  gstPercent: number;
  inCatalog: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  isManufacturer: boolean;
  contracts: number;
  soldMT: number;
  boughtMT: number;
  dispatchedMT: number;
  value: number;
  avgPricePerMT: number | null;
  minPricePerMT: number | null;
  maxPricePerMT: number | null;
  lastTradedOn: string | null;
}

export interface BusinessDashboard {
  fromDate: string | null;
  toDate: string | null;
  generatedAt: string;
  profile: DashboardProfile;
  summary: DashboardSummary;
  contractStatuses: DashboardStatusCount[];
  monthlyTrend: DashboardMonth[];
  contracts: DashboardContract[];
  trucks: DashboardTruck[];
  products: DashboardProduct[];
  trucksTruncated: boolean;
  maxTruckRows: number;
}

export interface BusinessDashboardArgs {
  profileId?: number | null;
  /** yyyy-MM-dd, inclusive; leave out for no limit. */
  fromDate?: string | null;
  toDate?: string | null;
}

const toQuery = ({ profileId, fromDate, toDate }: BusinessDashboardArgs) => {
  const params = new URLSearchParams();
  if (profileId) params.set("profileId", String(profileId));
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  const text = params.toString();
  return text ? `?${text}` : "";
};

export const businessDashboardApi = createApi({
  reducerPath: "businessDashboardApi",
  baseQuery: apiBaseQuery,
  // figures change as trucks move: refetch when the screen is opened again after a while
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getDashboardProfiles: builder.query<DashboardProfileOption[], void>({ query: () => "/api/BusinessDashboard/GetProfiles" }),
    getBusinessDashboard: builder.query<BusinessDashboard, BusinessDashboardArgs>({
      query: (args) => `/api/BusinessDashboard/GetDashboard${toQuery(args)}`,
    }),
  }),
});

export const { useGetDashboardProfilesQuery, useGetBusinessDashboardQuery } = businessDashboardApi;
