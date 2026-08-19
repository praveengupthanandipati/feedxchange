import { useEffect, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiTruck,
  FiActivity,
  FiFileText,
  FiPackage,
  FiEdit3,
  FiDownload,
  FiClock,
} from "react-icons/fi";
import { useLazyGetContractByContractIdQuery } from "../../store/contractsApi";
import {
  quantityMeasureOptions,
  poToleranceOptions,
  deliveryTypeOptions,
  deliveryScheduleOptions,
  qualitySpecSourceOptions,
  paymentTermsOptions,
} from "./newContract.data";
import "./ContractDetail.scss";
import "./NewContract.scss";

interface DetailFieldProps {
  label: string;
  value: ReactNode;
  full?: boolean;
}

const DetailField = ({ label, value, full }: DetailFieldProps) => (
  <div className={`detail-field ${full ? "new-contract__grid--full" : ""}`}>
    <span className="detail-field__label">{label}</span>
    <p className="detail-field__value">{value || "—"}</p>
  </div>
);

// TODO: wire these up to the real workflow actions once they exist.
const NEXT_STEPS = [
  { label: "Manage Trucks", icon: FiTruck },
  { label: "Contract Status", icon: FiActivity },
  { label: "Invoices", icon: FiFileText },
  { label: "Dispatches", icon: FiPackage },
  { label: "Add Amendment", icon: FiEdit3 },
  { label: "Download PDF", icon: FiDownload },
  { label: "View Activity Log", icon: FiClock },
];


const pick = (...values: Array<string | number | boolean | null | undefined>) =>
  values.find((v) => v !== undefined && v !== null && v !== "");


const leadingSegment = (value: string) => value.split(";")[0].trim();

const labelFor = (options: { value: string; label: string }[], raw: unknown): string => {
  if (raw === undefined || raw === null || raw === "") return "";
  const strValue = leadingSegment(String(raw));
  const normalize = (v: string) => v.trim().toLowerCase().replace(/[%\s]+/g, "");
  const match = options.find(
    (option) =>
      option.value === strValue ||
      option.label === strValue ||
      normalize(option.value) === normalize(strValue) ||
      normalize(option.label) === normalize(strValue),
  );
  return match ? match.label : strValue;
};

const fmtDate = (value: unknown): string => {
  if (!value) return "";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-IN");
};

const fmtCurrency = (value: unknown): string => {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value);
  return Number.isNaN(num) ? "" : `₹${num.toLocaleString("en-IN")}`;
};

const statusClass = (status: string) => status.toLowerCase().replace(/\s+/g, "-");

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const contractId = Number(id);

  // useLazyGetContractByContractIdQuery returns [trigger, result] — it does
  // NOT fetch automatically like useGetContractByContractIdQuery does.
  // We fire the trigger ourselves once we have a valid numeric id.
  const [fetchContract, { data: source, isLoading, isFetching, error }] =
    useLazyGetContractByContractIdQuery();

  useEffect(() => {
    if (!contractId || Number.isNaN(contractId)) return;
    fetchContract(contractId);
  }, [contractId, fetchContract]);

  const isBusy = isLoading || isFetching;

  return (
    <div className="contract-detail">
      <Link to="/contracts" className="contract-detail__back">
        <FiArrowLeft aria-hidden /> Back to Contracts
      </Link>

      {isBusy ? (
        <div className="contract-detail__card">
          <p>Loading contract details…</p>
        </div>
      ) : error || !source ? (
        <div className="contract-detail__card">
          <p>No contract found for id "{id}".</p>
        </div>
      ) : (
        (() => {
          const basic = source.basicDetails ?? {};
          const sellerSrc = source.sellerConditions ?? {};
          const buyerSrc = source.buyerConditions ?? {};
          const paymentsSrc = source.paymentsInvoices ?? {};
          const settings = source.contractSettings ?? {};

          const status = String(pick(basic.calculatedStatus, source.statusId) ?? "Pending");
          const approved = Boolean(settings.approvalStatus ?? false);

          const paymentTermsRaw = String(paymentsSrc.paymentTerms ?? "");
          const immediateAdvancePercent = pick(paymentsSrc.immediateAdvancePercentage);
          const balanceAdvancePercent = pick(paymentsSrc.balanceAdvancePercentage);

          return (
            <>
              <div className="contract-detail__card">
                <div className="contract-detail__header">
                  <div>
                    <h1>Contract {source.contractNumber ?? id}</h1>
                    <p>{fmtDate(source.contractDate)}</p>
                  </div>
                  <span className={`contracts-table__status contracts-table__status--${statusClass(status)}`}>
                    {status === "In-transit" || status === "In-Transit" ? "In-Transit" : status}
                  </span>
                </div>
              </div>

              <div className="contract-detail__layout">
                <div className="contract-detail__main">
                  <section className="new-contract__section">
                    <h2 className="new-contract__section-title">1. Basic Details</h2>
                    <div className="new-contract__grid">
                      <DetailField label="Date of Contract" value={fmtDate(source.contractDate)} />
                      <DetailField label="Seller" value={source.sellerName} />
                      <DetailField label="Buyer" value={source.buyerName} />
                      <DetailField label="Product" value={source.productName} />

                      <DetailField
                        label="Quantity Measure"
                        value={labelFor(quantityMeasureOptions, basic.quantityMeasure)}
                      />
                      <DetailField
                        label="Qty"
                        value={
                          basic.quantity !== undefined && basic.quantity !== null
                            ? `${basic.quantity} ${labelFor(quantityMeasureOptions, basic.quantityMeasure) || ""}`.trim()
                            : ""
                        }
                      />
                      <DetailField
                        label="PO Tolerance"
                        value={labelFor(poToleranceOptions, pick(basic.poTolerance, basic.poTolerancePercentage))}
                      />
                      <DetailField
                        label="Delivery Type"
                        value={labelFor(deliveryTypeOptions, basic.deliveryType)}
                      />

                      <DetailField label="Contract Rate" value={fmtCurrency(basic.contractRate)} />
                      <DetailField
                        label="GST % Value"
                        value={
                          basic.gstPercentage !== undefined && basic.gstPercentage !== null
                            ? `${basic.gstPercentage}%`
                            : ""
                        }
                      />
                      <DetailField label="Net Rate" value={fmtCurrency(basic.netRate)} />
                      <DetailField label="Indicative Freight" value={fmtCurrency(basic.indicativeFreight)} />

                      <DetailField label="Rate Remarks" value={basic.rateRemarks} full />
                    </div>
                  </section>

                  <section className="new-contract__section">
                    <h2 className="new-contract__section-title">2. Seller & Buyer</h2>
                    <div className="new-contract__conditions">
                      <div className="new-contract__condition-card">
                        <h3>Seller Conditions</h3>
                        <div className="new-contract__grid new-contract__grid--condition">
                          <DetailField
                            label="Commission"
                            value={
                              sellerSrc.commission !== undefined && sellerSrc.commission !== null
                                ? `${sellerSrc.commission}%`
                                : ""
                            }
                          />
                          <DetailField
                            label="Delivery schedule"
                            value={labelFor(deliveryScheduleOptions, sellerSrc.deliverySchedule)}
                          />
                          {sellerSrc.sellerFromDate && (
                            <DetailField label="From Date" value={fmtDate(sellerSrc.sellerFromDate)} />
                          )}
                          {sellerSrc.sellerToDate && (
                            <DetailField label="To Date" value={fmtDate(sellerSrc.sellerToDate)} />
                          )}
                          {sellerSrc.specificDays && (
                            <DetailField label="Specific Days" value={sellerSrc.specificDays} />
                          )}
                          <DetailField
                            label="Quality Spec Source"
                            value={labelFor(qualitySpecSourceOptions, sellerSrc.qualitySpecificationSource)}
                            full
                          />
                          <DetailField label="Loading Address At" value={sellerSrc.loadingAddressAt} full />
                          <DetailField
                            label="Remarks / Special Conditions"
                            value={sellerSrc.remarksSpecialConditions}
                            full
                          />
                        </div>
                      </div>

                      <div className="new-contract__condition-card">
                        <h3>Buyer Conditions</h3>
                        <div className="new-contract__grid new-contract__grid--condition">
                          <DetailField
                            label="Commission"
                            value={
                              buyerSrc.commission !== undefined && buyerSrc.commission !== null
                                ? `${buyerSrc.commission}%`
                                : ""
                            }
                          />
                          <DetailField
                            label="Delivery schedule"
                            value={labelFor(deliveryScheduleOptions, buyerSrc.deliverySchedule)}
                          />
                          {buyerSrc.buyerFromDate && (
                            <DetailField label="From Date" value={fmtDate(buyerSrc.buyerFromDate)} />
                          )}
                          {buyerSrc.buyerToDate && (
                            <DetailField label="To Date" value={fmtDate(buyerSrc.buyerToDate)} />
                          )}
                          {buyerSrc.specificDays && (
                            <DetailField label="Specific Days" value={buyerSrc.specificDays} />
                          )}
                          <DetailField
                            label="Quality Spec Source"
                            value={labelFor(qualitySpecSourceOptions, buyerSrc.qualitySpecificationSource)}
                            full
                          />
                          <DetailField
                            label="Delivery Address At"
                            value={buyerSrc.loadingAddressAt}
                            full
                          />
                          <DetailField
                            label="Remarks / Special Conditions"
                            value={buyerSrc.remarksSpecialConditions}
                            full
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="new-contract__section">
                    <h2 className="new-contract__section-title">3. Payments</h2>
                    <div className="new-contract__grid">
                      <DetailField label="Payment terms" value={labelFor(paymentTermsOptions, paymentTermsRaw)} />
                      {paymentsSrc.paymentBeforeDate && (
                        <DetailField label="Payment Before Date" value={fmtDate(paymentsSrc.paymentBeforeDate)} />
                      )}
                      {immediateAdvancePercent !== undefined && (
                        <DetailField label="Immediate Advance %" value={`${immediateAdvancePercent}%`} />
                      )}
                      {paymentsSrc.immediateAdvanceDate && (
                        <DetailField
                          label="Immediate Advance Date"
                          value={fmtDate(paymentsSrc.immediateAdvanceDate)}
                        />
                      )}
                      {balanceAdvancePercent !== undefined && (
                        <DetailField label="Balance Advance %" value={`${balanceAdvancePercent}%`} />
                      )}
                      {paymentsSrc.balanceAdvanceDate && (
                        <DetailField label="Balance Advance Date" value={fmtDate(paymentsSrc.balanceAdvanceDate)} />
                      )}
                      {paymentsSrc.sellerPaymentDueDays !== undefined && paymentsSrc.sellerPaymentDueDays !== null && (
                        <DetailField label="Seller Payment Due Days" value={paymentsSrc.sellerPaymentDueDays} />
                      )}
                      {paymentsSrc.buyerPaymentDueDays !== undefined && paymentsSrc.buyerPaymentDueDays !== null && (
                        <DetailField label="Buyer Payment Due Days" value={paymentsSrc.buyerPaymentDueDays} />
                      )}
                      <DetailField label="Remarks" value={paymentsSrc.remarks} full />
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
                            <span
                              className={`contracts-table__status contracts-table__status--${
                                approved ? "open" : "pending"
                              }`}
                            >
                              {approved ? "Approved" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </div>

                <aside className="contract-detail__side">
                  <div className="contract-detail__side-card">
                    <h3>Next Steps</h3>
                    <ul className="contract-detail__next-steps">
                      {NEXT_STEPS.map((step) => (
                        <li key={step.label}>
                          <button type="button" className="contract-detail__next-step">
                            <step.icon aria-hidden />
                            {step.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
};

export default ContractDetail;