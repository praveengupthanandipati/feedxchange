import SearchableSelect from "../../../../components/dropdown/SearchableSelect";

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
  sellerName: string;
  onSellerNameChange: (value: string) => void;
  sellerOptions: FilterOption[];
  buyerName: string;
  onBuyerNameChange: (value: string) => void;
  buyerOptions: FilterOption[];
}

const TruckTripFilters = ({
  truckNumber,
  onTruckNumberChange,
  truckOptions,
  driverName,
  onDriverNameChange,
  driverOptions,
  sellerName,
  onSellerNameChange,
  sellerOptions,
  buyerName,
  onBuyerNameChange,
  buyerOptions,
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
        options={sellerOptions}
        value={sellerName}
        onChange={onSellerNameChange}
        placeholder="Search by Seller"
        ariaLabel="Search by seller"
      />

      <SearchableSelect
        options={buyerOptions}
        value={buyerName}
        onChange={onBuyerNameChange}
        placeholder="Search by Buyer"
        ariaLabel="Search by buyer"
      />
    </div>
  );
};

export default TruckTripFilters;
