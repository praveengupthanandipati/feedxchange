import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import SearchableSelect from "../../components/dropdown/SearchableSelect";
import ToggleSwitch from "../../components/toggle/ToggleSwitch";
import type { Contract } from "./contracts.data";
import { useSaveContractMutation, useUpdateContractMutation } from "../../store/contractsApi";

import {
  quantityMeasureOptions,
  poToleranceOptions,
  deliveryTypeOptions,
  gstDetailsOptions,
  deliveryScheduleOptions,
  qualitySpecSourceOptions,
  addressOptions,
  paymentTermsOptions,
} from "./newContract.data";
import "./NewContract.scss";
import { useGetProductsQuery } from "../../store/productsApi";
import {useGetBusinessProfileSummaryQuery} from "../../store/businessProfilesApi";

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
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as null | { contract?: Contract; isEdit?: boolean }) || null;

  const [summaryVisible, setSummaryVisible] = useState(true);

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

  const resolveOptionValue = (
    options: { value: string; label: string }[],
    contractValue: string | undefined,
  ) => {
    if (!contractValue) return "";
    const match = options.find(
      (option) => option.value === contractValue || option.label === contractValue,
    );
    if (match) return match.value;
    console.warn("Option value not found for contract field", { contractValue, options });
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
const { data: products } = useGetProductsQuery();
    const productOptions = useMemo(
      () =>
        (products ?? []).map((product) => ({
          value: String(product.id),
          label: product.name ?? "",
        })),
      [products],
    );
    const { data: businessProfiles } = useGetBusinessProfileSummaryQuery();
    const businessProfileOptions = useMemo(
      () =>
        (businessProfiles ?? []).map((profile) => ({
          value: String(profile.profileId),
          label: profile.legalName ?? "",
        })),
      [businessProfiles],
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

  const [updateContract] = useUpdateContractMutation();
  const [saveContract] = useSaveContractMutation();

  const toIsoDateTime = (value: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  };

  const handleSubmit = async () => {
    const actionType = navState?.isEdit ? "Update" : "Create";
    console.log(`${actionType} Contract button clicked`, {
      isEdit: navState?.isEdit,
      contractNumber: navState?.contract?.id,
      contractDate,
      sellerId,
      buyerId,
      productId,
    });

    const missing = Object.entries(requiredValues)
      .filter(([, value]) => !value)
      .map(([key]) => REQUIRED_FIELD_LABELS[key]);

    if (missing.length > 0) {
      console.log(`${actionType} Contract missing required fields`, missing);
      setFormError(`Please fill in the required fields: ${missing.join(", ")}.`);
      return;
    }

    const currentUserId = Number(localStorage.getItem("userId")) || 0;

    const requestBody = {
      contractDate: toIsoDateTime(contractDate),
      // No reference-data endpoint exists yet for contract type / business unit /
      // currency, and statusId is unrelated to the calculatedStatus workflow
      // (see ContractchangeStatus) — send null (all nullable server-side) rather
      // than a guessed id until that lookup data is wired up.
      contractTypeId: null,
      businessUnitId: null,
      effectiveFrom: toIsoDateTime(contractDate),
      effectiveTo: toIsoDateTime(contractDate),
      currencyId: null,
      statusId: null,
      versionNo: null,
      parentContractId: null,
      referenceNo: "",
      remarks: "",
      approvalRequired: true,
      isActive: true,
      sellerId: Number(sellerId) || 0,
      buyerId: Number(buyerId) || 0,
      productId: Number(productId) || 0,
      basicDetails: {
        quantity: Number(qty) || 0,
        quantityMeasure,
        minQuantity: 10,
        maxQuantity: 100,
        poTolerancePercentage: 100,
        deliveryType,
        contractRate: Number(contractRate) || 0,
        gstPercentage: Number(gstPercent) || 0,
        gstDetails,
        baseRate,
        gstAmount,
        netRate,
        indicativeFreight: Number(indicativeFreight) || 0,
        rateRemarks,
      },
      sellerConditions: {
        commission: Number(sellerConditions.commission) || 0,
        deliverySchedule: sellerConditions.deliverySchedule,
        sellerSpecificDays:
          sellerConditions.deliverySchedule === "specific-days"
            ? sellerConditions.specificDays
            : "",
        sellerFromDate:
          sellerConditions.deliverySchedule === "forward-contract"
            ? toIsoDateTime(sellerConditions.fromDate)
            : null,
        sellerToDate:
          sellerConditions.deliverySchedule === "forward-contract"
            ? toIsoDateTime(sellerConditions.toDate)
            : null,
        qualitySpecifications: [],
        customQualitySpecifications: "",
        loadingAddressAt: sellerConditions.address,
        remarksSpecialConditions: sellerConditions.remarks,
      },
      buyerConditions: {
        commission: Number(buyerConditions.commission) || 0,
        deliverySchedule: buyerConditions.deliverySchedule,
        buyerFromDate:
          buyerConditions.deliverySchedule === "forward-contract"
            ? toIsoDateTime(buyerConditions.fromDate)
            : null,
        buyerToDate:
          buyerConditions.deliverySchedule === "forward-contract"
            ? toIsoDateTime(buyerConditions.toDate)
            : null,
        buyerSpecificDays:
          buyerConditions.deliverySchedule === "specific-days"
            ? buyerConditions.specificDays
            : null,
        qualitySpecifications: [],
        customQualitySpecifications: "",
        loadingAddressAt: buyerConditions.address,
        remarksSpecialConditions: buyerConditions.remarks,
      },
      paymentsInvoices: {
        paymentBeforeDate: paymentBeforeDate ? toIsoDateTime(paymentBeforeDate) : null,
        sellerPaymentDueDays: Number(sellerPaymentDueDays) || 0,
        buyerPaymentDueDays: Number(buyerPaymentDueDays) || 0,
        immediateAdvancePercentage: Number(immediateAdvancePercent) || 0,
        immediateAdvanceDate: immediateAdvanceDate ? toIsoDateTime(immediateAdvanceDate) : null,
        balanceAdvancePercentage: Number(balanceAdvancePercent) || 0,
        balanceAdvanceDate: balanceAdvanceDate ? toIsoDateTime(balanceAdvanceDate) : null,
        remarks: paymentRemarks,
      },
      actionPerformedBy: currentUserId,
    };

    try {
      if (navState?.isEdit && navState.contract) {
        const payload = {
          contractId: navState.contract.contractId,
          updateContract: requestBody,
        };
        console.log("Update Contract payload", payload);
        await updateContract(payload).unwrap();
      } else {
        const payload = requestBody;
        console.log("Create Contract payload", payload);
        await saveContract(payload).unwrap();
      }

      setFormError("");
      navigate("/contracts");
    } catch (error) {
      console.error(`${actionType} Contract API failed`, error);
      setFormError("Unable to save contract. Please try again.");
    }
  };

  useEffect(() => {
    if (!navState?.isEdit || !navState.contract) return;
    const c = navState.contract;

    setContractDate(toIsoDate(c.dateValue ?? c.date));
    setSellerId(resolveOptionValue(businessProfileOptions, c.seller));
    setBuyerId(resolveOptionValue(businessProfileOptions, c.buyer));
    setProductId(resolveOptionValue(productOptions, c.product));
    setQuantityMeasure(
      resolveOptionValue(quantityMeasureOptions, c.quantityMeasure) || "mt",
    );
    // qty in contracts is like "123 MT" — take the numeric part
    setQty((c.qty || "").split(" ")[0]);
    setPoTolerance(
      poToleranceOptions.find((o) => o.label === c.poTolerance || o.value === c.poTolerance)
        ?.value ?? "",
    );
    setDeliveryType(
      deliveryTypeOptions.find((o) => o.label === c.deliveryType || o.value === c.deliveryType)
        ?.value ?? "",
    );
    setContractRate(String(c.cRateValue ?? ""));
    setGstPercent(String((c.gst || "").replace("%", "") || "5"));
    // gstDetails options use labels like "5% GST" — match by starting number
    setGstDetails(
      gstDetailsOptions.find((o) => o.label.startsWith((c.gst || "").replace("%", "")))
        ?.value ?? "",
    );
    setIndicativeFreight(String(c.iFreightValue ?? ""));
    setRateRemarks(c.rateRemarks ?? "");

    // seller / buyer conditions
    setSellerConditions((prev) => ({
      ...prev,
      commission: (c.sellerConditions?.commission || "").replace("%", ""),
      deliverySchedule:
        deliveryScheduleOptions.find((o) => o.label === c.sellerConditions?.deliverySchedule)
          ?.value ?? prev.deliverySchedule,
      fromDate: toIsoDate(c.sellerConditions?.fromDate),
      toDate: toIsoDate(c.sellerConditions?.toDate),
      specificDays: c.sellerConditions?.specificDays ?? prev.specificDays,
      qualitySpecSource:
        qualitySpecSourceOptions.find((o) => o.label === c.sellerConditions?.qualitySpecSource)
          ?.value ?? prev.qualitySpecSource,
      address: addressOptions.find((o) => o.label === c.sellerConditions?.address)?.value ?? prev.address,
      remarks: c.sellerConditions?.remarks ?? prev.remarks,
    }));

    setBuyerConditions((prev) => ({
      ...prev,
      commission: (c.buyerConditions?.commission || "").replace("%", ""),
      deliverySchedule:
        deliveryScheduleOptions.find((o) => o.label === c.buyerConditions?.deliverySchedule)
          ?.value ?? prev.deliverySchedule,
      fromDate: toIsoDate(c.buyerConditions?.fromDate),
      toDate: toIsoDate(c.buyerConditions?.toDate),
      specificDays: c.buyerConditions?.specificDays ?? prev.specificDays,
      qualitySpecSource:
        qualitySpecSourceOptions.find((o) => o.label === c.buyerConditions?.qualitySpecSource)
          ?.value ?? prev.qualitySpecSource,
      address: addressOptions.find((o) => o.label === c.buyerConditions?.address)?.value ?? prev.address,
      remarks: c.buyerConditions?.remarks ?? prev.remarks,
    }));

    setPaymentTerms(paymentTermsOptions.find((o) => o.label === c.paymentTerms)?.value ?? "");
    setPaymentBeforeDate(toIsoDate(c.paymentBeforeDate));
    setImmediateAdvancePercent(c.immediateAdvancePercent ?? "");
    setImmediateAdvanceDate(toIsoDate(c.immediateAdvanceDate));
    setBalanceAdvanceDate(toIsoDate(c.balanceAdvanceDate));
    setSellerPaymentDueDays(c.sellerPaymentDueDays ?? "");
    setBuyerPaymentDueDays(c.buyerPaymentDueDays ?? "");
    setPaymentRemarks(c.paymentRemarks ?? "");
    setStatus(Boolean(c.status));
    setFormError("");
  }, []);



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
                  options={addressOptions}
                  value={sellerConditions.address}
                  onChange={(value) => handleSellerConditionChange({ address: value })}
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
                  options={addressOptions}
                  value={buyerConditions.address}
                  onChange={(value) => handleBuyerConditionChange({ address: value })}
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
        <button type="button" className="new-contract__submit" onClick={handleSubmit}>
          {navState?.isEdit ? "Update Contract" : "Create Contract"}
        </button>
      </div>
    </div>
  );
};

export default NewContract;
