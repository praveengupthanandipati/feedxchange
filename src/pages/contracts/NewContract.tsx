import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import SearchableSelect from "../../components/dropdown/SearchableSelect";
import ToggleSwitch from "../../components/toggle/ToggleSwitch";
import type { Contract } from "./contracts.data";
import {
  useGetContractByContractNumberQuery,
  useSaveContractMutation,
  useUpdateContractMutation,
} from "../../store/contractsApi";

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
import { useGetProductsQuery } from "../../store/productsApi";
import {
  useGetBusinessProfileSummaryQuery,
} from "../../store/businessProfilesApi";
import { useGetProfileAddressQuery } from "../../store/userProfilesCommonApi";


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

const toUpdateQualitySpecifications = (
  specifications: Contract["sellerQualitySpecifications"] | undefined,
) =>
  (specifications ?? [])
    .map((specification) => ({
      profileId: Number(specification.profileId),
      parameterId: Number(specification.parameterId),
      minValue: Number(specification.minValue) || 0,
      maxValue: Number(specification.maxValue) || 0,
      unit: specification.unit ?? "",
    }))
    .filter(
      (specification) =>
        Number.isInteger(specification.profileId) &&
        specification.profileId > 0 &&
        Number.isInteger(specification.parameterId) &&
        specification.parameterId > 0,
    );

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

  const [contractDate, setContractDate] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantityMeasure, setQuantityMeasure] = useState("mt");
  const [qty, setQty] = useState("");
  const [poTolerance, setPoTolerance] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
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
      cRateValue: asNumber(basicDetails.contractRate ?? source.pricePerKg, fallback.cRateValue) ?? 0,
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
        address: String(
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
const { data: products } = useGetProductsQuery();
    const productOptions = useMemo(
      () =>
        (products ?? []).map((product) => ({
          value: String(product.id),
          label: product.name ?? "",
        })),
      [products],
    );
    const { data: businessProfiles } = useGetBusinessProfileSummaryQuery(undefined, {
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
    const { data: sellerAddresses = [] } = useGetProfileAddressQuery(sellerId, {
      skip: !sellerId,
    });
    const { data: buyerAddresses = [] } = useGetProfileAddressQuery(buyerId, {
      skip: !buyerId,
    });
    const sellerAddressOptions = useMemo(
      () =>
        sellerAddresses.map((address) => ({
          value: String(address.addressId),
          label: formatProfileAddress(address) || `Address ${address.addressId}`,
        })),
      [sellerAddresses],
    );
    const buyerAddressOptions = useMemo(
      () =>
        buyerAddresses.map((address) => ({
          value: String(address.addressId),
          label: formatProfileAddress(address) || `Address ${address.addressId}`,
        })),
      [buyerAddresses],
    );
  
  const baseRate = parseFloat(contractRate) || 0;
  const gstAmount = Math.round(baseRate * ((parseFloat(gstPercent) || 0) / 100) * 100) / 100;
  const netRate = Math.round((baseRate + gstAmount) * 100) / 100;

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
      sellerQualitySpecSource: sellerConditions.qualitySpecSource,
      sellerAddress: sellerConditions.address,
      buyerCommission: buyerConditions.commission,
      buyerDeliverySchedule: buyerConditions.deliverySchedule,
      buyerFromDate:
        buyerConditions.deliverySchedule === "forward-contract" ? buyerConditions.fromDate : "skip",
      buyerToDate:
        buyerConditions.deliverySchedule === "forward-contract" ? buyerConditions.toDate : "skip",
      buyerSpecificDays:
        buyerConditions.deliverySchedule === "specific-days" ? buyerConditions.specificDays : "skip",
      buyerQualitySpecSource: buyerConditions.qualitySpecSource,
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
      paymentTerms,
      paymentBeforeDate,
      immediateAdvancePercent,
      immediateAdvanceDate,
      balanceAdvanceDate,
      sellerPaymentDueDays,
      buyerPaymentDueDays,
    ],
  );


  const handleSellerConditionChange = (patch: Partial<ConditionState>) => {
    setSellerConditions((prev) => ({ ...prev, ...patch }));
  };

  const handleBuyerConditionChange = (patch: Partial<ConditionState>) => {
    setBuyerConditions((prev) => ({ ...prev, ...patch }));
  };

  const handleNumberChange =
    (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  const handleSubmit = async () => {
  console.log("navState:", navState);
  console.log("contract:", navState?.contract);
  console.log("contractNumber:", contractNumber);
  console.log("isEdit:", navState?.isEdit);

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
    const rate = Number(contractRate) || 0;

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
        effectiveFrom: now,
        effectiveTo: now,
        totalQuantityMT: quantity,
        productId: Number(productId),
        tolerancePercentage: tolerance,
        minQuantityMT: existingContract?.minQuantityMT ?? quantity,
        maxQuantityMT: existingContract?.maxQuantityMT ?? quantity,
        dispatchedQuantityMT: existingContract?.dispatchedQuantityMT ?? 0,
        pendingQuantityMT: Math.max(0, quantity - (existingContract?.dispatchedQuantityMT ?? 0)),
        pricePerKg: rate,
        currencyId: existingContract?.currencyId ?? 1,
        contractStatusId: existingContract?.contractStatusId ?? (status ? 2 : 1),
        sellerCommission: Number(sellerConditions.commission) || 0,
        sellerDeliverySchedule: sellerConditions.deliverySchedule || "ready-loading",
        sellerSpecificDays: Number(sellerConditions.specificDays) || 0,
        sellerFromDate: sellerConditions.fromDate ? toApiDate(sellerConditions.fromDate) : now,
        sellerToDate: sellerConditions.toDate ? toApiDate(sellerConditions.toDate) : now,
        loadingAddressId: Number(sellerConditions.address) || 0,
        sellerRemarksSpecialConditions: sellerConditions.remarks || "",
        sellerQualitySpecifications: toUpdateQualitySpecifications(
          existingContract?.sellerQualitySpecifications,
        ),
        buyerCommission: Number(buyerConditions.commission) || 0,
        buyerDeliverySchedule: buyerConditions.deliverySchedule || "ready-loading",
        buyerSpecificDays: Number(buyerConditions.specificDays) || 0,
        buyerFromDate: buyerConditions.fromDate ? toApiDate(buyerConditions.fromDate) : now,
        buyerToDate: buyerConditions.toDate ? toApiDate(buyerConditions.toDate) : now,
        deliveryAddressId: Number(buyerConditions.address) || 0,
        buyerRemarksSpecialConditions: buyerConditions.remarks || "",
        buyerQualitySpecifications: toUpdateQualitySpecifications(
          existingContract?.buyerQualitySpecifications,
        ),
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

      console.log(
        "UPDATE CONTRACT PAYLOAD:",
        JSON.stringify(updatePayload, null, 2)
      );

      await updateContract(updatePayload).unwrap();

      localStorage.setItem(
        "successMessage",
        "Contract updated successfully."
      );
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
        effectiveFrom: now,
        effectiveTo: now,

        totalQuantityMT: quantity,

        productId: Number(productId),

        tolerancePercentage: tolerance,

        minQuantityMT: quantity,
        maxQuantityMT: quantity,

        dispatchedQuantityMT: 0,
        pendingQuantityMT: quantity,

        pricePerKg: rate,

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
        sellerQualitySpecifications: [],

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
        buyerQualitySpecifications: [],

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

      console.log(
        "CREATE CONTRACT PAYLOAD:",
        JSON.stringify(createPayload, null, 2)
      );

      await saveContract(createPayload).unwrap();

      localStorage.setItem(
        "successMessage",
        "Contract created successfully."
      );
    }

    window.location.href = "/contracts";

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

    setFormError(
      navState?.isEdit
        ? "Failed to update contract. Please check the API response."
        : "Failed to create contract. Please check the API response."
    );
  }
};
  useEffect(() => {
  if (!editContract) {
    return;
  }

  const contract = editContract;

  console.log("EDIT CONTRACT DATA:", contract);
   setContractNumber(
    contract.contractNumber || contract.id || ""
  );

  // --------------------------------------------------
  // Basic details
  // --------------------------------------------------

  setContractDate(
    toInputDate(contract.date) || toIsoDate(contract.dateValue)
  );

  // IMPORTANT:
  // Use actual API IDs if they exist.
  // Do NOT find the ID from the display name.
  setSellerId(
    contract.sellerId !== undefined
      ? String(contract.sellerId)
      : resolveOptionValue(
          businessProfileOptions,
          contract.seller
        )
  );

  setBuyerId(
    contract.buyerId !== undefined
      ? String(contract.buyerId)
      : resolveOptionValue(
          businessProfileOptions,
          contract.buyer
        )
  );

  setProductId(
    contract.productId !== undefined
      ? String(contract.productId)
      : resolveOptionValue(
          productOptions,
          contract.product
        )
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

  setContractRate(
    contract.cRateValue !== undefined
      ? String(contract.cRateValue)
      : ""
  );

  setGstPercent(
    contract.gst
      ? String(contract.gst).replace("%", "")
      : "5"
  );

  setGstDetails(contract.gstDetails || "");

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
      contract.loadingAddressId !== undefined
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
      contract.deliveryAddressId !== undefined
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
            {summaryVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {summaryVisible ? "Hide Summary" : "Show Summary"}
          </button>
        </div>
        <Link to="/contracts" className="new-contract__back">
          <FiArrowLeft aria-hidden /> Contract List
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
            <input
              id="contractDate"
              type="date"
              className="form-field__control"
              value={contractDate}
              onChange={(event) => setContractDate(event.target.value)}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Select Seller <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={businessProfileOptions}
              value={sellerId}
              onChange={setSellerId}
              placeholder="Seller"
              ariaLabel="Select Seller"
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">
              Select Buyer <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={businessProfileOptions}
              value={buyerId}
              onChange={setBuyerId}
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
            <label className="form-field__label" htmlFor="contractRate">
              Contract Rate <span className="form-field__required">*</span>
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
            <span className="form-field__label">
              GST details <span className="form-field__required">*</span>
            </span>
            <SearchableSelect
              options={gstDetailsOptions}
              value={gstDetails}
              onChange={setGstDetails}
              placeholder="GST Details"
              ariaLabel="GST details"
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="baseRate">
              Base Rate
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
                    <input
                      id="sellerFromDate"
                      type="date"
                      className="form-field__control"
                      value={sellerConditions.fromDate}
                      onChange={(event) =>
                        handleSellerConditionChange({ fromDate: event.target.value })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="sellerToDate">
                      To Date <span className="form-field__required">*</span>
                    </label>
                    <input
                      id="sellerToDate"
                      type="date"
                      className="form-field__control"
                      value={sellerConditions.toDate}
                      onChange={(event) =>
                        handleSellerConditionChange({ toDate: event.target.value })
                      }
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

              <div className="form-field new-contract__grid--full">
                <span className="form-field__label">
                  Quality Spec Source <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={qualitySpecSourceOptions}
                  value={sellerConditions.qualitySpecSource}
                  onChange={(value) => handleSellerConditionChange({ qualitySpecSource: value })}
                  placeholder="Select Source"
                  ariaLabel="Seller quality spec source"
                />
              </div>

              <div className="form-field new-contract__grid--full">
                <span className="form-field__label">
                  Loading Address At <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={sellerAddressOptions}
                  value={sellerConditions.address}
                  onChange={(value) => handleSellerConditionChange({ address: value })}
                  allowCustom
                  ariaLabel="Seller loading address"
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
                    <input
                      id="buyerFromDate"
                      type="date"
                      className="form-field__control"
                      value={buyerConditions.fromDate}
                      onChange={(event) =>
                        handleBuyerConditionChange({ fromDate: event.target.value })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="buyerToDate">
                      To Date <span className="form-field__required">*</span>
                    </label>
                    <input
                      id="buyerToDate"
                      type="date"
                      className="form-field__control"
                      value={buyerConditions.toDate}
                      onChange={(event) =>
                        handleBuyerConditionChange({ toDate: event.target.value })
                      }
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

              <div className="form-field new-contract__grid--full">
                <span className="form-field__label">
                  Quality Spec Source <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={qualitySpecSourceOptions}
                  value={buyerConditions.qualitySpecSource}
                  onChange={(value) => handleBuyerConditionChange({ qualitySpecSource: value })}
                  placeholder="Select Source"
                  ariaLabel="Buyer quality spec source"
                />
              </div>

              <div className="form-field new-contract__grid--full">
                <span className="form-field__label">
                  Delivery Address At <span className="form-field__required">*</span>
                </span>
                <SearchableSelect
                  options={buyerAddressOptions}
                  value={buyerConditions.address}
                  onChange={(value) => handleBuyerConditionChange({ address: value })}
                  allowCustom
                  ariaLabel="Buyer delivery address"
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
              <input
                id="paymentBeforeDate"
                type="date"
                className="form-field__control"
                value={paymentBeforeDate}
                onChange={(event) => setPaymentBeforeDate(event.target.value)}
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
                <input
                  id="immediateAdvanceDate"
                  type="date"
                  className="form-field__control"
                  value={immediateAdvanceDate}
                  onChange={(event) => setImmediateAdvanceDate(event.target.value)}
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
                <input
                  id="balanceAdvanceDate"
                  type="date"
                  className="form-field__control"
                  value={balanceAdvanceDate}
                  onChange={(event) => setBalanceAdvanceDate(event.target.value)}
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

      <div className="new-contract__actions">
        <Link to="/contracts" className="new-contract__cancel">
          Cancel
        </Link>
        <button
          type="button"
          className="new-contract__submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : navState?.isEdit
              ? "Update Contract"
              : "Create Contract"}
        </button>
      </div>
    </div>
  );
};

export default NewContract;
