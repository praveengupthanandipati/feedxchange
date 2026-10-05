import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";
import { sellerInvoiceApi } from "./sellerInvoiceApi";

// Shapes of the /api/PaymentAdvice endpoints: receipts (payments and advances), the uncleared invoices of a seller and buyer, and the allocation.

export interface PaymentParty {
  id: number;
  name: string;
}

export interface AdvanceContract {
  contractId: number;
  contractNumber: string;
  productName: string;
  immediateAdvancePercent: number;
  balanceAdvancePercent: number;
  /** Immediate + balance: the share of every invoice that is adjusted from the advance. */
  advancePercent: number;
}

export type ReceiptKind = "Regular" | "Advance";
export type ReceiptMode = "Online" | "Cheque" | "Cash" | "None";

export interface Receipt {
  receiptId: number;
  receiptNumber: string;
  sellerId: number;
  buyerId: number;
  kind: ReceiptKind;
  contractId: number | null;
  contractNumber: string | null;
  receiptDate: string;
  paymentMode: ReceiptMode;
  reference: string | null;
  bankName: string | null;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  towards: string | null;
  remarks: string | null;
  status: string;
  canDelete: boolean;
}

export interface SaveReceiptPayload {
  sellerId: number;
  buyerId: number;
  kind: ReceiptKind;
  contractId: number | null;
  /** yyyy-MM-dd */
  receiptDate: string;
  paymentMode: ReceiptMode;
  reference?: string;
  bankName?: string;
  amount: number;
  towards?: string;
  remarks?: string;
}

export interface UpdateReceiptPayload extends SaveReceiptPayload {
  receiptId: number;
}

export interface InvoiceToClear {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  contractId: number;
  contractNumber: string;
  productName: string;
  /** Total - deductions. */
  payableAmount: number;
  /** Cash already paid (earlier payments and allocations). */
  paidAmount: number;
  advanceAdjusted: number;
  balanceAmount: number;
  /** The contract advance %. */
  advancePercent: number;
}

export interface ApplyAllocationPayload {
  sellerId: number;
  buyerId: number;
  adjustAdvance: boolean;
  receiptIds: number[];
  allocations: { invoiceId: number; amount: number }[];
}

export interface ApplyAllocationResult {
  batchId: string;
  cashAllocated: number;
  advanceAdjusted: number;
  invoices: { invoiceId: number; invoiceNumber: string; cashAllocated: number; advanceAdjusted: number; balanceAmount: number; status: string }[];
}

interface PairArgs {
  sellerId: number;
  buyerId: number;
}

export const paymentAdviceApi = createApi({
  reducerPath: "paymentAdviceApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Receipts", "InvoicesToClear"],
  endpoints: (builder) => ({
    getPaymentSellers: builder.query<PaymentParty[], void>({ query: () => "/api/PaymentAdvice/GetSellers" }),
    getPaymentBuyers: builder.query<PaymentParty[], number | undefined>({
      query: (sellerId) => `/api/PaymentAdvice/GetBuyers${sellerId ? `?sellerId=${sellerId}` : ""}`,
    }),
    getAdvanceContracts: builder.query<AdvanceContract[], PairArgs>({
      query: ({ sellerId, buyerId }) => `/api/PaymentAdvice/GetAdvanceContracts?sellerId=${sellerId}&buyerId=${buyerId}`,
    }),
    getReceipts: builder.query<Receipt[], PairArgs>({
      query: ({ sellerId, buyerId }) => `/api/PaymentAdvice/GetReceipts?sellerId=${sellerId}&buyerId=${buyerId}`,
      providesTags: ["Receipts"],
    }),
    getInvoicesToClear: builder.query<InvoiceToClear[], PairArgs>({
      query: ({ sellerId, buyerId }) => `/api/PaymentAdvice/GetInvoicesToClear?sellerId=${sellerId}&buyerId=${buyerId}`,
      providesTags: ["InvoicesToClear"],
    }),
    saveReceipt: builder.mutation<Receipt, SaveReceiptPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/SaveReceipt", method: "POST", body }),
      invalidatesTags: ["Receipts"],
    }),
    updateReceipt: builder.mutation<Receipt, UpdateReceiptPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/UpdateReceipt", method: "POST", body }),
      invalidatesTags: ["Receipts"],
    }),
    deleteReceipt: builder.mutation<void, number>({
      query: (receiptId) => ({ url: `/api/PaymentAdvice/DeleteReceipt/${receiptId}`, method: "POST" }),
      invalidatesTags: ["Receipts"],
    }),
    applyAllocation: builder.mutation<ApplyAllocationResult, ApplyAllocationPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/ApplyAllocation", method: "POST", body }),
      invalidatesTags: ["Receipts", "InvoicesToClear"],
      // the seller invoice screens show what has been paid, so they must read it again
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(sellerInvoiceApi.util.invalidateTags(["Invoices"]));
        } catch {
          /* the page shows the error */
        }
      },
    }),
  }),
});

export const {
  useGetPaymentSellersQuery,
  useGetPaymentBuyersQuery,
  useGetAdvanceContractsQuery,
  useGetReceiptsQuery,
  useGetInvoicesToClearQuery,
  useSaveReceiptMutation,
  useUpdateReceiptMutation,
  useDeleteReceiptMutation,
  useApplyAllocationMutation,
} = paymentAdviceApi;
