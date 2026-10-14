import SearchableSelect, { type SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { BulkCommission } from "../commissionEstimation.data";

interface BulkCommissionBarProps {
  value: BulkCommission;
  commodityOptions: SearchableSelectOption[];
  partyOptions: SearchableSelectOption[];
  onChange: (value: BulkCommission) => void;
  onApply: () => void;
}

/** Sets one commission per MT on every listed (or ticked) contract matching the commodity and party. */
const BulkCommissionBar = ({ value, commodityOptions, partyOptions, onChange, onApply }: BulkCommissionBarProps) => (
  <form
    className="commission-estimations__bulk"
    onSubmit={(event) => {
      event.preventDefault();
      onApply();
    }}
    noValidate
  >
    <SearchableSelect options={commodityOptions} value={value.commodity} onChange={(commodity) => onChange({ ...value, commodity })} placeholder="Select Commodity" ariaLabel="Apply commission to commodity" clearable />
    <SearchableSelect options={partyOptions} value={value.party} onChange={(party) => onChange({ ...value, party })} placeholder="Select Party" ariaLabel="Apply commission to party" clearable />
    <input
      type="number"
      min={0}
      inputMode="decimal"
      className="commission-estimations__input"
      placeholder="Ex:50"
      aria-label="Commission per MT to apply"
      value={value.commission}
      onChange={(event) => onChange({ ...value, commission: event.target.value })}
    />
    <button type="submit" className="commission-estimations__btn commission-estimations__btn--navy">
      Apply
    </button>
  </form>
);

export default BulkCommissionBar;
