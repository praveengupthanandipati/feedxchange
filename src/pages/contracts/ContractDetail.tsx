import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { contracts, type Contract } from "./contracts.data";
import "./ContractDetail.scss";

const FIELDS: Array<{ label: string; key: keyof Contract }> = [
  { label: "Seller", key: "seller" },
  { label: "Buyer", key: "buyer" },
  { label: "Product", key: "product" },
  { label: "Qty", key: "qty" },
  { label: "Arranged Qty", key: "aQty" },
  { label: "Pending Qty", key: "pQty" },
  { label: "Dispatched Qty", key: "dQty" },
  { label: "Contract Rate", key: "cRate" },
  { label: "GST %", key: "gst" },
  { label: "Net Rate", key: "netRate" },
  { label: "Delivery Type", key: "deliveryType" },
  { label: "Payment Terms", key: "paymentTerms" },
  { label: "Inland Freight", key: "iFreight" },
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

          <dl className="contract-detail__grid">
            {FIELDS.map((field) => (
              <div key={field.key} className="contract-detail__item">
                <dt>{field.label}</dt>
                <dd>{contract[field.key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
