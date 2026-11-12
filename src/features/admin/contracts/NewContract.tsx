import { useEffect, useMemo, useState } from "react";
import DatePickerInput from "../../../shared/components/dropdown/DatePickerInput";
import type { ChangeEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from "../../../shared/components/icon";
import AddressSelectField from "../truck-management/contract-trucks/AddressSelectField";
import SearchableSelect from "../../../shared/components/dropdown/SearchableSelect";
import ToggleSwitch from "../../../shared/components/toggle/ToggleSwitch";
import ConfirmDialog from "../../../shared/components/dialog/ConfirmDialog";
import type { Contract } from "./contracts.data";
import {
  useGetContractByContractNumberQuery,
  useSaveContractMutation,
  useUpdateContractMutation,
} from "../../../core/store/contractsApi";

import {
  quantityMeasureOptions,
  poToleranceOptions,
  deliveryTypeOptions,
  gstDetailsOptions,
  deliveryScheduleOptions,
  qualitySpecSourceOptions,
  paymentTermsOptions,
} from "./newContract.data";
import "./NewContract.scss";
import { usePermission } from "../../../core/auth/AuthContext";
import NotifyModal from "../../../shared/notifications/NotifyModal";
import NotifyChoicePicker from "../../../shared/notifications/NotifyChoicePicker";
import type { NotifyChoices } from "../../../shared/notifications/notifyChoices";
import { parseProductFeatures, useGetProductsQuery } from "../../../core/store/productsApi";
import { getErrorMessage } from "../../../core/api/getErrorMessage";
import LookupLoadError from "../../../shared/components/feedback/LookupLoadError";
import {
  useGetBusinessProfileSummaryQuery,
} from "../../../core/store/businessProfilesApi";
import {
  useGetProfileAddressQuery,
  useGetProfileAddressWithSelectedQuery,
  type ProfileAddressDetail,
} from "../../../core/store/userProfilesCommonApi";


interface ConditionState {
  commission: string;
  deliverySchedule: string;
  fromDate: string;
  toDate: string;
  specificDays: string;
  qualitySpecSource: string;
  address: string;
  remarks: string;
}

/** Seller conditions the buyer's copy follows by default (the address is the buyer's own). */
const FOLLOWED_CONDITION_KEYS = ["deliverySchedule", "fromDate", "toDate", "specificDays", "qualitySpecSource"] as const;

const emptyCondition: ConditionState = {
  commission: "5",
  deliverySchedule: "ready-loading",
  fromDate: "",
  toDate: "",
  specificDays: "",
  qualitySpecSource: "",
  address: "",
  remarks: "",
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asNumber = (value: unknown, fallback?: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

/** One product feature shown under Seller / Buyer Conditions: the name is fixed, the min / max are editable. */
interface FeatureSpec {
  parameter: string;
  min: string;
  max: string;
}

/** "12", "12.5" or "12%" -> number; blank or unreadable -> null. */
const parseFeatureNumber = (value: string): number | null => {
  const cleaned = value.trim().replace(/%$/, "").trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Returns a message for the first invalid spec, or "" when all are fine. */
const validateFeatureSpecs = (side: string, specs: FeatureSpec[]) => {
  for (const spec of specs) {
    const min = parseFeatureNumber(spec.min);
    const max = parseFeatureNumber(spec.max);
    if ((spec.min.trim() && min === null) || (spec.max.trim() && max === null)) {
      return `${side} ${spec.parameter}: Min and Max must be numbers.`;
    }
    if ((min !== null && min < 0) || (max !== null && max < 0)) {
      return `${side} ${spec.parameter}: values cannot be negative.`;
    }
    if (min !== null && max !== null && min > max) {
      return `${side} ${spec.parameter}: Min cannot be greater than Max.`;
    }
  }
  return "";
};

const toSavePayload = (profileId: number, specs: FeatureSpec[]) =>
  specs
    .map((spec) => ({
      profileId,
      parameterId: 0,
      parameter: spec.parameter,
      minValue: parseFeatureNumber(spec.min),
      maxValue: parseFeatureNumber(spec.max),
      unit: "",
    }))
    .filter((spec) => spec.minValue !== null || spec.maxValue !== null);

/** Saved contract specifications -> editable rows (parameter name with its min / max as text). */
const toFeatureSpecs = (specifications: Contract["sellerQualitySpecifications"] | undefined): FeatureSpec[] =>
  (specifications ?? [])
    .filter((spec) => spec.parameter?.trim())
    .map((spec) => ({
      parameter: String(spec.parameter).trim(),
      min: spec.minValue == null ? "" : String(spec.minValue),
      max: spec.maxValue == null ? "" : String(spec.maxValue),
    }));

/**
 * An existing contract's saved specs laid out on the product's features: each feature shows what the contract saved (blank when it saved
 * none for it); saved parameters the product no longer lists are kept at the end. A contract with nothing saved starts from the product.
 */
const mergeSavedSpecs = (features: FeatureSpec[], saved: FeatureSpec[]): FeatureSpec[] => {
  if (saved.length === 0) return features.map((spec) => ({ ...spec }));
  const byName = new Map(saved.map((spec) => [spec.parameter.toLowerCase(), spec]));
  const merged = features.map((feature) => {
    const match = byName.get(feature.parameter.toLowerCase());
    return match ? { parameter: feature.parameter, min: match.min, max: match.max } : { parameter: feature.parameter, min: "", max: "" };
  });
  const listed = new Set(features.map((feature) => feature.parameter.toLowerCase()));
  return [...merged, ...saved.filter((spec) => !listed.has(spec.parameter.toLowerCase())).map((spec) => ({ ...spec }))];
};

/** Blank -> null (optional); otherwise a whole number inside [min, max], or NaN when invalid. */
const parseOptionalWhole = (value: string, min: number, max: number): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : Number.NaN;
};

const optionKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const formatProfileAddress = (address: {
  officeName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  stateName?: string;
  pincode?: string;
}) =>
  [
    address.officeName,
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.district,
    address.stateName,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

/** Dropdown values backed by a database id are always digits. */
const isProfileId = (value: string) => /^\d+$/.test(value);

/** Today as YYYY-MM-DD in local time: a new contract is dated today by default. */
const todayInputDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** Narrows a hydrated value to an id, discarding nulls, names and NaN. */
const asOptionId = (value: unknown) =>
  value != null && isProfileId(String(value)) ? String(value) : "";

const normalizeAddressText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * GetContractByContractNumber returns the chosen address as free text
 * (sellerConditions.loadingAddressAt) rather than an id, while the dropdown is keyed
 * by addressId. The text is matched back against the profile's address list so the
 * saved address shows up — and is re-sent — when an existing contract is edited.
 */
const findAddressByLabel = (addresses: ProfileAddressDetail[], label: string) => {
  const target = normalizeAddressText(label);
  if (!target) return undefined;

  return (
    addresses.find((address) => normalizeAddressText(formatProfileAddress(address)) === target) ??
    addresses.find((address) => normalizeAddressText(address.officeName ?? "") === target) ??
    addresses.find((address) => normalizeAddressText(formatProfileAddress(address)).includes(target))
  );
};

// const normalizeQualitySpecifications = (
//   specifications: Contract["sellerQualitySpecifications"],
// ) =>
//   (specifications ?? []).map((specification) => ({
//     profileId: specification.profileId ?? 0,
//     parameterId: specification.parameterId ?? 0,
//     minValue: specification.minValue ?? 0,
//     maxValue: specification.maxValue ?? 0,
//     unit: specification.unit ?? "",
//   }));

const REQUIRED_FIELD_LABELS: Record<string, string> = {
  contractDate: "Date of Contract",
  effectiveFrom: "Effective From",
  effectiveTo: "Effective To",
  sellerId: "Select Seller",
  buyerId: "Select Buyer",
  productId: "Select Product",
  quantityMeasure: "Quantity Measure",
  qty: "Qty",
  poTolerance: "PO Tolerance",
  deliveryType: "Delivery Type",
  contractRate: "Contract Rate",
  gstPercent: "GST % Value",
  gstDetails: "GST details",
  sellerCommission: "Seller Commission",
  sellerDeliverySchedule: "Seller Delivery schedule",
  sellerFromDate: "Seller From Date",
  sellerToDate: "Seller To Date",
  sellerSpecificDays: "Seller Specific Days",
  sellerQualitySpecSource: "Seller Quality Spec Source",
  sellerAddress: "Seller Loading Address At",
  buyerCommission: "Buyer Commission",
  buyerDeliverySchedule: "Buyer Delivery schedule",
  buyerFromDate: "Buyer From Date",
  buyerToDate: "Buyer To Date",
  buyerSpecificDays: "Buyer Specific Days",
  buyerQualitySpecSource: "Buyer Quality Spec Source",
  buyerAddress: "Buyer Delivery Address At",
  paymentTerms: "Payment terms",
  paymentBeforeDate: "Payment Before Date",
  immediateAdvancePercent: "Immediate Advance %",
  immediateAdvanceDate: "Immediate Advance Date",
  balanceAdvanceDate: "Balance Advance Date",
  sellerPaymentDueDays: "Seller Payment Due Days",
  buyerPaymentDueDays: "Buyer Payment Due Days",
};

const NewContract = () => {
  const location = useLocation();
  const navState = (location.state as null | { contract?: Contract; isEdit?: boolean }) || null;
  const editContractNumber = navState?.isEdit
    ? navState.contract?.contractNumber || navState.contract?.id || ""
    : "";
  const {
    data: contractDetails,
    isLoading: isContractDetailsLoading,
    isFetching: isContractDetailsFetching,
  } = useGetContractByContractNumberQuery(editContractNumber, {
    skip: !editContractNumber,
  });
 
  const [summaryVisible, setSummaryVisible] = useState(true);
  const [contractNumber, setContractNumber] = useState("");

  const [contractDate, setContractDate] = useState(todayInputDate);
  // The period the contract is valid for. Effective From starts empty; if left empty, the contract date is saved.
  const [effectiveFromInput, setEffectiveFromInput] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const effectiveFrom = effectiveFromInput;
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantityMeasure, setQuantityMeasure] = useState("mt");
  const [qty, setQty] = useState("");
  const [poTolerance, setPoTolerance] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  // Optional approximate travel time loading -> delivery address, typed by hand.
  const [travelDays, setTravelDays] = useState("");
  const [travelHours, setTravelHours] = useState("");
  const [contractRate, setContractRate] = useState("");
  const [gstPercent, setGstPercent] = useState("5");
  const [gstDetails, setGstDetails] = useState("");
  const [indicativeFreight, setIndicativeFreight] = useState("");
  const [rateRemarks, setRateRemarks] = useState("");

  const [sellerConditions, setSellerConditions] = useState<ConditionState>(emptyCondition);
  const [buyerConditions, setBuyerConditions] = useState<ConditionState>(emptyCondition);

  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentBeforeDate, setPaymentBeforeDate] = useState("");
  const [immediateAdvancePercent, setImmediateAdvancePercent] = useState("");
  const [immediateAdvanceDate, setImmediateAdvanceDate] = useState("");
  const [balanceAdvanceDate, setBalanceAdvanceDate] = useState("");
  // Set by hand (or loaded with an existing contract): stop following the delivery To Date.
  const [balanceDateEdited, setBalanceDateEdited] = useState(() => Boolean(navState?.isEdit));
  const [sellerPaymentDueDays, setSellerPaymentDueDays] = useState("");
  const [buyerPaymentDueDays, setBuyerPaymentDueDays] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");

  const [status, setStatus] = useState(false);
  const [formError, setFormError] = useState("");

  const editContract = useMemo<Contract | null>(() => {
    if (!navState?.isEdit || !navState.contract) return null;
    if (!contractDetails) return navState.contract;

    const response = asRecord(contractDetails);
    const source = asRecord(response.data ?? response.result ?? response.contract ?? contractDetails);
    const basicDetails = asRecord(source.basicDetails);
    const sellerDetails = asRecord(source.sellerConditions ?? source.sellerCondition);
    const buyerDetails = asRecord(source.buyerConditions ?? source.buyerCondition);
    const paymentDetails = asRecord(
      source.paymentTerms ?? source.paymentsInvoices ?? source.paymentInvoices ?? source.paymentDetails,
    );
    const fallback = navState.contract;

    return {
      ...fallback,
      contractId: asNumber(source.contractId, fallback.contractId) ?? fallback.contractId,
      id: String(source.contractNumber ?? fallback.id),
      contractNumber: String(source.contractNumber ?? fallback.contractNumber),
      date: String(source.contractDate ?? fallback.date),
      effectiveFrom: source.effectiveFrom ? String(source.effectiveFrom) : fallback.effectiveFrom,
      effectiveTo: source.effectiveTo ? String(source.effectiveTo) : fallback.effectiveTo,
      dateValue: source.contractDate
        ? new Date(String(source.contractDate)).getTime()
        : fallback.dateValue,
      seller: String(source.sellerName ?? fallback.seller),
      buyer: String(source.buyerName ?? fallback.buyer),
      product: String(source.productName ?? fallback.product),
      sellerId: asNumber(source.sellerId, fallback.sellerId),
      buyerId: asNumber(source.buyerId, fallback.buyerId),
      productId: asNumber(source.productId, fallback.productId),
      quantityMeasure: String(basicDetails.quantityMeasure ?? fallback.quantityMeasure),
      qtyValue: asNumber(basicDetails.quantity ?? source.totalQuantityMT, fallback.qtyValue) ?? 0,
      qty: `${basicDetails.quantity ?? source.totalQuantityMT ?? fallback.qtyValue} ${basicDetails.quantityMeasure ?? fallback.quantityMeasure}`,
      poTolerance: String(basicDetails.poTolerancePercentage ?? source.tolerancePercentage ?? fallback.poTolerance),
      deliveryType: String(basicDetails.deliveryType ?? source.deliveryType ?? fallback.deliveryType),
      approxTravelDays: asNumber(basicDetails.approxTravelDays ?? source.approxTravelDays, fallback.approxTravelDays ?? undefined) ?? null,
      approxTravelHours: asNumber(basicDetails.approxTravelHours ?? source.approxTravelHours, fallback.approxTravelHours ?? undefined) ?? null,
      cRateValue: asNumber(basicDetails.contractRate ?? source.pricePerMT, fallback.cRateValue) ?? 0,
      gst:
        basicDetails.gstPercentage ?? source.gstPercentage ?? source.gstPercent
          ? `${basicDetails.gstPercentage ?? source.gstPercentage ?? source.gstPercent}%`
          : fallback.gst,
      gstDetails: String(basicDetails.gstDetails ?? source.gstDetails ?? fallback.gstDetails ?? ""),
      indicativeFreight: String(basicDetails.indicativeFreight ?? fallback.indicativeFreight),
      rateRemarks: String(basicDetails.rateRemarks ?? fallback.rateRemarks),
      minQuantityMT: asNumber(basicDetails.minQuantity ?? source.minQuantityMT, fallback.minQuantityMT),
      maxQuantityMT: asNumber(basicDetails.maxQuantity ?? source.maxQuantityMT, fallback.maxQuantityMT),
      dispatchedQuantityMT: asNumber(source.dispatchedQuantityMT, fallback.dispatchedQuantityMT),
      pendingQuantityMT: asNumber(source.pendingQuantityMT, fallback.pendingQuantityMT),
      currencyId: asNumber(source.currencyId, fallback.currencyId),
      contractStatusId: asNumber(source.contractStatusId, fallback.contractStatusId),
      approvalRequired: Boolean(source.approvalRequired ?? fallback.approvalRequired),
      createdById: asNumber(source.createdBy ?? source.createdById, fallback.createdById),
      sellerCommission: asNumber(sellerDetails.commission ?? source.sellerCommission, fallback.sellerCommission),
      sellerDeliverySchedule: String(sellerDetails.deliverySchedule ?? source.sellerDeliverySchedule ?? fallback.sellerDeliverySchedule ?? ""),
      sellerSpecificDays: asNumber(sellerDetails.sellerSpecificDays ?? sellerDetails.specificDays ?? source.sellerSpecificDays, fallback.sellerSpecificDays),
      sellerFromDate: String(sellerDetails.sellerFromDate ?? sellerDetails.fromDate ?? source.sellerFromDate ?? fallback.sellerFromDate ?? ""),
      sellerToDate: String(sellerDetails.sellerToDate ?? sellerDetails.toDate ?? source.sellerToDate ?? fallback.sellerToDate ?? ""),
      loadingAddressId: asNumber(sellerDetails.loadingAddressId ?? source.loadingAddressId, fallback.loadingAddressId),
      loadingAddressLabel: String(
        sellerDetails.loadingAddressAt ?? sellerDetails.loadingAddress ?? source.loadingAddressAt ?? source.loadingAddress ?? fallback.loadingAddressLabel ?? "",
      ).trim(),
      sellerRemarksSpecialConditions: String(sellerDetails.remarksSpecialConditions ?? sellerDetails.remarks ?? source.sellerRemarksSpecialConditions ?? fallback.sellerRemarksSpecialConditions ?? ""),
      sellerQualitySpecifications: (sellerDetails.qualitySpecifications ?? source.sellerQualitySpecifications ?? fallback.sellerQualitySpecifications) as Contract["sellerQualitySpecifications"],
      sellerConditions: {
        ...fallback.sellerConditions,
        commission: String(sellerDetails.commission ?? source.sellerCommission ?? fallback.sellerConditions.commission),
        deliverySchedule: String(sellerDetails.deliverySchedule ?? source.sellerDeliverySchedule ?? fallback.sellerConditions.deliverySchedule),
        fromDate: String(sellerDetails.sellerFromDate ?? sellerDetails.fromDate ?? source.sellerFromDate ?? fallback.sellerConditions.fromDate),
        toDate: String(sellerDetails.sellerToDate ?? sellerDetails.toDate ?? source.sellerToDate ?? fallback.sellerConditions.toDate),
        specificDays: String(sellerDetails.sellerSpecificDays ?? sellerDetails.specificDays ?? source.sellerSpecificDays ?? fallback.sellerConditions.specificDays),
        qualitySpecSource: String(
          sellerDetails.qualitySpecSource ??
            sellerDetails.qualitySpecificationSource ??
            source.sellerQualitySpecSource ??
            fallback.sellerConditions.qualitySpecSource,
        ),
        // The saved address comes back as an id; the free-text fields are only a fallback for older responses.
        address: String(
          (asNumber(sellerDetails.loadingAddressId ?? source.loadingAddressId, 0) || undefined) ??
          sellerDetails.loadingAddressAt ??
            sellerDetails.loadingAddress ??
            sellerDetails.address ??
            source.loadingAddressAt ??
            fallback.sellerConditions.address,
        ),
        remarks: String(sellerDetails.remarksSpecialConditions ?? sellerDetails.remarks ?? fallback.sellerConditions.remarks),
      },
      buyerCommission: asNumber(buyerDetails.commission ?? source.buyerCommission, fallback.buyerCommission),
      buyerDeliverySchedule: String(buyerDetails.deliverySchedule ?? source.buyerDeliverySchedule ?? fallback.buyerDeliverySchedule ?? ""),
      buyerSpecificDays: asNumber(buyerDetails.buyerSpecificDays ?? buyerDetails.specificDays ?? source.buyerSpecificDays, fallback.buyerSpecificDays),
      buyerFromDate: String(buyerDetails.buyerFromDate ?? buyerDetails.fromDate ?? source.buyerFromDate ?? fallback.buyerFromDate ?? ""),
      buyerToDate: String(buyerDetails.buyerToDate ?? buyerDetails.toDate ?? source.buyerToDate ?? fallback.buyerToDate ?? ""),
      deliveryAddressId: asNumber(buyerDetails.deliveryAddressId ?? source.deliveryAddressId, fallback.deliveryAddressId),
      deliveryAddressLabel: String(
        buyerDetails.deliveryAddressAt ??
          buyerDetails.deliveryAddress ??
          buyerDetails.loadingAddressAt ??
          source.deliveryAddressAt ??
          source.deliveryAddress ??
          fallback.deliveryAddressLabel ??
          "",
      ).trim(),
      buyerRemarksSpecialConditions: String(buyerDetails.remarksSpecialConditions ?? buyerDetails.remarks ?? source.buyerRemarksSpecialConditions ?? fallback.buyerRemarksSpecialConditions ?? ""),
      buyerQualitySpecifications: (buyerDetails.qualitySpecifications ?? source.buyerQualitySpecifications ?? fallback.buyerQualitySpecifications) as Contract["buyerQualitySpecifications"],
      buyerConditions: {
        ...fallback.buyerConditions,
        commission: String(buyerDetails.commission ?? source.buyerCommission ?? fallback.buyerConditions.commission),
        deliverySchedule: String(buyerDetails.deliverySchedule ?? source.buyerDeliverySchedule ?? fallback.buyerConditions.deliverySchedule),
        fromDate: String(buyerDetails.buyerFromDate ?? buyerDetails.fromDate ?? source.buyerFromDate ?? fallback.buyerConditions.fromDate),
        toDate: String(buyerDetails.buyerToDate ?? buyerDetails.toDate ?? source.buyerToDate ?? fallback.buyerConditions.toDate),
        specificDays: String(buyerDetails.buyerSpecificDays ?? buyerDetails.specificDays ?? source.buyerSpecificDays ?? fallback.buyerConditions.specificDays),
        qualitySpecSource: String(
          buyerDetails.qualitySpecSource ??
            buyerDetails.qualitySpecificationSource ??
            source.buyerQualitySpecSource ??
            fallback.buyerConditions.qualitySpecSource,
        ),
        address: String(
          (asNumber(buyerDetails.deliveryAddressId ?? source.deliveryAddressId, 0) || undefined) ??
          buyerDetails.deliveryAddressAt ??
            buyerDetails.deliveryAddress ??
            buyerDetails.loadingAddressAt ??
            buyerDetails.address ??
            source.deliveryAddressAt ??
            fallback.buyerConditions.address,
        ),
        remarks: String(buyerDetails.remarksSpecialConditions ?? buyerDetails.remarks ?? fallback.buyerConditions.remarks),
      },
      paymentTerms: String(
        paymentDetails.paymentTermName ??
          paymentDetails.paymentTerms ??
          source.paymentTermName ??
          source.paymentTerms ??
          fallback.paymentTerms,
      ),
      paymentTermName: String(
        paymentDetails.paymentTermName ??
          paymentDetails.paymentTerms ??
          source.paymentTermName ??
          source.paymentTerms ??
          fallback.paymentTermName ??
          "",
      ),
      paymentBeforeDate: String(paymentDetails.paymentBeforeDate ?? fallback.paymentBeforeDate),
      immediateAdvancePercent: String(paymentDetails.immediateAdvancePercentage ?? fallback.immediateAdvancePercent),
      immediateAdvanceDate: String(paymentDetails.immediateAdvanceDate ?? fallback.immediateAdvanceDate),
      balanceAdvancePercent: String(paymentDetails.balanceAdvancePercentage ?? fallback.balanceAdvancePercent),
      balanceAdvanceDate: String(paymentDetails.balanceAdvanceDate ?? fallback.balanceAdvanceDate),
      sellerPaymentDueDays: String(paymentDetails.sellerPaymentDueDays ?? fallback.sellerPaymentDueDays),
      buyerPaymentDueDays: String(paymentDetails.buyerPaymentDueDays ?? fallback.buyerPaymentDueDays),
      paymentRemarks: String(paymentDetails.remarks ?? fallback.paymentRemarks),
    };
  }, [contractDetails, navState]);

   const [saveContract, { isLoading: isSaving }] = useSaveContractMutation();
  // After a contract is created the user chooses who to notify, on which channels and with which templates, before leaving the screen.
  const canNotify = usePermission("notifications.send");
  const notifyEventCode = navState?.isEdit ? "CONTRACT_UPDATED" : "CONTRACT_CREATED";
  const [notifyContract, setNotifyContract] = useState<string | null>(null);
  // Buyer and seller hear about a new contract once it is approved, so by default it notifies only when saved as Approved and
  // not back-dated; an edit never notifies by default. Ticking or unticking the box overrides this.
  const isPastDate = Boolean(contractDate) && contractDate < todayInputDate();
  const [notifyTouched, setNotifyTouched] = useState(false);
  const [notifyChoice, setNotifyChoice] = useState(false);
  const notifyAfterSave = notifyTouched ? notifyChoice : !navState?.isEdit && status && !isPastDate;
  const setNotifyAfterSave = (value: boolean) => {
    setNotifyTouched(true);
    setNotifyChoice(value);
  };
  const [pastDateConfirmOpen, setPastDateConfirmOpen] = useState(false);
  const [notifyChoices, setNotifyChoices] = useState<NotifyChoices | null>(null);
   const [updateContract, { isLoading: isUpdating }] =
  useUpdateContractMutation();
  const isSubmitting = isSaving || isUpdating;

  const resolveOptionValue = (
    options: { value: string; label: string }[],
    contractValue: string | undefined,
  ) => {
    if (!contractValue) return "";
    const match = options.find(
      (option) =>
        optionKey(option.value) === optionKey(contractValue) ||
        optionKey(option.label) === optionKey(contractValue),
    );
    if (match) return match.value;
    return contractValue;
  };

  /**
   * resolveOptionValue for dropdowns whose value is a database id. An unmatched label
   * is dropped rather than kept, so a display name never reaches a request expecting
   * an id — GetProfileAddress rejects one with a 400, and Number() turns it into NaN
   * on save, which serialises as null. Returns "" until the options have loaded; the
   * hydration effect re-runs on businessProfileOptions/productOptions and fills it in.
   */
  const resolveOptionId = (
    options: { value: string; label: string }[],
    contractValue: string | undefined,
  ) => asOptionId(resolveOptionValue(options, contractValue));

  // helper to convert `d/m/yyyy` or timestamp into yyyy-mm-dd for <input type="date">
  const toIsoDate = (value: string | number | undefined) => {
    if (!value) return "";
    if (typeof value === "number") return new Date(value).toISOString().slice(0, 10);
    // value like "12/8/2026" or "12/08/2026"
    const parts = value.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts.map((p) => p.padStart(2, "0"));
      return `${y}-${m}-${d}`;
    }
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? "" : new Date(parsed).toISOString().slice(0, 10);
  };
  const toApiDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
    // Date inputs represent a calendar day. Do not convert local midnight to
    // UTC, as that can move the date back one day in timezones ahead of UTC.
    return `${value}T00:00:00.000Z`;
  };

  const toInputDate = (value: string | undefined) => {
    if (!value) return "";

    const isoDate = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDate) return isoDate[1];

    const parts = value.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return "";
  };
const { data: products, isError: productsFailed } = useGetProductsQuery();
    const productOptions = useMemo(
      () =>
        (products ?? []).map((product) => ({
          value: String(product.id),
          label: product.name ?? "",
        })),
      [products],
    );
    // Product features -> editable quality specs for the seller and the buyer (a new contract starts from the product, an edit from its saved values).
    const isEditMode = !!navState?.isEdit;
    const defaultFeatures = useMemo<FeatureSpec[]>(() => {
      const product = (products ?? []).find((item) => String(item.id) === productId);
      return (parseProductFeatures(product?.productFeatures ?? null).nutritionalSpecifications ?? [])
        .filter((spec) => spec.parameter?.trim())
        .map((spec) => ({
          parameter: spec.parameter.trim(),
          min: spec.min == null ? "" : String(spec.min),
          max: spec.max == null ? "" : String(spec.max),
        }));
    }, [products, productId]);
    const defaultFeaturesKey = JSON.stringify(defaultFeatures);
    const [sellerSpecs, setSellerSpecs] = useState<FeatureSpec[]>([]);
    const [buyerSpecs, setBuyerSpecs] = useState<FeatureSpec[]>([]);

    // Editing: the values saved on the contract, per side, as editable rows (only while the product is still the contract's own).
    const savedSellerSpecs = useMemo(() => toFeatureSpecs(editContract?.sellerQualitySpecifications), [editContract]);
    const savedBuyerSpecs = useMemo(() => toFeatureSpecs(editContract?.buyerQualitySpecifications), [editContract]);
    const savedSpecsKey = JSON.stringify([savedSellerSpecs, savedBuyerSpecs]);
    const contractProductId = editContract?.productId != null ? String(editContract.productId) : "";
    const keepSavedSpecs = isEditMode && !!productId && productId === contractProductId;

    // Reload both lists whenever the selected product (or its features) changes; a refetch with identical data keeps the user's edits.
    // A new contract starts from the product's features; an existing one from its saved values, laid out on the product's features.
    useEffect(() => {
      if (isEditMode && !contractDetails) return; // wait for the saved specs
      if (keepSavedSpecs) {
        setSellerSpecs(mergeSavedSpecs(defaultFeatures, savedSellerSpecs));
        setBuyerSpecs(mergeSavedSpecs(defaultFeatures, savedBuyerSpecs));
      } else {
        setSellerSpecs(defaultFeatures.map((spec) => ({ ...spec })));
        setBuyerSpecs(defaultFeatures.map((spec) => ({ ...spec })));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultFeaturesKey, isEditMode, keepSavedSpecs, savedSpecsKey, !!contractDetails]);

    const patchSpec =
      (setter: typeof setSellerSpecs) => (index: number, patch: Partial<Pick<FeatureSpec, "min" | "max">>) =>
        setter((prev) => prev.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)));

    const renderFeatureSpecs = (side: "Seller" | "Buyer", specs: FeatureSpec[], setter: typeof setSellerSpecs) => (
      <div className="form-field new-contract__grid--full">
        <span className="form-field__label">Quality Specifications</span>
        {!productId ? (
          <p className="new-contract__feature-empty">Select a product to load its quality specifications.</p>
        ) : specs.length === 0 ? (
          <p className="new-contract__feature-empty">No quality features are defined for this product.</p>
        ) : (
          <div className="new-contract__features">
            <div className="new-contract__feature-row new-contract__feature-head" aria-hidden>
              <span>Parameter</span>
              <span>Min</span>
              <span>Max</span>
            </div>
            {specs.map((spec, index) => (
              <div className="new-contract__feature-row" key={spec.parameter}>
                <span className="new-contract__feature-name">{spec.parameter}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-field__control"
                  value={spec.min}
                  placeholder="Min"
                  aria-label={`${side} ${spec.parameter} minimum`}
                  onChange={(event) => patchSpec(setter)(index, { min: event.target.value })}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-field__control"
                  value={spec.max}
                  placeholder="Max"
                  aria-label={`${side} ${spec.parameter} maximum`}
                  onChange={(event) => patchSpec(setter)(index, { max: event.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const { data: businessProfiles, isError: businessProfilesFailed } = useGetBusinessProfileSummaryQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
    const businessProfileOptions = useMemo(
      () => {
        const uniqueProfiles = new Map<number, { value: string; label: string }>();

        for (const profile of businessProfiles ?? []) {
          if (profile.status?.toLowerCase() !== "active") continue;

          if (!uniqueProfiles.has(profile.profileId)) {
            uniqueProfiles.set(profile.profileId, {
              value: String(profile.profileId),
              label: profile.legalName ?? "",
            });
          }
        }

        return Array.from(uniqueProfiles.values());
      },
      [businessProfiles],
    );
    // Guarded on the id shape, not just emptiness: the endpoint binds profileId as an
    // int and 400s on anything else.
    // currentData, not data: after switching seller/buyer, `data` still holds the previous party's addresses until the
    // new ones arrive, and the primary-address effect below would put the old party's address back.
    const { currentData: sellerAddressList } = useGetProfileAddressQuery(sellerId, {
      skip: !isProfileId(sellerId),
    });
    const { currentData: buyerAddressList } = useGetProfileAddressQuery(buyerId, {
      skip: !isProfileId(buyerId),
    });
    const sellerAddresses = useMemo(() => sellerAddressList ?? [], [sellerAddressList]);
    const buyerAddresses = useMemo(() => buyerAddressList ?? [], [buyerAddressList]);
    // The party's list including the contract's saved address (a one-time contract address is not in the plain list).
    const savedLoadingId = editContract?.loadingAddressId || undefined;
    const savedDeliveryId = editContract?.deliveryAddressId || undefined;
    const { currentData: sellerListWithSaved } = useGetProfileAddressWithSelectedQuery(
      { profileId: sellerId, includeAddressId: savedLoadingId },
      { skip: !isProfileId(sellerId) || !savedLoadingId },
    );
    const { currentData: buyerListWithSaved } = useGetProfileAddressWithSelectedQuery(
      { profileId: buyerId, includeAddressId: savedDeliveryId },
      { skip: !isProfileId(buyerId) || !savedDeliveryId },
    );

    // Edit: the contract's saved address isn't one of this party's addresses (e.g. kept from a previously chosen
    // seller/buyer) and there's no text to show for it: clear it, so the field asks for the right address instead
    // of silently saving the wrong one. Checked against the list that includes the saved id, so a valid one-time contract
    // address is kept; runs only once that list has loaded.
    useEffect(() => {
      const savedId = editContract?.loadingAddressId ? String(editContract.loadingAddressId) : "";
      if (!sellerListWithSaved || !savedId || sellerConditions.address !== savedId || editContract?.loadingAddressLabel) return;
      if (!sellerListWithSaved.some((address) => String(address.addressId) === savedId)) {
        setSellerConditions((prev) => (prev.address === savedId ? { ...prev, address: "" } : prev));
      }
    }, [sellerListWithSaved, sellerConditions.address, editContract]);
    useEffect(() => {
      const savedId = editContract?.deliveryAddressId ? String(editContract.deliveryAddressId) : "";
      if (!buyerListWithSaved || !savedId || buyerConditions.address !== savedId || editContract?.deliveryAddressLabel) return;
      if (!buyerListWithSaved.some((address) => String(address.addressId) === savedId)) {
        setBuyerConditions((prev) => (prev.address === savedId ? { ...prev, address: "" } : prev));
      }
    }, [buyerListWithSaved, buyerConditions.address, editContract]);
    // On edit the address arrives as free text, which matches no option and is sent
    // back as 0. Swap it for the matching addressId as soon as the list is available.
    useEffect(() => {
      if (!sellerConditions.address || /^\d+$/.test(sellerConditions.address)) return;
      const match = findAddressByLabel(sellerAddresses, sellerConditions.address);
      if (match) setSellerConditions((prev) => ({ ...prev, address: String(match.addressId) }));
    }, [sellerAddresses, sellerConditions.address]);

    // "Delivery at" starts on the party's primary address, or its only address.
    useEffect(() => {
      if (sellerConditions.address) return;
      const preferred = sellerAddresses.find((address) => address.isPrimary) ?? (sellerAddresses.length === 1 ? sellerAddresses[0] : undefined);
      if (preferred) setSellerConditions((prev) => (prev.address ? prev : { ...prev, address: String(preferred.addressId) }));
    }, [sellerAddresses, sellerConditions.address]);

    useEffect(() => {
      if (buyerConditions.address) return;
      const preferred = buyerAddresses.find((address) => address.isPrimary) ?? (buyerAddresses.length === 1 ? buyerAddresses[0] : undefined);
      if (preferred) setBuyerConditions((prev) => (prev.address ? prev : { ...prev, address: String(preferred.addressId) }));
    }, [buyerAddresses, buyerConditions.address]);

    useEffect(() => {
      if (!buyerConditions.address || /^\d+$/.test(buyerConditions.address)) return;
      const match = findAddressByLabel(buyerAddresses, buyerConditions.address);
      if (match) setBuyerConditions((prev) => ({ ...prev, address: String(match.addressId) }));
    }, [buyerAddresses, buyerConditions.address]);
  
  const enteredRate = parseFloat(contractRate) || 0;
  const gstFraction = (parseFloat(gstPercent) || 0) / 100;
  // Product rate: the rate before GST. Entered "Including GST" it is worked back out of the rate; otherwise it is the rate.
  const baseRate = gstDetails === "including" ? Math.round((enteredRate / (1 + gstFraction)) * 100) / 100 : enteredRate;
  const gstAmount = Math.round(baseRate * gstFraction * 100) / 100;
  const netRate = Math.round((baseRate + gstAmount) * 100) / 100;

  // Forward Advance: Balance Advance Date is the forward contract's To Date (buyer's, else seller's) until set by hand.
  const forwardToDate = buyerConditions.toDate || sellerConditions.toDate;
  useEffect(() => {
    if (paymentTerms !== "forward-advance" || balanceDateEdited || !forwardToDate) return;
    setBalanceAdvanceDate(forwardToDate);
  }, [paymentTerms, forwardToDate, balanceDateEdited]);

  const balanceAdvancePercent = immediateAdvancePercent
    ? Math.max(0, 100 - (parseFloat(immediateAdvancePercent) || 0))
    : "";

  const sellerLabel = businessProfileOptions.find((option) => option.value === sellerId)?.label;
  const buyerLabel = businessProfileOptions .find((option) => option.value === buyerId)?.label;
  const productLabel = productOptions.find((option) => option.value === productId)?.label;
  const quantityMeasureLabel = quantityMeasureOptions.find(
    (option) => option.value === quantityMeasure,
  )?.label;

  const requiredValues = useMemo(
    () => ({
      contractDate,
      effectiveTo,
      sellerId,
      buyerId,
      productId,
      quantityMeasure,
      qty,
      poTolerance,
      deliveryType,
      contractRate,
      gstPercent,
      gstDetails,
      sellerCommission: sellerConditions.commission,
      sellerDeliverySchedule: sellerConditions.deliverySchedule,
      sellerFromDate:
        sellerConditions.deliverySchedule === "forward-contract" ? sellerConditions.fromDate : "skip",
      sellerToDate:
        sellerConditions.deliverySchedule === "forward-contract" ? sellerConditions.toDate : "skip",
      sellerSpecificDays:
        sellerConditions.deliverySchedule === "specific-days" ? sellerConditions.specificDays : "skip",
      // Contracts record the product's features (editable min / max) instead of a spec source, so no source is asked for.
      sellerQualitySpecSource: "skip",
      sellerAddress: sellerConditions.address,
      buyerCommission: buyerConditions.commission,
      buyerDeliverySchedule: buyerConditions.deliverySchedule,
      buyerFromDate:
        buyerConditions.deliverySchedule === "forward-contract" ? buyerConditions.fromDate : "skip",
      buyerToDate:
        buyerConditions.deliverySchedule === "forward-contract" ? buyerConditions.toDate : "skip",
      buyerSpecificDays:
        buyerConditions.deliverySchedule === "specific-days" ? buyerConditions.specificDays : "skip",
      buyerQualitySpecSource: "skip",
      buyerAddress: buyerConditions.address,
      paymentTerms,
      paymentBeforeDate: paymentTerms === "100-advance" ? paymentBeforeDate : "skip",
      immediateAdvancePercent:
        paymentTerms === "forward-advance" ? immediateAdvancePercent : "skip",
      immediateAdvanceDate: paymentTerms === "forward-advance" ? immediateAdvanceDate : "skip",
      balanceAdvanceDate: paymentTerms === "forward-advance" ? balanceAdvanceDate : "skip",
      sellerPaymentDueDays: paymentTerms === "credits" ? sellerPaymentDueDays : "skip",
      buyerPaymentDueDays: paymentTerms === "credits" ? buyerPaymentDueDays : "skip",
    }),
    [
      contractDate,
      effectiveTo,
      sellerId,
      buyerId,
      productId,
      quantityMeasure,
      qty,
      poTolerance,
      deliveryType,
      contractRate,
      gstPercent,
      gstDetails,
      sellerConditions,
      buyerConditions,
      isEditMode,
      paymentTerms,
      paymentBeforeDate,
      immediateAdvancePercent,
      immediateAdvanceDate,
      balanceAdvanceDate,
      sellerPaymentDueDays,
      buyerPaymentDueDays,
    ],
  );


  // The buyer's delivery schedule and quality specification follow the seller's while they still match it; once changed on the
  // buyer side they stay as set.
  const handleSellerConditionChange = (patch: Partial<ConditionState>) => {
    const follow: Partial<ConditionState> = {};
    for (const key of FOLLOWED_CONDITION_KEYS) {
      if (key in patch && buyerConditions[key] === sellerConditions[key]) follow[key] = patch[key];
    }
    setSellerConditions((prev) => ({ ...prev, ...patch }));
    if (Object.keys(follow).length > 0) setBuyerConditions((prev) => ({ ...prev, ...follow }));
  };

  // Picking a party fills its commission from its profile (seller: sell charge, buyer: buy charge); it stays editable.
  const profileCharge = (profileId: string, key: "sellCharge" | "buyCharge") =>
    businessProfiles?.find((profile) => String(profile.profileId) === profileId)?.[key];
  // A different party has different addresses: clear the old one (the new party's primary address then fills in),
  // otherwise the contract was saved with the previous seller's / buyer's address.
  const handleSellerPick = (value: string) => {
    const changed = value !== sellerId;
    setSellerId(value);
    const charge = profileCharge(value, "sellCharge");
    setSellerConditions((prev) => ({
      ...prev,
      ...(charge ? { commission: String(charge) } : {}),
      ...(changed ? { address: "" } : {}),
    }));
  };
  const handleBuyerPick = (value: string) => {
    const changed = value !== buyerId;
    setBuyerId(value);
    const charge = profileCharge(value, "buyCharge");
    setBuyerConditions((prev) => ({
      ...prev,
      ...(charge ? { commission: String(charge) } : {}),
      ...(changed ? { address: "" } : {}),
    }));
  };

  const handleBuyerConditionChange = (patch: Partial<ConditionState>) => {
    setBuyerConditions((prev) => ({ ...prev, ...patch }));
  };

  const handleNumberChange =
    (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  const handleSubmit = async (pastDateConfirmed = false) => {
  const missing = Object.entries(requiredValues)
    .filter(([, value]) => !value)
    .map(([key]) => REQUIRED_FIELD_LABELS[key])
    .filter(Boolean);

  if (missing.length > 0) {
    setFormError(
      `Please fill in the required fields: ${missing.join(", ")}.`
    );
    return;
  }

  if (sellerId && buyerId && sellerId === buyerId) {
    setFormError("Seller and Buyer cannot be the same business. Please select a different buyer.");
    return;
  }

  if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
    setFormError("Effective To cannot be before Effective From.");
    return;
  }

  // A new contract dated in the past is confirmed before it is saved.
  if (!navState?.isEdit && isPastDate && !pastDateConfirmed) {
    setPastDateConfirmOpen(true);
    return;
  }

  if (Number.isNaN(parseOptionalWhole(travelDays, 0, 365))) {
    setFormError("Approx. travel time: days must be a whole number from 0 to 365.");
    return;
  }
  if (Number.isNaN(parseOptionalWhole(travelHours, 0, 23))) {
    setFormError("Approx. travel time: hours must be a whole number from 0 to 23.");
    return;
  }

  const specError =
    validateFeatureSpecs("Seller", sellerSpecs) || validateFeatureSpecs("Buyer", buyerSpecs);
  if (specError) {
    setFormError(specError);
    return;
  }

  setFormError("");

  if (
    navState?.isEdit &&
    (isContractDetailsLoading || isContractDetailsFetching || !contractDetails)
  ) {
    setFormError("Contract details are still loading. Please try again.");
    return;
  }

  try {
    const currentUserId = Number(
      localStorage.getItem("userId") || 0
    );

    const quantity = Number(qty) || 0;
    const tolerance = Number(poTolerance) || 0;
    // Saved as the product rate (before GST) however it was entered, as every existing contract stores it.
    const rate = baseRate;
    // Stored as the readable text ("5% GST", "FOR Delivery") so lists and messages can show them as they are.
    const gstDetailsLabel = gstDetailsOptions.find((option) => option.value === gstDetails)?.label ?? gstDetails;
    const deliveryTypeLabel = deliveryTypeOptions.find((option) => option.value === deliveryType)?.label ?? deliveryType;

    const immediateAdvance =
      Number(immediateAdvancePercent) || 0;

    const balanceAdvance = Math.max(
      0,
      100 - immediateAdvance
    );

    const now = toApiDate(contractDate);

    if (!now) {
      setFormError("Invalid contract date.");
      return;
    }

    // The contracts list only contains summary values. In edit mode, retain
    // the complete record fetched for this contract when building the update.
    const existingContract = editContract ?? navState?.contract;

    const currentContractNumber =
      existingContract?.contractNumber ||
      existingContract?.id ||
      contractNumber ||
      "";

    /*
     * ==========================================
     * UPDATE
     * ==========================================
     */

    if (navState?.isEdit) {
      if (!currentContractNumber) {
        setFormError(
          "Contract number is missing. Cannot update this contract."
        );
        return;
      }

      if (!existingContract?.contractId) {
        setFormError("Contract ID is missing. Cannot update this contract.");
        return;
      }

      const updateContractData = {
        contractNumber: currentContractNumber,

        sellerId: Number(sellerId),
        buyerId: Number(buyerId),

        contractDate: now,
        effectiveFrom: toApiDate(effectiveFrom || contractDate) || now,
        effectiveTo: toApiDate(effectiveTo) || now,
        totalQuantityMT: quantity,
        productId: Number(productId),
        tolerancePercentage: tolerance,
        // Derived from the quantity on the form, not the stored contract — otherwise
        // editing the quantity leaves the old min/max behind.
        minQuantityMT: quantity,
        maxQuantityMT: quantity,
        dispatchedQuantityMT: existingContract?.dispatchedQuantityMT ?? 0,
        pendingQuantityMT: Math.max(0, quantity - (existingContract?.dispatchedQuantityMT ?? 0)),
        pricePerMT: rate,
        gstPercentage: Number(gstPercent) || 0,
        gstDetails: gstDetailsLabel,
        deliveryType: deliveryTypeLabel,
        approxTravelDays: parseOptionalWhole(travelDays, 0, 365),
        approxTravelHours: parseOptionalWhole(travelHours, 0, 23),
        currencyId: existingContract?.currencyId ?? 1,
        contractStatusId: existingContract?.contractStatusId ?? (status ? 2 : 1),
        sellerCommission: Number(sellerConditions.commission) || 0,
        sellerDeliverySchedule: sellerConditions.deliverySchedule || "ready-loading",
        sellerSpecificDays: Number(sellerConditions.specificDays) || 0,
        sellerFromDate: sellerConditions.fromDate ? toApiDate(sellerConditions.fromDate) : now,
        sellerToDate: sellerConditions.toDate ? toApiDate(sellerConditions.toDate) : now,
        loadingAddressId: Number(sellerConditions.address) || 0,
        sellerQualitySpecSource: sellerConditions.qualitySpecSource || null,
        sellerRemarksSpecialConditions: sellerConditions.remarks || "",
        sellerQualitySpecifications: toSavePayload(Number(sellerId), sellerSpecs),
        buyerCommission: Number(buyerConditions.commission) || 0,
        buyerDeliverySchedule: buyerConditions.deliverySchedule || "ready-loading",
        buyerSpecificDays: Number(buyerConditions.specificDays) || 0,
        buyerFromDate: buyerConditions.fromDate ? toApiDate(buyerConditions.fromDate) : now,
        buyerToDate: buyerConditions.toDate ? toApiDate(buyerConditions.toDate) : now,
        deliveryAddressId: Number(buyerConditions.address) || 0,
        buyerQualitySpecSource: buyerConditions.qualitySpecSource || null,
        buyerRemarksSpecialConditions: buyerConditions.remarks || "",
        buyerQualitySpecifications: toSavePayload(Number(buyerId), buyerSpecs),
        remarks: paymentRemarks || existingContract?.paymentRemarks || "",
        approvalRequired: existingContract?.approvalRequired ?? true,
        createdBy: existingContract?.createdById ?? currentUserId,
        paymentTerms: {
          paymentTermName: paymentTermsOptions.find((option) => option.value === paymentTerms)?.label || paymentTerms,
          paymentBeforeDate: paymentBeforeDate ? toApiDate(paymentBeforeDate) : now,
          sellerPaymentDueDays: Number(sellerPaymentDueDays) || 0,
          buyerPaymentDueDays: Number(buyerPaymentDueDays) || 0,
          immediateAdvancePercentage: immediateAdvance,
          immediateAdvanceDate: immediateAdvanceDate ? toApiDate(immediateAdvanceDate) : now,
          balanceAdvancePercentage: balanceAdvance,
          balanceAdvanceDate: balanceAdvanceDate ? toApiDate(balanceAdvanceDate) : now,
          remarks: paymentRemarks || "",
        },
      };

      const updatePayload = {
        contractNumber: currentContractNumber,
        updateContract: updateContractData,
      };

      await updateContract(updatePayload).unwrap();

      localStorage.setItem(
        "successMessage",
        "Contract updated successfully."
      );

      // Offer to tell the buyer and seller about the change (Skip / close continues to the list).
      if (canNotify && notifyAfterSave && currentContractNumber) {
        setNotifyContract(String(currentContractNumber));
        return;
      }
    }

    /*
     * ==========================================
     * CREATE
     * ==========================================
     */

    else {
      const createPayload = {
        contractNumber: "",

        sellerId: Number(sellerId),
        buyerId: Number(buyerId),

        contractDate: now,
        effectiveFrom: toApiDate(effectiveFrom || contractDate) || now,
        effectiveTo: toApiDate(effectiveTo) || now,

        totalQuantityMT: quantity,

        productId: Number(productId),

        tolerancePercentage: tolerance,

        minQuantityMT: quantity,
        maxQuantityMT: quantity,

        dispatchedQuantityMT: 0,
        pendingQuantityMT: quantity,

        pricePerMT: rate,
        gstPercentage: Number(gstPercent) || 0,
        gstDetails: gstDetailsLabel,
        deliveryType: deliveryTypeLabel,

        approxTravelDays: parseOptionalWhole(travelDays, 0, 365),
        approxTravelHours: parseOptionalWhole(travelHours, 0, 23),

        currencyId: 1,

        contractStatusId: status ? 2 : 1,

        sellerCommission:
          Number(sellerConditions.commission) || 0,

        sellerDeliverySchedule:
          sellerConditions.deliverySchedule,

        sellerSpecificDays:
          Number(sellerConditions.specificDays) || 0,

        sellerFromDate:
          sellerConditions.fromDate
            ? toApiDate(sellerConditions.fromDate)
            : now,

        sellerToDate:
          sellerConditions.toDate
            ? toApiDate(sellerConditions.toDate)
            : now,

        loadingAddressId:
          Number(sellerConditions.address) || 0,

        sellerQualitySpecSource:
          sellerConditions.qualitySpecSource || null,

        sellerRemarksSpecialConditions:
          sellerConditions.remarks || "",

        // sellerQualitySpecifications: [
        //   {
        //     profileId: Number(sellerId),
        //     parameterId: 1,
        //     minValue: 0,
        //     maxValue: 0,
        //     unit: "",
        //   },
        // ],
        sellerQualitySpecifications: toSavePayload(Number(sellerId), sellerSpecs),

        buyerCommission:
          Number(buyerConditions.commission) || 0,

        buyerDeliverySchedule:
          buyerConditions.deliverySchedule,

        buyerSpecificDays:
          Number(buyerConditions.specificDays) || 0,

        buyerFromDate:
          buyerConditions.fromDate
            ? toApiDate(buyerConditions.fromDate)
            : now,

        buyerToDate:
          buyerConditions.toDate
            ? toApiDate(buyerConditions.toDate)
            : now,

        deliveryAddressId:
          Number(buyerConditions.address) || 0,

        buyerQualitySpecSource:
          buyerConditions.qualitySpecSource || null,

        buyerRemarksSpecialConditions:
          buyerConditions.remarks || "",

        // buyerQualitySpecifications: [
        //   {
        //     profileId: Number(buyerId),
        //     parameterId: 1,
        //     minValue: 0,
        //     maxValue: 0,
        //     unit: "",
        //   },
        // ],
        buyerQualitySpecifications: toSavePayload(Number(buyerId), buyerSpecs),

        remarks: paymentRemarks || "",

        approvalRequired: true,

        createdBy: currentUserId,

        paymentTerms: {
          paymentTermName:
            paymentTermsOptions.find(
              (option) =>
                option.value === paymentTerms
            )?.label || paymentTerms,

          paymentBeforeDate:
            paymentBeforeDate
              ? toApiDate(paymentBeforeDate)
              : now,

          sellerPaymentDueDays:
            Number(sellerPaymentDueDays) || 0,

          buyerPaymentDueDays:
            Number(buyerPaymentDueDays) || 0,

          immediateAdvancePercentage:
            immediateAdvance,

          immediateAdvanceDate:
            immediateAdvanceDate
              ? toApiDate(immediateAdvanceDate)
              : now,

          balanceAdvancePercentage:
            balanceAdvance,

          balanceAdvanceDate:
            balanceAdvanceDate
              ? toApiDate(balanceAdvanceDate)
              : now,

          remarks: paymentRemarks || "",
        },
      };

      const created = await saveContract(createPayload).unwrap();

      localStorage.setItem(
        "successMessage",
        "Contract created successfully."
      );

      // The API returns the new contract number. Offer to notify the buyer and seller (Skip / close continues to the list).
      const createdNumber = typeof created === "string" ? created.replace(/^"|"$/g, "") : "";
      if (canNotify && notifyAfterSave && createdNumber) {
        setNotifyContract(createdNumber);
        return;
      }
    }

    window.location.href = "/admin/contracts?show=all";

  } catch (error) {
    console.error(
      navState?.isEdit
        ? "Update contract failed:"
        : "Save contract failed:",
      error
    );

    const err = error as {
      status?: number;
      data?: unknown;
    };

    console.error("API Status:", err.status);
    console.error("API Response:", err.data);

    // The API's own reason when it is a plain sentence (never raw backend data), else a general message.
    setFormError(
      getErrorMessage(
        error,
        navState?.isEdit ? "Failed to update contract. Please try again." : "Failed to create contract. Please try again.",
      ),
    );
  }
};
  useEffect(() => {
  if (!editContract) {
    return;
  }

  const contract = editContract;

   setContractNumber(
    contract.contractNumber || contract.id || ""
  );

  // --------------------------------------------------
  // Basic details
  // --------------------------------------------------

  setContractDate(
    toInputDate(contract.date) || toIsoDate(contract.dateValue)
  );
  setEffectiveFromInput(toInputDate(contract.effectiveFrom));
  setEffectiveTo(toInputDate(contract.effectiveTo));

  // IMPORTANT:
  // Use actual API IDs if they exist.
  // Do NOT find the ID from the display name.
  setSellerId(
    asOptionId(contract.sellerId) ||
      resolveOptionId(businessProfileOptions, contract.seller)
  );

  setBuyerId(
    asOptionId(contract.buyerId) ||
      resolveOptionId(businessProfileOptions, contract.buyer)
  );

  setProductId(
    asOptionId(contract.productId) ||
      resolveOptionId(productOptions, contract.product)
  );

  setQuantityMeasure(
    resolveOptionValue(
      quantityMeasureOptions,
      contract.quantityMeasure
    ) || "mt"
  );

  setQty(
    contract.qtyValue !== undefined
      ? String(contract.qtyValue)
      : contract.qty?.split(" ")[0] || ""
  );

  setPoTolerance(
    contract.poTolerance !== undefined
      ? String(contract.poTolerance).replace("%", "")
      : ""
  );

  setDeliveryType(
    resolveOptionValue(
      deliveryTypeOptions,
      contract.deliveryType
    )
  );
  setTravelDays(contract.approxTravelDays != null ? String(contract.approxTravelDays) : "");
  setTravelHours(contract.approxTravelHours != null ? String(contract.approxTravelHours) : "");

  const savedGstDetails = /includ/i.test(contract.gstDetails ?? "") ? "including" : contract.gstDetails ? "excluding" : "";
  const savedGstPercent = contract.gst ? Number(String(contract.gst).replace("%", "")) || 0 : 5;
  // The saved price is before GST; a contract entered "Including GST" shows its rate with the GST added back.
  setContractRate(
    contract.cRateValue !== undefined
      ? String(
          savedGstDetails === "including"
            ? Math.round(Number(contract.cRateValue) * (1 + savedGstPercent / 100) * 100) / 100
            : contract.cRateValue,
        )
      : ""
  );

  setGstPercent(
    contract.gst
      ? String(contract.gst).replace("%", "")
      : "5"
  );

  setGstDetails(savedGstDetails);

  setIndicativeFreight(
    contract.indicativeFreight !== undefined
      ? String(contract.indicativeFreight)
      : ""
  );

  setRateRemarks(
    contract.rateRemarks || ""
  );

  // --------------------------------------------------
  // Seller conditions
  // --------------------------------------------------

  setSellerConditions({
    commission:
      contract.sellerCommission !== undefined
        ? String(contract.sellerCommission)
        : contract.sellerConditions?.commission || "",

    deliverySchedule:
      resolveOptionValue(
        deliveryScheduleOptions,
        contract.sellerDeliverySchedule ||
          contract.sellerConditions?.deliverySchedule
      ),

    fromDate: toInputDate(
      contract.sellerFromDate ||
        contract.sellerConditions?.fromDate
    ),

    toDate: toInputDate(
      contract.sellerToDate ||
        contract.sellerConditions?.toDate
    ),

    specificDays:
      contract.sellerSpecificDays !== undefined
        ? String(contract.sellerSpecificDays)
        : contract.sellerConditions?.specificDays || "",

    qualitySpecSource:
      resolveOptionValue(
        qualitySpecSourceOptions,
        contract.sellerConditions?.qualitySpecSource
      ),

    address:
      contract.loadingAddressId
        ? String(contract.loadingAddressId)
        : contract.sellerConditions?.address || "",

    remarks:
      contract.sellerRemarksSpecialConditions ||
      contract.sellerConditions?.remarks ||
      "",
  });

  // --------------------------------------------------
  // Buyer conditions
  // --------------------------------------------------

  setBuyerConditions({
    commission:
      contract.buyerCommission !== undefined
        ? String(contract.buyerCommission)
        : contract.buyerConditions?.commission || "",

    deliverySchedule:
      resolveOptionValue(
        deliveryScheduleOptions,
        contract.buyerDeliverySchedule ||
          contract.buyerConditions?.deliverySchedule
      ),

    fromDate: toInputDate(
      contract.buyerFromDate ||
        contract.buyerConditions?.fromDate
    ),

    toDate: toInputDate(
      contract.buyerToDate ||
        contract.buyerConditions?.toDate
    ),

    specificDays:
      contract.buyerSpecificDays !== undefined
        ? String(contract.buyerSpecificDays)
        : contract.buyerConditions?.specificDays || "",

    qualitySpecSource:
      resolveOptionValue(
        qualitySpecSourceOptions,
        contract.buyerConditions?.qualitySpecSource
      ),

    address:
      contract.deliveryAddressId
        ? String(contract.deliveryAddressId)
        : contract.buyerConditions?.address || "",

    remarks:
      contract.buyerRemarksSpecialConditions ||
      contract.buyerConditions?.remarks ||
      "",
  });

  // --------------------------------------------------
  // Payment details
  // --------------------------------------------------

  setPaymentTerms(
    resolveOptionValue(
      paymentTermsOptions,
      contract.paymentTerms ||
        contract.paymentTermName
    )
  );

  setPaymentBeforeDate(
    toInputDate(contract.paymentBeforeDate)
  );

  setImmediateAdvancePercent(
    contract.immediateAdvancePercent || ""
  );

  setImmediateAdvanceDate(
    toInputDate(contract.immediateAdvanceDate)
  );

  setBalanceAdvanceDate(
    toInputDate(contract.balanceAdvanceDate)
  );

  setSellerPaymentDueDays(
    contract.sellerPaymentDueDays || ""
  );

  setBuyerPaymentDueDays(
    contract.buyerPaymentDueDays || ""
  );

  setPaymentRemarks(
    contract.paymentRemarks || ""
  );

  // --------------------------------------------------
  // Status
  // --------------------------------------------------

  setStatus(
    contract.contractStatusId === 2 ||
    contract.status === "Pending"
  );

}, [
  editContract,
  businessProfileOptions,
  productOptions,
]);

  return (
    <div className="new-contract">
      <div className="new-contract__topbar">
        <div className="new-contract__topbar-left">
          <h1>New Contract</h1>
          <button
            type="button"
            className="new-contract__summary-toggle"
            onClick={() => setSummaryVisible((prev) => !prev)}
          >
            {summaryVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
            {summaryVisible ? "Hide Summary" : "Show Summary"}
          </button>
        </div>
        <Link to="/admin/contracts?show=all" className="new-contract__back">
          <ArrowLeftIcon aria-hidden /> Contract List
        </Link>
      </div>

      {summaryVisible && (
        <div className="new-contract__summary">
          <div>
            <span>Contract Number</span>
            <strong>Generated on save</strong>
          </div>
          <div>
            <span>Contract Date</span>
            <strong>{contractDate || "Not Selected"}</strong>
          </div>
          <div>
            <span>Seller Name</span>
            <strong>{sellerLabel ?? "Not Selected"}</strong>
          </div>
          <div>
            <span>Buyer Name</span>
            <strong>{buyerLabel ?? "Not Selected"}</strong>
          </div>
          <div>
            <span>Product Details</span>
            <strong>{productLabel ?? "Not Selected"}</strong>
          </div>
          <div>
            <span>Qty in {quantityMeasureLabel ?? "Unit"}</span>
            <strong>{qty || "Not Entered"}</strong>
          </div>
          <div>
            <span>Contract Rate</span>
            <strong>{contractRate ? `₹${contractRate}` : "Not Entered"}</strong>
          </div>
        </div>
      )}

      <LookupLoadError failed={productsFailed || businessProfilesFailed} className="new-contract__error" />

      {formError && (
        <p className="new-contract__error" role="alert">
          {formError}
        </p>
      )}

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">1. Basic Details</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="contractDate">
              Date of Contract <span className="form-field__required">*</span>
            </label>
            <DatePickerInput
              id="contractDate"
              value={contractDate}
              onChange={(value) => setContractDate(value)}
              clearable
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Select Seller <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={businessProfileOptions.filter((option) => !buyerId || option.value !== buyerId)}
              value={sellerId}
              onChange={handleSellerPick}
              placeholder="Seller"
              ariaLabel="Select Seller"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Select Buyer <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={businessProfileOptions.filter((option) => !sellerId || option.value !== sellerId)}
              value={buyerId}
              onChange={handleBuyerPick}
              placeholder="Buyer"
              ariaLabel="Select Buyer"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Select Product <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={productOptions}
              value={productId}
              onChange={setProductId}
              placeholder="Product"
              ariaLabel="Select Product"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Delivery Type <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={deliveryTypeOptions}
              value={deliveryType}
              onChange={setDeliveryType}
              placeholder="Delivery Type"
              ariaLabel="Delivery Type"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Approx. Travel Time (Loading to Delivery)</span>
            <div className="new-contract__travel">
              <input
                id="travelDays"
                type="number"
                min="0"
                max="365"
                step="1"
                inputMode="numeric"
                className="form-field__control"
                placeholder="Days"
                aria-label="Approximate travel time, days"
                value={travelDays}
                onChange={(event) => setTravelDays(event.target.value)}
              />
              <span>days</span>
              <input
                id="travelHours"
                type="number"
                min="0"
                max="23"
                step="1"
                inputMode="numeric"
                className="form-field__control"
                placeholder="Hours"
                aria-label="Approximate travel time, hours"
                value={travelHours}
                onChange={(event) => setTravelHours(event.target.value)}
              />
              <span>hrs</span>
            </div>
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Quantity Measure <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={quantityMeasureOptions}
              value={quantityMeasure}
              onChange={setQuantityMeasure}
              ariaLabel="Quantity Measure"
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="qty">
              Qty <span className="form-field__required">*</span>
            </label>
            <input
              id="qty"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Contract Quantity"
              value={qty}
              onChange={handleNumberChange(setQty)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              PO Tolerance <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={poToleranceOptions}
              value={poTolerance}
              onChange={setPoTolerance}
              placeholder="PO Tolerance"
              ariaLabel="PO Tolerance"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              GST details <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={gstDetailsOptions}
              value={gstDetails}
              onChange={setGstDetails}
              placeholder="Select GST Details"
              ariaLabel="GST details"
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="gstPercent">
              GST % Value <span className="form-field__required">*</span>
            </label>
            <input
              id="gstPercent"
              type="number"
              min="0"
              className="form-field__control"
              value={gstPercent}
              onChange={handleNumberChange(setGstPercent)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="contractRate">
              Rate (₹/MT) <span className="form-field__required">*</span>
            </label>
            <input
              id="contractRate"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Rate Ex: 25,000"
              value={contractRate}
              onChange={handleNumberChange(setContractRate)}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="baseRate">
              Product Rate
            </label>
            <input
              id="baseRate"
              type="text"
              className="form-field__control"
              value={baseRate}
              disabled
              readOnly
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="gstAmount">
              GST Amount
            </label>
            <input
              id="gstAmount"
              type="text"
              className="form-field__control"
              value={gstAmount}
              disabled
              readOnly
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="netRate">
              Net Rate
            </label>
            <input
              id="netRate"
              type="text"
              className="form-field__control"
              value={netRate}
              disabled
              readOnly
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="effectiveFrom">
              Effective From
            </label>
            <DatePickerInput
              id="effectiveFrom"
              value={effectiveFrom}
              onChange={(value) => setEffectiveFromInput(value)}
              clearable
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="effectiveTo">
              Effective To <span className="form-field__required">*</span>
            </label>
            <DatePickerInput
              id="effectiveTo"
              value={effectiveTo}
              onChange={(value) => setEffectiveTo(value)}
              clearable
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="indicativeFreight">
              Indicative Freight
            </label>
            <input
              id="indicativeFreight"
              type="number"
              min="0"
              className="form-field__control"
              placeholder="Indicative Freight"
              value={indicativeFreight}
              onChange={handleNumberChange(setIndicativeFreight)}
            />
          </div>

          <div className="form-field new-contract__grid--full">
            <label className="form-field__label" htmlFor="rateRemarks">
              Rate Remarks
            </label>
            <textarea
              id="rateRemarks"
              className="form-field__control"
              placeholder="Enter Rate Remarks"
              value={rateRemarks}
              onChange={(event) => setRateRemarks(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">2. Seller & Buyer</h2>
        <div className="new-contract__conditions">
          <div className="new-contract__condition-card">
            <h3>Seller Conditions</h3>
            <div className="new-contract__grid new-contract__grid--condition">
              <div className="form-field">
                <label className="form-field__label" htmlFor="sellerCommission">
                  Commission <span className="form-field__required">*</span>
                </label>
                <input
                  id="sellerCommission"
                  type="number"
                  min="0"
                  className="form-field__control"
                  value={sellerConditions.commission}
                  onChange={(event) =>
                    handleSellerConditionChange({ commission: event.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <span className="form-field__label">
                  Delivery schedule <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={deliveryScheduleOptions}
                  value={sellerConditions.deliverySchedule}
                  onChange={(value) => handleSellerConditionChange({ deliverySchedule: value })}
                  ariaLabel="Seller delivery schedule"
                />
              </div>

              {sellerConditions.deliverySchedule === "forward-contract" && (
                <>
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="sellerFromDate">
                      From Date <span className="form-field__required">*</span>
                    </label>
                    <DatePickerInput
                      id="sellerFromDate"
                      value={sellerConditions.fromDate}
                      onChange={(value) => handleSellerConditionChange({ fromDate: value })}
                      clearable
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="sellerToDate">
                      To Date <span className="form-field__required">*</span>
                    </label>
                    <DatePickerInput
                      id="sellerToDate"
                      value={sellerConditions.toDate}
                      onChange={(value) => handleSellerConditionChange({ toDate: value })}
                      clearable
                    />
                  </div>
                </>
              )}

              {sellerConditions.deliverySchedule === "specific-days" && (
                <div className="form-field">
                  <label className="form-field__label" htmlFor="sellerSpecificDays">
                    Specific Days <span className="form-field__required">*</span>
                  </label>
                  <input
                    id="sellerSpecificDays"
                    type="number"
                    min="0"
                    className="form-field__control"
                    placeholder="Enter number of days"
                    value={sellerConditions.specificDays}
                    onChange={(event) =>
                      handleSellerConditionChange({ specificDays: event.target.value })
                    }
                  />
                </div>
              )}

              {renderFeatureSpecs("Seller", sellerSpecs, setSellerSpecs)}

              <div className="form-field new-contract__grid--full">
                <span className="form-field__label">
                  Loading Address At <span className="form-field__required">*</span>
                </span>
                {/* "+" opens the New Address popup: the address is saved against the seller through the API and its id is what the contract stores. */}
                <AddressSelectField
                  profileId={Number(sellerId) || 0}
                  value={sellerConditions.address}
                  savedLabel={editContract?.loadingAddressId && String(editContract.loadingAddressId) === sellerConditions.address ? editContract.loadingAddressLabel : undefined}
                  onChange={(addressId) => handleSellerConditionChange({ address: addressId })}
                  placeholder="Select Loading Address"
                  ariaLabel="Seller loading address"
                  modalTitle="New Loading Address"
                />
              </div>

              <div className="form-field new-contract__grid--full">
                <label className="form-field__label" htmlFor="sellerRemarks">
                  Remarks / Special Conditions
                </label>
                <textarea
                  id="sellerRemarks"
                  className="form-field__control"
                  placeholder="Enter Remarks / Special Conditions"
                  value={sellerConditions.remarks}
                  onChange={(event) =>
                    handleSellerConditionChange({ remarks: event.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="new-contract__condition-card">
            <h3>Buyer Conditions</h3>
            <div className="new-contract__grid new-contract__grid--condition">
              <div className="form-field">
                <label className="form-field__label" htmlFor="buyerCommission">
                  Commission <span className="form-field__required">*</span>
                </label>
                <input
                  id="buyerCommission"
                  type="number"
                  min="0"
                  className="form-field__control"
                  value={buyerConditions.commission}
                  onChange={(event) =>
                    handleBuyerConditionChange({ commission: event.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <span className="form-field__label">
                  Delivery schedule <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={deliveryScheduleOptions}
                  value={buyerConditions.deliverySchedule}
                  onChange={(value) => handleBuyerConditionChange({ deliverySchedule: value })}
                  ariaLabel="Buyer delivery schedule"
                />
              </div>

              {buyerConditions.deliverySchedule === "forward-contract" && (
                <>
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="buyerFromDate">
                      From Date <span className="form-field__required">*</span>
                    </label>
                    <DatePickerInput
                      id="buyerFromDate"
                      value={buyerConditions.fromDate}
                      onChange={(value) => handleBuyerConditionChange({ fromDate: value })}
                      clearable
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="buyerToDate">
                      To Date <span className="form-field__required">*</span>
                    </label>
                    <DatePickerInput
                      id="buyerToDate"
                      value={buyerConditions.toDate}
                      onChange={(value) => handleBuyerConditionChange({ toDate: value })}
                      clearable
                    />
                  </div>
                </>
              )}

              {buyerConditions.deliverySchedule === "specific-days" && (
                <div className="form-field">
                  <label className="form-field__label" htmlFor="buyerSpecificDays">
                    Specific Days <span className="form-field__required">*</span>
                  </label>
                  <input
                    id="buyerSpecificDays"
                    type="number"
                    min="0"
                    className="form-field__control"
                    placeholder="Enter number of days"
                    value={buyerConditions.specificDays}
                    onChange={(event) =>
                      handleBuyerConditionChange({ specificDays: event.target.value })
                    }
                  />
                </div>
              )}

              {renderFeatureSpecs("Buyer", buyerSpecs, setBuyerSpecs)}

              <div className="form-field new-contract__grid--full">
                <span className="form-field__label">
                  Delivery Address At <span className="form-field__required">*</span>
                </span>
                <AddressSelectField
                  profileId={Number(buyerId) || 0}
                  value={buyerConditions.address}
                  savedLabel={editContract?.deliveryAddressId && String(editContract.deliveryAddressId) === buyerConditions.address ? editContract.deliveryAddressLabel : undefined}
                  onChange={(addressId) => handleBuyerConditionChange({ address: addressId })}
                  placeholder="Select Delivery Address"
                  ariaLabel="Buyer delivery address"
                  modalTitle="New Delivery Address"
                  defaultUnloading
                />
              </div>

              <div className="form-field new-contract__grid--full">
                <label className="form-field__label" htmlFor="buyerRemarks">
                  Remarks / Special Conditions
                </label>
                <textarea
                  id="buyerRemarks"
                  className="form-field__control"
                  placeholder="Enter Remarks / Special Conditions"
                  value={buyerConditions.remarks}
                  onChange={(event) =>
                    handleBuyerConditionChange({ remarks: event.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">3. Payments</h2>
        <div className="new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">
              Payment terms <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={paymentTermsOptions}
              value={paymentTerms}
              onChange={setPaymentTerms}
              placeholder="Select Payment Terms"
              ariaLabel="Payment terms"
            />
          </div>

          {paymentTerms === "100-advance" && (
            <div className="form-field">
              <label className="form-field__label" htmlFor="paymentBeforeDate">
                Payment Before Date <span className="form-field__required">*</span>
              </label>
              <DatePickerInput
                id="paymentBeforeDate"
                value={paymentBeforeDate}
                onChange={(value) => setPaymentBeforeDate(value)}
                clearable
              />
            </div>
          )}

          {paymentTerms === "forward-advance" && (
            <>
              <div className="form-field">
                <label className="form-field__label" htmlFor="immediateAdvancePercent">
                  Immediate Advance % <span className="form-field__required">*</span>
                </label>
                <input
                  id="immediateAdvancePercent"
                  type="number"
                  min="0"
                  max="100"
                  className="form-field__control"
                  placeholder="Enter Immediate Advance %"
                  value={immediateAdvancePercent}
                  onChange={(event) => setImmediateAdvancePercent(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-field__label" htmlFor="immediateAdvanceDate">
                  Immediate Advance Date <span className="form-field__required">*</span>
                </label>
                <DatePickerInput
                  id="immediateAdvanceDate"
                  value={immediateAdvanceDate}
                  onChange={(value) => setImmediateAdvanceDate(value)}
                  clearable
                />
              </div>

              <div className="form-field">
                <label className="form-field__label" htmlFor="balanceAdvancePercent">
                  Balance Advance %
                </label>
                <input
                  id="balanceAdvancePercent"
                  type="text"
                  className="form-field__control"
                  value={balanceAdvancePercent}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-field">
                <label className="form-field__label" htmlFor="balanceAdvanceDate">
                  Balance Advance Date <span className="form-field__required">*</span>
                </label>
                <DatePickerInput
                  id="balanceAdvanceDate"
                  value={balanceAdvanceDate}
                  onChange={(value) => {
                    setBalanceDateEdited(true);
                    setBalanceAdvanceDate(value);
                  }}
                  clearable
                />
              </div>
            </>
          )}

          {paymentTerms === "credits" && (
            <>
              <div className="form-field">
                <label className="form-field__label" htmlFor="sellerPaymentDueDays">
                  Seller Payment Due Days <span className="form-field__required">*</span>
                </label>
                <input
                  id="sellerPaymentDueDays"
                  type="number"
                  min="0"
                  className="form-field__control"
                  placeholder="Enter number of days"
                  value={sellerPaymentDueDays}
                  onChange={(event) => setSellerPaymentDueDays(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-field__label" htmlFor="buyerPaymentDueDays">
                  Buyer Payment Due Days <span className="form-field__required">*</span>
                </label>
                <input
                  id="buyerPaymentDueDays"
                  type="number"
                  min="0"
                  className="form-field__control"
                  placeholder="Enter number of days"
                  value={buyerPaymentDueDays}
                  onChange={(event) => setBuyerPaymentDueDays(event.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-field new-contract__grid--full">
            <label className="form-field__label" htmlFor="paymentRemarks">
              Remarks
            </label>
            <textarea
              id="paymentRemarks"
              className="form-field__control"
              placeholder="Remarks / Special Conditions"
              value={paymentRemarks}
              onChange={(event) => setPaymentRemarks(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="new-contract__section">
        <h2 className="new-contract__section-title">4. Settings</h2>
        <table className="new-contract__settings-table">
          <thead>
            <tr>
              <th>Contract Setting Description</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p className="new-contract__setting-title">Approval Status</p>
                <p className="new-contract__setting-description">
                  You can not send the contract to buyer until it is approved
                </p>
              </td>
              <td>
                <div className="new-contract__setting-value">
                  <ToggleSwitch
                    checked={status}
                    onChange={setStatus}
                    ariaLabel="Approval status"
                  />
                  <span className="new-contract__setting-status">
                    {status ? "Approved" : "Pending"}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {canNotify && (
        <section className="new-contract__section">
          <h2 className="new-contract__section-title">Notifications</h2>
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="notify-after-save" checked={notifyAfterSave} onChange={(e) => setNotifyAfterSave(e.target.checked)} />
            <label className="form-check-label" htmlFor="notify-after-save">
              {navState?.isEdit
                ? "Notify the buyer and seller about this change"
                : "Notify the buyer and seller when the contract is created"}
            </label>
            {!navState?.isEdit && !notifyTouched && (!status || isPastDate) && (
              <div className="form-text">
                {isPastDate
                  ? "The contract date is in the past, so no confirmation is sent unless you tick this."
                  : "Saved as Pending: the buyer and seller are told when the contract is approved (Contract Status, Approve)."}
              </div>
            )}
            <div className="form-text">
              Choose the channels and the template for each below. After you click {navState?.isEdit ? "Update Contract" : "Create Contract"} you will see exactly who will receive what and can still change it before anything is sent.
            </div>
          </div>
          {notifyAfterSave && (
            <NotifyChoicePicker
              eventCode={notifyEventCode}
              roles={[{ code: "BUYER", label: "Buyer" }, { code: "SELLER", label: "Seller" }]}
              value={notifyChoices}
              onChange={setNotifyChoices}
            />
          )}
        </section>
      )}

      <div className="new-contract__actions">
        <Link to="/admin/contracts?show=all" className="new-contract__cancel">
          Cancel
        </Link>
        <button
          type="button"
          className="new-contract__submit"
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : navState?.isEdit
              ? "Update Contract"
              : "Create Contract"}
        </button>
      </div>

      <ConfirmDialog
        open={pastDateConfirmOpen}
        title="Contract date is in the past"
        message={`The contract is dated ${contractDate}, before today. Save it with this date?`}
        confirmLabel="Save with this date"
        onConfirm={() => {
          setPastDateConfirmOpen(false);
          void handleSubmit(true);
        }}
        onCancel={() => setPastDateConfirmOpen(false)}
      />

      <NotifyModal
        open={notifyContract !== null}
        title={`Contract ${notifyContract ?? ""} ${navState?.isEdit ? "updated" : "created"} - notify buyer and seller`}
        eventCode={notifyEventCode}
        contractNumber={notifyContract ?? undefined}
        sendLabel="Send notifications"
        closeOnBackdrop={false}
        choices={notifyChoices}
        onSkip={() => undefined}
        onClose={() => { window.location.href = "/admin/contracts?show=all"; }}
      />
    </div>
  );
};

export default NewContract;
