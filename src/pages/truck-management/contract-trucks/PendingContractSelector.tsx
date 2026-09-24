import { useMemo } from "react";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import { useGetAllOpenAndPendingContractsQuery } from "../../../store/contractsApi";
import "./PendingContractSelector.scss";

interface PendingContractSelectorProps {
  value: string;
  onChange: (contractNumber: string) => void;
}

const PendingContractSelector = ({ value, onChange }: PendingContractSelectorProps) => {
  const { data: contracts, isLoading } = useGetAllOpenAndPendingContractsQuery();

  const options = useMemo(
    () =>
      (contracts ?? [])
        .filter((row) => (row.pendingQuantityMT ?? 0) > 0)
        .map((row) => ({
          value: row.contractNumber,
          label: `${row.contractNumber} — ${row.seller ?? "-"} → ${row.buyer ?? "-"}`,
        })),
    [contracts],
  );

  return (
    <div className="pending-contract-selector">
      <label className="pending-contract-selector__label">Pending Contract</label>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder={isLoading ? "Loading pending contracts…" : "Select a pending contract"}
        ariaLabel="Select a pending contract"
      />
    </div>
  );
};

export default PendingContractSelector;
