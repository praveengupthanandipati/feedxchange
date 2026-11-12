import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ClearFiltersButton from "../../../../../shared/components/filters/ClearFiltersButton";

interface FilterOption {
  value: string;
  label: string;
}

interface TruckTripFiltersProps {
  truckNumber: string;
  onTruckNumberChange: (value: string) => void;
  truckOptions: FilterOption[];
  driverName: string;
  onDriverNameChange: (value: string) => void;
  driverOptions: FilterOption[];
  businessProfileName: string;
  onBusinessProfileNameChange: (value: string) => void;
  businessProfileOptions: FilterOption[];
  tripStatus: string;
  onTripStatusChange: (value: string) => void;
  tripStatusOptions: FilterOption[];
  /** Shows the ✕ that resets the filters and search. */
  onClear?: () => void;
}

const TruckTripFilters = ({
  truckNumber,
  onTruckNumberChange,
  truckOptions,
  driverName,
  onDriverNameChange,
  driverOptions,
  businessProfileName,
  onBusinessProfileNameChange,
  businessProfileOptions,
  tripStatus,
  onTripStatusChange,
  tripStatusOptions,
  onClear,
}: TruckTripFiltersProps) => {
  return (
    <div className="truck-trip-filters">
      <SearchableSelect
        options={truckOptions}
        value={truckNumber}
        onChange={onTruckNumberChange}
        placeholder="Search by Truck"
        ariaLabel="Search by truck number"
      />

      <SearchableSelect
        options={driverOptions}
        value={driverName}
        onChange={onDriverNameChange}
        placeholder="Search by Driver"
        ariaLabel="Search by driver name"
      />

      <SearchableSelect
        options={businessProfileOptions}
        value={businessProfileName}
        onChange={onBusinessProfileNameChange}
        placeholder="Search by Business Profile"
        ariaLabel="Search by business profile"
      />

      <SearchableSelect
        options={tripStatusOptions}
        value={tripStatus}
        onChange={onTripStatusChange}
        placeholder="Filter by Status"
        ariaLabel="Filter by trip status"
      />
      {onClear && <ClearFiltersButton onClick={onClear} />}
    </div>
  );
};

export default TruckTripFilters;
