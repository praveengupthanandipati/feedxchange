import SearchableSelect from "../../../../components/dropdown/SearchableSelect";

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
}

const DriverTruckMappingFilters = ({
  truckNumber,
  onTruckNumberChange,
  truckOptions,
  driverName,
  onDriverNameChange,
  driverOptions,
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
    </div>
  );
};

export default DriverTruckMappingFilters;
