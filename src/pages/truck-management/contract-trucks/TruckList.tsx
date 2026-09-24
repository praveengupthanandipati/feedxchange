import { useEffect, useState } from "react";
import {
  FiTruck,
  FiShare2,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
} from "react-icons/fi";
import type { ContractTruckDetail } from "./useContractTruckDetails";
import ChainViewButton from "./ChainViewButton";

interface TruckListProps {
  trucks: ContractTruckDetail[];
  isLoading: boolean;
  /** The share shortcut is only offered where the list is a quick look-up, not on its own screen. */
  showShare?: boolean;
  /** When given, each truck offers a Reassign button that hands the truck back to the caller. */
  onReassign?: (truck: ContractTruckDetail) => void;
  /** When given, each truck offers a View Chain button for its contract chain. */
  onViewChain?: (truck: ContractTruckDetail) => void;
}

const TruckList = ({
  trucks,
  isLoading,
  showShare = true,
  onReassign,
  onViewChain,
}: TruckListProps) => {
  // Keyed by dispatch id, not truck number — the same truck can appear on several
  // schedules, and those rows expand and collapse independently.
  const [expandedTrucks, setExpandedTrucks] = useState<Set<number>>(new Set());

  useEffect(() => {
    const last = trucks[trucks.length - 1];
    setExpandedTrucks(last ? new Set([last.contractTruckId]) : new Set());
  }, [trucks]);

  const toggleTruck = (contractTruckId: number) => {
    setExpandedTrucks((prev) => {
      const next = new Set(prev);
      if (next.has(contractTruckId)) next.delete(contractTruckId);
      else next.add(contractTruckId);
      return next;
    });
  };

  const handleShare = (truck: ContractTruckDetail) => {
    navigator.clipboard
      .writeText(`${truck.truckNumber} — Final Qty: ${truck.finalQty}`)
      .catch(() => undefined);
  };

  if (isLoading) {
    return <p className="truck-tracking-drawer__empty">Loading truck details…</p>;
  }

  if (trucks.length === 0) {
    return <p className="truck-tracking-drawer__empty">No trucks arranged yet for this contract.</p>;
  }

  return (
    <div className="truck-tracking-drawer__truck-list">
      {trucks.map((truck) => {
        const expanded = expandedTrucks.has(truck.contractTruckId);
        return (
          <div className="truck-tracking-drawer__truck-card" key={truck.contractTruckId}>
            <button
              type="button"
              className="truck-tracking-drawer__truck-header"
              onClick={() => toggleTruck(truck.contractTruckId)}
              aria-expanded={expanded}
            >
              <span className="truck-tracking-drawer__truck-title">
                <FiTruck aria-hidden />
                <strong>{truck.truckNumber}</strong>
                <span>(Final Qty: {truck.finalQty})</span>
              </span>
              <span className="truck-tracking-drawer__truck-meta">
                {showShare && (
                  <span
                    className="truck-tracking-drawer__share-btn"
                    role="button"
                    tabIndex={0}
                    aria-label={`Share ${truck.truckNumber} details`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleShare(truck);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        handleShare(truck);
                      }
                    }}
                  >
                    <FiShare2 aria-hidden />
                  </span>
                )}
                <span className="truck-tracking-drawer__status-badge">{truck.status}</span>
                {expanded ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
              </span>
            </button>

            {expanded && (
              <div className="truck-tracking-drawer__truck-details">
                <div>
                  <span>Transporter Name:</span>
                  <p>{truck.transporterName}</p>
                </div>
                <div>
                  <span>
                    <FiMapPin aria-hidden /> Transporter Location:
                  </span>
                  <p>{truck.transporterLocation}</p>
                </div>
                <div>
                  <span>Assignment Type:</span>
                  <p className="truck-tracking-drawer__assignment-badge">{truck.assignmentType}</p>
                </div>

                <div>
                  <span>Driver Name:</span>
                  <p>{truck.driverName}</p>
                </div>
                <div>
                  <span>
                    <FiPhone aria-hidden /> Driver Phone:
                  </span>
                  <p>{truck.driverPhone}</p>
                </div>
                <div>
                  <span>Maximum Capacity:</span>
                  <p>{truck.maxCapacity}</p>
                </div>
                <div>
                  <span>LR Number:</span>
                  <p>{truck.lrNumber}</p>
                </div>

                <div>
                  <span>Start Date &amp; Time:</span>
                  <p>{truck.startDateTime}</p>
                </div>
                <div>
                  <span>
                    <FiMapPin aria-hidden /> Start Location:
                  </span>
                  <p>{truck.startLocation}</p>
                </div>
                <div>
                  <span>
                    <FiMapPin aria-hidden /> Destination:
                  </span>
                  <p>{truck.destination}</p>
                </div>

                {(onReassign || onViewChain) && (
                  <div className="truck-tracking-drawer__truck-actions">
                    {onViewChain && (
                      <ChainViewButton
                        contractDispatchId={truck.contractTruckId}
                        onClick={() => onViewChain(truck)}
                      />
                    )}
                    {/* Only an assigned truck can move: once loaded or cancelled it stays put. */}
                    {onReassign && truck.status.trim().toLowerCase() === "assigned" && (
                      <button
                        type="button"
                        className="truck-tracking-drawer__reassign-btn"
                        onClick={() => onReassign(truck)}
                        title="Move this truck onto another contract"
                      >
                        <FiRefreshCw aria-hidden /> Reassign
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TruckList;
