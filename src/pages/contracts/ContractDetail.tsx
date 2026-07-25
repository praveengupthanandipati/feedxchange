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
import { contracts } from "./contracts.data";
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

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const contract = contracts.find((row) => row.id === id);

  return (
    <div className="contract-detail">
      <Link to="/contracts" className="contract-detail__back">
        <FiArrowLeft aria-hidden /> Back to Contracts
      </Link>

      {!contract ? (
        <div className="contract-detail__card">
          <p>No contract found for id "{id}".</p>
        </div>
      ) : (
        <>
          <div className="contract-detail__card">
            <div className="contract-detail__header">
              <div>
                <h1>Contract {contract.id}</h1>
                <p>{contract.date}</p>
              </div>
              <span
                className={`contracts-table__status contracts-table__status--${contract.status.toLowerCase()}`}
              >
                {contract.status === "In-transit" ? "In-Transit" : contract.status}
              </span>
            </div>
          </div>

          <div className="contract-detail__layout">
            <div className="contract-detail__main">
              <section className="new-contract__section">
                <h2 className="new-contract__section-title">1. Basic Details</h2>
                <div className="new-contract__grid">
                  <DetailField label="Date of Contract" value={contract.date} />
                  <DetailField label="Seller" value={contract.seller} />
                  <DetailField label="Buyer" value={contract.buyer} />
                  <DetailField label="Product" value={contract.product} />

                  <DetailField label="Quantity Measure" value={contract.quantityMeasure} />
                  <DetailField label="Qty" value={contract.qty} />
                  <DetailField label="PO Tolerance" value={contract.poTolerance} />
                  <DetailField label="Delivery Type" value={contract.deliveryType} />

                  <DetailField label="Contract Rate" value={contract.cRate} />
                  <DetailField label="GST % Value" value={contract.gst} />
                  <DetailField label="Net Rate" value={contract.netRate} />
                  <DetailField label="Indicative Freight" value={contract.indicativeFreight} />

                  <DetailField label="Inland Freight" value={contract.iFreight} />
                  <DetailField label="Rate Remarks" value={contract.rateRemarks} full />
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
                        value={contract.sellerConditions.commission}
                      />
                      <DetailField
                        label="Delivery schedule"
                        value={contract.sellerConditions.deliverySchedule}
                      />
                      {contract.sellerConditions.fromDate && (
                        <DetailField label="From Date" value={contract.sellerConditions.fromDate} />
                      )}
                      {contract.sellerConditions.toDate && (
                        <DetailField label="To Date" value={contract.sellerConditions.toDate} />
                      )}
                      {contract.sellerConditions.specificDays && (
                        <DetailField
                          label="Specific Days"
                          value={contract.sellerConditions.specificDays}
                        />
                      )}
                      <DetailField
                        label="Quality Spec Source"
                        value={contract.sellerConditions.qualitySpecSource}
                        full
                      />
                      <DetailField
                        label="Loading Address At"
                        value={contract.sellerConditions.address}
                        full
                      />
                      <DetailField
                        label="Remarks / Special Conditions"
                        value={contract.sellerConditions.remarks}
                        full
                      />
                    </div>
                  </div>

                  <div className="new-contract__condition-card">
                    <h3>Buyer Conditions</h3>
                    <div className="new-contract__grid new-contract__grid--condition">
                      <DetailField
                        label="Commission"
                        value={contract.buyerConditions.commission}
                      />
                      <DetailField
                        label="Delivery schedule"
                        value={contract.buyerConditions.deliverySchedule}
                      />
                      {contract.buyerConditions.fromDate && (
                        <DetailField label="From Date" value={contract.buyerConditions.fromDate} />
                      )}
                      {contract.buyerConditions.toDate && (
                        <DetailField label="To Date" value={contract.buyerConditions.toDate} />
                      )}
                      {contract.buyerConditions.specificDays && (
                        <DetailField
                          label="Specific Days"
                          value={contract.buyerConditions.specificDays}
                        />
                      )}
                      <DetailField
                        label="Quality Spec Source"
                        value={contract.buyerConditions.qualitySpecSource}
                        full
                      />
                      <DetailField
                        label="Delivery Address At"
                        value={contract.buyerConditions.address}
                        full
                      />
                      <DetailField
                        label="Remarks / Special Conditions"
                        value={contract.buyerConditions.remarks}
                        full
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="new-contract__section">
                <h2 className="new-contract__section-title">3. Payments</h2>
                <div className="new-contract__grid">
                  <DetailField label="Payment terms" value={contract.paymentTerms} />
                  {contract.paymentBeforeDate && (
                    <DetailField label="Payment Before Date" value={contract.paymentBeforeDate} />
                  )}
                  {contract.immediateAdvancePercent && (
                    <DetailField
                      label="Immediate Advance %"
                      value={`${contract.immediateAdvancePercent}%`}
                    />
                  )}
                  {contract.immediateAdvanceDate && (
                    <DetailField
                      label="Immediate Advance Date"
                      value={contract.immediateAdvanceDate}
                    />
                  )}
                  {contract.balanceAdvancePercent && (
                    <DetailField
                      label="Balance Advance %"
                      value={`${contract.balanceAdvancePercent}%`}
                    />
                  )}
                  {contract.balanceAdvanceDate && (
                    <DetailField label="Balance Advance Date" value={contract.balanceAdvanceDate} />
                  )}
                  {contract.sellerPaymentDueDays && (
                    <DetailField
                      label="Seller Payment Due Days"
                      value={contract.sellerPaymentDueDays}
                    />
                  )}
                  {contract.buyerPaymentDueDays && (
                    <DetailField
                      label="Buyer Payment Due Days"
                      value={contract.buyerPaymentDueDays}
                    />
                  )}
                  <DetailField label="Remarks" value={contract.paymentRemarks} full />
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
                            contract.approved ? "open" : "pending"
                          }`}
                        >
                          {contract.approved ? "Approved" : "Pending"}
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
