import { useState } from "react";
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
import { getContractSummary } from "./assignTransports.data";
import InstantTruckAssignment from "./instant-truck-assignment/InstantTruckAssignment";
import ScheduleTruckAssignment from "./schedule-truck-assignment/ScheduleTruckAssignment";
import "./Assigntransports.scss";

type ActiveTab = "instant" | "schedule";

const Assigntransports = () => {
  const [searchParams] = useSearchParams();
  const summary = getContractSummary(searchParams.get("contract"));

  const [detailsVisible, setDetailsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("instant");

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
            <button
              type="button"
              className={`assign-transports-tabs__tab ${activeTab === "instant" ? "is-active" : ""}`}
              onClick={() => setActiveTab("instant")}
            >
              Instant Truck Assignment
            </button>
            <button
              type="button"
              className={`assign-transports-tabs__tab ${activeTab === "schedule" ? "is-active" : ""}`}
              onClick={() => setActiveTab("schedule")}
            >
              Schedule Trucks Assignment
            </button>
          </div>

          {activeTab === "instant" ? <InstantTruckAssignment /> : <ScheduleTruckAssignment />}
        </div>
      </div>
    </div>
  );
};

export default Assigntransports;
