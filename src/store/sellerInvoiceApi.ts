import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

// Shapes of the /api/SellerInvoices endpoints. The server calculates amount, GST, total and the financial year; the screens only show them.

export interface InvoiceParty {
  id: number;
  name: string;
}

export interface InvoiceContract {
  contractId: number;
  contractNumber: string;
  contractDate: string;
  sellerId: number;
  sellerName: string;
  buyerId: number;
  buyerName: string;
  productName: string;
  statusName: string;
  /** False when the contract's status does not allow new invoices. */
  canInvoice: boolean;
  totalQtyMT: number;
  invoicedQtyMT: number;
  /** Contract quantity not invoiced yet. */
  pendingQtyMT: number;
  /** The most that can still be invoiced (contract maximum less what is invoiced). */
  maxAllowedQtyMT: number;
  pricePerKg: number;
  ratePerMT: number;
  gstPercent: number;
  netRatePerMT: number;
  totalContractValue: number;
}

export interface DeductionInput {
  date: string;
  amount: number;
  isTdsTcs: boolean;
  remarks?: string;
}

export interface InvoiceRowInput {
  contractNumber: string;
  invoiceNumber: string;
  truckNumber: string;
  numberOfBags?: number | null;
  invoiceQty: number;
  totalMTs?: number | null;
  freight?: number | null;
  /** Invoice amount before GST. Left out = quantity x the contract rate; a typed value replaces it. */
  invoiceAmount?: number | null;
  /** GST amount. Left out = the product's GST % of the invoice amount; a typed value replaces it. */
  gstAmount?: number | null;
  /** Left out = the server rounds the total to the nearest rupee. */
  roundOff?: number | null;
  remarks?: string;
  deductions: DeductionInput[];
}

export interface SaveInvoicesPayload {
  invoiceDate: string;
  rows: InvoiceRowInput[];
}

export interface InvoiceDeduction {
  deductionId: number;
  date: string;
  amount: number;
  isTdsTcs: boolean;
  remarks: string | null;
}

export interface Invoice {
  invoiceId: number;
  contractId: number;
  contractNumber: string;
  sellerId: number;
  sellerName: string;
  buyerId: number;
  buyerName: string;
  productName: string;
  invoiceNumber: string;
  invoiceDate: string;
  financialYear: string;
  truckNumber: string | null;
  numberOfBags: number | null;
  invoiceQty: number;
  totalMTs: number;
  ratePerMT: number;
  invoiceAmount: number;
  gstPercent: number | null;
  gstAmount: number;
  roundOff: number;
  totalAmount: number;
  freightAmount: number;
  deductionsTotal: number;
  tdsTcsTotal: number;
  netAmount: number;
  payableAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: "Pending" | "Partially Paid" | "Paid" | "Cancelled";
  remarks: string | null;
  /** Pending or Partially Paid: can still be edited. Paid and Cancelled invoices are locked. */
  isEditable: boolean;
  /** Pending with no payment made. */
  isCancellable: boolean;
  createdOn: string;
  modifiedOn: string | null;
  deductions: InvoiceDeduction[];
}

export interface InvoiceListQuery {
  financialYear?: string;
  sellerId?: number;
  buyerId?: number;
  contractNumber?: string;
  /** Uncleared | Pending | Partially Paid | Paid | Cancelled. Empty = everything except cancelled. */
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface InvoiceListResult {
  items: Invoice[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateInvoicePayload {
  invoiceId: number;
  invoiceDate: string;
  invoiceNumber: string;
  truckNumber: string;
  numberOfBags?: number | null;
  invoiceQty: number;
  totalMTs?: number | null;
  freight?: number | null;
  invoiceAmount?: number | null;
  gstAmount?: number | null;
  roundOff?: number | null;
  remarks?: string;
  /** The complete list of deductions the invoice should have (replaces the old list). */
  deductions: DeductionInput[];
}

export const sellerInvoiceApi = createApi({
  reducerPath: "sellerInvoiceApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Invoices", "Contracts"],
  endpoints: (builder) => ({
    getInvoiceSellers: builder.query<InvoiceParty[], void>({ query: () => "/api/SellerInvoices/GetSellers", providesTags: ["Contracts"] }),
    getInvoiceBuyers: builder.query<InvoiceParty[], void>({ query: () => "/api/SellerInvoices/GetBuyers", providesTags: ["Contracts"] }),
    getInvoiceContracts: builder.query<InvoiceContract[], { sellerId?: number; buyerId?: number }>({
      query: ({ sellerId, buyerId }) => {
        const params = new URLSearchParams();
        if (sellerId) params.set("sellerId", String(sellerId));
        if (buyerId) params.set("buyerId", String(buyerId));
        return `/api/SellerInvoices/GetContracts?${params.toString()}`;
      },
      providesTags: ["Contracts"],
    }),
    getInvoiceContractDetails: builder.query<InvoiceContract, string>({
      query: (contractNumber) => `/api/SellerInvoices/GetContractDetails?contractNumber=${encodeURIComponent(contractNumber)}`,
      providesTags: ["Contracts"],
    }),
    saveInvoices: builder.mutation<{ invoices: Invoice[] }, SaveInvoicesPayload>({
      query: (body) => ({ url: "/api/SellerInvoices/SaveInvoices", method: "POST", body }),
      invalidatesTags: ["Invoices", "Contracts"],
    }),
    getInvoices: builder.query<InvoiceListResult, InvoiceListQuery>({
      query: (q) => {
        const params = new URLSearchParams();
        Object.entries(q).forEach(([k, v]) => v !== undefined && v !== "" && params.set(k, String(v)));
        return `/api/SellerInvoices/GetInvoices?${params.toString()}`;
      },
      providesTags: ["Invoices"],
    }),
    getInvoiceFinancialYears: builder.query<string[], void>({ query: () => "/api/SellerInvoices/GetFinancialYears", providesTags: ["Invoices"] }),
    updateInvoice: builder.mutation<Invoice, UpdateInvoicePayload>({
      query: (body) => ({ url: "/api/SellerInvoices/UpdateInvoice", method: "POST", body }),
      invalidatesTags: ["Invoices", "Contracts"],
    }),
    cancelInvoice: builder.mutation<Invoice, { invoiceId: number; reason?: string }>({
      query: (body) => ({ url: "/api/SellerInvoices/CancelInvoice", method: "POST", body }),
      invalidatesTags: ["Invoices", "Contracts"],
    }),
  }),
});

export const {
  useGetInvoiceSellersQuery,
  useGetInvoiceBuyersQuery,
  useGetInvoiceContractsQuery,
  useLazyGetInvoiceContractsQuery,
  useLazyGetInvoiceContractDetailsQuery,
  useGetInvoiceContractDetailsQuery,
  useSaveInvoicesMutation,
  useLazyGetInvoicesQuery,
  useGetInvoicesQuery,
  useGetInvoiceFinancialYearsQuery,
  useUpdateInvoiceMutation,
  useCancelInvoiceMutation,
} = sellerInvoiceApi;

/** Message to show for a failed call (the API puts validation messages in errors.ErrorMessage or detail). */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  const e = error as { data?: { message?: string; detail?: string; title?: string; errors?: Record<string, string[]> } };
  return e?.data?.errors?.ErrorMessage?.[0] || e?.data?.message || e?.data?.detail || e?.data?.title || fallback;
}
