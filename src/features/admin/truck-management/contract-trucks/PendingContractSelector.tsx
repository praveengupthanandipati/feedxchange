import { useEffect, useMemo, useState } from "react";
import { useOpenAndPendingContracts } from "../../../../core/store/useOpenAndPendingContracts";
import type { OpenAndPendingContract } from "../../../../core/store/contractsApi";
import { useProfileCities } from "../../../../shared/hooks/useProfileCities";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import "./PendingContractSelector.scss";

interface PendingContractSelectorProps {
  value: string;
  onChange: (contractNumber: string) => void;
  /**
   * Adds Seller and Buyer dropdowns before the contract one. At least one of them has to be chosen; the contract dropdown then lists
   * only the pending contracts of the chosen seller and / or buyer.
   */
  withParties?: boolean;
}

const ALL = "__all";

const sellerKey = (row: OpenAndPendingContract) => String(row.sellerId ?? row.seller ?? "");
const buyerKey = (row: OpenAndPendingContract) => String(row.buyerId ?? row.buyer ?? "");

const PendingContractSelector = ({ value, onChange, withParties = false }: PendingContractSelectorProps) => {
  const { data: contracts, isLoading } = useOpenAndPendingContracts();
  const { label: partyLabel } = useProfileCities();
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");

  const pending = useMemo(() => (contracts ?? []).filter((row) => (row.pendingQuantityMT ?? 0) > 0), [contracts]);

  // a contract opened by link (or picked earlier) fills in its own seller and buyer
  useEffect(() => {
    if (!withParties || !value) return;
    const row = pending.find((c) => c.contractNumber === value);
    if (!row) return;
    setSellerId((prev) => (prev === sellerKey(row) ? prev : sellerKey(row)));
    setBuyerId((prev) => (prev === buyerKey(row) ? prev : buyerKey(row)));
  }, [withParties, value, pending]);

  const matching = (seller: string, buyer: string) =>
    pending.filter((row) => (!seller || sellerKey(row) === seller) && (!buyer || buyerKey(row) === buyer));

  const sellerOptions = useMemo(() => {
    const map = new Map<string, string>();
    matching("", buyerId).forEach((row) => map.set(sellerKey(row), row.seller ? partyLabel(row.seller) : "-"));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([id, label]) => ({ value: id, label }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, buyerId, partyLabel]);
  const buyerOptions = useMemo(() => {
    const map = new Map<string, string>();
    matching(sellerId, "").forEach((row) => map.set(buyerKey(row), row.buyer ? partyLabel(row.buyer) : "-"));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([id, label]) => ({ value: id, label }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, sellerId, partyLabel]);

  const chosenParty = !withParties || Boolean(sellerId || buyerId);
  const options = useMemo(
    () =>
      (withParties ? matching(sellerId, buyerId) : pending).map((row) => ({
        value: row.contractNumber,
        label: `${row.contractNumber} — ${row.seller ? partyLabel(row.seller) : "-"} → ${row.buyer ? partyLabel(row.buyer) : "-"}`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending, withParties, sellerId, buyerId, partyLabel],
  );

  /** Changing the seller / buyer clears the chosen contract when it no longer belongs to them. */
  const changeParty = (nextSeller: string, nextBuyer: string) => {
    setSellerId(nextSeller);
    setBuyerId(nextBuyer);
    if (value && !matching(nextSeller, nextBuyer).some((row) => row.contractNumber === value)) onChange("");
  };

  const contractSelect = (
    <SearchableSelect
      options={chosenParty ? options : []}
      value={value}
      onChange={onChange}
      disabled={!chosenParty}
      placeholder={
        isLoading
          ? "Loading pending contracts…"
          : !chosenParty
            ? "Select a seller or a buyer first"
            : options.length
              ? "Select a pending contract"
              : "No pending contracts for this seller / buyer"
      }
      ariaLabel="Select a pending contract"
    />
  );

  if (!withParties) {
    return (
      <div className="pending-contract-selector">
        <label className="pending-contract-selector__label">Pending Contract</label>
        {contractSelect}
      </div>
    );
  }

  return (
    <div className="pending-contract-selector pending-contract-selector--parties">
      <div className="pending-contract-selector__field">
        <label className="pending-contract-selector__label">Seller</label>
        <SearchableSelect
          options={[{ value: ALL, label: "All sellers" }, ...sellerOptions]}
          value={sellerId || ALL}
          onChange={(next) => changeParty(next === ALL ? "" : next, buyerId)}
          placeholder="Select seller"
          ariaLabel="Seller"
        />
      </div>
      <div className="pending-contract-selector__field">
        <label className="pending-contract-selector__label">Buyer</label>
        <SearchableSelect
          options={[{ value: ALL, label: "All buyers" }, ...buyerOptions]}
          value={buyerId || ALL}
          onChange={(next) => changeParty(sellerId, next === ALL ? "" : next)}
          placeholder="Select buyer"
          ariaLabel="Buyer"
        />
      </div>
      <div className="pending-contract-selector__field pending-contract-selector__field--contract">
        <label className="pending-contract-selector__label">Pending Contract</label>
        {contractSelect}
      </div>
      {!chosenParty && <small className="pending-contract-selector__hint">Choose a seller or a buyer (at least one) to see their pending contracts.</small>}
    </div>
  );
};

export default PendingContractSelector;
