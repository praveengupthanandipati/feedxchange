import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import SearchableSelect from "../../components/dropdown/SearchableSelect";
import ToggleSwitch from "../../components/toggle/ToggleSwitch";
import {
  sellerOptions,
  buyerOptions,
  productOptions,
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

interface ConditionState {
  commission: string;
  deliverySchedule: string;
  qualitySpecSource: string;
  address: string;
  remarks: string;
}

const emptyCondition: ConditionState = {
  commission: "5",
  deliverySchedule: "",
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
  sellerQualitySpecSource: "Seller Quality Spec Source",
  sellerAddress: "Seller Loading Address At",
  buyerCommission: "Buyer Commission",
  buyerDeliverySchedule: "Buyer Delivery schedule",
  buyerQualitySpecSource: "Buyer Quality Spec Source",
  buyerAddress: "Buyer Delivery Address At",
  paymentTerms: "Payment terms",
};

const NewContract = () => {
  const navigate = useNavigate();

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
  const [paymentRemarks, setPaymentRemarks] = useState("");

  const [approved, setApproved] = useState(false);
  const [formError, setFormError] = useState("");

  const baseRate = parseFloat(contractRate) || 0;
  const gstAmount = Math.round(baseRate * ((parseFloat(gstPercent) || 0) / 100) * 100) / 100;
  const netRate = Math.round((baseRate + gstAmount) * 100) / 100;

  const sellerLabel = sellerOptions.find((option) => option.value === sellerId)?.label;
  const buyerLabel = buyerOptions.find((option) => option.value === buyerId)?.label;
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
      sellerQualitySpecSource: sellerConditions.qualitySpecSource,
      sellerAddress: sellerConditions.address,
      buyerCommission: buyerConditions.commission,
      buyerDeliverySchedule: buyerConditions.deliverySchedule,
      buyerQualitySpecSource: buyerConditions.qualitySpecSource,
      buyerAddress: buyerConditions.address,
      paymentTerms,
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

  const handleSubmit = () => {
    const missing = Object.entries(requiredValues)
      .filter(([, value]) => !value)
      .map(([key]) => REQUIRED_FIELD_LABELS[key]);

    if (missing.length > 0) {
      setFormError(`Please fill in the required fields: ${missing.join(", ")}.`);
      return;
    }

    setFormError("");
    navigate("/contracts");
  };

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
              options={sellerOptions}
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
              options={buyerOptions}
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
                    checked={approved}
                    onChange={setApproved}
                    ariaLabel="Approval status"
                  />
                  <span className="new-contract__setting-status">
                    {approved ? "Approved" : "Pending"}
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
          Create Contract
        </button>
      </div>
    </div>
  );
};

export default NewContract;
