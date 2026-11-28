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
  contractDate: string;
  statusName: string;
  totalQtyMT: number;
  ratePerMT: number;
  gstPercent: number;
  netRatePerMT: number;
  totalContractValue: number;
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
  /** Advance only: moved to regular payments. */
  convertedAmount: number;
  unallocatedAmount: number;
  /** Receipts of one split payment share this id; groupPartCount > 1 means the payment was split. */
  paymentGroupId: string | null;
  groupPartCount: number;
  groupTotalAmount: number | null;
  /** A regular payment made by converting an advance: that advance receipt (and its contract). */
  convertedFromReceiptId: number | null;
  convertedFromReceiptNumber: string | null;
  convertedFromContractNumber: string | null;
  towards: string | null;
  remarks: string | null;
  status: string;
  canDelete: boolean;
}

/** One part of a split payment: an advance for one contract or the regular part; an amount OR a percent (the regular part may be left empty = the balance). */
export interface ReceiptSplitPayload {
  kind: ReceiptKind;
  contractId?: number | null;
  amount?: number | null;
  percent?: number | null;
}

export interface SaveSplitPaymentPayload {
  sellerId: number;
  buyerId: number;
  /** yyyy-MM-dd */
  receiptDate: string;
  paymentMode: ReceiptMode;
  reference?: string;
  bankName?: string;
  /** The whole payment. */
  amount: number;
  towards?: string;
  remarks?: string;
  splits: ReceiptSplitPayload[];
}

export interface ConvertAdvancePayload {
  receiptId: number;
  amount: number;
  remarks?: string;
}

/** An advance converted (partly) to a regular payment. */
export interface AdvanceConversion {
  conversionId: number;
  fromReceiptId: number;
  fromReceiptNumber: string;
  toReceiptId: number;
  toReceiptNumber: string;
  contractId: number | null;
  contractNumber: string | null;
  amount: number;
  convertedOn: string;
  remarks: string | null;
  /** Active | Reversed (the regular payment was deleted, so the money is advance again). */
  status: string;
  /** How much of the new regular payment has been allocated to invoices. */
  toAllocatedAmount: number;
}

/** Where part of a receipt's money went. */
export interface PartAllocation {
  allocationId: number;
  invoiceId: number;
  invoiceNumber: string;
  contractNumber: string;
  /** Payment (cash) | Advance */
  allocationType: string;
  amount: number;
  allocatedOn: string;
}

export interface PaymentPart {
  receipt: Receipt;
  allocations: PartAllocation[];
}

/** One whole payment: what was received, its parts, and what was done with each part. */
export interface PaymentDetail {
  anchorReceiptId: number;
  sellerId: number;
  buyerId: number;
  receiptDate: string;
  paymentMode: ReceiptMode;
  reference: string | null;
  bankName: string | null;
  towards: string | null;
  remarks: string | null;
  totalAmount: number;
  parts: PaymentPart[];
  /** Regular payments made by converting an advance of this payment. */
  convertedParts: PaymentPart[];
}

export interface UpdatePaymentPartPayload {
  /** An existing part to change; empty = a new part. */
  receiptId?: number | null;
  kind: ReceiptKind;
  contractId?: number | null;
  amount: number;
}

export interface UpdatePaymentPayload {
  /** Any receipt of the payment. */
  receiptId: number;
  /** yyyy-MM-dd */
  receiptDate: string;
  paymentMode: ReceiptMode;
  reference?: string;
  bankName?: string;
  amount: number;
  towards?: string;
  remarks?: string;
  parts: UpdatePaymentPartPayload[];
  /** Allow the allocations of changed or removed parts to be deleted. */
  reverseAllocations?: boolean;
}

export interface CancelPaymentPayload {
  receiptId: number;
  reverseAllocations?: boolean;
  reason?: string;
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
  /** Manual advance adjustment per invoice; when any line is sent the contract advance % is not used. */
  advanceAllocations?: { invoiceId: number; amount: number }[];
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
  sellerId: number;
  buyerId: number;
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
  tagTypes: ["Receipts", "InvoicesToClear", "Refunds", "Conversions"],
  endpoints: (builder) => ({
    getPaymentSellers: builder.query<PaymentParty[], void>({ query: () => "/api/PaymentAdvice/GetSellers" }),
    getPaymentBuyers: builder.query<PaymentParty[], number | undefined>({
      query: (sellerId) => `/api/PaymentAdvice/GetBuyers${sellerId ? `?sellerId=${sellerId}` : ""}`,
    }),
    getAdvanceContracts: builder.query<AdvanceContract[], PairArgs>({
      query: ({ sellerId, buyerId }) => `/api/PaymentAdvice/GetAdvanceContracts?sellerId=${sellerId}&buyerId=${buyerId}`,
    }),
    /** The pair's receipts with money left to allocate; `includeFullyAllocated` lists every receipt (View Payment Advices). */
    getReceipts: builder.query<Receipt[], PairArgs & { includeFullyAllocated?: boolean }>({
      query: ({ sellerId, buyerId, includeFullyAllocated }) =>
        `/api/PaymentAdvice/GetReceipts?sellerId=${sellerId}&buyerId=${buyerId}${includeFullyAllocated ? "&includeFullyAllocated=true" : ""}`,
      providesTags: ["Receipts"],
    }),
    /** View Payment Advices: receipts in a date range; seller and buyer are optional. Without includeFullyAllocated only those with money left. */
    searchReceipts: builder.query<Receipt[], { sellerId?: number; buyerId?: number; from?: string; to?: string; includeFullyAllocated?: boolean }>({
      query: (q) => {
        const params = new URLSearchParams();
        Object.entries(q).forEach(([k, v]) => v !== undefined && v !== "" && v !== false && params.set(k, String(v)));
        return `/api/PaymentAdvice/SearchReceipts?${params.toString()}`;
      },
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
    /** One payment divided into advances for several contracts and / or a regular part (one receipt per part). */
    saveSplitPayment: builder.mutation<Receipt[], SaveSplitPaymentPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/SaveSplitPayment", method: "POST", body }),
      invalidatesTags: ["Receipts"],
    }),
    /** Moves unallocated advance to a regular payment (a new receipt) that can be allocated to any invoice. */
    convertAdvance: builder.mutation<Receipt, ConvertAdvancePayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/ConvertAdvance", method: "POST", body }),
      invalidatesTags: ["Receipts", "Conversions"],
    }),
    getPayment: builder.query<PaymentDetail, number>({
      query: (receiptId) => `/api/PaymentAdvice/GetPayment?receiptId=${receiptId}`,
      providesTags: ["Receipts"],
    }),
    /** Edits a whole payment: its details and every part (change, remove, add). */
    updatePayment: builder.mutation<PaymentDetail, UpdatePaymentPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/UpdatePayment", method: "POST", body }),
      invalidatesTags: ["Receipts", "Conversions", "InvoicesToClear"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(sellerInvoiceApi.util.invalidateTags(["Invoices", "Contracts"]));
        } catch {
          /* nothing changed */
        }
      },
    }),
    /** Cancels a whole payment; its allocations are deleted when reverseAllocations is true. */
    cancelPayment: builder.mutation<void, CancelPaymentPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/CancelPayment", method: "POST", body }),
      invalidatesTags: ["Receipts", "Conversions", "InvoicesToClear"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(sellerInvoiceApi.util.invalidateTags(["Invoices", "Contracts"]));
        } catch {
          /* nothing changed */
        }
      },
    }),
    getConversions: builder.query<AdvanceConversion[], { sellerId?: number; buyerId?: number }>({
      query: ({ sellerId, buyerId }) => {
        const params = new URLSearchParams();
        if (sellerId) params.set("sellerId", String(sellerId));
        if (buyerId) params.set("buyerId", String(buyerId));
        return `/api/PaymentAdvice/GetConversions?${params.toString()}`;
      },
      providesTags: ["Conversions"],
    }),
    updateReceipt: builder.mutation<Receipt, UpdateReceiptPayload>({
      query: (body) => ({ url: "/api/PaymentAdvice/UpdateReceipt", method: "POST", body }),
      invalidatesTags: ["Receipts"],
    }),
    deleteReceipt: builder.mutation<void, number>({
      query: (receiptId) => ({ url: `/api/PaymentAdvice/DeleteReceipt/${receiptId}`, method: "POST" }),
      invalidatesTags: ["Receipts", "Conversions"],
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
    /** View Refunds: refunds in a date range (refund date); seller and buyer are optional. */
    searchRefunds: builder.query<Refund[], { sellerId?: number; buyerId?: number; from?: string; to?: string }>({
      query: (q) => {
        const params = new URLSearchParams();
        Object.entries(q).forEach(([k, v]) => v !== undefined && v !== "" && params.set(k, String(v)));
        return `/api/PaymentAdvice/SearchRefunds?${params.toString()}`;
      },
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
  useSearchReceiptsQuery,
  useGetInvoicesToClearQuery,
  useSaveReceiptMutation,
  useSaveSplitPaymentMutation,
  useConvertAdvanceMutation,
  useGetConversionsQuery,
  useLazyGetPaymentQuery,
  useUpdatePaymentMutation,
  useCancelPaymentMutation,
  useUpdateReceiptMutation,
  useDeleteReceiptMutation,
  useApplyAllocationMutation,
  useGetRefundSellersQuery,
  useGetRefundBuyersQuery,
  useGetRefundableReceiptsQuery,
  useGetRefundsQuery,
  useSearchRefundsQuery,
  useSaveRefundMutation,
  useCancelRefundMutation,
} = paymentAdviceApi;
