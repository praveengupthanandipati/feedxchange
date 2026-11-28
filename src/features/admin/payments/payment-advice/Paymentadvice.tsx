import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { amountInWords } from "../../../../shared/utils/amountInWords";
import { DATE_PRESETS, presetRange } from "../dateRanges";
import { useProfileCities, withCity } from "../../../../shared/hooks/useProfileCities";
import {
  type IconComponent,
  CheckIcon,
  CircleAlertIcon,
  CircleCheckBigIcon,
  CircleMinusIcon,
  ListChecksIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DollarSignIcon,
  FileTextIcon,
  SearchIcon,
  SquarePenIcon,
  Trash2Icon,
  XIcon,
  ZapIcon,
} from "../../../../shared/components/icon";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { Badge, Input, Select } from "../../../../shared/components/ui";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import {
  useApplyAllocationMutation,
  useDeleteReceiptMutation,
  useGetAdvanceContractsQuery,
  useGetInvoicesToClearQuery,
  useGetPaymentBuyersQuery,
  useGetPaymentSellersQuery,
  useGetReceiptsQuery,
  useSearchReceiptsQuery,
  useSaveReceiptMutation,
  useLazyGetPaymentQuery,
  useUpdatePaymentMutation,
  useCancelPaymentMutation,
  type PaymentDetail,
  useSaveSplitPaymentMutation,
  useUpdateReceiptMutation,
  type InvoiceToClear,
  type Receipt,
  type SaveReceiptPayload,
} from "../../../../core/store/paymentAdviceApi";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";
import SplitPaymentEditor from "./SplitPaymentEditor";
import ConvertAdvanceDialog from "./ConvertAdvanceDialog";
import AdvanceConversionsPanel from "./AdvanceConversionsPanel";
import {
  createEmptyPaymentForm,
  createEmptySplit,
  editImpact,
  formFromDetail,
  splitFromDetail,
  groupPartLabel,
  resolveSplit,
  splitPayload,
  type SplitState,
  invoiceBalance,
  modeFields,
  money,
  paymentModeLabels,
  paymentModes,
  planAdvance,
  receiptUnallocated,
  round2,
  shortDate,
  toApiMode,
  validatePaymentForm,
  type PaymentFieldKey,
  type PaymentFormErrors,
  type PaymentFormValues,
  type PaymentKind,
  type PaymentMode,
} from "./paymentAdvice.data";
// the dashboards' table toolbar (bd-toolbar) styles
import "../../business-dashboard/BusinessDashboard.scss";
import "./Paymentadvice.scss";
import { useNotifyPrompt } from "../../../../shared/notifications/useNotifyPrompt";
import LookupLoadError from "../../../../shared/components/feedback/LookupLoadError";

const modeIcons: Record<PaymentMode, IconComponent> = {
  online: CreditCardIcon,
  cheque: FileTextIcon,
  cash: DollarSignIcon,
  none: CircleMinusIcon,
};

const dash = (value: string | null | undefined) => value || "-";
const num = (value: string) => {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};
const NO_RECEIPTS: Receipt[] = [];
const NO_INVOICES: InvoiceToClear[] = [];

/**
 * Contracts Invoices & Payments > Add Payment Advice (mode "add": enter payments, then allocate the unallocated receipts to invoices) and
 * View Payment Advices (mode "view": every receipt of the seller and buyer, allocated or not, to edit or delete; the form opens only to edit).
 */
/** A row of the View table: one receipt, or one whole split payment (its parts are in `members`, the figures are the sums of the parts). */
type ViewRow = Receipt & { members?: Receipt[] };

const ALL = "__all";

const Paymentadvice = ({ mode: pageMode = "add" }: { mode?: "add" | "view" }) => {
  const isView = pageMode === "view";
  const navigate = useNavigate();
  // "Allocate" on View Payment Advices opens this page with the receipt's seller and buyer already chosen
  const [searchParams] = useSearchParams();
  const [sellerId, setSellerId] = useState(() => (pageMode === "add" ? (searchParams.get("seller") ?? "") : ""));
  const [buyerId, setBuyerId] = useState(() => (pageMode === "add" ? (searchParams.get("buyer") ?? "") : ""));
  const allocationRef = useRef<HTMLElement>(null);
  // one payment split over several contracts (advances) and / or a regular part
  const [split, setSplit] = useState<SplitState>(() => createEmptySplit());
  const [splitTried, setSplitTried] = useState(false);
  // the advance receipt being converted to a regular payment
  const [convertTarget, setConvertTarget] = useState<Receipt | null>(null);
  // editing a whole payment (all its parts), and cancelling it
  const [editingDetail, setEditingDetail] = useState<PaymentDetail | null>(null);
  const [reverseConfirm, setReverseConfirm] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReverse, setCancelReverse] = useState(false);
  const scrolledToAllocation = useRef(false);
  const [partyError, setPartyError] = useState(false);

  // ---- 1. the payment form
  const [values, setValues] = useState<PaymentFormValues>(() => createEmptyPaymentForm());
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const [rowPendingDelete, setRowPendingDelete] = useState<Receipt | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  // ---- 3. the allocation being prepared
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [alloc, setAlloc] = useState<Record<number, string>>({});
  // Advance: adjusted automatically by the contract's advance %, typed by hand per invoice, or not at all
  const [advanceMode, setAdvanceMode] = useState<"auto" | "manual" | "none">("auto");
  const adjustAdvance = advanceMode === "auto";
  const [advManual, setAdvManual] = useState<Record<number, string>>({});
  const [applyTried, setApplyTried] = useState(false);

  const formRef = useRef<HTMLElement>(null);

  // ---- View Payment Advices: the table's own search and filters
  const [viewSearch, setViewSearch] = useState("");
  const [viewKind, setViewKind] = useState<"all" | "Regular" | "Advance">("all");
  const [viewMode, setViewMode] = useState<"all" | "Online" | "Cheque" | "Cash" | "None">("all");
  // the date filter comes first; seller and buyer are optional filters; by default only receipts with money left to allocate
  const [datePreset, setDatePreset] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [allocFilter, setAllocFilter] = useState<"all" | "allocated" | "unallocated" | "refunded">("unallocated");
  const dateRange = datePreset === "custom" ? { from: customFrom || undefined, to: customTo || undefined } : presetRange(datePreset);

  // ---- data from the API
  const seller = sellerId ? Number(sellerId) : 0;
  const buyer = buyerId ? Number(buyerId) : 0;
  const { data: sellers = [], isError: sellersFailed } = useGetPaymentSellersQuery();
  // currentData: the buyers of THIS seller (undefined while they load, instead of the previous seller's list).
  const { data: buyers = [], currentData: sellerBuyers, isError: buyersFailed } = useGetPaymentBuyersQuery(seller || undefined);
  // Only a pair the API knows: a business can't be its own buyer, and the buyer must trade with this seller
  // (otherwise it answers 400 "These two parties…", e.g. while the seller's buyer list is still loading).
  // A receipt opened for editing keeps its own pair as before.
  const hasPair =
    seller > 0 && buyer > 0 && seller !== buyer && (editingId !== null || Boolean(sellerBuyers?.some((b) => b.id === buyer)));
  const pairArgs = { sellerId: seller, buyerId: buyer };
  const { data: contracts = [] } = useGetAdvanceContractsQuery(pairArgs, { skip: !hasPair });
  const { data: pairReceipts = NO_RECEIPTS, isFetching: pairLoading } = useGetReceiptsQuery(pairArgs, { skip: !hasPair || isView });
  const { data: searchedReceipts = NO_RECEIPTS, isFetching: searchLoading } = useSearchReceiptsQuery(
    {
      sellerId: seller || undefined,
      buyerId: buyer || undefined,
      from: dateRange.from,
      to: dateRange.to,
      includeFullyAllocated: allocFilter !== "unallocated",
    },
    { skip: !isView, refetchOnMountOrArgChange: true },
  );
  const openReceiptsData = isView ? searchedReceipts : pairReceipts;
  const receiptsLoading = isView ? searchLoading : pairLoading;
  const { data: invoicesData = NO_INVOICES, isFetching: invoicesLoading } = useGetInvoicesToClearQuery(pairArgs, { skip: !hasPair || isView });
  const [saveReceipt, { isLoading: saving }] = useSaveReceiptMutation();
  const [saveSplitPayment, { isLoading: savingSplit }] = useSaveSplitPaymentMutation();
  const [loadPayment] = useLazyGetPaymentQuery();
  const [updatePayment, { isLoading: updatingPayment }] = useUpdatePaymentMutation();
  const [cancelPayment, { isLoading: cancellingPayment }] = useCancelPaymentMutation();
  const notify = useNotifyPrompt();
  const [updateReceipt, { isLoading: updating }] = useUpdateReceiptMutation();
  const [deleteReceipt] = useDeleteReceiptMutation();
  const [applyAllocation, { isLoading: applying }] = useApplyAllocationMutation();

  // Sellers and buyers are shown as "Name, City".
  const { cityOf } = useProfileCities();
  const sellerOptions = useMemo(() => sellers.map((p) => ({ value: String(p.id), label: withCity(p.name, cityOf(p.id)) })), [sellers, cityOf]);
  const buyerOptions = useMemo(
    () => buyers.filter((p) => String(p.id) !== sellerId).map((p) => ({ value: String(p.id), label: withCity(p.name, cityOf(p.id)) })),
    [buyers, sellerId, cityOf],
  );

  // nothing is pre-selected: the user chooses the seller, then the buyer
  // opened from "Allocate": once the receipts have loaded, scroll down to the allocation section
  useEffect(() => {
    if (isView || scrolledToAllocation.current || !searchParams.get("receipt") || !hasPair || receiptsLoading) return;
    scrolledToAllocation.current = true;
    window.setTimeout(() => allocationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [isView, hasPair, receiptsLoading, searchParams]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.error ? 6000 : 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // a different seller / buyer starts a fresh allocation
  useEffect(() => {
    setAlloc({});
    setAdvManual({});
    setExcluded(new Set());
    setApplyTried(false);
  }, [sellerId, buyerId]);

  /** Receipts that still have money to allocate (a fully allocated receipt is not listed by the API). */
  const openReceipts = useMemo(() => {
    const byDate = (a: Receipt, b: Receipt) => a.receiptDate.localeCompare(b.receiptDate) || a.receiptId - b.receiptId;
    const sorted = [...openReceiptsData].sort(byDate);
    // the receipts of one split payment stay together, where the first of them would have been
    const firstOfGroup = new Map<string, number>();
    sorted.forEach((r, i) => {
      if (r.paymentGroupId && !firstOfGroup.has(r.paymentGroupId)) firstOfGroup.set(r.paymentGroupId, i);
    });
    const position = (r: Receipt, i: number) => (r.paymentGroupId ? (firstOfGroup.get(r.paymentGroupId) ?? i) : i);
    return sorted.map((r, i) => ({ r, i })).sort((x, y) => position(x.r, x.i) - position(y.r, y.i) || x.i - y.i).map((x) => x.r);
  }, [openReceiptsData]);
  const regularReceipts = openReceipts.filter((r) => r.kind === "Regular");
  const advanceReceipts = openReceipts.filter((r) => r.kind === "Advance");
  const regularPool = round2(regularReceipts.filter((r) => !excluded.has(r.receiptId)).reduce((sum, r) => sum + receiptUnallocated(r), 0));
  const advancePool = round2(advanceReceipts.reduce((sum, r) => sum + receiptUnallocated(r), 0));

  const openInvoices = useMemo(
    () => invoicesData.filter((i) => invoiceBalance(i) > 0.004).sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate) || a.invoiceNumber.localeCompare(b.invoiceNumber)),
    [invoicesData],
  );

  /** Advance goes into every invoice at its contract's advance %, oldest invoice first. */
  const advancePlan = useMemo(() => (adjustAdvance ? planAdvance(openInvoices, openReceipts) : {}), [adjustAdvance, openInvoices, openReceipts]);
  /** Advance left per contract (all of the pair's advance receipts of that contract). */
  const advancePoolByContract = useMemo(() => {
    const pool: Record<number, number> = {};
    advanceReceipts.forEach((r) => {
      if (r.contractId) pool[r.contractId] = round2((pool[r.contractId] ?? 0) + receiptUnallocated(r));
    });
    return pool;
  }, [advanceReceipts]);
  const manualAdvanceOf = (invoice: InvoiceToClear) => Math.max(num(advManual[invoice.invoiceId] ?? ""), 0);
  const advanceFor = (invoice: InvoiceToClear) => (advanceMode === "manual" ? manualAdvanceOf(invoice) : (advancePlan[invoice.invoiceId]?.amount ?? 0));
  /** A manual advance amount that is more than the invoice balance or than the advance left on its contract. */
  const advanceError = (invoice: InvoiceToClear): string | undefined => {
    if (advanceMode !== "manual") return undefined;
    const value = manualAdvanceOf(invoice);
    if (value <= 0) return undefined;
    if (value > invoiceBalance(invoice) + 0.004) return `At most ${money(invoiceBalance(invoice))}.`;
    const usedOnContract = openInvoices.filter((i) => i.contractId === invoice.contractId).reduce((sum, i) => sum + manualAdvanceOf(i), 0);
    const pool = advancePoolByContract[invoice.contractId] ?? 0;
    if (usedOnContract > pool + 0.004) return `Only ${money(pool)} of advance is left for this contract.`;
    return undefined;
  };
  /** What is left on an invoice for a cash allocation, after the advance adjustment. */
  const dueAfterAdvance = (invoice: InvoiceToClear) => round2(invoiceBalance(invoice) - advanceFor(invoice));

  const allocTotal = round2(openInvoices.reduce((sum, i) => sum + num(alloc[i.invoiceId] ?? ""), 0));
  const advanceTotal = round2(openInvoices.reduce((sum, i) => sum + advanceFor(i), 0));
  const poolLeft = round2(regularPool - allocTotal);

  const rowError = (invoice: InvoiceToClear): string | undefined => {
    const value = num(alloc[invoice.invoiceId] ?? "");
    if (value < 0) return "Cannot be negative.";
    if (value > dueAfterAdvance(invoice) + 0.004) return `At most ${money(dueAfterAdvance(invoice))}.`;
    return undefined;
  };
  const anyRowError = openInvoices.some((i) => rowError(i) || advanceError(i));
  const overPool = allocTotal > regularPool + 0.004;
  const nothingToApply = allocTotal <= 0 && advanceTotal <= 0;

  // ---------------------------------------------------------------------------------------------- 1. payment form
  const resetForm = (mode: PaymentMode = values.mode) => {
    setValues(createEmptyPaymentForm(mode));
    setErrors({});
    setEditingId(null);
    setEditingDetail(null);
    setReverseConfirm(false);
    setSplit(createEmptySplit());
    setSplitTried(false);
  };

  const handleModeChange = (mode: PaymentMode) => {
    setValues((prev) => ({ ...prev, mode, reference: "", bankName: "" }));
    setErrors({});
  };

  const handleKindChange = (kind: PaymentKind) => {
    setValues((prev) => {
      // "Advance" is only pre-filled for an advance; drop it again when switching back to a normal payment
      let towards = prev.towards;
      if (kind === "advance" && !towards.trim()) towards = "Advance";
      else if (kind !== "advance" && towards === "Advance") towards = "";
      return { ...prev, kind, contractId: "", towards };
    });
    setSplit(createEmptySplit());
    setSplitTried(false);
    setErrors({});
  };

  const handleFieldChange = (key: PaymentFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: key === "amount" ? value.replace(/[^0-9.]/g, "") : value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _cleared, ...rest } = prev;
      return rest;
    });
  };

  /** Saves the edited payment: its details and every part (changed, removed, added). */
  const handleUpdatePayment = async (detail: PaymentDetail) => {
    const nextErrors = validatePaymentForm(values, { requireContract: false });
    setErrors(nextErrors);
    setSplitTried(true);
    const total = Number(values.amount) || 0;
    const resolved = resolveSplit(split, total);
    if (Object.keys(nextErrors).length > 0 || !resolved.valid) return;
    const impact = editImpact(split, detail, resolved);
    if (impact.blocked.length > 0) {
      setToast({ text: impact.blocked[0], error: true });
      return;
    }
    if (impact.reverse.length > 0 && !reverseConfirm) {
      setToast({ text: "Some changes delete allocations. Tick the confirmation under the parts to go on.", error: true });
      return;
    }
    const shownFields = new Set(modeFields[values.mode].map((field) => field.key));
    try {
      await updatePayment({
        receiptId: detail.anchorReceiptId,
        receiptDate: values.date,
        paymentMode: toApiMode(values.mode),
        reference: shownFields.has("reference") ? values.reference.trim() : undefined,
        bankName: shownFields.has("bankName") ? values.bankName.trim() : undefined,
        amount: total,
        towards: values.towards.trim() || undefined,
        remarks: values.remarks.trim() || undefined,
        reverseAllocations: impact.reverse.length > 0,
        parts: [
          ...split.rows.map((row) => ({ receiptId: row.part?.receipt.receiptId ?? null, kind: "Advance" as const, contractId: Number(row.contractId), amount: resolved.rowAmounts[row.key] })),
          ...(split.regular.enabled ? [{ receiptId: split.regular.part?.receipt.receiptId ?? null, kind: "Regular" as const, contractId: null, amount: resolved.regularAmount }] : []),
        ],
      }).unwrap();
      setToast({ text: impact.reverse.length ? "Payment updated. The allocations of the changed parts were deleted, so they can be allocated again." : "Payment updated." });
      resetForm();
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The payment could not be updated."), error: true });
    }
  };

  const handleCancelPayment = async () => {
    if (!editingDetail) return;
    try {
      await cancelPayment({ receiptId: editingDetail.anchorReceiptId, reverseAllocations: cancelReverse }).unwrap();
      setCancelOpen(false);
      setToast({ text: "Payment cancelled." });
      resetForm();
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The payment could not be cancelled."), error: true });
    }
  };

  const handleSave = async () => {
    if (editingDetail) {
      await handleUpdatePayment(editingDetail);
      return;
    }
    // a new advance is a split payment (one or several contracts, and / or a regular part); an edited receipt stays a single one
    const isSplit = values.kind === "advance" && editingId === null;
    const nextErrors = validatePaymentForm(values, { requireContract: !isSplit });
    const missingParty = !hasPair;
    setErrors(nextErrors);
    setPartyError(missingParty);
    if (isSplit) setSplitTried(true);
    const resolvedSplit = resolveSplit(split, Number(values.amount) || 0);
    if (missingParty || Object.keys(nextErrors).length > 0 || (isSplit && !resolvedSplit.valid)) return;

    if (isSplit) {
      const shownFields = new Set(modeFields[values.mode].map((field) => field.key));
      try {
        const saved = await saveSplitPayment({
          sellerId: seller,
          buyerId: buyer,
          receiptDate: values.date,
          paymentMode: toApiMode(values.mode),
          reference: shownFields.has("reference") ? values.reference.trim() : undefined,
          bankName: shownFields.has("bankName") ? values.bankName.trim() : undefined,
          amount: Number(values.amount),
          towards: values.towards.trim() || undefined,
          remarks: values.remarks.trim() || undefined,
          splits: splitPayload(split, resolvedSplit),
        }).unwrap();
        const first = saved[0];
        if (first) notify.ask({ eventCode: "PAYMENT_RECORDED", title: "Notify about this payment", sourceEntityType: "PaymentReceipt", sourceEntityId: first.receiptId, contractNumber: first.contractNumber ?? undefined });
        setToast({
          text:
            saved.length > 1
              ? `Payment saved as ${saved.length} parts (${saved.map((r) => (r.kind === "Advance" ? `advance ${r.contractNumber ?? ""}`.trim() : "regular")).join(", ")}). They are now in the unallocated receipts.`
              : "Advance saved. It is now in the unallocated receipts.",
        });
        resetForm();
      } catch (error) {
        setToast({ text: apiErrorMessage(error, "The payment could not be saved."), error: true });
      }
      return;
    }

    const shown = new Set(modeFields[values.mode].map((field) => field.key));
    const payload: SaveReceiptPayload = {
      sellerId: seller,
      buyerId: buyer,
      kind: values.kind === "advance" ? "Advance" : "Regular",
      contractId: values.kind === "advance" ? Number(values.contractId) : null,
      receiptDate: values.date,
      paymentMode: toApiMode(values.mode),
      reference: shown.has("reference") ? values.reference.trim() : undefined,
      bankName: shown.has("bankName") ? values.bankName.trim() : undefined,
      amount: Number(values.amount),
      towards: values.towards.trim() || undefined,
      remarks: values.remarks.trim() || undefined,
    };

    try {
      if (editingId) await updateReceipt({ ...payload, receiptId: editingId }).unwrap();
      else {
        const saved = await saveReceipt(payload).unwrap();
        // The seller is told about the payment (the buyer can be added in the dialog).
        notify.ask({ eventCode: "PAYMENT_RECORDED", title: "Notify about this payment", sourceEntityType: "PaymentReceipt", sourceEntityId: saved.receiptId, contractNumber: saved.contractNumber ?? undefined });
      }
      setToast({ text: editingId ? "Payment updated." : `${payload.kind === "Advance" ? "Advance" : "Payment"} saved. It is now in the unallocated receipts.` });
      resetForm();
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The payment could not be saved."), error: true });
    }
  };

  /** Edit opens the WHOLE payment the receipt belongs to (all its parts), not just the one receipt. */
  const handleEdit = async (row: Receipt) => {
    try {
      const detail = await loadPayment(row.receiptId, false).unwrap();
      setSellerId(String(detail.sellerId));
      setBuyerId(String(detail.buyerId));
      setPartyError(false);
      setEditingDetail(detail);
      setEditingId(detail.anchorReceiptId);
      setErrors({});
      setValues(formFromDetail(detail));
      setSplit(splitFromDetail(detail));
      setSplitTried(false);
      setReverseConfirm(false);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The payment could not be opened."), error: true });
    }
  };

  const handleConfirmDelete = async () => {
    if (!rowPendingDelete) return;
    const target = rowPendingDelete;
    setRowPendingDelete(null);
    try {
      await deleteReceipt(target.receiptId).unwrap();
      if (editingId === target.receiptId) resetForm();
      setToast({ text: "Payment deleted." });
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The payment could not be deleted."), error: true });
    }
  };

  // ---------------------------------------------------------------------------------------------- 3. allocation
  const toggleReceipt = (id: number) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** Fill the invoices oldest first from the selected receipts, after the advance adjustment. */
  const handleAutoAllocate = () => {
    let left = regularPool;
    const next: Record<number, string> = {};
    openInvoices.forEach((invoice) => {
      const use = Math.min(left, dueAfterAdvance(invoice));
      if (use > 0.004) next[invoice.invoiceId] = String(round2(use));
      left = round2(left - Math.max(use, 0));
    });
    setAlloc(next);
    setApplyTried(false);
  };

  const handleApply = async () => {
    setApplyTried(true);
    if (anyRowError || overPool || nothingToApply) return;
    try {
      const result = await applyAllocation({
        sellerId: seller,
        buyerId: buyer,
        adjustAdvance,
        advanceAllocations: advanceMode === "manual" ? openInvoices.filter((i) => manualAdvanceOf(i) > 0).map((i) => ({ invoiceId: i.invoiceId, amount: manualAdvanceOf(i) })) : undefined,
        receiptIds: regularReceipts.filter((r) => !excluded.has(r.receiptId)).map((r) => r.receiptId),
        allocations: openInvoices.filter((i) => num(alloc[i.invoiceId] ?? "") > 0).map((i) => ({ invoiceId: i.invoiceId, amount: num(alloc[i.invoiceId]) })),
      }).unwrap();
      const cleared = result.invoices.filter((i) => i.status === "Paid").length;
      setToast({
        text: `Allocated ${money(result.cashAllocated)} from receipts${result.advanceAdjusted > 0 ? ` and adjusted ${money(result.advanceAdjusted)} of advance` : ""}${cleared ? `. ${cleared} invoice${cleared === 1 ? "" : "s"} cleared` : ""}.`,
      });
      setAlloc({});
      setAdvManual({});
      setApplyTried(false);
    } catch (error) {
      setToast({ text: apiErrorMessage(error, "The allocation could not be applied."), error: true });
    }
  };

  // ---- View Payment Advices: the dashboards' table (search, filters, sorting, paging)
  const viewRows = useMemo(() => {
    const needle = viewSearch.trim().toLowerCase();
    return openReceipts.filter(
      (r) =>
        (viewKind === "all" || r.kind === viewKind) &&
        (viewMode === "all" || r.paymentMode === viewMode) &&
        (allocFilter === "all" ||
          (allocFilter === "allocated" && r.allocatedAmount > 0) ||
          (allocFilter === "unallocated" && receiptUnallocated(r) > 0.004) ||
          (allocFilter === "refunded" && r.refundedAmount > 0)) &&
        (!needle ||
          [r.receiptNumber, r.contractNumber, r.reference, r.bankName, r.towards, r.remarks].some((v) => v?.toLowerCase().includes(needle))),
    );
  }, [openReceipts, viewSearch, viewKind, viewMode, allocFilter]);
  /** Small notes under a receipt's type: split payment, and where a converted payment came from. */
  const receiptTags = (r: Receipt) => (
    <>
      {r.groupPartCount > 1 && (
        <small className="pa-sub" title="The parts of one payment (one transaction) that was split over contracts and / or a regular part">
          One payment of {money(r.groupTotalAmount ?? r.amount)} split into {r.groupPartCount} parts
        </small>
      )}
      {r.convertedFromReceiptNumber && (
        <small className="pa-sub" title="Made by converting an advance to a regular payment">
          Converted from advance {r.convertedFromReceiptNumber}
          {r.convertedFromContractNumber ? ` (${r.convertedFromContractNumber})` : ""}
        </small>
      )}
    </>
  );

  const handleConverted = (regular: Receipt, allocate: boolean) => {
    const from = convertTarget;
    setConvertTarget(null);
    setToast({ text: `${money(regular.amount)} of advance ${from?.receiptNumber ?? ""} is now regular payment ${regular.receiptNumber}.` });
    if (!allocate || !from) return;
    if (isView) navigate(`/admin/payments/payment-advice/add?seller=${from.sellerId}&buyer=${from.buyerId}&receipt=${regular.receiptId}`);
    else allocationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // View shows a split payment as ONE row; opening it shows every part
  const [openPayments, setOpenPayments] = useState<string[]>([]);
  const viewKey = (r: ViewRow) => (r.members ? `g-${r.paymentGroupId}` : String(r.receiptId));
  const togglePayment = (key: string) => setOpenPayments((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const viewTableRows = useMemo<ViewRow[]>(() => {
    const seen = new Set<string>();
    const rows: ViewRow[] = [];
    viewRows.forEach((r) => {
      if (!r.paymentGroupId) {
        rows.push(r);
        return;
      }
      if (seen.has(r.paymentGroupId)) return;
      seen.add(r.paymentGroupId);
      const members = viewRows.filter((x) => x.paymentGroupId === r.paymentGroupId).sort((x, y) => x.receiptId - y.receiptId);
      if (members.length === 1 && r.groupPartCount <= 1) {
        rows.push(r);
        return;
      }
      const sum = (pick: (x: Receipt) => number) => round2(members.reduce((total, x) => total + pick(x), 0));
      rows.push({
        ...members[0],
        members,
        // what was received in all (the regular payments converted from advances are inside it)
        amount: r.groupTotalAmount ?? sum((x) => x.amount),
        allocatedAmount: sum((x) => x.allocatedAmount),
        refundedAmount: sum((x) => x.refundedAmount ?? 0),
        convertedAmount: 0,
        unallocatedAmount: sum((x) => x.unallocatedAmount),
      });
    });
    return rows;
  }, [viewRows]);
  const paymentParts = (row: ViewRow) => {
    const members = row.members ?? [];
    const cell: React.CSSProperties = { padding: "4px 10px", textAlign: "left", whiteSpace: "nowrap", fontSize: "var(--fx-text-sm)" };
    const num: React.CSSProperties = { ...cell, textAlign: "right" };
    return (
      <div style={{ padding: "8px 12px", borderLeft: "4px solid var(--color-primary, #1e3a6e)", fontSize: "var(--fx-text-sm)" }}>
        <div style={{ marginBottom: 6 }}>
          <strong>One payment of {money(row.amount)}</strong> on {shortDate(row.receiptDate)} ({modeLabel(row)}
          {row.reference ? ` · ${row.reference}` : ""}) split into {row.groupPartCount} part{row.groupPartCount === 1 ? "" : "s"}
          <button
            type="button"
            style={{ marginLeft: 12, fontWeight: 600, textDecoration: "underline", background: "none", border: 0, cursor: "pointer", color: "var(--color-primary, #1e3a6e)" }}
            onClick={() => void handleEdit(row)}
          >
            Edit whole payment
          </button>
        </div>
        <table className="pa-table" style={{ width: "auto", minWidth: "40rem" }}>
          <thead>
            <tr>
              <th style={cell}>Receipt</th>
              <th style={cell}>Part</th>
              <th style={num}>Amount</th>
              <th style={num}>Allocated</th>
              <th style={num}>Refunded</th>
              <th style={num}>Converted</th>
              <th style={num}>Unallocated</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.receiptId}>
                <td style={cell}>{m.receiptNumber}</td>
                <td style={cell}>
                  {m.kind === "Advance" ? `Advance · ${m.contractNumber ?? ""}` : m.convertedFromReceiptNumber ? `Regular (converted from ${m.convertedFromReceiptNumber})` : "Regular payment"}
                </td>
                <td style={num}>{money(m.amount)}</td>
                <td style={num}>{money(m.allocatedAmount)}</td>
                <td style={num}>{money(m.refundedAmount ?? 0)}</td>
                <td style={num}>{m.convertedAmount > 0 ? money(m.convertedAmount) : "–"}</td>
                <td style={{ ...num, fontWeight: 600 }}>{money(m.unallocatedAmount)}</td>
                <td style={cell}>
                  {m.kind === "Advance" && (
                    <button
                      type="button"
                      className="payment-advice-table__icon-btn payment-advice-table__icon-btn--convert"
                      onClick={() => setConvertTarget(m)}
                      disabled={!(m.unallocatedAmount > 0.004)}
                      aria-label={`Convert advance ${m.receiptNumber} to a regular payment`}
                      title={m.unallocatedAmount > 0.004 ? "Convert the unallocated advance to a regular payment" : "Nothing unallocated to convert"}
                    >
                      <RefreshCwIcon aria-hidden />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  const modeLabel = (r: Receipt) => paymentModeLabels[r.paymentMode.toLowerCase() as PaymentMode];
  const viewColumns: TableColumn<ViewRow>[] = [
    {
      key: "receiptNumber",
      header: "Receipt",
      sortable: true,
      hideable: false,
      // the parts of one split payment carry the same coloured edge
      render: (r) =>
        r.members ? (
          <button
            type="button"
            onClick={() => togglePayment(viewKey(r))}
            aria-expanded={openPayments.includes(viewKey(r))}
            title="Show or hide the parts of this payment"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: 0, cursor: "pointer", padding: 0, color: "inherit", font: "inherit" }}
          >
            {openPayments.includes(viewKey(r)) ? <ChevronDownIcon aria-hidden /> : <ChevronRightIcon aria-hidden />}
            {r.members[0].receiptNumber} + {r.members.length - 1} more
          </button>
        ) : (
          r.receiptNumber
        ),
      sortValue: (r) => r.receiptNumber,
      exportValue: (r) => (r.members ? r.members.map((m) => m.receiptNumber).join(", ") : r.receiptNumber),
    },
    { key: "receiptDate", header: "Date", sortable: true, render: (r) => shortDate(r.receiptDate), sortValue: (r) => r.receiptDate, exportValue: (r) => shortDate(r.receiptDate) },
    {
      key: "kind",
      header: "Type",
      sortable: true,
      render: (r) =>
        r.members ? (
          <>
            <Badge tone="info">Split payment · {r.groupPartCount} parts</Badge>
            <small className="pa-sub">{r.members.map((m) => (m.kind === "Advance" ? `advance ${m.contractNumber ?? ""}` : "regular")).join(" · ")}</small>
          </>
        ) : (
          <>
            <Badge tone={r.kind === "Advance" ? "info" : "neutral"}>{r.kind === "Advance" ? `Advance · ${r.contractNumber ?? ""}` : "Payment"}</Badge>
            {receiptTags(r)}
          </>
        ),
      sortValue: (r) => (r.members ? "Split" : r.kind),
      exportValue: (r) =>
        r.members
          ? `Split payment ${r.members.map((m) => (m.kind === "Advance" ? `advance ${m.contractNumber ?? ""}` : "regular")).join(" / ")}`
          : r.kind === "Advance"
            ? `Advance ${r.contractNumber ?? ""}`.trim()
            : "Payment",
    },
    {
      key: "paymentMode",
      header: "Mode / Reference",
      sortable: true,
      render: (r) => (
        <>
          {modeLabel(r)}
          {r.reference ? ` · ${r.reference}` : ""}
          {r.bankName ? <small className="pa-sub">{r.bankName}</small> : null}
        </>
      ),
      sortValue: (r) => `${modeLabel(r)} ${r.reference ?? ""}`,
      exportValue: (r) => [modeLabel(r), r.reference, r.bankName].filter(Boolean).join(" · "),
    },
    { key: "towards", header: "Towards", sortable: true, priority: "low", render: (r) => dash(r.towards), sortValue: (r) => r.towards ?? "" },
    { key: "amount", header: "Amount", sortable: true, align: "right", render: (r) => money(r.amount), sortValue: (r) => r.amount },
    { key: "allocatedAmount", header: "Allocated", sortable: true, align: "right", render: (r) => money(r.allocatedAmount), sortValue: (r) => r.allocatedAmount },
    { key: "refundedAmount", header: "Refunded", sortable: true, align: "right", render: (r) => money(r.refundedAmount ?? 0), sortValue: (r) => r.refundedAmount ?? 0 },
    { key: "unallocatedAmount", header: "Unallocated", sortable: true, align: "right", render: (r) => (
        <>
          <strong>{money(r.unallocatedAmount)}</strong>
          {r.convertedAmount > 0 && <small className="pa-sub">{money(r.convertedAmount)} converted to regular</small>}
        </>
      ), sortValue: (r) => r.unallocatedAmount },
    {
      key: "actions",
      header: "Actions",
      hideable: false,
      exportable: false,
      render: (r) => (
        <div className="payment-advice-table__actions">
          {r.members && (
            <>
              <button
                type="button"
                className="payment-advice-table__icon-btn payment-advice-table__icon-btn--allocate"
                onClick={() => navigate(`/admin/payments/payment-advice/add?seller=${r.sellerId}&buyer=${r.buyerId}&receipt=${r.receiptId}`)}
                disabled={!(r.unallocatedAmount > 0.004)}
                aria-label="Allocate this payment"
                title={r.unallocatedAmount > 0.004 ? "Allocate to invoices" : "Nothing left to allocate"}
              >
                <ListChecksIcon aria-hidden />
              </button>
              <button type="button" className="payment-advice-table__icon-btn payment-advice-table__icon-btn--edit" onClick={() => void handleEdit(r)} aria-label="Edit the whole payment" title="Edit the whole payment (all its parts)">
                <SquarePenIcon aria-hidden />
              </button>
            </>
          )}
          {!r.members && r.kind === "Advance" && (
            <button
              type="button"
              className="payment-advice-table__icon-btn payment-advice-table__icon-btn--convert"
              onClick={() => setConvertTarget(r)}
              disabled={!(r.unallocatedAmount > 0.004)}
              aria-label={`Convert advance ${r.receiptNumber} to a regular payment`}
              title={r.unallocatedAmount > 0.004 ? "Convert the unallocated advance to a regular payment" : "Nothing unallocated to convert"}
            >
              <RefreshCwIcon aria-hidden />
            </button>
          )}
          {!r.members && (<>
          <button
            type="button"
            className="payment-advice-table__icon-btn payment-advice-table__icon-btn--allocate"
            onClick={() => navigate(`/admin/payments/payment-advice/add?seller=${r.sellerId}&buyer=${r.buyerId}&receipt=${r.receiptId}`)}
            disabled={!(r.unallocatedAmount > 0.004)}
            aria-label={`Allocate payment ${r.receiptNumber}`}
            title={r.unallocatedAmount > 0.004 ? "Allocate to invoices" : "Nothing left to allocate"}
          >
            <ListChecksIcon aria-hidden />
          </button>
          <button type="button" className="payment-advice-table__icon-btn payment-advice-table__icon-btn--edit" onClick={() => handleEdit(r)} aria-label={`Edit payment ${r.receiptNumber}`} title="Edit the whole payment (all its parts)">
            <SquarePenIcon aria-hidden />
          </button>
          <button
            type="button"
            className="payment-advice-table__icon-btn payment-advice-table__icon-btn--delete"
            onClick={() => setRowPendingDelete(r)}
            disabled={!r.canDelete}
            aria-label={`Delete payment ${r.receiptNumber}`}
            title={!r.canDelete ? "Part of this receipt is already allocated" : "Delete"}
          >
            <Trash2Icon aria-hidden />
          </button>
          </>)}
        </div>
      ),
    },
  ];
  const viewTable = (
    <Table
      toolbar={
        <div className="bd-toolbar">
          <div className="bd-toolbar__filters">
            <Input
              icon={SearchIcon}
              type="search"
              placeholder="Receipt, contract, reference, bank…"
              aria-label="Search payment advices"
              value={viewSearch}
              onChange={(event) => setViewSearch(event.target.value)}
              fieldClassName="bd-toolbar__search"
            />
            <Select aria-label="Payment type" value={viewKind} onChange={(event) => setViewKind(event.target.value as typeof viewKind)}>
              <option value="all">All types</option>
              <option value="Regular">Payment</option>
              <option value="Advance">Advance</option>
            </Select>
            <Select aria-label="Payment mode" value={viewMode} onChange={(event) => setViewMode(event.target.value as typeof viewMode)}>
              <option value="all">All modes</option>
              <option value="Online">Online</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="None">No details</option>
            </Select>
          </div>
        </div>
      }
      exportName="Payment Advices"
      columns={viewColumns}
      data={viewTableRows}
      rowKey={viewKey}
      expandedRowKeys={openPayments}
      renderExpandedRow={paymentParts}
      pageSize={10}
      variant="light"
      mobileCards
      columnToggle
      emptyMessage={receiptsLoading ? "Loading receipts…" : "No payment advices match these filters."}
    />
  );

  const fields = modeFields[values.mode];
  const selectedTerms = contracts.find((c) => String(c.contractId) === values.contractId);
  const prompt = hasPair ? "" : "Select a seller and buyer.";

  return (
    <div className="payment-advice-page">
      {toast && (
        <div className={`payment-advice-page__toast${toast.error ? " payment-advice-page__toast--error" : ""}`} role={toast.error ? "alert" : "status"}>
          {toast.error ? <CircleAlertIcon aria-hidden /> : <CircleCheckBigIcon aria-hidden />}
          {toast.text}
        </div>
      )}

      {/* ===================================================== 1. Payment Advice (enter the payment) */}
      <section className="payment-advice-card" ref={formRef} aria-labelledby="payment-advice-title">
        <h1 id="payment-advice-title" className="payment-advice-card__title">
          {isView ? (editingId ? "Edit Payment Advice" : "View Payment Advices") : "Add Payment Advice"}
        </h1>
        <LookupLoadError failed={sellersFailed || buyersFailed} className="payment-advice-card__error" />

        <div
          className="payment-advice-parties"
          style={
            isView && editingId === null
              ? { gridTemplateColumns: datePreset === "custom" ? "minmax(9rem, 0.8fr) repeat(2, minmax(9rem, 0.7fr)) 1.4fr 1.4fr minmax(9rem, 0.8fr)" : "minmax(9rem, 0.8fr) 1.4fr 1.4fr minmax(9rem, 0.8fr)" }
              : undefined
          }
        >
          {isView && editingId === null && (
            <>
              <div className="payment-advice-field">
                <label htmlFor="pa-view-date">Date</label>
                <Select id="pa-view-date" aria-label="Payment date" value={datePreset} onChange={(event) => setDatePreset(event.target.value)}>
                  {DATE_PRESETS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
              {datePreset === "custom" && (
                <>
                  <Input type="date" label="From" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} />
                  <Input type="date" label="To" value={customTo} min={customFrom || undefined} onChange={(event) => setCustomTo(event.target.value)} />
                </>
              )}
            </>
          )}
          <div className="payment-advice-field">
            <label>Seller</label>
            <SearchableSelect
              options={isView ? [{ value: ALL, label: "All sellers" }, ...sellerOptions] : sellerOptions}
              value={isView && !sellerId ? ALL : sellerId}
              onChange={(value) => {
                setSellerId(value === ALL ? "" : value);
                setBuyerId("");
                setPartyError(false);
              }}
              placeholder={isView ? "All sellers" : "Select Seller"}
              disabled={editingDetail !== null}
              ariaLabel="Select Seller"
            />
          </div>
          <div className="payment-advice-field">
            <label>Buyer</label>
            <SearchableSelect
              options={isView ? [{ value: ALL, label: "All buyers" }, ...buyerOptions] : buyerOptions}
              value={isView && !buyerId ? ALL : buyerId}
              onChange={(value) => {
                setBuyerId(value === ALL ? "" : value);
                setPartyError(false);
              }}
              placeholder={isView ? "All buyers" : "Select Buyer"}
              disabled={editingDetail !== null}
              ariaLabel="Select Buyer"
            />
          </div>
          {isView && editingId === null && (
            <div className="payment-advice-field">
              <label htmlFor="pa-view-alloc">Allocation</label>
              <Select id="pa-view-alloc" aria-label="Allocation status" value={allocFilter} onChange={(event) => setAllocFilter(event.target.value as typeof allocFilter)}>
                <option value="all">All</option>
                <option value="allocated">Allocated</option>
                <option value="unallocated">Un-allocated</option>
                <option value="refunded">Refunded</option>
              </Select>
            </div>
          )}
        </div>
        {partyError && (
          <p className="payment-advice-card__error" role="alert">
            Select both a seller and a buyer.
          </p>
        )}

        {(!isView || editingId !== null) && (
        <>
        <div className="pa-choices">
          {!editingDetail && (
          <fieldset className="payment-advice-mode">
            <legend className="payment-advice-mode__legend">Payment Type</legend>
            <div className="payment-advice-mode__options">
              {(["regular", "advance"] as PaymentKind[]).map((kind) => (
                <label className="payment-advice-mode__option" key={kind} title={kind === "advance" ? "An advance paid against one or more contracts (and, if you like, partly a regular payment); it is adjusted into those contracts' invoices, or converted to a regular payment later" : undefined}>
                  <input type="radio" name="payment-advice-kind" value={kind} checked={values.kind === kind} onChange={() => handleKindChange(kind)} />
                  <span className="payment-advice-mode__pill">{kind === "regular" ? "Payment" : "Advance"}</span>
                </label>
              ))}
            </div>
          </fieldset>
          )}

          <fieldset className="payment-advice-mode">
            <legend className="payment-advice-mode__legend">Select Mode</legend>
            <div className="payment-advice-mode__options">
              {paymentModes.map((mode) => {
                const Icon = modeIcons[mode];
                return (
                  <label className="payment-advice-mode__option" key={mode}>
                    <input type="radio" name="payment-advice-mode" value={mode} checked={values.mode === mode} onChange={() => handleModeChange(mode)} />
                    <span className="payment-advice-mode__pill">
                      <Icon aria-hidden />
                      {paymentModeLabels[mode]}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {editingDetail && (
          <p className="pa-sub" style={{ margin: "4px 0" }}>
            Editing the whole payment of {money(editingDetail.totalAmount)} ({editingDetail.parts.length} part{editingDetail.parts.length === 1 ? "" : "s"}): change every part,
            remove parts, add new ones, or cancel the payment.
          </p>
        )}

        {((values.kind === "advance" && editingId === null) || editingDetail) && (
          <SplitPaymentEditor contracts={contracts} total={Number(values.amount) || 0} value={split} onChange={setSplit} showErrors={splitTried} />
        )}

        {editingDetail && (() => {
          const impact = editImpact(split, editingDetail, resolveSplit(split, Number(values.amount) || 0));
          return (
            <div style={{ display: "grid", gap: 6, margin: "0 0 10px" }}>
              {impact.blocked.map((message) => (
                <small key={message} className="pa-error" role="alert">
                  {message}
                </small>
              ))}
              {impact.reverse.length > 0 && (
                <label style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", borderRadius: 6, background: "rgba(245,158,11,0.12)" }}>
                  <input type="checkbox" checked={reverseConfirm} onChange={(event) => setReverseConfirm(event.target.checked)} style={{ marginTop: 3 }} />
                  <span>
                    These changes delete allocations to invoices (the invoices go back to what they owed):{" "}
                    {impact.reverse.map((r) => `${r.receiptNumber} ${money(r.allocated)} (${r.why})`).join("; ")}. Tick to confirm.
                  </span>
                </label>
              )}
              {editingDetail.convertedParts.length > 0 && (
                <small style={{ opacity: 0.8 }}>
                  Regular payments made from these advances (not edited here):{" "}
                  {editingDetail.convertedParts
                    .map((c) => `${c.receipt.receiptNumber} ${money(c.receipt.amount)} from ${c.receipt.convertedFromReceiptNumber ?? ""}${c.receipt.allocatedAmount > 0 ? `, ${money(c.receipt.allocatedAmount)} allocated` : ""}`)
                    .join(" · ")}
                </small>
              )}
            </div>
          );
        })()}

        {values.kind === "advance" && editingId !== null && !editingDetail && (
          <div className="pa-advance-row">
            <div className="payment-advice-field">
              <label htmlFor="payment-advice-contract">Contract</label>
              <SearchableSelect
                options={contracts.map((c) => ({ value: String(c.contractId), label: `${c.contractNumber} · ${c.productName}` }))}
                value={values.contractId}
                onChange={(value) => handleFieldChange("contractId", value)}
                placeholder={contracts.length ? "Select Contract" : "No contracts for these parties"}
                ariaLabel="Contract the advance is for"
              />
              {errors.contractId && <span className="payment-advice-field__error">{errors.contractId}</span>}
            </div>
            <div className="pa-advice-note">
              {selectedTerms ? (
                <>
                  <strong>{selectedTerms.advancePercent}% advance</strong>
                  <span>
                    {selectedTerms.immediateAdvancePercent}% immediate + {selectedTerms.balanceAdvancePercent}% balance. The same {selectedTerms.advancePercent}% of every invoice on this contract is adjusted from this advance.
                  </span>
                </>
              ) : (
                <span>Choose the contract to see its advance terms.</span>
              )}
            </div>
          </div>
        )}

        {values.kind === "advance" && editingId !== null && !editingDetail && selectedTerms && (
          <dl
            aria-label="Contract details"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))", gap: "6px 16px", margin: "4px 0 12px", fontSize: "var(--fx-text-sm)" }}
          >
            {[
              ["Contract #", selectedTerms.contractNumber],
              ["Contract date", new Date(selectedTerms.contractDate).toLocaleDateString("en-GB").replace(/\//g, "-")],
              ["Status", selectedTerms.statusName || "—"],
              ["Product", selectedTerms.productName],
              ["Contract qty", `${selectedTerms.totalQtyMT} MT`],
              ["Rate / MT", money(selectedTerms.ratePerMT)],
              ["GST", `${selectedTerms.gstPercent}%`],
              ["Net rate / MT", money(selectedTerms.netRatePerMT)],
              ["Contract value", money(selectedTerms.totalContractValue)],
              ["Advance terms", `${selectedTerms.advancePercent}% (${selectedTerms.immediateAdvancePercent}% + ${selectedTerms.balanceAdvancePercent}%)`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt style={{ opacity: 0.7, fontSize: 12 }}>{label}</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="payment-advice-fields">
          {fields.map((field) => {
            const id = `payment-advice-${field.key}`;
            const error = errors[field.key];
            return (
              <div className="payment-advice-field" key={field.key}>
                <label htmlFor={id}>{field.label}</label>
                <input
                  id={id}
                  type={field.type}
                  inputMode={field.inputMode}
                  className={error ? "has-error" : ""}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
                {error && (
                  <span className="payment-advice-field__error" id={`${id}-error`}>
                    {error}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* The amount in words, to check what was typed: one full-width line of fixed height under the fields, so
            the form does not grow or jump while typing. */}
        <p className="payment-advice-words" aria-live="polite" title={amountInWords(values.amount) || undefined}>
          {amountInWords(values.amount) && (
            <>
              <span className="payment-advice-words__label">Amount in words:</span> {amountInWords(values.amount)}
            </>
          )}
        </p>

        <div className="payment-advice-actions">
          <button type="button" className="payment-advice-actions__cancel" onClick={() => resetForm()}>
            <XIcon aria-hidden /> Cancel
          </button>
          {editingDetail && (
            <button
              type="button"
              className="payment-advice-actions__cancel"
              style={{ background: "var(--color-danger, #b91c1c)", color: "#fff" }}
              onClick={() => {
                setCancelReverse(false);
                setCancelOpen(true);
              }}
            >
              <XIcon aria-hidden /> Cancel this payment
            </button>
          )}
          <button type="button" className="payment-advice-actions__save" onClick={handleSave} disabled={saving || updating || savingSplit || updatingPayment}>
            <CheckIcon aria-hidden /> {editingId ? "Update Payment" : "Save Payments"}
          </button>
        </div>
        </>
        )}
      </section>

      {/* ===================================================== 2. Unallocated receipts */}
      <section className="payment-advice-card" ref={allocationRef} aria-labelledby="pa-receipts-title">
        <div className="pa-head">
          <h2 id="pa-receipts-title" className="payment-advice-card__title pa-head__title">
            {isView ? "Payment Advices" : "Unallocated Receipts"}
          </h2>
          <div className="pa-chips">
            <span className="pa-chip">Payments <strong>{money(round2(regularReceipts.reduce((s, r) => s + receiptUnallocated(r), 0)))}</strong></span>
            <span className="pa-chip pa-chip--advance">Advance <strong>{money(advancePool)}</strong></span>
          </div>
        </div>

        {isView ? (
          viewTable
        ) : (
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th className="pa-col-check" aria-label="Use for allocation" />
                <th>Receipt</th>
                <th>Date</th>
                <th>Type</th>
                <th>Mode / Reference</th>
                <th>Towards</th>
                <th className="pa-num">Amount</th>
                <th className="pa-num">Allocated</th>
                <th className="pa-num">Refunded</th>
                <th className="pa-num">Unallocated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {openReceipts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="pa-empty">
                    {prompt || (receiptsLoading ? "Loading receipts…" : "No unallocated receipts for these parties. Enter a payment above.")}
                  </td>
                </tr>
              ) : (
                openReceipts.map((r, index) => (
                  <Fragment key={r.receiptId}>
                  {r.paymentGroupId && openReceipts[index - 1]?.paymentGroupId !== r.paymentGroupId && (
                    <tr className="pa-group-row">
                      <td colSpan={11} style={{ background: "var(--color-surface-muted, rgba(0,0,0,0.05))", fontSize: "var(--fx-text-sm)", padding: "6px 12px" }}>
                        <strong>One payment of {money(r.groupTotalAmount ?? r.amount)}</strong> on {shortDate(r.receiptDate)} ({paymentModeLabels[r.paymentMode.toLowerCase() as PaymentMode]}
                        {r.reference ? ` · ${r.reference}` : ""}) split into {r.groupPartCount} parts:{" "}
                        {openReceipts
                          .filter((x) => x.paymentGroupId === r.paymentGroupId)
                          .map((x) => groupPartLabel(x, false))
                          .join(" · ")}
                        <button type="button" className="payment-advice-table__link" style={{ marginLeft: 12, fontWeight: 600, textDecoration: "underline", background: "none", border: 0, cursor: "pointer", color: "var(--color-primary, #1e3a6e)" }} onClick={() => void handleEdit(r)}>
          Edit whole payment
        </button>
                      </td>
                    </tr>
                  )}
                  <tr
                    className={r.kind === "Regular" && excluded.has(r.receiptId) ? "is-muted" : ""}
                    style={r.paymentGroupId ? { boxShadow: "inset 4px 0 0 var(--color-primary, #1e3a6e)" } : undefined}
                  >
                    <td className="pa-col-check">
                      {r.kind === "Regular" ? (
                        <input type="checkbox" checked={!excluded.has(r.receiptId)} onChange={() => toggleReceipt(r.receiptId)} aria-label={`Use receipt ${r.receiptNumber} for allocation`} title="Use this receipt for the allocation below" />
                      ) : (
                        <ZapIcon className="pa-auto" aria-label="Adjusted automatically" title="Advance: adjusted automatically by the contract's advance %" />
                      )}
                    </td>
                    <td>{r.receiptNumber}</td>
                    <td>{shortDate(r.receiptDate)}</td>
                    <td>
                      <span className={`pa-tag pa-tag--${r.kind === "Advance" ? "advance" : "regular"}`}>{r.kind === "Advance" ? `Advance · ${r.contractNumber ?? ""}` : "Payment"}</span>
                      {receiptTags(r)}
                    </td>
                    <td>
                      {paymentModeLabels[r.paymentMode.toLowerCase() as PaymentMode]}
                      {r.reference ? ` · ${r.reference}` : ""}
                      {r.bankName ? <small className="pa-sub">{r.bankName}</small> : null}
                    </td>
                    <td>{dash(r.towards)}</td>
                    <td className="pa-num">{money(r.amount)}</td>
                    <td className="pa-num">{money(r.allocatedAmount)}</td>
                    <td className="pa-num">{money(r.refundedAmount ?? 0)}</td>
                    <td className="pa-num pa-strong">
                      {money(r.unallocatedAmount)}
                      {r.convertedAmount > 0 && <small className="pa-sub">{money(r.convertedAmount)} converted to regular</small>}
                    </td>
                    <td>
                      <div className="payment-advice-table__actions">
                        {r.kind === "Advance" && (
                          <button
                            type="button"
                            className="payment-advice-table__icon-btn payment-advice-table__icon-btn--convert"
                            onClick={() => setConvertTarget(r)}
                            aria-label={`Convert advance ${r.receiptNumber} to a regular payment`}
                            title="Convert the unallocated advance to a regular payment (allocate it to any invoice)"
                          >
                            <RefreshCwIcon aria-hidden />
                          </button>
                        )}
                        <button
                          type="button"
                          className="payment-advice-table__icon-btn payment-advice-table__icon-btn--edit"
                          onClick={() => handleEdit(r)}
                          aria-label="Edit the whole payment"
                          title="Edit the whole payment (all its parts)"
                        >
                          <SquarePenIcon aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="payment-advice-table__icon-btn payment-advice-table__icon-btn--delete"
                          onClick={() => setRowPendingDelete(r)}
                          disabled={!r.canDelete}
                          aria-label="Delete payment"
                          title={!r.canDelete ? "Part of this receipt is already allocated" : "Delete"}
                        >
                          <Trash2Icon aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>

      {/* ===================================================== 3. Uncleared invoices: allocate */}
      {!isView && (
      <section className="payment-advice-card" aria-labelledby="pa-invoices-title">
        <div className="pa-head">
          <h2 id="pa-invoices-title" className="payment-advice-card__title pa-head__title">
            Uncleared Invoices
          </h2>
          <label className="pa-switch">
            Advance adjustment
            <select
              className="pa-input"
              aria-label="Advance adjustment"
              value={advanceMode}
              onChange={(event) => {
                setAdvanceMode(event.target.value as typeof advanceMode);
                setAlloc({});
              }}
            >
              <option value="auto">Automatic (contract's advance %)</option>
              <option value="manual">Manual (type the amount)</option>
              <option value="none">Do not adjust advance</option>
            </select>
          </label>
        </div>

        <div className="pa-pool" role="status">
          <div><span>Selected receipts</span><strong>{money(regularPool)}</strong></div>
          <div><span>Allocating now</span><strong>{money(allocTotal)}</strong></div>
          <div className={poolLeft < -0.004 ? "is-bad" : ""}><span>Left in receipts</span><strong>{money(poolLeft)}</strong></div>
          <div><span>Advance adjusted</span><strong>{money(advanceTotal)}</strong></div>
          <div className="pa-pool__buttons">
            <button type="button" className="pa-btn" onClick={handleAutoAllocate} disabled={openInvoices.length === 0 || regularPool <= 0}>
              <ZapIcon aria-hidden /> Auto-allocate
            </button>
            <button type="button" className="pa-btn pa-btn--ghost" onClick={() => setAlloc({})} disabled={allocTotal <= 0}>
              Clear
            </button>
          </div>
        </div>

        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Invoice</th>
                <th>Date</th>
                <th className="pa-num">Invoice Amount</th>
                <th className="pa-num">Already Paid</th>
                <th className="pa-num">Advance Adjusted</th>
                <th className="pa-num">Balance</th>
                <th className="pa-num">Advance Now</th>
                <th className="pa-alloc-col">Allocate Now</th>
                <th className="pa-num">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {openInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="pa-empty">
                    {prompt || (invoicesLoading ? "Loading invoices…" : "No uncleared invoices for these parties.")}
                  </td>
                </tr>
              ) : (
                openInvoices.map((invoice) => {
                  const plan = advancePlan[invoice.invoiceId];
                  const error = rowError(invoice);
                  const cash = Math.max(num(alloc[invoice.invoiceId] ?? ""), 0);
                  return (
                    <tr key={invoice.invoiceId}>
                      <td>
                        {invoice.contractNumber}
                        <small className="pa-sub">{invoice.productName}</small>
                      </td>
                      <td>{invoice.invoiceNumber}</td>
                      <td>{shortDate(invoice.invoiceDate)}</td>
                      <td className="pa-num">{money(invoice.payableAmount)}</td>
                      <td className="pa-num">{money(invoice.paidAmount)}</td>
                      <td className="pa-num">{money(invoice.advanceAdjusted)}</td>
                      <td className="pa-num pa-strong">{money(invoiceBalance(invoice))}</td>
                      <td className="pa-num">
                        {advanceMode === "manual" ? (
                          <>
                            <input
                              type="text"
                              inputMode="decimal"
                              className={`pa-input${advanceError(invoice) ? " has-error" : ""}`}
                              aria-label={`Advance to adjust into invoice ${invoice.invoiceNumber}`}
                              placeholder="0"
                              value={advManual[invoice.invoiceId] ?? ""}
                              disabled={(advancePoolByContract[invoice.contractId] ?? 0) <= 0}
                              onChange={(event) => {
                                setAdvManual((prev) => ({ ...prev, [invoice.invoiceId]: event.target.value.replace(/[^0-9.]/g, "") }));
                                setAlloc({});
                              }}
                            />
                            <small className={`pa-sub${advanceError(invoice) ? " pa-sub--warn" : ""}`}>
                              {advanceError(invoice) ?? ((advancePoolByContract[invoice.contractId] ?? 0) > 0 ? `${money(advancePoolByContract[invoice.contractId])} advance left` : "No advance for this contract")}
                            </small>
                          </>
                        ) : plan && plan.percent > 0 ? (
                          <>
                            <span className="pa-strong">{money(plan.amount)}</span>
                            <small className={`pa-sub${plan.short ? " pa-sub--warn" : ""}`}>
                              {plan.percent}% of invoice{plan.short ? " · advance short" : ""}
                            </small>
                          </>
                        ) : (
                          <span className="pa-muted">–</span>
                        )}
                      </td>
                      <td className="pa-alloc-col">
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`pa-input${(applyTried || alloc[invoice.invoiceId]) && error ? " has-error" : ""}`}
                          aria-label={`Allocate to invoice ${invoice.invoiceNumber}`}
                          placeholder="0"
                          value={alloc[invoice.invoiceId] ?? ""}
                          onChange={(event) => setAlloc((prev) => ({ ...prev, [invoice.invoiceId]: event.target.value.replace(/[^0-9.]/g, "") }))}
                        />
                        {error && (applyTried || alloc[invoice.invoiceId]) && <small className="pa-error">{error}</small>}
                      </td>
                      <td className="pa-num pa-strong">{money(round2(Math.max(dueAfterAdvance(invoice) - cash, 0)))}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {openInvoices.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3}>Total</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + i.payableAmount, 0)))}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + i.paidAmount, 0)))}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + i.advanceAdjusted, 0)))}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + invoiceBalance(i), 0)))}</td>
                  <td className="pa-num">{money(advanceTotal)}</td>
                  <td className="pa-alloc-col pa-num">{money(allocTotal)}</td>
                  <td className="pa-num">{money(round2(openInvoices.reduce((s, i) => s + Math.max(dueAfterAdvance(i) - Math.max(num(alloc[i.invoiceId] ?? ""), 0), 0), 0)))}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {applyTried && overPool && (
          <p className="payment-advice-card__error" role="alert">
            You are allocating {money(allocTotal)} but the selected receipts only have {money(regularPool)}. Tick more receipts above or reduce the amounts.
          </p>
        )}
        {applyTried && nothingToApply && (
          <p className="payment-advice-card__error" role="alert">
            Enter an amount against at least one invoice, or use Auto-allocate.
          </p>
        )}

        <div className="payment-advice-actions">
          <button type="button" className="payment-advice-actions__cancel" onClick={() => { setAlloc({}); setApplyTried(false); }}>
            <XIcon aria-hidden /> Reset
          </button>
          <button type="button" className="payment-advice-actions__save" onClick={handleApply} disabled={openInvoices.length === 0 || applying}>
            <CheckIcon aria-hidden /> {applying ? "Applying…" : "Apply Allocation"}
          </button>
        </div>
      </section>
      )}

      {(isView || hasPair) && <AdvanceConversionsPanel sellerId={seller || undefined} buyerId={buyer || undefined} />}

      <ConfirmDialog
        open={cancelOpen && editingDetail !== null}
        title="Cancel this whole payment?"
        message={`All ${editingDetail?.parts.length ?? 0} part(s) of this ${money(editingDetail?.totalAmount ?? 0)} payment will be cancelled. This cannot be undone.`}
        confirmLabel={cancellingPayment ? "Cancelling…" : "Cancel payment"}
        confirmDisabled={cancellingPayment || ((editingDetail?.parts.concat(editingDetail?.convertedParts ?? []).some((p) => p.allocations.length > 0) ?? false) && !cancelReverse)}
        onConfirm={() => void handleCancelPayment()}
        onCancel={() => setCancelOpen(false)}
      >
        {editingDetail && editingDetail.parts.concat(editingDetail.convertedParts).some((p) => p.allocations.length > 0) && (
          <div style={{ display: "grid", gap: 6, textAlign: "left" }}>
            <div>This payment is allocated to invoices:</div>
            {editingDetail.parts
              .concat(editingDetail.convertedParts)
              .flatMap((p) => p.allocations.map((a) => `${p.receipt.receiptNumber} → ${a.invoiceNumber} (${a.contractNumber}) ${money(a.amount)}`))
              .map((line) => (
                <small key={line}>{line}</small>
              ))}
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={cancelReverse} onChange={(event) => setCancelReverse(event.target.checked)} />
              Delete these allocations too
            </label>
          </div>
        )}
      </ConfirmDialog>

      <ConvertAdvanceDialog receipt={convertTarget} onClose={() => setConvertTarget(null)} onConverted={handleConverted} />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Delete this payment?"
        message="This will remove the payment entry. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
      {notify.element}
    </div>
  );
};

export default Paymentadvice;
