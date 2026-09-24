import { useMemo } from "react";
import { FiFileText, FiTruck, FiCheckCircle, FiClock } from "react-icons/fi";
import {
  useGetContractByContractNumberQuery,
  useGetAllOpenAndPendingContractsQuery,
} from "../../../store/contractsApi";
import { useContractTruckDetails } from "./useContractTruckDetails";
import "../assign-transports/Assigntransports.scss";

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatText(value: string | null | undefined): string {
  return value?.trim() ? value : "-";
}

interface ContractSummaryPanelProps {
  contractNumber: string;
  /** Extra detail fields shown after Product Name, e.g. the contract's loading and delivery addresses. */
  extraFields?: { label: string; value: string }[];
}

const ContractSummaryPanel = ({ contractNumber, extraFields = [] }: ContractSummaryPanelProps) => {
  const { data: contract } = useGetContractByContractNumberQuery(contractNumber, { skip: !contractNumber });
  const { data: openAndPendingContracts } = useGetAllOpenAndPendingContractsQuery();
  const { trucks } = useContractTruckDetails(contractNumber, Boolean(contractNumber));

  const matchingOpenContract = useMemo(
    () => openAndPendingContracts?.find((row) => row.contractNumber === contractNumber),
    [openAndPendingContracts, contractNumber],
  );

  const totalQty = matchingOpenContract?.totalQuantityMT ?? contract?.basicDetails?.quantity ?? 0;
  const dispatchedQty = matchingOpenContract?.dispatchedQuantityMT ?? 0;
  const pendingQty = matchingOpenContract?.pendingQuantityMT ?? 0;
  const arrangedQty = Math.max(totalQty - dispatchedQty - pendingQty, 0);

  return (
    <>
      <div className="assign-transports-stats">
        <div className="assign-transports-stats__card assign-transports-stats__card--navy">
          <span className="assign-transports-stats__icon">
            <FiFileText aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Contract Qty</span>
            <strong>{totalQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--success">
          <span className="assign-transports-stats__icon">
            <FiTruck aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Dispatched</span>
            <strong>{dispatchedQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--info">
          <span className="assign-transports-stats__icon">
            <FiCheckCircle aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Vehicle Arranged</span>
            <strong>{arrangedQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--warning">
          <span className="assign-transports-stats__icon">
            <FiClock aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Pending Qty</span>
            <strong>{pendingQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--danger">
          <span className="assign-transports-stats__icon">
            <FiTruck aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Total Trucks Assigned</span>
            <strong>{trucks.length}</strong>
          </span>
        </div>
      </div>

      <div className="assign-transports-details">
        <div className="assign-transports-details__header">
          <h2>Contract Details</h2>
        </div>
        <div className="assign-transports-details__grid">
          <div className="assign-transports-details__field">
            <span>Seller Name</span>
            <strong>{formatText(contract?.sellerName ?? matchingOpenContract?.seller)}</strong>
          </div>
          <div className="assign-transports-details__field">
            <span>Buyer Name</span>
            <strong>{formatText(contract?.buyerName ?? matchingOpenContract?.buyer)}</strong>
          </div>
          <div className="assign-transports-details__field">
            <span>Date of Contract</span>
            <strong>{formatDisplayDate(contract?.contractDate ?? matchingOpenContract?.contractDate)}</strong>
          </div>
          <div className="assign-transports-details__field">
            <span>Product Name</span>
            <strong>{formatText(contract?.productName)}</strong>
          </div>
          {extraFields.map((field) => (
            <div className="assign-transports-details__field" key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value || "-"}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ContractSummaryPanel;
