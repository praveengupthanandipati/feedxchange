import { Link, useParams } from "react-router-dom";
import { useGetContractByContractNumberQuery } from "../../store/contractsApi";
import "./ContractDetail.scss";
import "./NewContract.scss";

interface DetailObject {
  [key: string]: unknown;
}

const asObject = (value: unknown): DetailObject =>
  value && typeof value === "object" ? (value as DetailObject) : {};

const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const DetailField = ({ label, value }: { label: string; value: unknown }) => (
  <div className="detail-field">
    <span className="detail-field__label">{label}</span>
    <p className="detail-field__value">{displayValue(value)}</p>
  </div>
);

const ContractDetail = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetContractByContractNumberQuery(
    decodeURIComponent(id),
    { skip: !id },
  );

  const source = asObject(data);
  const basicDetails = asObject(source.basicDetails);
  const sellerConditions = asObject(source.sellerConditions);
  const buyerConditions = asObject(source.buyerConditions);
  const paymentTerms = asObject(source.paymentTerms);

  return (
    <div className="contract-detail">
      <Link to="/contracts" className="contract-detail__back">
        Back to Contracts
      </Link>

      {isLoading ? (
        <div className="contract-detail__card"><p>Loading contract details...</p></div>
      ) : error || !data ? (
        <div className="contract-detail__card"><p>No contract found for "{id}".</p></div>
      ) : (
        <>
          <div className="contract-detail__card">
            <div className="contract-detail__header">
              <div>
                <h1>Contract {displayValue(source.contractNumber ?? id)}</h1>
                <p>{displayValue(source.contractDate)}</p>
              </div>
              <span className="contracts-table__status">{displayValue(basicDetails.calculatedStatus)}</span>
            </div>
          </div>

          <div className="contract-detail__layout">
            <div className="contract-detail__main">
              <section className="new-contract__section">
                <h2 className="new-contract__section-title">Contract Details</h2>
                <div className="new-contract__grid">
                  <DetailField label="Contract Number" value={source.contractNumber} />
                  <DetailField label="Contract Date" value={source.contractDate} />
                  <DetailField label="Seller" value={source.sellerName} />
                  <DetailField label="Buyer" value={source.buyerName} />
                  <DetailField label="Product" value={source.productName} />
                  <DetailField label="Quantity" value={`${displayValue(basicDetails.quantity)} ${displayValue(basicDetails.quantityMeasure)}`} />
                  <DetailField label="Contract Rate" value={basicDetails.contractRate} />
                  <DetailField label="Minimum Quantity" value={basicDetails.minQuantity} />
                  <DetailField label="Maximum Quantity" value={basicDetails.maxQuantity} />
                  <DetailField label="Delivery Type" value={basicDetails.deliveryType} />
                  <DetailField label="Delivery Schedule" value={basicDetails.deliverySchedule} />
                  <DetailField label="Delivery From" value={basicDetails.deliveryFromDate} />
                  <DetailField label="Delivery To" value={basicDetails.deliveryToDate} />
                  <DetailField label="Seller Commission" value={sellerConditions.commission} />
                  <DetailField label="Buyer Commission" value={buyerConditions.commission} />
                  <DetailField label="Payment Terms" value={paymentTerms.paymentTermName} />
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContractDetail;
