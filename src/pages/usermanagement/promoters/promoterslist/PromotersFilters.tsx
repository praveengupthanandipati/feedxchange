import { FiSearch } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";

interface FilterOption {
  value: string;
  label: string;
}

export const statusFilterOptions: FilterOption[] = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Deleted", label: "Deleted" },
];

interface PromotersFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  commissionStructure: string;
  onCommissionStructureChange: (value: string) => void;
  commissionStructureOptions: FilterOption[];
  paymentFrequency: string;
  onPaymentFrequencyChange: (value: string) => void;
  paymentFrequencyOptions: FilterOption[];
}

const PromotersFilters = ({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  commissionStructure,
  onCommissionStructureChange,
  commissionStructureOptions,
  paymentFrequency,
  onPaymentFrequencyChange,
  paymentFrequencyOptions,
}: PromotersFiltersProps) => {
  return (
    <div className="promoters-filters">
      <SearchableSelect
        options={statusFilterOptions}
        value={status}
        onChange={onStatusChange}
        placeholder="Select Status"
        ariaLabel="Filter by status"
      />

      <SearchableSelect
        options={commissionStructureOptions}
        value={commissionStructure}
        onChange={onCommissionStructureChange}
        placeholder="Filter by Commission Structure"
        ariaLabel="Filter by commission structure"
      />

      <SearchableSelect
        options={paymentFrequencyOptions}
        value={paymentFrequency}
        onChange={onPaymentFrequencyChange}
        placeholder="Filter by Payment Frequency"
        ariaLabel="Filter by payment frequency"
      />

      <div className="promoters-filters__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by name, company, phone, email"
        />
      </div>
    </div>
  );
};

export default PromotersFilters;
