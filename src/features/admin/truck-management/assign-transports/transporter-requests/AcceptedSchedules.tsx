import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CircleCheckBigIcon, PenLineIcon, PlusIcon, SaveIcon, Trash2Icon, TruckIcon, XIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../../shared/components/dialog/ConfirmDialog";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";
import { getUserId } from "../../../../../core/auth/session";
import { formatApiDateTime } from "../../../../../shared/utils/apiDateTime";
import { useNotifyPrompt } from "../../../../../shared/notifications/useNotifyPrompt";
import { useAddTruckDetailsMutation } from "../../../../../core/store/trucksApi";
import { useAddDriverMutation, useLazyGetDriverByMobileQuery } from "../../../../../core/store/driversApi";
import {
  useAddTrucksToScheduleMutation,
  useGetAcceptedSchedulesQuery,
  useGetTruckLookupsQuery,
  useUpdateScheduleTruckMutation,
  useDeleteScheduleTruckMutation,
  type AcceptedSchedule,
  type AssignedTruck,
  type TruckLookups,
} from "../../../../../core/store/transporterRequestsApi";
import "./AcceptedSchedules.scss";

interface TruckRow {
  id: string;
  /** A truck id from the list, or a truck number typed in that is not in it yet (added to the truck master on save). */
  truck: string;
  /** A driver id from the list, or a name typed in for a new driver (added on save). */
  driverName: string;
  /** A driver id from the list (the same one as the name), or a 10-digit number typed in for a new driver. */
  driverPhone: string;
  qty: string;
  lrNumber: string;
  trackingUrl: string;
}
type RowErrors = Partial<Record<"truck" | "driverName" | "driverPhone" | "qty" | "trackingUrl", string>>;

let rowSeq = 0;
const newRow = (qty = ""): TruckRow => ({ id: `row-${Date.now()}-${rowSeq++}`, truck: "", driverName: "", driverPhone: "", qty, lrNumber: "", trackingUrl: "" });

const mt = (value: number) => `${Math.round(value * 1000) / 1000} MT`;
const normalizeTruckNumber = (value: string) => value.replace(/[^a-z0-9]/gi, "").toUpperCase();

interface AddTrucksFormProps {
  /** What the form needs of the schedule: what is left on it (and the offer, when adding). An instant truck passes its contract's. */
  schedule: Pick<AcceptedSchedule, "dispatchScheduleTransporterId" | "remainingQuantityMT">;
  /** Wording of the quantity limit when editing: left "on this schedule" (default) or "on the contract" (an instant truck). */
  limitScope?: "schedule" | "contract";
  lookups: TruckLookups | undefined;
  /** Reloads the transporter's trucks and drivers, after one is added from this form. */
  refreshLookups: () => Promise<TruckLookups | undefined>;
  onClose: () => void;
  /** Edit mode: this truck, already on the schedule and still Assigned, is changed instead of new trucks being added. */
  editing?: AssignedTruck;
}

/**
 * Adds one or many trucks to a single accepted schedule, the same way as the Add Truck to Schedule screen: a truck number not in
 * the list can be typed in (it is added to the truck master on save), and so can a driver's name and contact number (added to the
 * transporter's drivers on save).
 */
export const AddTrucksForm = ({ schedule, lookups, refreshLookups, onClose, editing, limitScope = "schedule" }: AddTrucksFormProps) => {
  const [addTrucks, { isLoading: adding }] = useAddTrucksToScheduleMutation();
  const [updateTruck, { isLoading: updating }] = useUpdateScheduleTruckMutation();
  const saving = adding || updating;
  // What the trucks in this form may add up to: what is left, plus this truck's own quantity when editing it.
  const limit = schedule.remainingQuantityMT + (editing?.quantityMT ?? 0);
  const [addTruckDetails, { isLoading: addingTruck }] = useAddTruckDetailsMutation();
  const [addDriver, { isLoading: addingDriver }] = useAddDriverMutation();
  const [fetchDriverByMobile] = useLazyGetDriverByMobileQuery();
  const notify = useNotifyPrompt();
  const [rows, setRows] = useState<TruckRow[]>(() =>
    editing
      ? [{
          ...newRow(String(editing.quantityMT)),
          truck: String(editing.truckId),
          driverName: String(editing.driverId),
          driverPhone: String(editing.driverId),
          lrNumber: editing.lrNumber ?? "",
          trackingUrl: editing.trackingUrl ?? "",
        }]
      : [newRow(String(schedule.remainingQuantityMT))],
  );
  const [errors, setErrors] = useState<Record<string, RowErrors>>({});
  const [totalError, setTotalError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
  // After an edit: how many contracts' buyers and sellers the server notified.
  const [notifiedContracts, setNotifiedContracts] = useState(0);

  const trucks = useMemo(() => lookups?.trucks ?? [], [lookups]);
  const drivers = useMemo(() => lookups?.drivers ?? [], [lookups]);
  // Only trucks and drivers that are free now: one on another trip is left out of the list (the API refuses it too).
  // When editing, the truck and driver already on this trip count as free: they are "busy" only with this trip.
  const ownTruckId = editing?.truckId;
  const ownDriverId = editing?.driverId;
  const freeTrucks = useMemo(() => trucks.filter((t) => !t.busyMessage || t.truckId === ownTruckId), [trucks, ownTruckId]);
  const freeDrivers = useMemo(() => drivers.filter((d) => !d.busyMessage || d.driverId === ownDriverId), [drivers, ownDriverId]);
  const truckOptions = useMemo(() => freeTrucks.map((t) => ({ value: String(t.truckId), label: t.truckNumber })), [freeTrucks]);
  // Both driver fields hold the driver id; one lists the names, the other the contact numbers.
  const driverNameOptions = useMemo(() => freeDrivers.map((d) => ({ value: String(d.driverId), label: d.driverName })), [freeDrivers]);
  const driverPhoneOptions = useMemo(() => freeDrivers.filter((d) => d.mobileNumber).map((d) => ({ value: String(d.driverId), label: d.mobileNumber })), [freeDrivers]);
  const driverById = (value: string) => drivers.find((d) => String(d.driverId) === value);
  const isFreeDriver = (driverId: number | null | undefined) => Boolean(driverId) && freeDrivers.some((d) => d.driverId === driverId);

  /** The listed truck a row points at: picked from the list, or typed with the number of one of the transporter's trucks. */
  const knownTruck = (value: string) =>
    trucks.find((t) => String(t.truckId) === value) ?? (value ? trucks.find((t) => normalizeTruckNumber(t.truckNumber) === normalizeTruckNumber(value)) : undefined);

  const update = (id: string, patch: Partial<TruckRow>) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const allocated = rows.reduce((sum, r) => sum + (Number(r.qty) > 0 ? Number(r.qty) : 0), 0);
  const truckKey = (value: string) => (knownTruck(value) ? `id:${knownTruck(value)!.truckId}` : `no:${normalizeTruckNumber(value)}`);

  /** Who a row's driver is: a listed driver (by id, or by a typed number already on the list), or a new one. */
  const driverRef = (row: TruckRow): { id?: number; name: string; phone: string } | "mixed" => {
    const byName = driverById(row.driverName);
    const byPhone = driverById(row.driverPhone);
    if (byName && byPhone) return byName.driverId === byPhone.driverId ? { id: byName.driverId, name: byName.driverName, phone: byName.mobileNumber } : "mixed";
    if (byName || byPhone) return "mixed";
    const phone = row.driverPhone.trim();
    const sameNumber = phone ? drivers.find((d) => d.mobileNumber === phone) : undefined;
    return sameNumber ? { id: sameNumber.driverId, name: sameNumber.driverName, phone } : { name: row.driverName.trim(), phone };
  };
  const driverKey = (row: TruckRow) => {
    const ref = driverRef(row);
    return ref === "mixed" ? `x:${row.id}` : ref.id ? `id:${ref.id}` : `m:${ref.phone}`;
  };

  /** Picking a listed driver fills both fields; typing a new name or number clears a listed driver from the other field. */
  const pickDriver = (row: TruckRow, field: "driverName" | "driverPhone", value: string) => {
    if (driverById(value)) return update(row.id, { driverName: value, driverPhone: value });
    const other = field === "driverName" ? "driverPhone" : "driverName";
    const wasListed = Boolean(driverById(row.driverName) || driverById(row.driverPhone));
    const next = field === "driverPhone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    update(row.id, { [field]: next, ...(wasListed ? { [other]: "" } : {}) });
  };

  const validate = () => {
    const rowErrors: Record<string, RowErrors> = {};
    let total = 0;
    rows.forEach((row) => {
      const e: RowErrors = {};
      const truck = knownTruck(row.truck);
      if (!row.truck.trim()) e.truck = "Select or type a truck number.";
      else if (!truck && normalizeTruckNumber(row.truck).length < 4) e.truck = "Enter a valid truck number.";
      else if (rows.some((o) => o.id !== row.id && o.truck.trim() && truckKey(o.truck) === truckKey(row.truck))) e.truck = "This truck is already in another row.";
      else if (truck?.busyMessage && truck.truckId !== ownTruckId) e.truck = truck.busyMessage;
      const ref = driverRef(row);
      if (!row.driverName.trim()) e.driverName = "Select a driver, or type a new driver's name.";
      if (!row.driverPhone.trim()) e.driverPhone = "Select or type the driver's contact number.";
      if (row.driverName.trim() && row.driverPhone.trim()) {
        if (ref === "mixed") e.driverPhone = "Pick the name and number of the same driver, or type both for a new driver.";
        else if (ref.id) {
          const driver = driverById(String(ref.id));
          if (!driver) e.driverPhone = "This driver is not on your list.";
          else if (driver.busyMessage && driver.driverId !== ownDriverId) e.driverPhone = driver.busyMessage;
        } else {
          if (ref.name.length < 2) e.driverName = "Enter the driver's name.";
          if (!/^\d{10}$/.test(ref.phone)) e.driverPhone = "Enter a 10-digit mobile number.";
        }
        if (!e.driverName && !e.driverPhone && rows.some((o) => o.id !== row.id && driverKey(o) === driverKey(row))) e.driverPhone = "This driver is already in another row.";
      }
      if (!row.qty.trim()) e.qty = "Quantity is required.";
      else if (!/^\d+(\.\d+)?$/.test(row.qty.trim()) || Number(row.qty) <= 0) e.qty = "Enter a quantity greater than 0.";
      else total += Number(row.qty);
      if (row.trackingUrl.trim() && !/^https?:\/\/.+/i.test(row.trackingUrl.trim())) e.trackingUrl = "Start with http:// or https://";
      if (Object.keys(e).length) rowErrors[row.id] = e;
    });
    const totalMsg = total <= limit + 1e-9
      ? ""
      : editing
        ? `This truck can carry at most ${mt(limit)}: its current ${mt(editing.quantityMT)} plus the ${mt(schedule.remainingQuantityMT)} still unassigned on ${limitScope === "contract" ? "the contract" : "this schedule"}.`
        : `These trucks add up to ${mt(total)}, but only ${mt(limit)} of this schedule is still unassigned.`;
    return { rowErrors, totalMsg };
  };

  /** The truck's id. A number typed in that is not in the list is first added to the truck master with only its number. */
  const resolveTruckId = async (value: string): Promise<number> => {
    const known = knownTruck(value);
    if (known) return known.truckId;
    const created = await addTruckDetails({
      truckNumber: value.trim().toUpperCase(),
      trackingUrl: undefined,
      actionPerformedBy: Number(getUserId()) || 0,
    }).unwrap();
    const truckId = Number(created);
    if (!truckId) throw new Error(`Truck ${value.trim().toUpperCase()} was added but its id was not returned.`);
    return truckId;
  };

  const save = async () => {
    const { rowErrors, totalMsg } = validate();
    setErrors(rowErrors);
    setTotalError(totalMsg);
    setSubmitError("");
    if (Object.keys(rowErrors).length || totalMsg) return;

    // New truck numbers and new drivers are added first, then all trucks go on the schedule.
    let truckIds: number[];
    const driverIds: number[] = [];
    let addedDriver = false;
    try {
      truckIds = [];
      for (const row of rows) truckIds.push(await resolveTruckId(row.truck));
    } catch (err) {
      setSubmitError(getErrorMessage(err, "The new truck number could not be added. Please try again."));
      return;
    }
    try {
      for (const row of rows) {
        const ref = driverRef(row);
        if (ref === "mixed") throw new Error("Pick the name and number of the same driver.");
        if (ref.id) {
          driverIds.push(ref.id);
          continue;
        }
        await addDriver({ driverName: ref.name, mobileNumber: ref.phone, actionPerformedBy: Number(getUserId()) || 0 }).unwrap();
        const created = await fetchDriverByMobile(ref.phone).unwrap();
        if (!created?.driverId) throw new Error(`Driver ${ref.name} was added but could not be found.`);
        driverIds.push(created.driverId);
        addedDriver = true;
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err, "The new driver could not be added. Please try again."));
      if (truckIds.some((id, i) => !knownTruck(rows[i].truck) && id) || addedDriver) void refreshLookups();
      return;
    }

    if (editing) {
      try {
        const row = rows[0];
        const result = await updateTruck({
          contractDispatchId: editing.contractDispatchId,
          truckId: truckIds[0],
          driverId: driverIds[0],
          quantityMT: Number(row.qty),
          lrNumber: row.lrNumber.trim() || undefined,
          trackingUrl: row.trackingUrl.trim(),
        }).unwrap();
        // The server tells the buyer and seller of every contract the truck is on (all of a re-assigned truck's contracts).
        setNotifiedContracts(result?.notifiedContracts ?? 0);
        setDone(true);
      } catch (err) {
        setSubmitError(getErrorMessage(err, "Could not save the changes to this truck. Please try again."));
      } finally {
        if (addedDriver || (truckIds[0] && !knownTruck(rows[0].truck))) void refreshLookups();
      }
      return;
    }

    try {
      const result = await addTrucks({
        dispatchScheduleTransporterId: schedule.dispatchScheduleTransporterId,
        trucks: rows.map((r, index) => ({
          truckId: truckIds[index],
          driverId: driverIds[index],
          quantityMT: Number(r.qty),
          lrNumber: r.lrNumber.trim() || undefined,
          trackingUrl: r.trackingUrl.trim() || undefined,
        })),
      }).unwrap();
      setDone(true);
      notify.ask(result.contractDispatchIds.map((id) => ({ eventCode: "TRUCK_ADDED", title: "Notify about the truck added", sourceEntityType: "ContractTruckDispatch", sourceEntityId: id })));
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Could not add the trucks to this schedule. Please try again."));
    } finally {
      // A truck added above is now one of the transporter's, whether or not the schedule save went through.
      if (addedDriver || truckIds.some((id, i) => !knownTruck(rows[i].truck) && id)) void refreshLookups();
    }
  };

  const busy = saving || addingTruck || addingDriver;
  // A truck re-assigned across contracts is one physical truck: a new truck, driver or quantity applies to every contract it serves.
  const inChain = Boolean(editing?.inChain);

  return (
    <div className="accepted-schedules__form">
      {createPortal(notify.element, document.body)}
      {done ? (
        <div className="accepted-schedules__success">
          <CircleCheckBigIcon aria-hidden />{" "}
          {editing
            ? `Truck updated.${notifiedContracts > 0 ? ` The buyer and seller of ${notifiedContracts === 1 ? "the contract were" : `all ${notifiedContracts} contracts were`} notified.` : ""}`
            : `${rows.length > 1 ? "Trucks added" : "Truck added"} to this schedule.`}
          <button type="button" className="accepted-schedules__link" onClick={onClose}>Close</button>
        </div>
      ) : (
        <>
          {inChain && (
            <p className="accepted-schedules__locked-note">
              This truck has been re-assigned and also serves other contracts. A new truck, driver or quantity applies to all of them, and the
              buyer and seller of every one is notified. The LR number stays this contract's own.
            </p>
          )}
          <div className="accepted-schedules__rows">
            {rows.map((row, index) => {
              const e = errors[row.id] ?? {};
              const taken = rows.filter((o) => o.id !== row.id).map((o) => o.truck);
              const takenDrivers = rows.filter((o) => o.id !== row.id).map((o) => o.driverName);
              const ref = driverRef(row);
              const isNewDriver = Boolean(row.driverName.trim() && row.driverPhone.trim()) && ref !== "mixed" && !ref.id;
              const isNewTruck = Boolean(row.truck.trim()) && !knownTruck(row.truck);
              return (
                <div className="accepted-schedules__row" key={row.id}>
                  <span className="accepted-schedules__row-no">{index + 1}</span>
                  <div className="accepted-schedules__field">
                    <label>Truck <b>*</b></label>
                    <SearchableSelect
                      options={truckOptions.filter((o) => !taken.includes(o.value))}
                      value={row.truck}
                      onChange={(value) => {
                        const picked = knownTruck(value);
                        update(row.id, {
                          truck: value,
                          trackingUrl: row.trackingUrl || picked?.trackingUrl || "",
                          // The truck's usual driver is filled in only when that driver is free.
                          ...(!row.driverName && !row.driverPhone && isFreeDriver(picked?.defaultDriverId) ? { driverName: String(picked!.defaultDriverId), driverPhone: String(picked!.defaultDriverId) } : {}),
                        });
                      }}
                      placeholder="Select or type a truck number"
                      ariaLabel="Truck"
                      allowCustom
                      clearable
                    />
                    {e.truck ? (
                      <p className="accepted-schedules__error">{e.truck}</p>
                    ) : (
                      isNewTruck && <p className="accepted-schedules__muted">New truck: added to your trucks on save.</p>
                    )}
                  </div>
                  <div className="accepted-schedules__field">
                    <label>Driver Name <b>*</b></label>
                    <SearchableSelect
                      options={driverNameOptions.filter((o) => !takenDrivers.includes(o.value))}
                      value={row.driverName}
                      onChange={(value) => pickDriver(row, "driverName", value)}
                      placeholder="Select or type a driver name"
                      ariaLabel="Driver name"
                      allowCustom
                      clearable
                    />
                    {e.driverName && <p className="accepted-schedules__error">{e.driverName}</p>}
                  </div>
                  <div className="accepted-schedules__field">
                    <label>Driver Contact No <b>*</b></label>
                    <SearchableSelect
                      options={driverPhoneOptions.filter((o) => !takenDrivers.includes(o.value))}
                      value={row.driverPhone}
                      onChange={(value) => pickDriver(row, "driverPhone", value)}
                      placeholder="Select or type a contact no"
                      ariaLabel="Driver contact number"
                      allowCustom
                      clearable
                    />
                    {e.driverPhone ? (
                      <p className="accepted-schedules__error">{e.driverPhone}</p>
                    ) : (
                      isNewDriver && <p className="accepted-schedules__muted">New driver: added to your drivers on save.</p>
                    )}
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
                    {!editing && rows.length > 1 && (
                      <button type="button" className="accepted-schedules__icon accepted-schedules__icon--delete" onClick={() => remove(row.id)} aria-label="Remove truck" title="Remove truck">
                        <Trash2Icon aria-hidden />
                      </button>
                    )}
                    {!editing && index === rows.length - 1 && (
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
            <span className={`accepted-schedules__allocated${allocated > limit ? " is-over" : ""}`}>
              {editing ? `Editing ${editing.truckNumber ?? "truck"} · up to ${mt(limit)}` : `${mt(allocated)} of ${mt(limit)} remaining allocated`}
            </span>
            <span className="accepted-schedules__form-buttons">
              <button type="button" className="transporter-requests__btn transporter-requests__btn--danger" onClick={onClose} disabled={busy}>
                <XIcon aria-hidden /> Cancel
              </button>
              <button type="button" className="transporter-requests__btn transporter-requests__btn--navy" onClick={save} disabled={busy}>
                <SaveIcon aria-hidden /> {busy ? "Saving…" : editing ? "Save changes" : rows.length > 1 ? "Add all trucks" : "Add truck"}
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

const ScheduleCard = ({ schedule, lookups, refreshLookups, showTransporter }: { schedule: AcceptedSchedule; lookups: TruckLookups | undefined; refreshLookups: () => Promise<TruckLookups | undefined>; showTransporter: boolean }) => {
  const [open, setOpen] = useState(false);
  // The truck being edited (one at a time; it replaces the Add Trucks form while open).
  const [editingId, setEditingId] = useState<number | null>(null);
  const active = schedule.trucks.filter((t) => !t.cancelled);
  const editingTruck = active.find((t) => t.contractDispatchId === editingId && t.editable);
  // Delete: asked first, then the truck is taken off (kept as Cancelled) and its quantity is back in "left to assign".
  const [deleteTruck, { isLoading: deleting }] = useDeleteScheduleTruckMutation();
  const [toDelete, setToDelete] = useState<AssignedTruck | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteNote, setDeleteNote] = useState("");
  const confirmDelete = async () => {
    if (!toDelete) return;
    const truck = toDelete;
    setToDelete(null);
    setDeleteError("");
    setDeleteNote("");
    try {
      const result = await deleteTruck({ contractDispatchId: truck.contractDispatchId }).unwrap();
      if (editingId === truck.contractDispatchId) setEditingId(null);
      const n = result?.notifiedContracts ?? 0;
      setDeleteNote(
        `Truck ${truck.truckNumber ?? ""} deleted${(result?.contracts ?? 1) > 1 ? ` from all ${result.contracts} contracts it served` : ""}.` +
          (n > 0 ? ` The buyer and seller of ${n === 1 ? "the contract were" : `all ${n} contracts were`} notified.` : ""),
      );
    } catch (err) {
      setDeleteError(getErrorMessage(err, `Truck ${truck.truckNumber ?? ""} could not be deleted. Please try again.`));
    }
  };
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
        <button
          type="button"
          className="transporter-requests__btn transporter-requests__btn--info"
          onClick={() => {
            setEditingId(null);
            setOpen((p) => !p);
          }}
          disabled={full}
          aria-expanded={open}
        >
          <TruckIcon aria-hidden /> {open ? "Hide" : "Add Trucks"}
        </button>
      </header>

      {active.length > 0 && (
        <ul className="accepted-schedules__trucks">
          {active.map((t) => (
            <li key={t.contractDispatchId} className={t.contractDispatchId === editingId ? "is-editing" : undefined}>
              <b>{t.truckNumber ?? "-"}</b>
              <span>{t.driverName ?? "-"}{t.driverPhone ? ` · ${t.driverPhone}` : ""}</span>
              <span>{mt(t.quantityMT)}</span>
              {t.lrNumber && <span>LR {t.lrNumber}</span>}
              <span className="accepted-schedules__chip">{t.status}</span>
              {/* Editable until it is Loaded. */}
              {t.editable && (
                <button
                  type="button"
                  className="accepted-schedules__icon accepted-schedules__icon--small accepted-schedules__icon--edit"
                  onClick={() => {
                    setOpen(false);
                    setEditingId((id) => (id === t.contractDispatchId ? null : t.contractDispatchId));
                  }}
                  aria-label={`Edit truck ${t.truckNumber ?? ""}`}
                  aria-pressed={t.contractDispatchId === editingId}
                  title="Edit this truck"
                >
                  <PenLineIcon aria-hidden />
                </button>
              )}
              {/* a re-assigned truck comes off every contract it serves */}
              {t.editable && (
                <button
                  type="button"
                  className="accepted-schedules__icon accepted-schedules__icon--small accepted-schedules__icon--delete"
                  onClick={() => setToDelete(t)}
                  disabled={deleting}
                  aria-label={`Delete truck ${t.truckNumber ?? ""}`}
                  title="Delete this truck"
                >
                  <Trash2Icon aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {deleteError && <p className="accepted-schedules__error" role="alert">{deleteError}</p>}
      {deleteNote && <p className="accepted-schedules__success" role="status">{deleteNote}</p>}
      <ConfirmDialog
        open={toDelete != null}
        title="Delete this truck?"
        message={
          toDelete
            ? `${toDelete.truckNumber ?? "This truck"} (${mt(toDelete.quantityMT)}) will be taken off this schedule. Its ${mt(toDelete.quantityMT)} goes back to "left to assign", so you can add another truck for it.` +
              (toDelete.inChain ? " It has been re-assigned, so it comes off every contract it serves too." : "") +
              " The buyer and seller of each contract are notified."
            : ""
        }
        confirmLabel="Delete truck"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      {editingTruck && (
        <AddTrucksForm
          key={editingTruck.contractDispatchId}
          schedule={schedule}
          lookups={lookups}
          refreshLookups={refreshLookups}
          editing={editingTruck}
          onClose={() => setEditingId(null)}
        />
      )}
      {open && !full && !editingTruck && <AddTrucksForm schedule={schedule} lookups={lookups} refreshLookups={refreshLookups} onClose={() => setOpen(false)} />}
    </article>
  );
};

/** Accepted schedules with the trucks added so far; trucks can be added to any of them, one or several at a time. */
const AcceptedSchedules = ({ showTransporter, from, to }: { showTransporter: boolean; /** Schedule-date range (yyyy-MM-dd), optional. */ from?: string; to?: string }) => {
  const { data, isLoading, isError, error } = useGetAcceptedSchedulesQuery({ from, to });
  const { data: lookups, refetch: refetchLookups } = useGetTruckLookupsQuery();
  const refreshLookups = async () => (await refetchLookups()).data;
  // Schedules whose truck arrangement is not complete yet (some accepted quantity is still unassigned), and fully assigned ones
  // while any of their trucks can still be edited (not Loaded yet).
  const schedules = useMemo(() => (data ?? []).filter((s) => s.remainingQuantityMT > 0 || s.trucks.some((t) => t.editable)).sort((a, b) => a.scheduleDateTime.localeCompare(b.scheduleDateTime)), [data]);

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
        <p className="transporter-requests__empty">{from || to ? "No accepted schedules in this period are waiting for trucks." : "No accepted schedules are waiting for trucks."}</p>
      ) : (
        <div className="accepted-schedules">
          {schedules.map((s) => (
            <ScheduleCard key={s.dispatchScheduleTransporterId} schedule={s} lookups={lookups} refreshLookups={refreshLookups} showTransporter={showTransporter} />
          ))}
        </div>
      )}
    </section>
  );
};

export default AcceptedSchedules;
