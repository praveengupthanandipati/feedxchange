import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiTruck,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { defaultContractSummary, type ContractSummary } from "./assignTransports.data";
import InstantTruckAssignment from "./instant-truck-assignment/InstantTruckAssignment";
import ScheduleTruckAssignment from "./schedule-truck-assignment/ScheduleTruckAssignment";
import {
  useGetContractByContractNumberQuery,
  useGetTruckAssignmentTypesQuery,
  useGetAllOpenAndPendingContractsQuery,
} from "../../../store/contractsApi";
import "./Assigntransports.scss";

function formatDisplayDate(value: string | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

const Assigntransports = () => {
  const [searchParams] = useSearchParams();
  const contractNumber = searchParams.get("contract") ?? "";

  const { data: contract } = useGetContractByContractNumberQuery(contractNumber, {
    skip: !contractNumber,
  });
  const { data: assignmentTypes } = useGetTruckAssignmentTypesQuery();
  const { data: openAndPendingContracts } = useGetAllOpenAndPendingContractsQuery();

  const matchingOpenContract = useMemo(
    () => openAndPendingContracts?.find((row) => row.contractNumber === contractNumber),
    [openAndPendingContracts, contractNumber],
  );

  const summary: ContractSummary = useMemo(() => {
    if (!contract) return { ...defaultContractSummary, contractNumber: contractNumber || defaultContractSummary.contractNumber };

    const basic = contract.basicDetails;
    const quantityLabel =
      basic?.quantity != null ? `${basic.quantity} ${basic.quantityMeasure ?? ""}`.trim() : "-";
    const dispatched = matchingOpenContract?.dispatchedQuantityMT ?? 0;
    const pending = matchingOpenContract?.pendingQuantityMT ?? basic?.quantity ?? 0;
    const arranged = Math.max((basic?.quantity ?? 0) - dispatched - pending, 0);

    return {
      contractNumber: contract.contractNumber ?? contractNumber,
      contractQty: quantityLabel,
      dispatchedQty: `${dispatched} MT`,
      vehicleArrangedQty: `${arranged} MT`,
      pendingQty: `${pending} MT`,
      totalTrucksAssigned: 0,
      sellerName: contract.sellerName ?? "-",
      buyerName: contract.buyerName ?? "-",
      contractDate: formatDisplayDate(contract.contractDate),
      productName: contract.productName ?? "-",
      contractRate: basic?.contractRate != null ? `₹${basic.contractRate.toLocaleString("en-IN")}` : "-",
      indicativeFreight:
        basic?.indicativeFreight != null ? `₹${basic.indicativeFreight.toLocaleString("en-IN")}` : "-",
      loadingAddress: contract.sellerConditions?.loadingAddressAt ?? "-",
      deliveryAddress: contract.buyerConditions?.loadingAddressAt ?? "-",
    };
  }, [contract, contractNumber, matchingOpenContract]);

  const [detailsVisible, setDetailsVisible] = useState(true);
  const [activeTypeId, setActiveTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (activeTypeId === null && assignmentTypes && assignmentTypes.length > 0) {
      setActiveTypeId(assignmentTypes[0].truckAssignmentTypeId);
    }
  }, [assignmentTypes, activeTypeId]);

  const activeType = assignmentTypes?.find((type) => type.truckAssignmentTypeId === activeTypeId);
  const isScheduleTab = activeType?.truckAssignmentTypeName.toLowerCase().includes("sched") ?? false;

  return (
    <div className="assign-transports-page">
      <div className="assign-transports-card">
        <div className="assign-transports-card__header">
          <h1>
            Contract No: <span className="assign-transports-card__contract-no">{summary.contractNumber}</span>
          </h1>
          <Link to="/truck-management/bulk-freight-approval" className="assign-transports-card__back">
            <FiArrowLeft aria-hidden /> Back to Contract Trucks
          </Link>
        </div>

        <div className="assign-transports-stats">
          <div className="assign-transports-stats__card assign-transports-stats__card--navy">
            <span className="assign-transports-stats__icon">
              <FiFileText aria-hidden />
            </span>
            <span className="assign-transports-stats__body">
              <span className="assign-transports-stats__label">Contract Qty</span>
              <strong>{summary.contractQty}</strong>
            </span>
          </div>
          <div className="assign-transports-stats__card assign-transports-stats__card--success">
            <span className="assign-transports-stats__icon">
              <FiTruck aria-hidden />
            </span>
            <span className="assign-transports-stats__body">
              <span className="assign-transports-stats__label">Dispatched</span>
              <strong>{summary.dispatchedQty}</strong>
            </span>
          </div>
          <div className="assign-transports-stats__card assign-transports-stats__card--info">
            <span className="assign-transports-stats__icon">
              <FiCheckCircle aria-hidden />
            </span>
            <span className="assign-transports-stats__body">
              <span className="assign-transports-stats__label">Vehicle Arranged</span>
              <strong>{summary.vehicleArrangedQty}</strong>
            </span>
          </div>
          <div className="assign-transports-stats__card assign-transports-stats__card--warning">
            <span className="assign-transports-stats__icon">
              <FiClock aria-hidden />
            </span>
            <span className="assign-transports-stats__body">
              <span className="assign-transports-stats__label">Pending Qty</span>
              <strong>{summary.pendingQty}</strong>
            </span>
          </div>
          <div className="assign-transports-stats__card assign-transports-stats__card--danger">
            <span className="assign-transports-stats__icon">
              <FiTruck aria-hidden />
            </span>
            <span className="assign-transports-stats__body">
              <span className="assign-transports-stats__label">Total Trucks Assigned</span>
              <strong>{summary.totalTrucksAssigned}</strong>
            </span>
          </div>
        </div>

        <div className="assign-transports-details">
          <div className="assign-transports-details__header">
            <h2>Contract Details</h2>
            <button
              type="button"
              className="assign-transports-details__toggle"
              onClick={() => setDetailsVisible((prev) => !prev)}
            >
              {detailsVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {detailsVisible ? "Hide" : "Show"}
            </button>
          </div>

          {detailsVisible && (
            <div className="assign-transports-details__grid">
              <div className="assign-transports-details__field">
                <span>Seller Name</span>
                <strong>{summary.sellerName}</strong>
              </div>
              <div className="assign-transports-details__field">
                <span>Buyer Name</span>
                <strong>{summary.buyerName}</strong>
              </div>
              <div className="assign-transports-details__field">
                <span>Date of Contract</span>
                <strong>{summary.contractDate}</strong>
              </div>
              <div className="assign-transports-details__field">
                <span>Product Name</span>
                <strong>{summary.productName}</strong>
              </div>

              <div className="assign-transports-details__field">
                <span>Contract Rate</span>
                <strong>{summary.contractRate}</strong>
              </div>
              <div className="assign-transports-details__field">
                <span>Indicative Freight</span>
                <strong>{summary.indicativeFreight}</strong>
              </div>
              <div className="assign-transports-details__field">
                <span>Loading Address</span>
                <strong>{summary.loadingAddress}</strong>
              </div>

              <div className="assign-transports-details__field assign-transports-details__field--full">
                <span>Delivery Address</span>
                <strong>{summary.deliveryAddress}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="assign-transports-tabs-section">
          <h2 className="assign-transports-tabs-section__title">Contract Trucks Details</h2>

          <div className="assign-transports-tabs">
            {(assignmentTypes ?? []).map((type) => (
              <button
                key={type.truckAssignmentTypeId}
                type="button"
                className={`assign-transports-tabs__tab ${
                  activeTypeId === type.truckAssignmentTypeId ? "is-active" : ""
                }`}
                onClick={() => setActiveTypeId(type.truckAssignmentTypeId)}
              >
                {type.truckAssignmentTypeName}
              </button>
            ))}
          </div>

          {activeType &&
            (isScheduleTab ? (
              <ScheduleTruckAssignment
                summary={summary}
                contractId={contract?.id ?? 0}
                sellerId={contract?.sellerId ?? 0}
                buyerId={contract?.buyerId ?? 0}
              />
            ) : (
              <InstantTruckAssignment
                contractId={contract?.id ?? 0}
                sellerId={contract?.sellerId ?? 0}
                buyerId={contract?.buyerId ?? 0}
                truckAssignmentTypeId={activeType.truckAssignmentTypeId}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Assigntransports;
