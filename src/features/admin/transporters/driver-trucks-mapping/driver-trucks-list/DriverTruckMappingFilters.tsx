import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ClearFiltersButton from "../../../../../shared/components/filters/ClearFiltersButton";

interface FilterOption {
  value: string;
  label: string;
}

interface DriverTruckMappingFiltersProps {
  truckNumber: string;
  onTruckNumberChange: (value: string) => void;
  truckOptions: FilterOption[];
  driverName: string;
  onDriverNameChange: (value: string) => void;
  driverOptions: FilterOption[];
  /** Shows the ✕ that resets the filters and search. */
  onClear?: () => void;
}

const DriverTruckMappingFilters = ({
  truckNumber,
  onTruckNumberChange,
  truckOptions,
  driverName,
  onDriverNameChange,
  driverOptions,
  onClear,
}: DriverTruckMappingFiltersProps) => {
  return (
    <div className="driver-truck-mapping-filters">
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
      {onClear && <ClearFiltersButton onClick={onClear} />}
    </div>
  );
};

export default DriverTruckMappingFilters;
