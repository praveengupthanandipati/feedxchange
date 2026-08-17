import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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
import {
  useLazyGetAllContractsByFiltersQuery,
  useLazyGetContractByContractIdQuery,
  useGetAllContractStatusesQuery,
  type GetContractDto,
} from "../../store/contractsApi";
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

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const formatDisplayDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
};

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

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<GetContractDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [searchContracts] = useLazyGetAllContractsByFiltersQuery();
  const [fetchContract] = useLazyGetContractByContractIdQuery();
  const { data: statusOptions } = useGetAllContractStatusesQuery();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setContract(null);

      try {
        const rows = await searchContracts({ SearchText: id }).unwrap();
        const match = rows.find((row) => row.contractNumber?.toLowerCase() === id.toLowerCase());
        if (!match) {
          if (!cancelled) setNotFound(true);
          return;
        }

        const detail = await fetchContract(match.contractId).unwrap();
        if (!cancelled) setContract(detail);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, searchContracts, fetchContract]);

  const basicDetails = contract?.basicDetails;
  const sellerConditions = contract?.sellerConditions;
  const buyerConditions = contract?.buyerConditions;
  const paymentsInvoices = contract?.paymentsInvoices;

  const calculatedStatus = basicDetails?.calculatedStatus ?? "";
  const statusLabel =
    statusOptions?.find((option) => option.name === calculatedStatus)?.displayName || calculatedStatus;
  const statusModifier = calculatedStatus.toLowerCase();

  const poTolerance =
    basicDetails?.poTolerance ||
    (basicDetails?.poTolerancePercentage != null ? `${basicDetails.poTolerancePercentage}%` : "");

  return (
    <div className="contract-detail">
      <Link to="/contracts" className="contract-detail__back">
        <FiArrowLeft aria-hidden /> Back to Contracts
      </Link>

      {loading ? (
        <div className="contract-detail__card">
          <p>Loading contract…</p>
        </div>
      ) : notFound || !contract ? (
        <div className="contract-detail__card">
          <p>No contract found for id "{id}".</p>
        </div>
      ) : (
        <>
          <div className="contract-detail__card">
            <div className="contract-detail__header">
              <div>
                <h1>Contract {contract.contractNumber}</h1>
                <p>{formatDisplayDate(contract.contractDate)}</p>
              </div>
              {calculatedStatus && (
                <span className={`contracts-table__status contracts-table__status--${statusModifier}`}>
                  {statusLabel}
                </span>
              )}
            </div>
          </div>

          <div className="contract-detail__layout">
            <div className="contract-detail__main">
              <section className="new-contract__section">
                <h2 className="new-contract__section-title">1. Basic Details</h2>
                <div className="new-contract__grid">
                  <DetailField label="Date of Contract" value={formatDisplayDate(contract.contractDate)} />
                  <DetailField label="Seller" value={contract.sellerName} />
                  <DetailField label="Buyer" value={contract.buyerName} />
                  <DetailField label="Product" value={contract.productName} />

                  <DetailField label="Quantity Measure" value={basicDetails?.quantityMeasure} />
                  <DetailField
                    label="Qty"
                    value={
                      basicDetails?.quantity != null
                        ? `${basicDetails.quantity} ${basicDetails.quantityMeasure ?? ""}`
                        : ""
                    }
                  />
                  <DetailField label="PO Tolerance" value={poTolerance} />
                  <DetailField label="Delivery Type" value={basicDetails?.deliveryType} />

                  <DetailField
                    label="Contract Rate"
                    value={basicDetails?.contractRate != null ? formatINR(basicDetails.contractRate) : ""}
                  />
                  <DetailField
                    label="GST % Value"
                    value={basicDetails?.gstPercentage != null ? `${basicDetails.gstPercentage}%` : ""}
                  />
                  <DetailField
                    label="Net Rate"
                    value={basicDetails?.netRate != null ? formatINR(basicDetails.netRate) : ""}
                  />
                  <DetailField
                    label="Indicative Freight"
                    value={
                      basicDetails?.indicativeFreight != null ? formatINR(basicDetails.indicativeFreight) : ""
                    }
                  />

                  <DetailField label="Rate Remarks" value={basicDetails?.rateRemarks} full />
                </div>
              </section>

              <section className="new-contract__section">
                <h2 className="new-contract__section-title">2. Seller & Buyer</h2>
                <div className="new-contract__conditions">
                  <div className="new-contract__condition-card">
                    <h3>Seller Conditions</h3>
                    <div className="new-contract__grid new-contract__grid--condition">
                      <DetailField label="Commission" value={sellerConditions?.commission} />
                      <DetailField label="Delivery schedule" value={sellerConditions?.deliverySchedule} />
                      {sellerConditions?.sellerFromDate && (
                        <DetailField
                          label="From Date"
                          value={formatDisplayDate(sellerConditions.sellerFromDate)}
                        />
                      )}
                      {sellerConditions?.sellerToDate && (
                        <DetailField
                          label="To Date"
                          value={formatDisplayDate(sellerConditions.sellerToDate)}
                        />
                      )}
                      {sellerConditions?.specificDays && (
                        <DetailField label="Specific Days" value={sellerConditions.specificDays} />
                      )}
                      <DetailField
                        label="Quality Spec Source"
                        value={sellerConditions?.qualitySpecificationSource}
                        full
                      />
                      <DetailField
                        label="Loading Address At"
                        value={sellerConditions?.loadingAddressAt}
                        full
                      />
                      <DetailField
                        label="Remarks / Special Conditions"
                        value={sellerConditions?.remarksSpecialConditions}
                        full
                      />
                    </div>
                  </div>

                  <div className="new-contract__condition-card">
                    <h3>Buyer Conditions</h3>
                    <div className="new-contract__grid new-contract__grid--condition">
                      <DetailField label="Commission" value={buyerConditions?.commission} />
                      <DetailField label="Delivery schedule" value={buyerConditions?.deliverySchedule} />
                      {buyerConditions?.buyerFromDate && (
                        <DetailField
                          label="From Date"
                          value={formatDisplayDate(buyerConditions.buyerFromDate)}
                        />
                      )}
                      {buyerConditions?.buyerToDate && (
                        <DetailField
                          label="To Date"
                          value={formatDisplayDate(buyerConditions.buyerToDate)}
                        />
                      )}
                      {buyerConditions?.specificDays && (
                        <DetailField label="Specific Days" value={buyerConditions.specificDays} />
                      )}
                      <DetailField
                        label="Quality Spec Source"
                        value={buyerConditions?.qualitySpecificationSource}
                        full
                      />
                      <DetailField
                        label="Delivery Address At"
                        value={buyerConditions?.loadingAddressAt}
                        full
                      />
                      <DetailField
                        label="Remarks / Special Conditions"
                        value={buyerConditions?.remarksSpecialConditions}
                        full
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="new-contract__section">
                <h2 className="new-contract__section-title">3. Payments</h2>
                <div className="new-contract__grid">
                  <DetailField label="Payment terms" value={paymentsInvoices?.paymentTerms} />
                  {paymentsInvoices?.paymentBeforeDate && (
                    <DetailField
                      label="Payment Before Date"
                      value={formatDisplayDate(paymentsInvoices.paymentBeforeDate)}
                    />
                  )}
                  {paymentsInvoices?.immediateAdvancePercentage != null && (
                    <DetailField
                      label="Immediate Advance %"
                      value={`${paymentsInvoices.immediateAdvancePercentage}%`}
                    />
                  )}
                  {paymentsInvoices?.immediateAdvanceDate && (
                    <DetailField
                      label="Immediate Advance Date"
                      value={formatDisplayDate(paymentsInvoices.immediateAdvanceDate)}
                    />
                  )}
                  {paymentsInvoices?.balanceAdvancePercentage != null && (
                    <DetailField
                      label="Balance Advance %"
                      value={`${paymentsInvoices.balanceAdvancePercentage}%`}
                    />
                  )}
                  {paymentsInvoices?.balanceAdvanceDate && (
                    <DetailField
                      label="Balance Advance Date"
                      value={formatDisplayDate(paymentsInvoices.balanceAdvanceDate)}
                    />
                  )}
                  {paymentsInvoices?.sellerPaymentDueDays != null && (
                    <DetailField
                      label="Seller Payment Due Days"
                      value={paymentsInvoices.sellerPaymentDueDays}
                    />
                  )}
                  {paymentsInvoices?.buyerPaymentDueDays != null && (
                    <DetailField
                      label="Buyer Payment Due Days"
                      value={paymentsInvoices.buyerPaymentDueDays}
                    />
                  )}
                  <DetailField label="Remarks" value={paymentsInvoices?.remarks} full />
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
                            contract.contractSettings?.approvalStatus ? "open" : "pending"
                          }`}
                        >
                          {contract.contractSettings?.approvalStatus ? "Approved" : "Pending"}
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
      )}
    </div>
  );
};

export default ContractDetail;
