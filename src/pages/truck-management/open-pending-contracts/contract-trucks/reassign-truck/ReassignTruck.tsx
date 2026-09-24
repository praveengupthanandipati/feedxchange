import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiTruck } from "react-icons/fi";
import InfoPanel from "../InfoPanel";
import { useGetAllActiveDriversQuery } from "../../../../../store/driversApi";
import { useGetProfileAddressQuery } from "../../../../../store/userProfilesCommonApi";
import {
  useGetAllOpenAndPendingContractsQuery,
  useGetContractByContractNumberQuery,
} from "../../../../../store/contractsApi";
import {
  useGetContractTruckChainOverviewQuery,
  useReassignContractTruckMutation,
  type ContractTruckChainLeg,
  type ContractTruckChainOverview,
} from "../../../../../store/contractTrucksApi";
// ContractTruckChainLeg is still used for the acting party roles below.
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import { splitApiDateTimeForForm } from "../../../../../utils/apiDateTime";
import "./ReassignTruck.scss";
// The header row is shared with the Contract chain screen.
import "../truck-chain/ContractTruckChain.scss";

function formatQty(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${value.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} MT`;
}

function formatFreight(value: number | null | undefined): string {
  if (value == null) return "-";
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / MT`;
}

function formatAddress(address: { officeName: string; addressLine1: string; city: string; pincode: string }) {
  return [address.officeName, address.addressLine1, address.city, address.pincode]
    .filter(Boolean)
    .join(", ");
}

/**
 * GetAllOpenAndPendingContracts prefixes the city onto the party, as in
 * "Adilabad - Vimal Agro Exports", while the chain returns the bare name. Both are
 * reduced to the name before comparing.
 */
function samePartyName(listName: string | null | undefined, partyName: string): boolean {
  if (!listName || !partyName) return false;
  const bare = (value: string) => value.split(" - ").pop()?.trim().toLowerCase() ?? "";
  return bare(listName) === bare(partyName);
}

/** The roles the acting party holds across the chain, e.g. "Buyer on X · Seller on Y". */
function rolesOf(profileId: number, legs: ContractTruckChainLeg[]): string {
  return legs
    .flatMap((leg) => [
      leg.buyerProfileId === profileId ? `Buyer on ${leg.contractNumber}` : "",
      leg.sellerProfileId === profileId ? `Seller on ${leg.contractNumber}` : "",
    ])
    .filter(Boolean)
    .join(" · ");
}

interface ReassignFormProps {
  contractNumber: string;
  contractTruckId: number;
  overview: ContractTruckChainOverview;
}

const ReassignForm = ({ contractNumber, contractTruckId, overview }: ReassignFormProps) => {
  const navigate = useNavigate();
  const { truck, legs } = overview;

  const sourceLeg = legs.find((leg) => leg.contractDispatchId === contractTruckId) ?? legs[0];
  const orderedLegs = useMemo(() => [...legs].sort((a, b) => a.chainPosition - b.chainPosition), [legs]);

  // The party re-assigning is the seller on the source leg, pushing the truck onto the
  // contract that supplies them — the one where they are the buyer.
  const actingPartyId = sourceLeg?.sellerProfileId ?? 0;
  const actingPartyName = sourceLeg?.sellerName ?? "You";

  const { data: sourceContract } = useGetContractByContractNumberQuery(contractNumber);
  const { data: openContracts } = useGetAllOpenAndPendingContractsQuery();
  const { data: drivers } = useGetAllActiveDriversQuery();
  const [reassignContractTruck, { isLoading: saving }] = useReassignContractTruckMutation();

  const driverPhone = drivers?.find((d) => d.driverId === truck.driverId)?.mobileNumber ?? "";

  const [targetContractNumber, setTargetContractNumber] = useState("");
  const [loadingAddressId, setLoadingAddressId] = useState("");
  const [lrNumber, setLrNumber] = useState("");
  const [assignedOn, setAssignedOn] = useState("");
  const [freightMode, setFreightMode] = useState<"same" | "override">("same");
  const [freightOverride, setFreightOverride] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const { data: targetContract, isFetching: loadingTarget } = useGetContractByContractNumberQuery(
    targetContractNumber,
    { skip: !targetContractNumber },
  );

  // The new leg loads at an address registered by the seller on the contract above.
  const { data: targetSellerAddresses } = useGetProfileAddressQuery(String(targetContract?.sellerId ?? 0), {
    skip: !targetContract?.sellerId,
  });

  // Only this party's own contracts are ever offered — never anyone else's.
  const myContracts = useMemo(
    () =>
      (openContracts ?? []).filter(
        (row) =>
          row.contractNumber !== contractNumber &&
          (samePartyName(row.buyer, actingPartyName) || samePartyName(row.seller, actingPartyName)),
      ),
    [openContracts, contractNumber, actingPartyName],
  );

  // Of those, the ones that meet all three rules: you buy on them, same product,
  // enough still pending.
  const preferredContracts = useMemo(
    () =>
      myContracts.filter(
        (row) =>
          samePartyName(row.buyer, actingPartyName) &&
          (!sourceContract?.productName || row.productName === sourceContract.productName) &&
          row.pendingQuantityMT >= truck.quantityMT,
      ),
    [myContracts, actingPartyName, sourceContract, truck.quantityMT],
  );

  const usingFallback = preferredContracts.length === 0 && myContracts.length > 0;
  const targetOptions = usingFallback ? myContracts : preferredContracts;

  useEffect(() => {
    if (!sourceLeg || assignedOn) return;
    const { date, time } = splitApiDateTimeForForm(sourceLeg.assignedOn);
    if (date && time) setAssignedOn(`${date}T${time}`);
  }, [sourceLeg, assignedOn]);

  if (!sourceLeg) {
    return (
      <InfoPanel
        icon={FiTruck}
        title="Truck Not Found"
        description="This truck has no chain on the contract. Open View All Trucks and use Re-assign on one of its trucks."
        action={{
          label: "Go to View All Trucks",
          to: `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`,
        }}
      />
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!targetContractNumber) nextErrors.targetContract = "Select the contract to re-assign onto.";
    if (!loadingAddressId) nextErrors.loadingAddress = "Select the loading address for this leg.";
    if (!lrNumber.trim()) nextErrors.lrNumber = "LR number is required for this leg.";
    if (!assignedOn) nextErrors.assignedOn = "Assigned on is required.";
    if (freightMode === "override") {
      if (!freightOverride.trim()) nextErrors.freight = "Enter the freight for this leg.";
      else if (!/^\d+(\.\d+)?$/.test(freightOverride.trim()) || Number(freightOverride) <= 0)
        nextErrors.freight = "Enter a valid freight amount greater than 0.";
    }
    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!targetContract?.id) {
      setSubmitError("That contract could not be loaded. Pick it again.");
      return;
    }

    setSubmitError("");

    try {
      const succeeded = await reassignContractTruck({
        sourceContractDispatchId: sourceLeg.contractDispatchId,
        targetContractId: targetContract.id,
        reassignedByProfileId: actingPartyId,
        loadingAddressId: Number(loadingAddressId),
        // This leg delivers where the source leg loads — your own yard on your contract.
        deliveryAddressId: sourceLeg.fromAddressId,
        lrNumber: lrNumber.trim(),
        assignedOn: new Date(assignedOn).toISOString(),
        freightPerMT: freightMode === "same" ? sourceLeg.freightPerMT : Number(freightOverride),
        createdBy: Number(localStorage.getItem("userId")) || 0,
      }).unwrap();

      if (!succeeded) {
        setSubmitError("The server rejected this re-assignment. Please try again.");
        return;
      }

      navigate(
        `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`,
      );
    } catch {
      setSubmitError("Failed to re-assign this truck. Please try again.");
    }
  };

  return (
    <>
      <div className="reassign-truck__acting">
        <span className="reassign-truck__acting-dot" aria-hidden />
        <strong>{actingPartyName}</strong>
        <span>{rolesOf(actingPartyId, orderedLegs) || `Seller on ${sourceLeg.contractNumber}`}</span>
      </div>

      <div className="reassign-truck__layout reassign-truck__layout--single">
        <div className="reassign-truck__main">
          <section className="reassign-truck__panel reassign-truck__source">
            <div className="reassign-truck__source-head">
              <span className="reassign-truck__source-truck">
                <FiTruck aria-hidden />
                <strong>{truck.registrationNumber}</strong>
              </span>
              <span className="reassign-truck__status">{truck.dispatchStatusName}</span>
            </div>
            <p className="reassign-truck__source-sub">
              {sourceLeg.contractNumber} · {sourceLeg.sellerName} → {sourceLeg.buyerName}
            </p>

            <div className="reassign-truck__source-grid">
              <div>
                <span>Transporter</span>
                <strong>{truck.transporterName}</strong>
              </div>
              <div>
                <span>Driver</span>
                <strong>
                  {truck.driverName}
                  {driverPhone ? ` · ${driverPhone}` : ""}
                </strong>
              </div>
              <div>
                <span>Quantity</span>
                <strong>{formatQty(truck.quantityMT)}</strong>
              </div>
              <div>
                <span>LR Number</span>
                <strong>{sourceLeg.lrNumber || "-"}</strong>
              </div>
              <div>
                <span>Freight</span>
                <strong>{formatFreight(sourceLeg.freightPerMT)}</strong>
              </div>
              <div>
                <span>Delivers to</span>
                <strong>{sourceLeg.deliveryAddress}</strong>
              </div>
            </div>

          </section>

          <section className="reassign-truck__panel">
            <h2 className="reassign-truck__panel-title">Re-assignment Details</h2>

            <div className="reassign-truck__field">
              <label htmlFor="reassign-target">
                Re-assign onto contract <span className="reassign-truck__required">*</span>
              </label>
              <select
                id="reassign-target"
                className="reassign-truck__control"
                value={targetContractNumber}
                onChange={(event) => {
                  setTargetContractNumber(event.target.value);
                  setLoadingAddressId("");
                }}
              >
                <option value="">Select a contract</option>
                {targetOptions.length === 0 && (
                  <option value="" disabled>
                    No other open contract for {actingPartyName}
                  </option>
                )}
                {targetOptions.map((row) => (
                  <option key={row.contractNumber} value={row.contractNumber}>
                    {row.contractNumber} · {row.seller ?? "-"} → {row.buyer ?? "-"} · {row.productName} ·{" "}
                    {formatQty(row.pendingQuantityMT)} pending
                  </option>
                ))}
              </select>
              {errors.targetContract && <p className="reassign-truck__error">{errors.targetContract}</p>}
            </div>

            <div className="reassign-truck__field">
              <label htmlFor="reassign-loading">
                Loading address <span className="reassign-truck__required">*</span>
              </label>
              <select
                id="reassign-loading"
                className="reassign-truck__control"
                value={loadingAddressId}
                onChange={(event) => setLoadingAddressId(event.target.value)}
                disabled={!targetContractNumber || loadingTarget}
              >
                <option value="">{loadingTarget ? "Loading contract…" : "Select a loading address"}</option>
                {(targetSellerAddresses ?? []).map((address) => (
                  <option key={address.addressId} value={String(address.addressId)}>
                    {formatAddress(address)}
                  </option>
                ))}
              </select>
              <p className="reassign-truck__hint">
                Delivers to {sourceLeg.loadingAddress} · {sourceLeg.contractNumber}
              </p>
              {errors.loadingAddress && <p className="reassign-truck__error">{errors.loadingAddress}</p>}
            </div>

            <div className="reassign-truck__row reassign-truck__row--three">
              <div className="reassign-truck__field">
                <label htmlFor="reassign-lr">
                  LR Number <span className="reassign-truck__required">*</span>
                </label>
                <input
                  id="reassign-lr"
                  type="text"
                  className="reassign-truck__control"
                  value={lrNumber}
                  onChange={(event) => setLrNumber(event.target.value)}
                />
                {errors.lrNumber && <p className="reassign-truck__error">{errors.lrNumber}</p>}
              </div>

              <div className="reassign-truck__field">
                <label htmlFor="reassign-assigned-on">Assigned on</label>
                <input
                  id="reassign-assigned-on"
                  type="datetime-local"
                  className="reassign-truck__control"
                  value={assignedOn}
                  onChange={(event) => setAssignedOn(event.target.value)}
                />
                {errors.assignedOn && <p className="reassign-truck__error">{errors.assignedOn}</p>}
              </div>

              <div className="reassign-truck__field">
                <span className="reassign-truck__label">Freight</span>
              <div className="reassign-truck__freight">
                <label
                  className={`reassign-truck__freight-option ${freightMode === "same" ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="freight-mode"
                    checked={freightMode === "same"}
                    onChange={() => setFreightMode("same")}
                  />
                  Keep {formatFreight(sourceLeg.freightPerMT)}
                </label>
                <label
                  className={`reassign-truck__freight-option ${freightMode === "override" ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="freight-mode"
                    checked={freightMode === "override"}
                    onChange={() => setFreightMode("override")}
                  />
                  Override
                  <input
                    type="text"
                    inputMode="decimal"
                    className="reassign-truck__control reassign-truck__freight-input"
                    placeholder="₹0.00"
                    value={freightOverride}
                    onChange={(event) => setFreightOverride(event.target.value)}
                    onFocus={() => setFreightMode("override")}
                    aria-label="Freight"
                  />
                </label>
              </div>
                {errors.freight && <p className="reassign-truck__error">{errors.freight}</p>}
              </div>
            </div>

            {submitError && <p className="reassign-truck__error">{submitError}</p>}

            <div className="reassign-truck__actions">
              <Link
                to={`/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`}
                className="reassign-truck__cancel"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="reassign-truck__submit"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Re-assigning…" : "Re-assign truck"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

const ReassignTruck = () => {
  const [searchParams] = useSearchParams();
  const { selectedContract, setSelectedContract } = useSelectedContract();
  // Falls back to the contract picked earlier, so opening this screen from the menu
  // without one in the URL still shows data rather than an empty state.
  const contractNumber = searchParams.get("contract") ?? selectedContract ?? "";
  const contractTruckId = Number(searchParams.get("contractTruckId") ?? 0);

  const requestingUserId = Number(localStorage.getItem("userId")) || 0;
  const { data: overview, isFetching } = useGetContractTruckChainOverviewQuery(
    { contractDispatchId: contractTruckId, requestingUserId },
    { skip: !contractTruckId },
  );

  useEffect(() => {
    if (contractNumber) setSelectedContract(contractNumber);
  }, [contractNumber, setSelectedContract]);


  return (
    <div className="reassign-truck">
      <p className="reassign-truck__breadcrumb">
        <Link to="/truck-management/open-pending-contracts">Contracts</Link>
        {contractNumber && (
          <>
            {` / ${contractNumber} / Trucks`}
            {overview ? ` / ${overview.truck.registrationNumber}` : ""}
          </>
        )}
      </p>

      <div className="truck-chain__header">
        <h1 className="reassign-truck__heading">Re-assign truck</h1>
        <Link
          to={
            contractNumber
              ? `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`
              : "/truck-management/open-pending-contracts/view-trucks"
          }
          className="reassign-truck__cancel"
        >
          <FiArrowLeft aria-hidden /> View All Trucks
        </Link>
      </div>
      {!contractNumber || !contractTruckId ? (
        <InfoPanel
          icon={FiFileText}
          title="No Truck Selected"
          description="Open a contract, go to View All Trucks and use Re-assign on the truck you want to move onto another contract."
          action={{ label: "Go to Open & Pending Contracts", to: "/truck-management/open-pending-contracts" }}
        />
      ) : isFetching ? (
        <p className="reassign-truck__notice">Loading this truck chain…</p>
      ) : !overview ? (
        <InfoPanel
          icon={FiTruck}
          title="Chain Not Available"
          description="The chain for this truck could not be loaded. Go back to View All Trucks and try again."
          action={{
            label: "Go to View All Trucks",
            to: `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`,
          }}
        />
      ) : (
        <ReassignForm
          contractNumber={contractNumber}
          contractTruckId={contractTruckId}
          overview={overview}
        />
      )}
    </div>
  );
};

export default ReassignTruck;
