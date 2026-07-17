import { useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { productOptions } from "../../contracts/newContract.data";
import {
  useGetAllBusinessLinesQuery,
  useGetBusinessTypesByLineQuery,
  useGetBusinessSubTypesQuery,
} from "../../../store/businessProfilesApi";
import { groupOptions, collectionAreaOptions, areaOptions, establishmentYearOptions } from "./newBusiness.data";

export interface BrokerageRow {
  id: string;
  productId: string;
  buyCharge: string;
  sellCharge: string;
}

let brokerageRowSeq = 0;
export const nextBrokerageRowId = () => `brokerage-${Date.now()}-${brokerageRowSeq++}`;

interface BrokerageChargesCardProps {
  buyBrokerageCharges: string;
  onBuyBrokerageChargesChange: (value: string) => void;
  sellBrokerageCharges: string;
  onSellBrokerageChargesChange: (value: string) => void;
  rows: BrokerageRow[];
  onRowsChange: (rows: BrokerageRow[]) => void;
}

const BrokerageChargesCard = ({
  buyBrokerageCharges,
  onBuyBrokerageChargesChange,
  sellBrokerageCharges,
  onSellBrokerageChargesChange,
  rows,
  onRowsChange,
}: BrokerageChargesCardProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  const confirmRemoveRow = () => {
    onRowsChange(rows.filter((row) => row.id !== pendingDeleteId));
    setPendingDeleteId(null);
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
            <span>Actions</span>
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
                  allowCustom
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
                  <button
                    type="button"
                    className="repeatable-rows__delete"
                    onClick={() => setPendingDeleteId(row.id)}
                    aria-label="Remove row"
                  >
                    <FiTrash2 aria-hidden />
                  </button>
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

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this row?"
        message="This will remove the brokerage charges for this product. This cannot be undone."
        onConfirm={confirmRemoveRow}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export interface CapacityRow {
  id: string;
  productId: string;
  tonsPerDay: string;
  tonsPerMonth: string;
}

let capacityRowSeq = 0;
export const nextCapacityRowId = () => `capacity-${Date.now()}-${capacityRowSeq++}`;

interface CapacityRequirementsCardProps {
  rows: CapacityRow[];
  onRowsChange: (rows: CapacityRow[]) => void;
}

const CapacityRequirementsCard = ({ rows, onRowsChange }: CapacityRequirementsCardProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addRow = () => {
    onRowsChange([...rows, { id: nextCapacityRowId(), productId: "", tonsPerDay: "", tonsPerMonth: "" }]);
  };

  const confirmRemoveRow = () => {
    onRowsChange(rows.filter((row) => row.id !== pendingDeleteId));
    setPendingDeleteId(null);
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
            <span>Actions</span>
          </div>
          {rows.map((row, index) => (
            <div className="repeatable-rows__row" key={row.id}>
              <SearchableSelect
                options={productOptions}
                value={row.productId}
                onChange={(value) => updateRow(row.id, { productId: value })}
                ariaLabel="Product"
                allowCustom
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
                <button
                  type="button"
                  className="repeatable-rows__delete"
                  onClick={() => setPendingDeleteId(row.id)}
                  aria-label="Remove row"
                >
                  <FiTrash2 aria-hidden />
                </button>
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

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this row?"
        message="This will remove the capacity requirement for this product. This cannot be undone."
        onConfirm={confirmRemoveRow}
        onCancel={() => setPendingDeleteId(null)}
      />
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
  groupName: string;
  onGroupNameChange: (value: string) => void;
  collectionArea: string;
  onCollectionAreaChange: (value: string) => void;
  area: string;
  onAreaChange: (value: string) => void;
  referredBy: string;
  onReferredByChange: (value: string) => void;
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
  groupName,
  onGroupNameChange,
  collectionArea,
  onCollectionAreaChange,
  area,
  onAreaChange,
  referredBy,
  onReferredByChange,
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
          <span className="form-field__label">Group</span>
          <SearchableSelect
            options={groupOptions}
            value={groupName}
            onChange={onGroupNameChange}
            placeholder="Select or type..."
            ariaLabel="Group"
            allowCustom
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">Collection Area</span>
          <SearchableSelect
            options={collectionAreaOptions}
            value={collectionArea}
            onChange={onCollectionAreaChange}
            placeholder="Select or type..."
            ariaLabel="Collection Area"
            allowCustom
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
          <label className="form-field__label" htmlFor="referredBy">
            Referred By
          </label>
          <input
            id="referredBy"
            type="text"
            className="form-field__control"
            placeholder="Enter Referred By"
            value={referredBy}
            onChange={(event) => onReferredByChange(event.target.value)}
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
        />
        <CapacityRequirementsCard rows={capacityRows} onRowsChange={onCapacityRowsChange} />
      </div>
    </>
  );
};

export default BusinessProfile;
