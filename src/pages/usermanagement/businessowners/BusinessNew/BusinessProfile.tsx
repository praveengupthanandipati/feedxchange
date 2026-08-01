import { useMemo } from "react";
import { FiPlus } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../../components/tooltip/InfoTooltip";
import EmptyRowsState from "./EmptyRowsState";
import {
  useGetAllBusinessLinesQuery,
  useGetBusinessTypesByLineQuery,
  useGetBusinessSubTypesQuery,
} from "../../../../store/businessProfilesApi";
import { useGetProductsQuery } from "../../../../store/productsApi";
import { areaOptions, establishmentYearOptions } from "./newBusiness.data";

export interface BrokerageRow {
  id: string;
  productId: string;
  buyCharge: string;
  sellCharge: string;
  // Present only for rows loaded from an existing profile — tells the save
  // step to call UpdateBusinessBuySellCharge instead of bundling this row
  // into the next CreateBusinessBuySellCharge call. effectiveFrom/effectiveTo/
  // isActive have no UI field yet, so they just round-trip whatever the
  // backend already has for this row.
  meta?: {
    chargeId: number;
    createdBy: number;
    createdOn: string;
    effectiveFrom: string;
    effectiveTo: string;
    isActive: boolean;
  };
}

let brokerageRowSeq = 0;
export const nextBrokerageRowId = () => `brokerage-${Date.now()}-${brokerageRowSeq++}`;

interface ProductOption {
  value: string;
  label: string;
}

interface BrokerageChargesCardProps {
  buyBrokerageCharges: string;
  onBuyBrokerageChargesChange: (value: string) => void;
  sellBrokerageCharges: string;
  onSellBrokerageChargesChange: (value: string) => void;
  rows: BrokerageRow[];
  onRowsChange: (rows: BrokerageRow[]) => void;
  productOptions: ProductOption[];
}

const BrokerageChargesCard = ({
  buyBrokerageCharges,
  onBuyBrokerageChargesChange,
  sellBrokerageCharges,
  onSellBrokerageChargesChange,
  rows,
  onRowsChange,
  productOptions,
}: BrokerageChargesCardProps) => {
  const addRow = () => {
    onRowsChange([
      ...rows,
      {
        id: nextBrokerageRowId(),
        productId: "",
        buyCharge: buyBrokerageCharges,
        sellCharge: sellBrokerageCharges,
      },
    ]);
  };

  const handleBuyBrokerageChange = (value: string) => {
    onBuyBrokerageChargesChange(value);
    onRowsChange(rows.map((row) => ({ ...row, buyCharge: value })));
  };

  const handleSellBrokerageChange = (value: string) => {
    onSellBrokerageChargesChange(value);
    onRowsChange(rows.map((row) => ({ ...row, sellCharge: value })));
  };

  const updateRow = (id: string, patch: Partial<BrokerageRow>) => {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="new-contract__condition-card">
      <h3>Brokerage Charges</h3>

      <div className="new-contract__grid new-contract__grid--condition">
        <div className="form-field">
          <span className="form-field__label">
            Buy Brokerage Charges
            <InfoTooltip text="Default brokerage charged when buying from this business." />
          </span>
          <input
            type="number"
            min="0"
            className="form-field__control"
            placeholder="Buy Brokerage Charges"
            value={buyBrokerageCharges}
            onChange={(event) => handleBuyBrokerageChange(event.target.value)}
          />
        </div>
        <div className="form-field">
          <span className="form-field__label">
            Sell Brokerage Charges
            <InfoTooltip text="Default brokerage charged when selling to this business." />
          </span>
          <input
            type="number"
            min="0"
            className="form-field__control"
            placeholder="Sell Brokerage Charges"
            value={sellBrokerageCharges}
            onChange={(event) => handleSellBrokerageChange(event.target.value)}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyRowsState onAdd={addRow} />
      ) : (
        <div className="repeatable-rows">
          <div className="repeatable-rows__header">
            <span>Product</span>
            <span>Buy Charges</span>
            <span>Sell Charges</span>
            <span>Add</span>
          </div>
          {rows.map((row, index) => {
            const usedProducts = rows
              .filter((otherRow) => otherRow.id !== row.id)
              .map((otherRow) => otherRow.productId);
            const availableProductOptions = productOptions.filter(
              (option) => !usedProducts.includes(option.value),
            );

            return (
              <div className="repeatable-rows__row" key={row.id}>
                <SearchableSelect
                  options={availableProductOptions}
                  value={row.productId}
                  onChange={(value) => updateRow(row.id, { productId: value })}
                  ariaLabel="Product"
                />
                <input
                  type="number"
                  min="0"
                  className="form-field__control"
                  placeholder="Buy Charges"
                  value={row.buyCharge}
                  onChange={(event) => updateRow(row.id, { buyCharge: event.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="form-field__control"
                  placeholder="Sell Charges"
                  value={row.sellCharge}
                  onChange={(event) => updateRow(row.id, { sellCharge: event.target.value })}
                />
                <div className="repeatable-rows__actions">
                  {index === rows.length - 1 && (
                    <button
                      type="button"
                      className="repeatable-rows__add"
                      onClick={addRow}
                      aria-label="Add row"
                    >
                      <FiPlus aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface CapacityRow {
  id: string;
  productId: string;
  tonsPerDay: string;
  tonsPerMonth: string;
  meta?: { capacityRequirementId: number; createdBy: number; createdOn: string };
}

let capacityRowSeq = 0;
export const nextCapacityRowId = () => `capacity-${Date.now()}-${capacityRowSeq++}`;

interface CapacityRequirementsCardProps {
  rows: CapacityRow[];
  onRowsChange: (rows: CapacityRow[]) => void;
  productOptions: ProductOption[];
}

const CapacityRequirementsCard = ({ rows, onRowsChange, productOptions }: CapacityRequirementsCardProps) => {
  const addRow = () => {
    onRowsChange([...rows, { id: nextCapacityRowId(), productId: "", tonsPerDay: "", tonsPerMonth: "" }]);
  };

  const updateRow = (id: string, patch: Partial<CapacityRow>) => {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="new-contract__condition-card">
      <h3>Capacity and Monthly Requirements</h3>

      {rows.length === 0 ? (
        <EmptyRowsState onAdd={addRow} />
      ) : (
        <div className="repeatable-rows">
          <div className="repeatable-rows__header">
            <span>Product</span>
            <span>TPD</span>
            <span>TPM</span>
            <span>Add</span>
          </div>
          {rows.map((row, index) => (
            <div className="repeatable-rows__row" key={row.id}>
              <SearchableSelect
                options={productOptions}
                value={row.productId}
                onChange={(value) => updateRow(row.id, { productId: value })}
                ariaLabel="Product"
              />
              <input
                type="number"
                min="0"
                className="form-field__control"
                placeholder="TPD"
                value={row.tonsPerDay}
                onChange={(event) => updateRow(row.id, { tonsPerDay: event.target.value })}
              />
              <input
                type="number"
                min="0"
                className="form-field__control"
                placeholder="TPM"
                value={row.tonsPerMonth}
                onChange={(event) => updateRow(row.id, { tonsPerMonth: event.target.value })}
              />
              <div className="repeatable-rows__actions">
                {index === rows.length - 1 && (
                  <button
                    type="button"
                    className="repeatable-rows__add"
                    onClick={addRow}
                    aria-label="Add row"
                  >
                    <FiPlus aria-hidden />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface BusinessProfileProps {
  legalName: string;
  onLegalNameChange: (value: string) => void;
  tradingName: string;
  onTradingNameChange: (value: string) => void;
  yearOfEstablishment: string;
  onYearOfEstablishmentChange: (value: string) => void;
  panNumber: string;
  onPanNumberChange: (value: string) => void;
  gstNumber: string;
  onGstNumberChange: (value: string) => void;
  businessLineId: string;
  onBusinessLineIdChange: (value: string) => void;
  businessTypeId: string;
  onBusinessTypeIdChange: (value: string) => void;
  businessSubTypeId: string;
  onBusinessSubTypeIdChange: (value: string) => void;
  area: string;
  onAreaChange: (value: string) => void;
  collectionArea: string;
  onCollectionAreaChange: (value: string) => void;
  referredBy: string;
  onReferredByChange: (value: string) => void;
  referralName: string;
  onReferralNameChange: (value: string) => void;
  aboutProfile: string;
  onAboutProfileChange: (value: string) => void;
  buyBrokerageCharges: string;
  onBuyBrokerageChargesChange: (value: string) => void;
  sellBrokerageCharges: string;
  onSellBrokerageChargesChange: (value: string) => void;
  brokerageRows: BrokerageRow[];
  onBrokerageRowsChange: (rows: BrokerageRow[]) => void;
  capacityRows: CapacityRow[];
  onCapacityRowsChange: (rows: CapacityRow[]) => void;
}

const BusinessProfile = ({
  legalName,
  onLegalNameChange,
  tradingName,
  onTradingNameChange,
  yearOfEstablishment,
  onYearOfEstablishmentChange,
  panNumber,
  onPanNumberChange,
  gstNumber,
  onGstNumberChange,
  businessLineId,
  onBusinessLineIdChange,
  businessTypeId,
  onBusinessTypeIdChange,
  businessSubTypeId,
  onBusinessSubTypeIdChange,
  area,
  onAreaChange,
  collectionArea,
  onCollectionAreaChange,
  referredBy,
  onReferredByChange,
  referralName,
  onReferralNameChange,
  aboutProfile,
  onAboutProfileChange,
  buyBrokerageCharges,
  onBuyBrokerageChargesChange,
  sellBrokerageCharges,
  onSellBrokerageChargesChange,
  brokerageRows,
  onBrokerageRowsChange,
  capacityRows,
  onCapacityRowsChange,
}: BusinessProfileProps) => {
  const { data: products } = useGetProductsQuery();
  const productOptions = useMemo(
    () =>
      (products ?? []).map((product) => ({
        value: String(product.id),
        label: product.name ?? "",
      })),
    [products],
  );

  const { data: businessLines } = useGetAllBusinessLinesQuery();
  const businessLineOptions = useMemo(
    () =>
      (businessLines ?? []).map((line) => ({
        value: String(line.businessLineId),
        label: line.businessLineName,
      })),
    [businessLines],
  );

  const { data: businessTypes } = useGetBusinessTypesByLineQuery(businessLineId, {
    skip: !businessLineId,
  });
  const businessTypeOptions = useMemo(
    () =>
      (businessTypes ?? []).map((type) => ({
        value: String(type.businessTypeId),
        label: type.businessTypeName,
      })),
    [businessTypes],
  );

  const { data: businessSubTypes } = useGetBusinessSubTypesQuery(businessTypeId, {
    skip: !businessTypeId,
  });
  const businessSubTypeOptions = useMemo(
    () =>
      (businessSubTypes ?? []).map((subType) => ({
        value: String(subType.businessSubTypeId),
        label: subType.businessSubTypeName,
      })),
    [businessSubTypes],
  );

  const handleBusinessLineIdChange = (value: string) => {
    onBusinessLineIdChange(value);
    onBusinessTypeIdChange("");
    onBusinessSubTypeIdChange("");
  };

  const handleBusinessTypeIdChange = (value: string) => {
    onBusinessTypeIdChange(value);
    onBusinessSubTypeIdChange("");
  };

  return (
    <>
      <div className="new-contract__grid">
        <div className="form-field">
          <label className="form-field__label" htmlFor="legalName">
            Business Legal Name <span className="form-field__required">*</span>
          </label>
          <input
            id="legalName"
            type="text"
            className="form-field__control"
            placeholder="Name as per PAN/GST"
            value={legalName}
            onChange={(event) => onLegalNameChange(event.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">
            Trading Name
            <InfoTooltip text="The name used for day-to-day trading, if different from the legal name." />
          </span>
          <input
            type="text"
            className="form-field__control"
            placeholder="Trading Name"
            value={tradingName}
            onChange={(event) => onTradingNameChange(event.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">Establishment Year</span>
          <SearchableSelect
            options={establishmentYearOptions}
            value={yearOfEstablishment}
            onChange={onYearOfEstablishmentChange}
            ariaLabel="Establishment Year"
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="panNumber">
            PAN Number
          </label>
          <input
            id="panNumber"
            type="text"
            className="form-field__control"
            placeholder="PAN Number"
            value={panNumber}
            onChange={(event) => onPanNumberChange(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="gstNumber">
            GST Number
          </label>
          <input
            id="gstNumber"
            type="text"
            className="form-field__control"
            placeholder="GST Number"
            value={gstNumber}
            onChange={(event) => onGstNumberChange(event.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">Line of Business</span>
          <SearchableSelect
            options={businessLineOptions}
            value={businessLineId}
            onChange={handleBusinessLineIdChange}
            ariaLabel="Line of Business"
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">Type of Business</span>
          <SearchableSelect
            options={businessTypeOptions}
            value={businessTypeId}
            onChange={handleBusinessTypeIdChange}
            placeholder={businessLineId ? "Select..." : "Select Line of Business first"}
            ariaLabel="Type of Business"
            disabled={!businessLineId}
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">Sub Type of Business</span>
          <SearchableSelect
            options={businessSubTypeOptions}
            value={businessSubTypeId}
            onChange={onBusinessSubTypeIdChange}
            placeholder={businessTypeId ? "Select..." : "Select Type of Business first"}
            ariaLabel="Sub Type of Business"
            disabled={!businessTypeId}
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">Area</span>
          <SearchableSelect
            options={areaOptions}
            value={area}
            onChange={onAreaChange}
            placeholder="Select or type..."
            ariaLabel="Area"
            allowCustom
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="collectionArea">
            Collection Area
          </label>
          <input
            id="collectionArea"
            type="text"
            className="form-field__control"
            placeholder="Enter Collection Area"
            value={collectionArea}
            onChange={(event) => onCollectionAreaChange(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="referredBy">
           Referral Code
          </label>
          <input
            id="referredBy"
            type="text"
            className="form-field__control"
            placeholder="Enter Referral Code"
            value={referredBy}
            onChange={(event) => onReferredByChange(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="referralName">
            Referral Name
          </label>
          <input
            id="referralName"
            type="text"
            className="form-field__control"
            placeholder="Enter Referral Name"
            value={referralName}
            onChange={(event) => onReferralNameChange(event.target.value)}
          />
        </div>

        <div className="form-field new-contract__grid--full mb-3">
          <label className="form-field__label" htmlFor="aboutProfile">
            About Business
          </label>
          <textarea
            id="aboutProfile"
            className="form-field__control"
            placeholder="Describe Your Business"
            value={aboutProfile}
            onChange={(event) => onAboutProfileChange(event.target.value)}
          />
        </div>
      </div>

      <div className="new-contract__conditions">
        <BrokerageChargesCard
          buyBrokerageCharges={buyBrokerageCharges}
          onBuyBrokerageChargesChange={onBuyBrokerageChargesChange}
          sellBrokerageCharges={sellBrokerageCharges}
          onSellBrokerageChargesChange={onSellBrokerageChargesChange}
          rows={brokerageRows}
          onRowsChange={onBrokerageRowsChange}
          productOptions={productOptions}
        />
        <CapacityRequirementsCard
          rows={capacityRows}
          onRowsChange={onCapacityRowsChange}
          productOptions={productOptions}
        />
      </div>
    </>
  );
};

export default BusinessProfile;
