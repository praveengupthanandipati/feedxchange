import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiTruck } from "react-icons/fi";
import InfoPanel from "../InfoPanel";
import SearchableSelect from "../../../../../components/dropdown/SearchableSelect";
import {
  useGetContractTruckChainOverviewQuery,
  useGetContractTruckChainQuery,
  type ContractTruckChainLeg,
} from "../../../../../store/contractTrucksApi";
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import { formatApiDateTime } from "../../../../../utils/apiDateTime";
// The chain, trip and participant styles are shared with the Re-assign screen.
import "../reassign-truck/ReassignTruck.scss";
import "./ContractTruckChain.scss";

function formatQty(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${value.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} MT`;
}

function formatFreight(value: number | null | undefined): string {
  if (value == null) return "-";
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / MT`;
}

function positionBadge(leg: ContractTruckChainLeg): { badge: string; caption: string; tone: string } {
  if (leg.chainPosition < 0) return { badge: String(leg.chainPosition), caption: "up", tone: "up" };
  if (leg.chainPosition > 0) return { badge: `+${leg.chainPosition}`, caption: "down", tone: "down" };
  return { badge: "0", caption: leg.positionLabel || "head", tone: "head" };
}

const ChainLegCard = ({ leg, isCurrent }: { leg: ContractTruckChainLeg; isCurrent: boolean }) => {
  const { badge, caption, tone } = positionBadge(leg);
  return (
    <div className={`reassign-truck__leg ${isCurrent ? "is-head" : ""}`}>
      <div className={`reassign-truck__position reassign-truck__position--${tone}`}>
        <strong>{badge}</strong>
        <span>{caption}</span>
      </div>
      <div className="reassign-truck__leg-body">
        <div className="reassign-truck__leg-head">
          <strong>{leg.contractNumber}</strong>
          {leg.isPhysicalLoadingPoint && <span className="reassign-truck__tag is-loads">Loads here</span>}
          {leg.isPhysicalUnloadingPoint && (
            <span className="reassign-truck__tag is-unloads">Unloads here</span>
          )}
          <span className="reassign-truck__leg-status">{leg.dispatchStatusName}</span>
        </div>
        <p className="reassign-truck__parties">
          {leg.sellerName} → {leg.buyerName}
        </p>
        <p className="reassign-truck__addresses">
          {leg.loadingAddress} ({leg.loadingCity}) → {leg.deliveryAddress} ({leg.deliveryCity})
        </p>
        <p className="reassign-truck__meta">
          {leg.lrNumber || "no LR"} · {formatQty(leg.quantityMT)} @ {formatFreight(leg.freightPerMT)} ·{" "}
          {formatApiDateTime(leg.assignedOn)} ·{" "}
          {leg.isOriginalArrangement
            ? "the original arrangement"
            : // reassignmentDirectionName already reads "Re-assigned upstream".
              `${leg.reassignmentDirectionName ?? "Re-assigned"} by ${leg.reassignedByName ?? "-"}`}
        </p>
      </div>
    </div>
  );
};

interface ChainContentProps {
  contractNumber: string;
  contractDispatchId: number;
}

const ChainContent = ({ contractNumber, contractDispatchId }: ChainContentProps) => {
  const requestingUserId = Number(localStorage.getItem("userId")) || 0;
  const { data: overview, isFetching } = useGetContractTruckChainOverviewQuery({
    contractDispatchId,
    requestingUserId,
  });

  // Nothing is shown until a party is chosen: the per-viewer endpoint then returns
  // exactly the contracts that party is entitled to see.
  const [viewerProfileId, setViewerProfileId] = useState("");
  const { data: viewerLegs, isFetching: loadingViewer } = useGetContractTruckChainQuery(
    { contractDispatchId, requestingProfileId: Number(viewerProfileId), requestingUserId },
    { skip: !viewerProfileId },
  );

  const orderedLegs = useMemo(
    () => [...(overview?.legs ?? [])].sort((a, b) => a.chainPosition - b.chainPosition),
    [overview],
  );
  const orderedViewerLegs = useMemo(
    () => [...(viewerLegs ?? [])].sort((a, b) => a.chainPosition - b.chainPosition),
    [viewerLegs],
  );

  if (isFetching) return <p className="reassign-truck__notice">Loading this truck chain…</p>;

  if (!overview) {
    return (
      <InfoPanel
        icon={FiTruck}
        title="Chain Not Available"
        description="The chain for this truck could not be loaded. Go back to View All Trucks and try again."
        action={{
          label: "Go to View All Trucks",
          to: `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`,
        }}
      />
    );
  }

  const { truck, participants } = overview;
  const viewerOptions = participants.map((participant) => ({
    value: String(participant.profileId),
    label: `${participant.name} — ${participant.role}`,
  }));
  const selectedParticipant = participants.find(
    (participant) => String(participant.profileId) === viewerProfileId,
  );

  return (
    <>
      <div className="truck-chain__summary">
        <div>
          <span>Truck</span>
          <strong>{truck.registrationNumber}</strong>
        </div>
        <div>
          <span>Driver</span>
          <strong>{truck.driverName}</strong>
        </div>
        <div>
          <span>Transporter</span>
          <strong>{truck.transporterName}</strong>
        </div>
        <div>
          <span>Quantity</span>
          <strong>{formatQty(truck.quantityMT)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{truck.dispatchStatusName}</strong>
        </div>
        <div>
          <span>Contracts</span>
          {/* The numbers the selected party is on; every one of them for an admin. */}
          <strong>
            {(selectedParticipant
              ? selectedParticipant.contracts
              : orderedLegs.map((leg) => leg.contractNumber)
            ).join(", ") || "-"}
          </strong>
        </div>
      </div>

      <div className="reassign-truck__layout reassign-truck__layout--single">
        <div className="reassign-truck__main">
          <section className="reassign-truck__panel">
            <h2 className="reassign-truck__panel-title">
              {selectedParticipant ? `As ${selectedParticipant.name}` : "Every party on this truck"}
            </h2>
            {/* Admin sees the whole chain; picking a party swaps in just what they are returned. */}
            <SearchableSelect
              options={viewerOptions}
              value={viewerProfileId}
              onChange={setViewerProfileId}
              placeholder="All parties"
              ariaLabel="Select a party to see only their contracts"
              clearable
            />

            {viewerProfileId && loadingViewer ? (
              <p className="reassign-truck__notice">Loading…</p>
            ) : (
              <>
                <div className="truck-chain__table-wrapper">
                  <table className="truck-chain__table">
                    <thead>
                      <tr>
                        <th>Caller</th>
                        <th>Contracts</th>
                        <th>Loading shown</th>
                        <th>Delivery shown</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedParticipant ? [selectedParticipant] : participants).map(
                        (participant) => (
                          <tr
                            key={`${participant.profileId}-${participant.role}`}
                            className={participant.isTransporter ? "is-transporter" : ""}
                          >
                            <td>
                              <strong>{participant.name}</strong>
                              <span>{participant.role}</span>
                            </td>
                            <td>{participant.legCount}</td>
                            <td>{participant.loadingShown.join(", then ") || "-"}</td>
                            <td>{participant.deliveryShown.join(", then ") || "-"}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="reassign-truck__legs">
                  {(selectedParticipant ? orderedViewerLegs : orderedLegs).map((leg) => (
                    <ChainLegCard
                      key={leg.contractDispatchId}
                      leg={leg}
                      isCurrent={leg.contractDispatchId === contractDispatchId}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>


      {/* Only an assigned truck can be moved; loaded or cancelled, it stays put. */}
      {truck.dispatchStatusName.trim().toLowerCase() === "assigned" && (
        <div className="truck-chain__actions">
          <Link
            to={`/truck-management/open-pending-contracts/reassign-truck?contract=${encodeURIComponent(
              contractNumber,
            )}&contractTruckId=${contractDispatchId}`}
            className="reassign-truck__submit"
          >
            Re-assign this truck
          </Link>
        </div>
      )}
    </>
  );
};

const ContractTruckChain = () => {
  const [searchParams] = useSearchParams();
  const { selectedContract, setSelectedContract } = useSelectedContract();
  // Falls back to the contract picked earlier, so opening this screen from the menu
  // without one in the URL still shows data rather than an empty state.
  const contractNumber = searchParams.get("contract") ?? selectedContract ?? "";
  const contractDispatchId = Number(searchParams.get("contractTruckId") ?? 0);

  useEffect(() => {
    if (contractNumber) setSelectedContract(contractNumber);
  }, [contractNumber, setSelectedContract]);


  return (
    <div className="reassign-truck truck-chain">
      <div className="truck-chain__header">
        <div>
          <h1 className="reassign-truck__heading">Contract chain &amp; overview</h1>
        </div>
        <Link
          to={
            contractNumber
              ? `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`
              : "/truck-management/open-pending-contracts"
          }
          className="reassign-truck__cancel"
        >
          <FiArrowLeft aria-hidden /> View All Trucks
        </Link>
      </div>

      {contractNumber && contractDispatchId ? (
        <ChainContent contractNumber={contractNumber} contractDispatchId={contractDispatchId} />
      ) : (
        <InfoPanel
          icon={FiFileText}
          title="No Truck Selected"
          description="Open a contract, go to View All Trucks and use View Chain on one of its trucks."
          action={{ label: "Go to Open & Pending Contracts", to: "/truck-management/open-pending-contracts" }}
        />
      )}
    </div>
  );
};

export default ContractTruckChain;
