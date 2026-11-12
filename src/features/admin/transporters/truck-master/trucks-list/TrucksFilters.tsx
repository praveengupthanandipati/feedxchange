import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ClearFiltersButton from "../../../../../shared/components/filters/ClearFiltersButton";

interface FilterOption {
  value: string;
  label: string;
}

interface TrucksFiltersProps {
  truckNumber: string;
  onTruckNumberChange: (value: string) => void;
  truckType: string;
  onTruckTypeChange: (value: string) => void;
  truckTypeOptions: FilterOption[];
  make: string;
  onMakeChange: (value: string) => void;
  makeOptions: FilterOption[];
  model: string;
  onModelChange: (value: string) => void;
  modelOptions: FilterOption[];
  manufactureYear: string;
  onManufactureYearChange: (value: string) => void;
  manufactureYearOptions: FilterOption[];
  capacity: string;
  onCapacityChange: (value: string) => void;
  capacityOptions: FilterOption[];
  fuelType: string;
  onFuelTypeChange: (value: string) => void;
  fuelTypeOptions: FilterOption[];
  /** Shows the ✕ that resets the filters and search. */
  onClear?: () => void;
}

const TrucksFilters = ({
  truckNumber,
  onTruckNumberChange,
  truckType,
  onTruckTypeChange,
  truckTypeOptions,
  make,
  onMakeChange,
  makeOptions,
  model,
  onModelChange,
  modelOptions,
  manufactureYear,
  onManufactureYearChange,
  manufactureYearOptions,
  capacity,
  onCapacityChange,
  capacityOptions,
  fuelType,
  onFuelTypeChange,
  fuelTypeOptions,
  onClear,
}: TrucksFiltersProps) => {
  return (
    <div className="trucks-filters">
      <input
        type="text"
        className="trucks-filters__input"
        value={truckNumber}
        onChange={(event) => onTruckNumberChange(event.target.value)}
        placeholder="Truck Number"
        aria-label="Filter by Truck Number"
      />

      <SearchableSelect
        options={truckTypeOptions}
        value={truckType}
        onChange={onTruckTypeChange}
        placeholder="Filter by Truck Type"
        ariaLabel="Filter by Truck Type"
      />

      <SearchableSelect
        options={makeOptions}
        value={make}
        onChange={onMakeChange}
        placeholder="Filter by Make"
        ariaLabel="Filter by Make"
      />

      <SearchableSelect
        options={modelOptions}
        value={model}
        onChange={onModelChange}
        placeholder="Filter by Model"
        ariaLabel="Filter by Model"
      />

      <SearchableSelect
        options={manufactureYearOptions}
        value={manufactureYear}
        onChange={onManufactureYearChange}
        placeholder="Filter by Year of Model"
        ariaLabel="Filter by Year of Model"
      />

      <SearchableSelect
        options={capacityOptions}
        value={capacity}
        onChange={onCapacityChange}
        placeholder="Filter by Capacity"
        ariaLabel="Filter by Capacity"
      />

      <SearchableSelect
        options={fuelTypeOptions}
        value={fuelType}
        onChange={onFuelTypeChange}
        placeholder="Filter by Fuel Type"
        ariaLabel="Filter by Fuel Type"
      />
      {onClear && <ClearFiltersButton onClick={onClear} />}
    </div>
  );
};

export default TrucksFilters;
