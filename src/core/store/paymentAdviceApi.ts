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
  /** Given back to the buyer. */
  refundedAmount: number;
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

export interface SaveRefundPayload {
  sellerId: number;
  buyerId: number;
  /** yyyy-MM-dd */
  refundDate: string;
  paymentMode: ReceiptMode;
  reference?: string;
  remarks?: string;
  lines: { receiptId: number; amount: number }[];
}

export interface Refund {
  refundId: number;
  receiptId: number;
  receiptNumber: string;
  contractId: number | null;
  contractNumber: string | null;
  refundDate: string;
  paymentMode: ReceiptMode;
  reference: string | null;
  amount: number;
  remarks: string | null;
  status: string;
}

interface PairArgs {
  sellerId: number;
  buyerId: number;
}

export const paymentAdviceApi = createApi({
  reducerPath: "paymentAdviceApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Receipts", "InvoicesToClear", "Refunds"],
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
    getRefundSellers: builder.query<PaymentParty[], void>({ query: () => "/api/PaymentAdvice/GetRefundSellers" }),
    getRefundBuyers: builder.query<PaymentParty[], number | undefined>({
      query: (sellerId) => `/api/PaymentAdvice/GetRefundBuyers${sellerId ? `?sellerId=${sellerId}` : ""}`,
    }),
    getRefundableReceipts: builder.query<Receipt[], PairArgs>({
      query: ({ sellerId, buyerId }) => `/api/PaymentAdvice/GetRefundableReceipts?sellerId=${sellerId}&buyerId=${buyerId}`,
      providesTags: ["Refunds"],
    }),
    getRefunds: builder.query<Refund[], PairArgs>({
      query: ({ sellerId, buyerId }) => `/api/PaymentAdvice/GetRefunds?sellerId=${sellerId}&buyerId=${buyerId}`,
      providesTags: ["Refunds"],
    }),
    saveRefund: builder.mutation<Refund[], SaveRefundPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/SaveRefund", method: "POST", body }),
      invalidatesTags: ["Refunds", "Receipts"],
    }),
    cancelRefund: builder.mutation<void, number>({
      query: (refundId) => ({ url: `/api/PaymentAdvice/CancelRefund/${refundId}`, method: "POST" }),
      invalidatesTags: ["Refunds", "Receipts"],
    }),
    applyAllocation: builder.mutation<ApplyAllocationResult, ApplyAllocationPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/ApplyAllocation", method: "POST", body }),
      invalidatesTags: ["Receipts", "InvoicesToClear", "Refunds"],
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
  useGetRefundSellersQuery,
  useGetRefundBuyersQuery,
  useGetRefundableReceiptsQuery,
  useGetRefundsQuery,
  useSaveRefundMutation,
  useCancelRefundMutation,
} = paymentAdviceApi;
