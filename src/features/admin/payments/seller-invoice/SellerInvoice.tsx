import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DatePickerInput from "../../../../shared/components/dropdown/DatePickerInput";
import { ArrowLeftIcon, CheckIcon, CircleCheckBigIcon, PlusIcon, XIcon } from "../../../../shared/components/icon";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import ContractDetailsOffcanvas from "./ContractDetailsOffcanvas";
import ContractPicker from "./ContractPicker";
import SelectPartiesOffcanvas from "./SelectPartiesOffcanvas";
import InvoiceBlock from "./InvoiceBlock";
import {
  calculateRow,
  createEmptySellerInvoiceRow,
  formatTodayInput,
  hasErrors,
  money,
  problemMessages,
  toRowInput,
  validateRow,
  type SellerInvoiceRow,
} from "./sellerInvoice.data";
import {
  apiErrorMessage,
  useLazyGetInvoiceContractDetailsQuery,
  useSaveInvoicesMutation,
  type InvoiceNotice,
  type TripChoice,
  type TripSelection,
} from "../../../../core/store/sellerInvoiceApi";
import TripSelectionDialog from "./TripSelectionDialog";
import { useGetContractTruckDispatchStatusesQuery, useUpdateContractTruckStatusMutation } from "../../../../core/store/contractTrucksApi";
import { financialYearOf as fyOf, financialYearOptionsUpTo } from "../../contracts/contract-status/contractStatus.data";
import type { InvoiceContract } from "../../../../core/store/sellerInvoiceApi";
import { useNotifyPrompt } from "../../../../shared/notifications/useNotifyPrompt";
import "./SellerInvoice.scss";

/** Where Update Truck Status sends the user: this screen, with the contract, truck and dispatch already filled in. */
const UPDATE_TRUCK_STATUS_PATH = "/admin/truck-management/open-pending-contracts/update-truck-status";

const SellerInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatchParam = Number(searchParams.get("dispatch"));
  const fromTruckStatus = Number.isInteger(dispatchParam) && dispatchParam > 0 && !!searchParams.get("contract") && !!searchParams.get("truck");

  const [invoiceDate, setInvoiceDate] = useState(formatTodayInput());
  const [rows, setRows] = useState<SellerInvoiceRow[]>(() => {
    if (!fromTruckStatus) return [createEmptySellerInvoiceRow()];
    // opened for one truck's dispatch: the contract and truck are filled in (the quantity starts as the truck's quantity)
    const qty = searchParams.get("qty") ?? "";
    return [{
      ...createEmptySellerInvoiceRow(),
      contractNumber: searchParams.get("contract") ?? "",
      truckNumber: searchParams.get("truck") ?? "",
      contractDispatchId: dispatchParam,
      invoiceQty: qty,
      totalMts: qty,
    }];
  });
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState("");

  const [contractDetailsRowId, setContractDetailsRowId] = useState<string | null>(null);
  const [selectPartiesRowId, setSelectPartiesRowId] = useState<string | null>(null);
  const [rowPendingDelete, setRowPendingDelete] = useState<SellerInvoiceRow | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  // Trip selection (a truck with several loaded trips on the contract) and what the system did automatically while saving.
  const [tripPrompt, setTripPrompt] = useState<TripSelection[] | null>(null);
  const [notices, setNotices] = useState<InvoiceNotice[]>([]);

  const [lookupContract] = useLazyGetInvoiceContractDetailsQuery();
  const [saveInvoices, { isLoading: saving }] = useSaveInvoicesMutation();
  // Opened for one truck's dispatch: after the invoice is saved, that dispatch is set to Loaded (in case the server
  // did not already do it while saving the invoice).
  const { data: dispatchStatuses } = useGetContractTruckDispatchStatusesQuery(undefined, { skip: !fromTruckStatus });
  const [updateTruckStatus] = useUpdateContractTruckStatusMutation();
  const loadedStatusId = dispatchStatuses?.find((s) => [s.statusName, s.displayName].some((n) => n?.trim().toLowerCase() === "loaded"))?.dispatchStatusId;
  const notify = useNotifyPrompt();

  // The financial year is picked from a dropdown and the invoice date stays inside it (the server works the year out
  // from the invoice date, so the two always agree): picking a year moves the date into it, changing the date moves
  // the year.
  const financialYear = invoiceDate ? fyOf(invoiceDate) : fyOf();
  const financialYearOptions = useMemo(() => financialYearOptionsUpTo(financialYear).reverse(), [financialYear]);
  const handleFinancialYearChange = (year: string) => {
    if (!year || year === financialYear) return;
    const start = Number(year.slice(0, 4));
    const current = fyOf();
    // The current year: today. An earlier year: its last day (31 March). A later one: its first day (1 April).
    setInvoiceDate(year === current ? formatTodayInput() : year < current ? `${start + 1}-03-31` : `${start}-04-01`);
  };

  useEffect(() => {
    if (!saveToast) return;
    const timer = setTimeout(() => setSaveToast(null), 4000);
    return () => clearTimeout(timer);
  }, [saveToast]);

  const patchRow = (id: string, patch: Partial<SellerInvoiceRow>) => setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  /** Total MTs is no longer on the form: it is sent as the invoice quantity. */
  const handleInvoiceQtyChange = (id: string, value: string) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, invoiceQty: value, totalMts: value } : row)));

  // a different contract number means the linked contract is no longer known until it is looked up again
  const handleContractNumberChange = (id: string, value: string) => patchRow(id, { contractNumber: value, contract: null, contractError: "" });

  /** The row with a contract linked. The invoice quantity is not taken from the contract: it is typed from the invoice. */
  const withContract = (row: SellerInvoiceRow, contract: InvoiceContract): SellerInvoiceRow => ({
    ...row,
    contractNumber: contract.contractNumber,
    contract,
    contractError: "",
    totalMts: row.invoiceQty,
  });

  const needsLookup = (row: SellerInvoiceRow) =>
    row.contractNumber.trim() !== "" && !(row.contract && row.contract.contractNumber.toLowerCase() === row.contractNumber.trim().toLowerCase());

  /** Looks a typed contract number up (the rate and GST are needed to calculate the invoice). */
  const resolveContract = async (row: SellerInvoiceRow): Promise<void> => {
    if (!needsLookup(row)) return;
    const number = row.contractNumber.trim();
    try {
      const contract = await lookupContract(number).unwrap();
      setRows((prev) => prev.map((r) => (r.id === row.id ? withContract(r, contract) : r)));
    } catch {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, contract: null, contractError: `Contract ${number} was not found.` } : r)));
    }
  };

  /** Before saving, every typed contract number is looked up; returns the rows as they are afterwards. */
  const resolveAllContracts = async (): Promise<SellerInvoiceRow[]> => {
    const updated = await Promise.all(
      rows.map(async (row) => {
        if (!needsLookup(row)) return row;
        try {
          return withContract(row, await lookupContract(row.contractNumber.trim()).unwrap());
        } catch {
          return { ...row, contract: null, contractError: `Contract ${row.contractNumber.trim()} was not found.` };
        }
      }),
    );
    setRows(updated);
    return updated;
  };

  // "Select contract" at the top: the picked contract (shown in the overview) goes into the first invoice without a
  // contract, or a new invoice when every invoice already has one; the page then scrolls to that invoice.
  const [pickedContract, setPickedContract] = useState(() => searchParams.get("contract")?.trim() ?? "");

  // Opened with a contract: from Update Truck Status (contract, truck and dispatch: the first invoice is already filled
  // in above, for that truck's dispatch) or from Pending Contracts (?contract only). The contract is looked up once so
  // the rate and GST are there to calculate the invoice.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    const contractNumber = searchParams.get("contract")?.trim() ?? "";
    if (!contractNumber) return;
    if (fromTruckStatus) {
      void resolveContract(rows[0]);
      return;
    }
    const first: SellerInvoiceRow = { ...createEmptySellerInvoiceRow(), contractNumber };
    setRows([first]);
    void resolveContract(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [overviewDetails, setOverviewDetails] = useState<string | null>(null);
  const handleContractPick = (contract: InvoiceContract) => {
    setPickedContract(contract.contractNumber);
    const target = rows.find((row) => !row.contractNumber.trim());
    const added = target ? null : withContract(createEmptySellerInvoiceRow(), contract);
    setRows((prev) => (target ? prev.map((row) => (row.id === target.id ? withContract(row, contract) : row)) : [...prev, added!]));
    const id = target?.id ?? added!.id;
    window.setTimeout(() => document.querySelector(`[data-invoice-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const handleSelectPartiesSelect = (contract: InvoiceContract) => {
    if (!selectPartiesRowId) return;
    setRows((prev) => prev.map((row) => (row.id === selectPartiesRowId ? withContract(row, contract) : row)));
    setSelectPartiesRowId(null);
  };

  const resetForm = () => {
    setInvoiceDate(formatTodayInput());
    setRows([createEmptySellerInvoiceRow()]);
    setPickedContract("");
    setShowErrors(false);
    setServerError("");
  };

  /** `choices`: rowNumber (1-based) -> what the user decided in the trip dialog (an existing trip, or a new trip with its accepted steps). */
  const handleSaveInvoices = async (choices?: Record<number, TripChoice>) => {
    setServerError("");
    setNotices([]);
    const latest = await resolveAllContracts();
    if (latest.some((row) => hasErrors(validateRow(row)))) {
      setShowErrors(true);
      return;
    }

    try {
      const result = await saveInvoices({
        invoiceDate,
        rows: latest.map((row, index) => {
          const choice = choices?.[index + 1];
          return {
            ...toRowInput(row),
            // The trip chosen in the dialog, else the dispatch this invoice was opened for from Update Truck Status.
            contractDispatchId: choice?.contractDispatchId ?? row.contractDispatchId ?? null,
            createNewTrip: choice?.createNewTrip ?? false,
            tripSetup: choice?.tripSetup ?? null,
            tripSetupAccepted: choice?.accepted ?? false,
          };
        }),
      }).unwrap();

      // Nothing was saved: the trip is not obvious (or has to be created), so the user decides / accepts the steps first.
      if (result.requiresTripSelection && (result.tripSelections?.length ?? 0) > 0) {
        setTripPrompt(result.tripSelections ?? []);
        return;
      }

      setSaveToast(`${result.invoices.length} invoice${result.invoices.length === 1 ? "" : "s"} saved successfully.`);
      const returnToContract = fromTruckStatus ? latest[0]?.contractNumber : "";
      // The truck this invoice was opened for is now loaded: make sure its dispatch shows Loaded. An error here (e.g. the
      // server already set it while saving the invoice) changes nothing for the user.
      if (loadedStatusId) {
        const modifiedBy = Number(localStorage.getItem("userId")) || 0;
        await Promise.all(
          latest
            .filter((row) => row.contractDispatchId !== null)
            .map((row) =>
              updateTruckStatus({ contractDispatchId: row.contractDispatchId!, dispatchStatusId: loadedStatusId, modifiedBy })
                .unwrap()
                .catch(() => undefined),
            ),
        );
      }
      resetForm();
      setNotices(result.notices ?? []);
      // The buyer is told about each invoice (the seller can be added in the dialog). One dialog per invoice, one after another; Skip or close moves on.
      // An invoice opened from Update Truck Status loads that truck, so its "truck loaded" message is offered too
      // (it used to be offered when Loaded was picked there).
      const loadedTrucks = latest
        .map((row) => ({ dispatchId: row.contractDispatchId, row }))
        .filter((item): item is { dispatchId: number; row: SellerInvoiceRow } => item.dispatchId !== null);
      // Opened from Update Truck Status: once the notify prompts are answered (or skipped), back to the contract's
      // trucks, where this truck now shows Loaded. (Leaving straight away would close the prompts.)
      const backToTrucks = () => {
        if (returnToContract) navigate(`${UPDATE_TRUCK_STATUS_PATH}?contract=${encodeURIComponent(returnToContract)}`);
      };
      notify.ask([
        ...result.invoices.map((invoice) => ({
          eventCode: "INVOICE_CREATED",
          title: `Notify the buyer about invoice ${invoice.invoiceNumber}`,
          sourceEntityType: "ContractInvoice",
          sourceEntityId: invoice.invoiceId,
          contractNumber: invoice.contractNumber,
        })),
        ...loadedTrucks.map(({ dispatchId, row }) => ({
          eventCode: "TRUCK_LOADED",
          title: `Notify the buyer that truck ${row.truckNumber} is loaded`,
          sourceEntityType: "ContractTruckDispatch",
          sourceEntityId: dispatchId,
          contractNumber: row.contractNumber,
        })),
      ], backToTrucks);
    } catch (error) {
      setServerError(apiErrorMessage(error, "The invoices could not be saved."));
    }
  };

  const totals = useMemo(() => {
    const all = rows.map(calculateRow).filter((x): x is NonNullable<ReturnType<typeof calculateRow>> => x !== null);
    return { count: rows.length, payable: all.reduce((sum, a) => sum + a.payable, 0) };
  }, [rows]);

  const problems = showErrors ? problemMessages(rows) : [];

  return (
    <div className="seller-invoice-page">
      {notify.element}
      {saveToast && (
        <div className="seller-invoice-page__toast" role="status">
          <CircleCheckBigIcon aria-hidden />
          {saveToast}
        </div>
      )}

      {fromTruckStatus && (
        <Link
          to={`${UPDATE_TRUCK_STATUS_PATH}?contract=${encodeURIComponent(searchParams.get("contract") ?? "")}`}
          className="si-back-link"
        >
          <ArrowLeftIcon aria-hidden /> Back to Update Truck Status
        </Link>
      )}

      <div className="si-page-header">
        <div>
          <h1>Seller Invoices</h1>
          <p className="si-muted">Enter the invoices raised by the seller. Amounts, GST and the financial year are worked out for you.</p>
        </div>
        {/* Top left: the financial year first, then the invoice date (kept inside that year). */}
        <div className="si-page-header__controls">
          <div className="si-page-header__date">
            <label htmlFor="seller-invoice-fy">Financial year</label>
            <select
              id="seller-invoice-fy"
              className="si-input"
              value={financialYear}
              onChange={(event) => handleFinancialYearChange(event.target.value)}
              title="April to March. The invoice date is kept inside the year you pick."
            >
              {financialYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="si-page-header__date">
            <label htmlFor="seller-invoice-date">Invoice date</label>
            <DatePickerInput id="seller-invoice-date" value={invoiceDate} onChange={(value) => setInvoiceDate(value)} />
          </div>
        </div>
      </div>

      <ContractPicker financialYear={financialYear} value={pickedContract} onSelect={handleContractPick} onDetails={setOverviewDetails} />

      <div className="si-invoices">
        {rows.map((row, index) => (
          <InvoiceBlock
            key={row.id}
            index={index + 1}
            row={row}
            invoiceDate={invoiceDate}
            showErrors={showErrors}
            canRemove={rows.length > 1}
            onChange={patchRow}
            onInvoiceQtyChange={handleInvoiceQtyChange}
            onContractNumberChange={handleContractNumberChange}
            onContractLeave={(r) => void resolveContract(r)}
            onFindContract={(r) => setSelectPartiesRowId(r.id)}
            onContractDetails={(r) => setContractDetailsRowId(r.id)}
            onRemove={setRowPendingDelete}
          />
        ))}
      </div>

      <button type="button" className="si-add-invoice" onClick={() => setRows((prev) => [...prev, createEmptySellerInvoiceRow()])}>
        <PlusIcon aria-hidden /> Add another invoice
      </button>

      {notices.length > 0 && (
        <div className="si-banner si-banner--info" role="status">
          <ul>
            {notices.map((notice, index) => (
              <li key={`${notice.rowNumber}-${notice.code}-${index}`}>
                {notices.length > 1 ? `Invoice ${notice.rowNumber}: ` : ""}
                {notice.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(serverError || problems.length > 0) && (
        <div className="si-banner si-banner--error" role="alert">
          {serverError ? (
            <p>{serverError}</p>
          ) : (
            <>
              <p>Please fix the highlighted fields:</p>
              <ul>
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="si-footer">
        <p>
          <strong>{totals.count}</strong> invoice{totals.count === 1 ? "" : "s"} · Payable <strong>{money(totals.payable)}</strong>
        </p>
        <div className="si-footer__actions">
          <button type="button" className="si-btn si-btn--secondary" onClick={resetForm} disabled={saving}>
            <XIcon aria-hidden /> Cancel
          </button>
          <button type="button" className="si-btn si-btn--primary" onClick={() => void handleSaveInvoices()} disabled={saving}>
            <CheckIcon aria-hidden /> {saving ? "Saving…" : "Save Invoices"}
          </button>
        </div>
      </div>

      <TripSelectionDialog
        selections={tripPrompt}
        prefill={Object.fromEntries(
          rows.map((row, index) => [
            index + 1,
            row.notAssigned
              ? { transporterId: row.transporterId, driverMode: row.driverMode, driverId: row.driverId, driverName: row.driverName, driverMobile: row.driverMobile, licenseNumber: row.licenseNumber, licenseExpiry: row.licenseExpiry }
              : undefined,
          ]),
        )}
        onCancel={() => setTripPrompt(null)}
        onConfirm={(choices) => {
          setTripPrompt(null);
          void handleSaveInvoices(choices);
        }}
      />

      <ContractDetailsOffcanvas
        open={contractDetailsRowId !== null || overviewDetails !== null}
        contractNumber={overviewDetails ?? rows.find((row) => row.id === contractDetailsRowId)?.contractNumber ?? ""}
        onClose={() => {
          setContractDetailsRowId(null);
          setOverviewDetails(null);
        }}
      />

      <SelectPartiesOffcanvas open={selectPartiesRowId !== null} onClose={() => setSelectPartiesRowId(null)} onSelect={handleSelectPartiesSelect} />

      <ConfirmDialog
        open={rowPendingDelete !== null}
        title="Remove this invoice?"
        message="This will remove the invoice and its deductions from the form. This cannot be undone."
        confirmLabel="Remove"
        onConfirm={() => {
          if (rowPendingDelete) setRows((prev) => prev.filter((row) => row.id !== rowPendingDelete.id));
          setRowPendingDelete(null);
        }}
        onCancel={() => setRowPendingDelete(null)}
      />
    </div>
  );
};

export default SellerInvoice;
