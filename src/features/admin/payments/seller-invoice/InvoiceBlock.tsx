import { useMemo } from "react";
import { LinkIcon, PlusIcon, SearchIcon, Trash2Icon } from "../../../../shared/components/icon";
import DatePickerInput from "../../../../shared/components/dropdown/DatePickerInput";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import { useGetAllActiveDriversQuery } from "../../../../core/store/driversApi";
import { useGetTransporterProfileSummaryQuery } from "../../../../core/store/transportersApi";
import { calculateRow, createEmptyDeduction, money, validateRow, type DeductionEntry, type SellerInvoiceRow } from "./sellerInvoice.data";

interface InvoiceBlockProps {
  index: number;
  row: SellerInvoiceRow;
  invoiceDate: string;
  /** Show the "required" highlights (after a failed Save). Problems with the contract are always shown. */
  showErrors: boolean;
  canRemove: boolean;
  onChange: (id: string, patch: Partial<SellerInvoiceRow>) => void;
  onInvoiceQtyChange: (id: string, value: string) => void;
  onContractNumberChange: (id: string, value: string) => void;
  onContractLeave: (row: SellerInvoiceRow) => void;
  onFindContract: (row: SellerInvoiceRow) => void;
  onContractDetails: (row: SellerInvoiceRow) => void;
  onRemove: (row: SellerInvoiceRow) => void;
}

/**
 * One invoice on a grid of six EQUAL columns, so the invoice details and the deductions line up:
 *   row 1  Contract | Invoice No | Truck No | Bags | Invoice Qty | Total MTs
 *   row 2  Freight  | Amount     | GST %    | Total | Round Off Total | Remarks
 *   then one row per deduction: Date | Amount | TDS/TCS | Remarks (2 columns) | remove
 * Invoice amount and GST are calculated but can be overwritten; everything else is typed.
 */
const InvoiceBlock = ({
  index,
  row,
  invoiceDate,
  showErrors,
  canRemove,
  onChange,
  onInvoiceQtyChange,
  onContractNumberChange,
  onContractLeave,
  onFindContract,
  onContractDetails,
  onRemove,
}: InvoiceBlockProps) => {
  const errors = validateRow(row);
  const amounts = calculateRow(row);

  // truck / driver details for a truck that is not assigned yet: only loaded when the section is opened
  const { data: transporters } = useGetTransporterProfileSummaryQuery(undefined, { skip: !row.notAssigned });
  const { data: drivers } = useGetAllActiveDriversQuery(undefined, { skip: !row.notAssigned });
  const transporterOptions = useMemo(() => (transporters ?? []).map((t) => ({ value: String(t.profileId), label: t.legalName })), [transporters]);
  const driverOptions = useMemo(() => (drivers ?? []).map((d) => ({ value: String(d.driverId), label: `${d.driverName} (${d.mobileNumber})` })), [drivers]);
  const contract = row.contract;
  const bad = (key: "invoiceNumber" | "truckNumber" | "invoiceQty" | "totalMts" | "roundedTotal" | "freight" | "invoiceAmount" | "gstPercent") => (showErrors && errors[key] ? " has-error" : "");
  const contractError = row.contractError || (showErrors ? errors.contractNumber : undefined) || (contract && !contract.canInvoice ? errors.contractNumber : undefined);

  /** A labelled cell of the grid (every cell is one equal column wide unless it asks for more). */
  const field = (label: string, control: React.ReactNode, span = 1) => (
    <div className={`si-f${span > 1 ? ` si-f--span${span}` : ""}`}>
      <span className="si-f__label">{label}</span>
      {control}
    </div>
  );

  // opened for one truck's dispatch (Update Truck Status -> Loaded): the contract and truck are fixed
  const dispatchFixed = row.contractDispatchId !== null;
  const text = (key: keyof SellerInvoiceRow, label: string, extra: { mode?: "text" | "numeric" | "decimal"; error?: string; placeholder?: string } = {}) => (
    <input
      type="text"
      readOnly={dispatchFixed && key === "truckNumber"}
      title={dispatchFixed && key === "truckNumber" ? "The truck chosen in Update Truck Status" : undefined}
      className={`si-input${extra.error ?? ""}`}
      inputMode={extra.mode ?? "text"}
      aria-label={`${label} (invoice ${index})`}
      placeholder={extra.placeholder}
      value={row[key] as string}
      onChange={(event) => onChange(row.id, { [key]: event.target.value } as Partial<SellerInvoiceRow>)}
    />
  );

  const setDeduction = (id: string, patch: Partial<DeductionEntry>) => onChange(row.id, { deductions: row.deductions.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const addDeduction = () => onChange(row.id, { deductions: [...row.deductions, createEmptyDeduction(invoiceDate)] });

  return (
    <section className="si-invoice" aria-label={`Invoice ${index}`}>
      <header className="si-invoice__head">
        <span className="si-index" aria-hidden>
          {index}
        </span>
        <span className="si-invoice__title">Invoice {index}</span>
        {contractError ? (
          <small className="si-error-text si-one-line">{contractError}</small>
        ) : contract ? (
          <small className="si-contract-note si-one-line" title={`${contract.sellerName} → ${contract.buyerName} · ${contract.productName}`}>
            {contract.sellerName} → {contract.buyerName} · {contract.productName} · {money(contract.ratePerMT)}/MT + {contract.gstPercent}% GST · {contract.pendingQtyMT} MT pending
          </small>
        ) : (
          <small className="si-contract-note si-one-line">Choose the contract first: the rate, GST and pending quantity come from it.</small>
        )}
        <button
          type="button"
          className="si-icon-btn si-icon-btn--danger si-invoice__remove"
          onClick={() => onRemove(row)}
          disabled={!canRemove}
          aria-label={`Remove invoice ${index}`}
          title={canRemove ? "Remove this invoice" : "At least one invoice is needed"}
        >
          <Trash2Icon aria-hidden />
        </button>
      </header>

      {/* ---- the invoice: two rows on the six-column grid ---- */}
      <div className="si-grid6">
        {/* row 1 */}
        {field(
          "Contract #",
          <div className="si-contract-inline">
            <input
              type="text"
              className={`si-input${contractError ? " has-error" : ""}`}
              aria-label={`Contract number (invoice ${index})`}
              placeholder="Contract #"
              title={contractError}
              readOnly={dispatchFixed}
              value={row.contractNumber}
              onChange={(event) => onContractNumberChange(row.id, event.target.value)}
              onBlur={() => onContractLeave(row)}
              onKeyDown={(event) => event.key === "Enter" && onContractLeave(row)}
            />
            <button type="button" className="si-icon-btn" onClick={() => onFindContract(row)} aria-label="Find contract" title="Find contract by seller / buyer">
              <LinkIcon aria-hidden />
            </button>
            <button type="button" className="si-icon-btn" onClick={() => onContractDetails(row)} disabled={!row.contractNumber.trim()} aria-label="Contract details" title="Contract details">
              <SearchIcon aria-hidden />
            </button>
          </div>,
        )}
        {field("Invoice Number", text("invoiceNumber", "Invoice #", { error: bad("invoiceNumber"), placeholder: "Invoice #" }))}
        {field("Truck Number", text("truckNumber", "Truck #", { error: bad("truckNumber"), placeholder: "Truck #" }))}
        {field("No. of Bags", text("bags", "Bags", { mode: "numeric" }))}
        {field(
          "Invoice Qty (MT)",
          <input
            type="text"
            inputMode="decimal"
            className={`si-input${bad("invoiceQty")}`}
            aria-label={`Invoice quantity (invoice ${index})`}
            title={contract ? `Up to ${contract.maxAllowedQtyMT} MT more can be invoiced on this contract` : undefined}
            value={row.invoiceQty}
            onChange={(event) => onInvoiceQtyChange(row.id, event.target.value)}
          />,
        )}
        {field(
          "Total MTs",
          <input
            type="text"
            inputMode="decimal"
            className={`si-input${bad("totalMts")}`}
            aria-label={`Total loaded on truck (invoice ${index})`}
            title="Total loaded on the truck. Follows the invoice quantity; change it if more was loaded."
            value={row.totalMts}
            onChange={(event) => onChange(row.id, { totalMts: event.target.value, totalMtsEdited: true })}
          />,
        )}

        {/* row 2 */}
        {field("Freight (₹)", text("freight", "Freight", { mode: "decimal", error: bad("freight") }))}
        {field(
          "Invoice Amount (₹)",
          <div className="si-amount-cell">
            <input
              type="text"
              inputMode="decimal"
              className={`si-input si-input--amount${bad("invoiceAmount")}`}
              aria-label={`Invoice amount (invoice ${index})`}
              title="Calculated from the quantity and the contract rate. Type an amount to use your own figure."
              value={row.invoiceAmountEdited ? row.invoiceAmount : amounts ? amounts.autoAmount.toFixed(2) : ""}
              onChange={(event) => onChange(row.id, { invoiceAmount: event.target.value, invoiceAmountEdited: event.target.value.trim() !== "" })}
            />
            {row.invoiceAmountEdited && (
              <button type="button" className="si-reset-btn" onClick={() => onChange(row.id, { invoiceAmount: "", invoiceAmountEdited: false })} aria-label="Use the calculated invoice amount" title="Use the calculated amount">
                ↺
              </button>
            )}
          </div>,
        )}
        {field(
          "GST %",
          <>
            <input
              type="text"
              inputMode="decimal"
              className={`si-input si-input--amount${bad("gstPercent")}`}
              aria-label={`GST percentage (invoice ${index})`}
              title="GST percentage on the invoice amount (the product's default is filled in)"
              value={row.gstPercent.trim() ? row.gstPercent : amounts ? String(amounts.gstPercent) : contract ? String(contract.gstPercent) : "5"}
              onChange={(event) => onChange(row.id, { gstPercent: event.target.value })}
            />
            <small className="si-calc-note">GST: {amounts ? money(amounts.gst) : "—"}</small>
          </>,
        )}
        {field("Total (₹)", <input type="text" className="si-input si-input--amount" aria-label={`Total (invoice ${index})`} readOnly tabIndex={-1} value={amounts ? amounts.total.toFixed(2) : ""} />)}
        {field(
          "Round Off Total (₹)",
          <div className="si-amount-cell">
            <input
              type="text"
              inputMode="decimal"
              className={`si-input si-input--amount${bad("roundedTotal")}`}
              aria-label={`Rounded total (invoice ${index})`}
              title="Starts as the total. Edit it to round the amount off (up to 100 up or down)."
              value={row.roundedTotal.trim() ? row.roundedTotal : amounts ? amounts.total.toFixed(2) : ""}
              onChange={(event) => onChange(row.id, { roundedTotal: event.target.value })}
            />
            {row.roundedTotal.trim() !== "" && (
              <button type="button" className="si-reset-btn" onClick={() => onChange(row.id, { roundedTotal: "" })} aria-label="Use the calculated total" title="Use the calculated total">
                ↺
              </button>
            )}
          </div>,
        )}
        {field("Remarks", text("remarks", "Remarks"))}

        {/* truck and driver details, for a truck that is not assigned to the contract (or not in the truck master yet) */}
        <div className="si-truck-details">
          <label className="si-truck-details__toggle">
            <input type="checkbox" checked={row.notAssigned} onChange={(event) => onChange(row.id, { notAssigned: event.target.checked })} />
            <span>
              This truck is not assigned to the contract — enter the truck &amp; driver details
              <small className="si-muted"> (the truck, driver and trip are only created after you confirm each step when saving)</small>
            </span>
          </label>

          {row.notAssigned && (
            <div className="si-truck-details__body">
              <div className="si-truck-details__grid">
                <div className="si-truck-details__field">
                  <span className="si-f__label">Truck Number</span>
                  <input className="si-input" readOnly tabIndex={-1} value={row.truckNumber} placeholder="Enter it in the Truck Number box above" aria-label="Truck number" />
                </div>
                <div className="si-truck-details__field">
                  <span className="si-f__label">Transporter <span className="si-req" aria-hidden>*</span> <small className="si-muted">(for a truck not in the truck master)</small></span>
                  <SearchableSelect options={transporterOptions} value={row.transporterId} onChange={(value) => onChange(row.id, { transporterId: value })} placeholder="Select transporter" ariaLabel={`Transporter (invoice ${index})`} />
                </div>
              </div>

              <div className="si-truck-details__modes" role="radiogroup" aria-label={`Driver (invoice ${index})`}>
                <label>
                  <input type="radio" checked={row.driverMode === "existing"} onChange={() => onChange(row.id, { driverMode: "existing" })} /> Existing driver
                </label>
                <label>
                  <input type="radio" checked={row.driverMode === "new"} onChange={() => onChange(row.id, { driverMode: "new" })} /> New driver
                </label>
              </div>

              {row.driverMode === "existing" ? (
                <div className="si-truck-details__grid">
                  <div className="si-truck-details__field">
                    <span className="si-f__label">Driver <span className="si-req" aria-hidden>*</span></span>
                    <SearchableSelect options={driverOptions} value={row.driverId} onChange={(value) => onChange(row.id, { driverId: value })} placeholder="Select driver" ariaLabel={`Driver (invoice ${index})`} />
                  </div>
                </div>
              ) : (
                <div className="si-truck-details__grid">
                  <div className="si-truck-details__field">
                    <span className="si-f__label">Driver name <span className="si-req" aria-hidden>*</span></span>
                    <input className="si-input" value={row.driverName} onChange={(event) => onChange(row.id, { driverName: event.target.value })} />
                  </div>
                  <div className="si-truck-details__field">
                    <span className="si-f__label">Mobile number <span className="si-req" aria-hidden>*</span></span>
                    <input className="si-input" inputMode="tel" value={row.driverMobile} onChange={(event) => onChange(row.id, { driverMobile: event.target.value })} />
                  </div>
                  <div className="si-truck-details__field">
                    <span className="si-f__label">Licence number <small className="si-muted">(optional)</small></span>
                    <input className="si-input" value={row.licenseNumber} onChange={(event) => onChange(row.id, { licenseNumber: event.target.value })} />
                  </div>
                  <div className="si-truck-details__field">
                    <span className="si-f__label">Licence expiry (optional)</span>
                    <input className="si-input" type="date" value={row.licenseExpiry} onChange={(event) => onChange(row.id, { licenseExpiry: event.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* the deductions: the next rows, on the same six columns */}
        {row.deductions.map((d) => {
          const problem = showErrors ? errors.deductions[d.id] : undefined;
          return (
            <div key={d.id} className={`si-ded${problem ? " has-error" : ""}`}>
              {field("Deduction date", <DatePickerInput id={`si-ded-date-${d.id}`} value={d.date} onChange={(value) => setDeduction(d.id, { date: value })} />)}
              {field(
                "Deduction amount (₹)",
                <input
                  type="text"
                  inputMode="decimal"
                  className={`si-input${problem ? " has-error" : ""}`}
                  aria-label="Deduction amount"
                  title={problem}
                  value={d.amount}
                  onChange={(event) => setDeduction(d.id, { amount: event.target.value })}
                />,
              )}
              <label className="si-check si-f">
                <span className="si-f__label">&nbsp;</span>
                <span className="si-check__box">
                  <input type="checkbox" checked={d.tdsTcs} onChange={(event) => setDeduction(d.id, { tdsTcs: event.target.checked })} /> TDS / TCS
                </span>
              </label>
              {field("Deduction remarks", <input type="text" className="si-input" aria-label="Deduction remarks" value={d.remarks} onChange={(event) => setDeduction(d.id, { remarks: event.target.value })} />, 2)}
              <div className="si-f si-f--end">
                <span className="si-f__label">&nbsp;</span>
                <button
                  type="button"
                  className="si-icon-btn si-icon-btn--danger"
                  aria-label="Remove deduction"
                  title="Remove this deduction"
                  onClick={() => onChange(row.id, { deductions: row.deductions.filter((x) => x.id !== d.id) })}
                >
                  <Trash2Icon aria-hidden />
                </button>
              </div>
              {problem && <small className="si-error-text si-ded__error">{problem}</small>}
            </div>
          );
        })}
      </div>

      <div className="si-ded-foot">
        <button type="button" className="si-link-btn" onClick={addDeduction}>
          <PlusIcon aria-hidden /> Add deduction
        </button>
        {amounts && (
          <span className="si-ded-foot__sum">
            {amounts.freight > 0 && <>Freight {money(amounts.freight)} (included) · </>}
            {amounts.deductions > 0 && <>Deductions − {money(amounts.deductions)} · </>}
            Payable <strong>{money(amounts.payable)}</strong>
          </span>
        )}
      </div>
    </section>
  );
};

export default InvoiceBlock;
