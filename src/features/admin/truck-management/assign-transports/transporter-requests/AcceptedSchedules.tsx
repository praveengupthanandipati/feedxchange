import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CircleCheckBigIcon, PlusIcon, SaveIcon, Trash2Icon, TruckIcon, XIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";
import { formatApiDateTime } from "../../../../../shared/utils/apiDateTime";
import { useNotifyPrompt } from "../../../../../shared/notifications/useNotifyPrompt";
import {
  useAddTrucksToScheduleMutation,
  useGetAcceptedSchedulesQuery,
  useGetTruckLookupsQuery,
  type AcceptedSchedule,
  type TruckLookups,
} from "../../../../../core/store/transporterRequestsApi";
import "./AcceptedSchedules.scss";

interface TruckRow {
  id: string;
  truckId: string;
  driverId: string;
  qty: string;
  lrNumber: string;
  trackingUrl: string;
}
type RowErrors = Partial<Record<"truckId" | "driverId" | "qty" | "trackingUrl", string>>;

let rowSeq = 0;
const newRow = (qty = ""): TruckRow => ({ id: `row-${Date.now()}-${rowSeq++}`, truckId: "", driverId: "", qty, lrNumber: "", trackingUrl: "" });

const mt = (value: number) => `${Math.round(value * 1000) / 1000} MT`;

/** Adds one or many trucks to a single accepted schedule, the same way as the Add Truck to Schedule screen. */
const AddTrucksForm = ({ schedule, lookups, onClose }: { schedule: AcceptedSchedule; lookups: TruckLookups | undefined; onClose: () => void }) => {
  const [addTrucks, { isLoading }] = useAddTrucksToScheduleMutation();
  const notify = useNotifyPrompt();
  const [rows, setRows] = useState<TruckRow[]>(() => [newRow(String(schedule.remainingQuantityMT))]);
  const [errors, setErrors] = useState<Record<string, RowErrors>>({});
  const [totalError, setTotalError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  const trucks = lookups?.trucks ?? [];
  const drivers = lookups?.drivers ?? [];
  // Only trucks and drivers that are free now: one on another trip is left out of the list (the API refuses it too).
  const truckOptions = useMemo(() => trucks.filter((t) => !t.busyMessage).map((t) => ({ value: String(t.truckId), label: t.truckNumber })), [trucks]);
  const driverOptions = useMemo(() => drivers.filter((d) => !d.busyMessage).map((d) => ({ value: String(d.driverId), label: `${d.driverName} — ${d.mobileNumber}` })), [drivers]);
  const isFreeDriver = (driverId: number | null | undefined) => Boolean(driverId) && drivers.some((d) => d.driverId === driverId && !d.busyMessage);

  const update = (id: string, patch: Partial<TruckRow>) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const allocated = rows.reduce((sum, r) => sum + (Number(r.qty) > 0 ? Number(r.qty) : 0), 0);

  const validate = () => {
    const rowErrors: Record<string, RowErrors> = {};
    let total = 0;
    rows.forEach((row) => {
      const e: RowErrors = {};
      const truck = trucks.find((t) => String(t.truckId) === row.truckId);
      if (!row.truckId) e.truckId = "Select a truck.";
      else if (rows.some((o) => o.id !== row.id && o.truckId === row.truckId)) e.truckId = "This truck is already in another row.";
      else if (truck?.busyMessage) e.truckId = truck.busyMessage;
      const driver = drivers.find((d) => String(d.driverId) === row.driverId);
      if (!row.driverId) e.driverId = "Select a driver.";
      else if (driver?.busyMessage) e.driverId = driver.busyMessage;
      if (!row.qty.trim()) e.qty = "Quantity is required.";
      else if (!/^\d+(\.\d+)?$/.test(row.qty.trim()) || Number(row.qty) <= 0) e.qty = "Enter a quantity greater than 0.";
      else total += Number(row.qty);
      if (row.trackingUrl.trim() && !/^https?:\/\/.+/i.test(row.trackingUrl.trim())) e.trackingUrl = "Start with http:// or https://";
      if (Object.keys(e).length) rowErrors[row.id] = e;
    });
    const totalMsg = total > schedule.remainingQuantityMT + 1e-9 ? `These trucks add up to ${mt(total)}, but only ${mt(schedule.remainingQuantityMT)} of this schedule is still unassigned.` : "";
    return { rowErrors, totalMsg };
  };

  const save = async () => {
    const { rowErrors, totalMsg } = validate();
    setErrors(rowErrors);
    setTotalError(totalMsg);
    setSubmitError("");
    if (Object.keys(rowErrors).length || totalMsg) return;
    try {
      const result = await addTrucks({
        dispatchScheduleTransporterId: schedule.dispatchScheduleTransporterId,
        trucks: rows.map((r) => ({
          truckId: Number(r.truckId),
          driverId: Number(r.driverId),
          quantityMT: Number(r.qty),
          lrNumber: r.lrNumber.trim() || undefined,
          trackingUrl: r.trackingUrl.trim() || undefined,
        })),
      }).unwrap();
      setDone(true);
      notify.ask(result.contractDispatchIds.map((id) => ({ eventCode: "TRUCK_ADDED", title: "Notify about the truck added", sourceEntityType: "ContractTruckDispatch", sourceEntityId: id })));
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Could not add the trucks to this schedule. Please try again."));
    }
  };

  return (
    <div className="accepted-schedules__form">
      {createPortal(notify.element, document.body)}
      {done ? (
        <div className="accepted-schedules__success">
          <CircleCheckBigIcon aria-hidden /> {rows.length > 1 ? "Trucks added" : "Truck added"} to this schedule.
          <button type="button" className="accepted-schedules__link" onClick={onClose}>Close</button>
        </div>
      ) : (
        <>
          <div className="accepted-schedules__rows">
            {rows.map((row, index) => {
              const e = errors[row.id] ?? {};
              const taken = rows.filter((o) => o.id !== row.id).map((o) => o.truckId);
              return (
                <div className="accepted-schedules__row" key={row.id}>
                  <span className="accepted-schedules__row-no">{index + 1}</span>
                  <div className="accepted-schedules__field">
                    <label>Truck <b>*</b></label>
                    <SearchableSelect
                      options={truckOptions.filter((o) => !taken.includes(o.value))}
                      value={row.truckId}
                      onChange={(truckId) => {
                        const picked = trucks.find((t) => String(t.truckId) === truckId);
                        update(row.id, {
                          truckId,
                          trackingUrl: row.trackingUrl || picked?.trackingUrl || "",
                          // The truck's usual driver is filled in only when that driver is free.
                          driverId: row.driverId || (isFreeDriver(picked?.defaultDriverId) ? String(picked!.defaultDriverId) : ""),
                        });
                      }}
                      placeholder={truckOptions.length ? "Select a truck" : "No free trucks right now"}
                      ariaLabel="Truck"
                    />
                    {e.truckId && <p className="accepted-schedules__error">{e.truckId}</p>}
                  </div>
                  <div className="accepted-schedules__field">
                    <label>Driver <b>*</b></label>
                    <SearchableSelect options={driverOptions} value={row.driverId} onChange={(driverId) => update(row.id, { driverId })} placeholder={driverOptions.length ? "Select a driver" : "No free drivers right now"} ariaLabel="Driver" />
                    {e.driverId && <p className="accepted-schedules__error">{e.driverId}</p>}
                  </div>
                  <div className="accepted-schedules__field accepted-schedules__field--narrow">
                    <label>Qty (MT) <b>*</b></label>
                    <input type="text" inputMode="decimal" value={row.qty} onChange={(ev) => update(row.id, { qty: ev.target.value })} placeholder="e.g. 20" />
                    {e.qty && <p className="accepted-schedules__error">{e.qty}</p>}
                  </div>
                  <div className="accepted-schedules__field accepted-schedules__field--narrow">
                    <label>LR Number</label>
                    <input type="text" value={row.lrNumber} onChange={(ev) => update(row.id, { lrNumber: ev.target.value })} placeholder="Lorry receipt no." />
                  </div>
                  <div className="accepted-schedules__field">
                    <label>Tracking URL</label>
                    <input type="text" value={row.trackingUrl} onChange={(ev) => update(row.id, { trackingUrl: ev.target.value })} placeholder="https://…" />
                    {e.trackingUrl && <p className="accepted-schedules__error">{e.trackingUrl}</p>}
                  </div>
                  <div className="accepted-schedules__row-actions">
                    {rows.length > 1 && (
                      <button type="button" className="accepted-schedules__icon accepted-schedules__icon--delete" onClick={() => remove(row.id)} aria-label="Remove truck" title="Remove truck">
                        <Trash2Icon aria-hidden />
                      </button>
                    )}
                    {index === rows.length - 1 && (
                      <button type="button" className="accepted-schedules__icon accepted-schedules__icon--add" onClick={() => setRows((prev) => [...prev, newRow()])} aria-label="Add another truck" title="Add another truck">
                        <PlusIcon aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="accepted-schedules__form-foot">
            <span className={`accepted-schedules__allocated${allocated > schedule.remainingQuantityMT ? " is-over" : ""}`}>
              {mt(allocated)} of {mt(schedule.remainingQuantityMT)} remaining allocated
            </span>
            <span className="accepted-schedules__form-buttons">
              <button type="button" className="transporter-requests__btn transporter-requests__btn--danger" onClick={onClose} disabled={isLoading}>
                <XIcon aria-hidden /> Cancel
              </button>
              <button type="button" className="transporter-requests__btn transporter-requests__btn--navy" onClick={save} disabled={isLoading}>
                <SaveIcon aria-hidden /> {isLoading ? "Saving…" : rows.length > 1 ? "Add all trucks" : "Add truck"}
              </button>
            </span>
          </div>
          {totalError && <p className="accepted-schedules__error">{totalError}</p>}
          {submitError && <p className="accepted-schedules__error" role="alert">{submitError}</p>}
        </>
      )}
    </div>
  );
};

const ScheduleCard = ({ schedule, lookups, showTransporter }: { schedule: AcceptedSchedule; lookups: TruckLookups | undefined; showTransporter: boolean }) => {
  const [open, setOpen] = useState(false);
  const active = schedule.trucks.filter((t) => !t.cancelled);
  const pct = schedule.acceptedQuantityMT > 0 ? Math.min(100, (schedule.assignedQuantityMT / schedule.acceptedQuantityMT) * 100) : 0;
  const full = schedule.remainingQuantityMT <= 0;

  return (
    <article className={`accepted-schedules__card${full ? " is-full" : ""}`}>
      <header className="accepted-schedules__card-head">
        <div>
          <strong>{formatApiDateTime(schedule.scheduleDateTime)}</strong>
          <span className="accepted-schedules__product">
            {schedule.productName ?? "-"}
            {schedule.billChange && <span className="transporter-requests__bill-tag is-required">Bill Change is required</span>}
          </span>
          {showTransporter && <span className="accepted-schedules__muted">Transporter: {schedule.transporterName}</span>}
        </div>
        <div className="accepted-schedules__route">
          <span title={schedule.loadingAddress ?? undefined}><b>From</b> {schedule.sellerName ?? "-"}{schedule.loadingPlace ? `, ${schedule.loadingPlace}` : ""}</span>
          <span title={schedule.deliveryAddress ?? undefined}><b>To</b> {schedule.buyerName ?? "-"}{schedule.deliveryPlace ? `, ${schedule.deliveryPlace}` : ""}</span>
        </div>
        <div className="accepted-schedules__qty">
          <span>{mt(schedule.assignedQuantityMT)} of {mt(schedule.acceptedQuantityMT)} assigned @ ₹{schedule.acceptedFreightPerMT}/MT</span>
          <div className="accepted-schedules__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className={full ? "accepted-schedules__done" : "accepted-schedules__left"}>{full ? "Fully assigned" : `${mt(schedule.remainingQuantityMT)} left to assign`}</span>
        </div>
        <button type="button" className="transporter-requests__btn transporter-requests__btn--info" onClick={() => setOpen((p) => !p)} disabled={full} aria-expanded={open}>
          <TruckIcon aria-hidden /> {open ? "Hide" : "Add Trucks"}
        </button>
      </header>

      {active.length > 0 && (
        <ul className="accepted-schedules__trucks">
          {active.map((t) => (
            <li key={t.contractDispatchId}>
              <b>{t.truckNumber ?? "-"}</b>
              <span>{t.driverName ?? "-"}{t.driverPhone ? ` · ${t.driverPhone}` : ""}</span>
              <span>{mt(t.quantityMT)}</span>
              {t.lrNumber && <span>LR {t.lrNumber}</span>}
              <span className="accepted-schedules__chip">{t.status}</span>
            </li>
          ))}
        </ul>
      )}

      {open && !full && <AddTrucksForm schedule={schedule} lookups={lookups} onClose={() => setOpen(false)} />}
    </article>
  );
};

/** Accepted schedules with the trucks added so far; trucks can be added to any of them, one or several at a time. */
const AcceptedSchedules = ({ showTransporter }: { showTransporter: boolean }) => {
  const { data, isLoading, isError, error } = useGetAcceptedSchedulesQuery();
  const { data: lookups } = useGetTruckLookupsQuery();
  // Only schedules whose truck arrangement is not complete yet (some accepted quantity is still unassigned).
  const schedules = useMemo(() => (data ?? []).filter((s) => s.remainingQuantityMT > 0).sort((a, b) => a.scheduleDateTime.localeCompare(b.scheduleDateTime)), [data]);

  return (
    <section className="transporter-requests__section">
      <div className="transporter-requests__section-head">
        <h2>
          Add Trucks to Accepted Schedules <span className="transporter-requests__count">{schedules.length}</span>
        </h2>
      </div>
      <p className="accepted-schedules__hint">Accepted schedules whose truck arrangement is not complete. Add one or more trucks against any of them. The total can't exceed the quantity still left on that schedule.</p>
      {isError && <p className="manage-schedule-table__error" role="alert">{getErrorMessage(error, "The accepted schedules could not be loaded. Please try again.")}</p>}
      {isLoading ? (
        <p className="transporter-requests__empty">Loading…</p>
      ) : schedules.length === 0 ? (
        <p className="transporter-requests__empty">No accepted schedules are waiting for trucks.</p>
      ) : (
        <div className="accepted-schedules">
          {schedules.map((s) => (
            <ScheduleCard key={s.dispatchScheduleTransporterId} schedule={s} lookups={lookups} showTransporter={showTransporter} />
          ))}
        </div>
      )}
    </section>
  );
};

export default AcceptedSchedules;
