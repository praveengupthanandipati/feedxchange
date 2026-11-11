import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import { useGetAllActiveDriversQuery } from "../../../../core/store/driversApi";
import { useGetTransporterProfileSummaryQuery } from "../../../../core/store/transportersApi";
import type { TripChoice, TripOption, TripSelection } from "../../../../core/store/sellerInvoiceApi";
import type { TripDraft } from "./sellerInvoice.data";

interface TripSelectionDialogProps {
  /** One entry per invoice row that needs a decision; null = closed. */
  selections: TripSelection[] | null;
  /** rowNumber (1-based) -> what the user decided. */
  onConfirm: (choices: Record<number, TripChoice>) => void;
  onCancel: () => void;
  /** Truck / driver details already typed on the invoice rows (rowNumber -> details): "create a new trip" starts selected and filled in. The steps still have to be accepted. */
  prefill?: Record<number, TripDraft | undefined>;
}

const dateTime = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/** What the user has entered for one row. `choice` is "trip:<id>", "new" or "". */
interface RowState {
  choice: string;
  transporterId: string;
  driverMode: "existing" | "new";
  driverId: string;
  driverName: string;
  driverMobile: string;
  licenseNumber: string;
  licenseExpiry: string;
  /** Which of the listed steps the user has accepted (by index). */
  accepted: boolean[];
}

const emptyRow = (): RowState => ({
  choice: "",
  transporterId: "",
  driverMode: "existing",
  driverId: "",
  driverName: "",
  driverMobile: "",
  licenseNumber: "",
  licenseExpiry: "",
  accepted: [],
});

const TITLES: Record<string, string> = {
  SelectLoadedTrip: "Select the trip for the invoice",
  ChooseTripOrNew: "Which trip is this invoice for?",
  NewTrip: "Add the truck to the contract",
};

/**
 * Asked before an invoice is saved when the trip is not obvious (several Loaded trips; a mix of Loaded and Assigned trips) or when a trip has to be created
 * (truck not on the contract, every trip already invoiced, truck or driver not in the masters). Creating things is only done after the user has accepted
 * every listed step; the server then runs them in order inside the invoice's transaction.
 */
const TripSelectionDialog = ({ selections, onConfirm, onCancel, prefill }: TripSelectionDialogProps) => {
  const open = selections !== null;
  const [rows, setRows] = useState<Record<number, RowState>>({});

  const { data: transporters } = useGetTransporterProfileSummaryQuery(undefined, { skip: !open });
  const { data: drivers } = useGetAllActiveDriversQuery(undefined, { skip: !open });
  const transporterOptions = useMemo(() => (transporters ?? []).map((t) => ({ value: String(t.profileId), label: t.legalName })), [transporters]);
  const driverOptions = useMemo(() => (drivers ?? []).map((d) => ({ value: String(d.driverId), label: `${d.driverName} (${d.mobileNumber})` })), [drivers]);

  useEffect(() => {
    if (!selections) return;
    setRows(
      Object.fromEntries(
        selections.map((s) => {
          const draft = prefill?.[s.rowNumber];
          // the transporter starts as the one this truck last ran for (when the server knows it); it is chosen for each trip
          const start = { ...emptyRow(), transporterId: s.transporterProfileId ? String(s.transporterProfileId) : "" };
          return [s.rowNumber, draft && s.allowCreateNew && s.kind === "NewTrip" ? { ...start, ...draft, choice: "new" } : start];
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!selections) return null;

  const patch = (rowNumber: number, change: Partial<RowState>) => setRows((prev) => ({ ...prev, [rowNumber]: { ...(prev[rowNumber] ?? emptyRow()), ...change } }));

  /** The steps the user has to accept when "create a new trip" is chosen for this row. */
  const stepsFor = (selection: TripSelection, state: RowState): string[] => {
    const steps: string[] = [];
    const transporterLabel = transporterOptions.find((o) => o.value === state.transporterId)?.label ?? selection.transporterName ?? "the selected transporter";
    if (!selection.truckInMaster) steps.push(`Add truck ${selection.truckNumber} to the truck master.`);
    if (!selection.mappedDriver) {
      if (state.driverMode === "new") steps.push(`Add driver ${state.driverName.trim() || "(new driver)"} to the driver master.`);
      steps.push("Map the driver to the truck.");
    }
    steps.push(`Assign truck ${selection.truckNumber} to contract ${selection.contractNumber} with ${transporterLabel} as the transporter, as a new trip with status Loaded (${selection.invoiceQtyMT} MT).`);
    steps.push("Create the invoice against that trip.");
    return steps;
  };

  const rowComplete = (selection: TripSelection, state: RowState): boolean => {
    if (!state.choice) return false;
    if (state.choice !== "new") return true;
    if (!state.transporterId) return false;
    if (!selection.mappedDriver) {
      if (state.driverMode === "existing" && !state.driverId) return false;
      if (state.driverMode === "new" && (!state.driverName.trim() || !state.driverMobile.trim())) return false;
    }
    const steps = stepsFor(selection, state);
    return steps.every((_, index) => state.accepted[index] === true);
  };

  const complete = selections.every((selection) => rowComplete(selection, rows[selection.rowNumber] ?? emptyRow()));

  const confirm = () => {
    const choices: Record<number, TripChoice> = {};
    for (const selection of selections) {
      const state = rows[selection.rowNumber] ?? emptyRow();
      if (state.choice === "new") {
        choices[selection.rowNumber] = {
          createNewTrip: true,
          accepted: true,
          tripSetup: {
            transporterProfileId: Number(state.transporterId),
            ...(selection.mappedDriver
              ? {}
              : state.driverMode === "existing"
                ? { driverId: Number(state.driverId) }
                : {
                    newDriver: {
                      driverName: state.driverName.trim(),
                      mobileNumber: state.driverMobile.trim(),
                      licenseNumber: state.licenseNumber.trim(),
                      licenseExpiryDate: state.licenseExpiry || null,
                    },
                  }),
          },
        };
      } else {
        choices[selection.rowNumber] = { contractDispatchId: Number(state.choice.replace("trip:", "")) };
      }
    }
    onConfirm(choices);
  };

  const tripRow = (selection: TripSelection, trip: TripOption, state: RowState) => {
    const value = `trip:${trip.contractDispatchId}`;
    const selected = state.choice === value;
    return (
      <tr
        key={trip.contractDispatchId}
        className={`${selected ? "is-selected" : ""}${trip.selectable ? "" : " is-disabled"}`}
        onClick={() => trip.selectable && patch(selection.rowNumber, { choice: value })}
      >
        <td>
          <input
            type="radio"
            name={`trip-row-${selection.rowNumber}`}
            checked={selected}
            disabled={!trip.selectable}
            onChange={() => patch(selection.rowNumber, { choice: value })}
            aria-label={`Select ${trip.tripNumber}`}
          />
        </td>
        <td>
          <strong>{trip.tripNumber}</strong>
          {trip.lrNumber && <div className="si-muted">LR {trip.lrNumber}</div>}
        </td>
        <td>{dateTime(trip.tripDate)}</td>
        <td>{trip.source || "—"}</td>
        <td>{trip.destination || "—"}</td>
        <td>{trip.truckNumber}</td>
        <td>
          {trip.dispatchStatus}
          {trip.willBeMarkedLoaded && <div className="si-muted">will be changed to Loaded</div>}
        </td>
        <td>{trip.invoiceStatus}</td>
      </tr>
    );
  };

  return createPortal(
    <div className="si-trips__backdrop" onClick={onCancel}>
      <div className="si-trips" role="dialog" aria-modal="true" aria-labelledby="si-trips-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="si-trips-title" className="si-trips__title">
          {selections.length === 1 ? TITLES[selections[0].kind] ?? "Choose how to continue" : "Choose how to continue"}
        </h2>
        <p className="si-trips__message">Nothing is saved until you confirm. Everything below is done together in one transaction — if any step fails, none of it is kept.</p>

        <div className="si-trips__body">
          {selections.map((selection) => {
            const state = rows[selection.rowNumber] ?? emptyRow();
            const steps = state.choice === "new" ? stepsFor(selection, state) : [];
            return (
              <section key={selection.rowNumber} className="si-trips__group">
                <h3>
                  Invoice {selection.rowNumber} · Contract {selection.contractNumber} · Truck {selection.truckNumber}
                </h3>
                <p className="si-trips__note">{selection.message}</p>

                {selection.trips.length > 0 && (
                  <div className="si-trips__table-wrap">
                    <table className="si-trips__table">
                      <thead>
                        <tr>
                          <th aria-label="Select" />
                          <th>Trip Number</th>
                          <th>Trip Date</th>
                          <th>Source</th>
                          <th>Destination</th>
                          <th>Truck Number</th>
                          <th>Dispatch Status</th>
                          <th>Invoice Status</th>
                        </tr>
                      </thead>
                      <tbody>{selection.trips.map((trip) => tripRow(selection, trip, state))}</tbody>
                    </table>
                  </div>
                )}

                {selection.allowCreateNew && (
                  <label className={`si-trips__new${state.choice === "new" ? " is-selected" : ""}`}>
                    <input type="radio" name={`trip-row-${selection.rowNumber}`} checked={state.choice === "new"} onChange={() => patch(selection.rowNumber, { choice: "new", accepted: [] })} />
                    <span>
                      <strong>{selection.truckInMaster ? "Create a new trip for this invoice" : "Add this truck and create a new trip for this invoice"}</strong>
                      <span className="si-muted">The truck is assigned to the contract as a new trip with status Loaded.</span>
                    </span>
                  </label>
                )}

                {state.choice === "new" && (
                  <div className="si-trips__setup">
                    <div className="si-trips__field">
                      <label>Transporter for this trip <span className="si-req" aria-hidden>*</span></label>
                      <SearchableSelect options={transporterOptions} value={state.transporterId} onChange={(v) => patch(selection.rowNumber, { transporterId: v, accepted: [] })} placeholder="Select transporter" ariaLabel="Transporter" />
                    </div>

                    {selection.mappedDriver ? (
                      <p className="si-muted">
                        Driver: <strong>{selection.mappedDriver.driverName}</strong> ({selection.mappedDriver.mobileNumber}) is already mapped to this truck and will be used.
                      </p>
                    ) : (
                      <div className="si-trips__driver">
                        <div className="si-trips__modes" role="radiogroup" aria-label="Driver">
                          <label>
                            <input type="radio" checked={state.driverMode === "existing"} onChange={() => patch(selection.rowNumber, { driverMode: "existing", accepted: [] })} /> Existing driver
                          </label>
                          <label>
                            <input type="radio" checked={state.driverMode === "new"} onChange={() => patch(selection.rowNumber, { driverMode: "new", accepted: [] })} /> New driver
                          </label>
                        </div>
                        {state.driverMode === "existing" ? (
                          <div className="si-trips__field">
                            <label>Driver <span className="si-req" aria-hidden>*</span></label>
                            <SearchableSelect options={driverOptions} value={state.driverId} onChange={(v) => patch(selection.rowNumber, { driverId: v })} placeholder="Select driver" ariaLabel="Driver" />
                          </div>
                        ) : (
                          <div className="si-trips__fields">
                            <div className="si-trips__field">
                              <label>Driver name <span className="si-req" aria-hidden>*</span></label>
                              <input className="si-input" value={state.driverName} onChange={(e) => patch(selection.rowNumber, { driverName: e.target.value })} />
                            </div>
                            <div className="si-trips__field">
                              <label>Mobile number <span className="si-req" aria-hidden>*</span></label>
                              <input className="si-input" inputMode="tel" value={state.driverMobile} onChange={(e) => patch(selection.rowNumber, { driverMobile: e.target.value })} />
                            </div>
                            <div className="si-trips__field">
                              <label>Licence number (optional)</label>
                              <input className="si-input" value={state.licenseNumber} onChange={(e) => patch(selection.rowNumber, { licenseNumber: e.target.value })} />
                            </div>
                            <div className="si-trips__field">
                              <label>Licence expiry (optional)</label>
                              <input className="si-input" type="date" value={state.licenseExpiry} onChange={(e) => patch(selection.rowNumber, { licenseExpiry: e.target.value })} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="si-trips__steps" role="group" aria-label="Steps to accept">
                      <strong>Please accept each step:</strong>
                      {steps.map((step, index) => (
                        <label key={step}>
                          <input
                            type="checkbox"
                            checked={state.accepted[index] === true}
                            onChange={(event) => {
                              const next = [...state.accepted];
                              next[index] = event.target.checked;
                              patch(selection.rowNumber, { accepted: next });
                            }}
                          />
                          <span>
                            {index + 1}. {step}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="si-trips__actions">
          <button type="button" className="si-btn si-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="si-btn si-btn--primary" disabled={!complete} onClick={confirm}>
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TripSelectionDialog;
