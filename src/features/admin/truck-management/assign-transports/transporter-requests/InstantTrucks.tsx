import { useState } from "react";
import { PenLineIcon, Trash2Icon, ZapIcon } from "../../../../../shared/components/icon";
import ConfirmDialog from "../../../../../shared/components/dialog/ConfirmDialog";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";
import { formatApiDateTime } from "../../../../../shared/utils/apiDateTime";
import {
  useDeleteScheduleTruckMutation,
  useGetInstantTrucksQuery,
  useGetTruckLookupsQuery,
  type InstantTruck,
  type TruckLookups,
} from "../../../../../core/store/transporterRequestsApi";
import { AddTrucksForm } from "./AcceptedSchedules";
import "./AcceptedSchedules.scss";

const mt = (value: number) => `${Math.round(value * 1000) / 1000} MT`;

/** One instant truck: where it goes and what it carries, with Edit while it is still Assigned (not Loaded). */
const InstantTruckCard = ({ item, lookups, refreshLookups, showTransporter, onDeleted }: { item: InstantTruck; lookups: TruckLookups | undefined; refreshLookups: () => Promise<TruckLookups | undefined>; showTransporter: boolean; onDeleted: (message: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const t = item.truck;
  const loaded = t.status !== "Assigned";
  // Delete: while not loaded, and not for a truck re-assigned across contracts (that one is cancelled by FeedXchange).
  // Delete while not loaded; a re-assigned truck comes off every contract it serves.
  const canDelete = t.editable;
  const [deleteTruck, { isLoading: deleting }] = useDeleteScheduleTruckMutation();
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const confirmDelete = async () => {
    setConfirming(false);
    setDeleteError("");
    try {
      const result = await deleteTruck({ contractDispatchId: t.contractDispatchId }).unwrap();
      setEditing(false);
      const n = result?.notifiedContracts ?? 0;
      // the card disappears with the truck, so the confirmation is shown above the list
      onDeleted(
        `Truck ${t.truckNumber ?? ""} deleted${(result?.contracts ?? 1) > 1 ? ` from all ${result.contracts} contracts it served` : ""}.` +
          (n > 0 ? ` The buyer and seller of ${n === 1 ? "the contract were" : `all ${n} contracts were`} notified.` : ""),
      );
    } catch (err) {
      setDeleteError(getErrorMessage(err, `Truck ${t.truckNumber ?? ""} could not be deleted. Please try again.`));
    }
  };

  return (
    <article className={`accepted-schedules__card accepted-schedules__card--instant${loaded ? " is-full" : ""}`}>
      <header className="accepted-schedules__card-head">
        <div>
          <strong>{formatApiDateTime(item.assignedOn)}</strong>
          <span className="accepted-schedules__product">
            {item.productName ?? "-"}
            <span className="accepted-schedules__instant-tag"><ZapIcon aria-hidden /> Instant truck</span>
          </span>
          {showTransporter && (
            <span className="accepted-schedules__muted">
              Transporter: {item.transporterName}{item.contractNumber ? ` · Contract ${item.contractNumber}` : ""}
            </span>
          )}
        </div>
        <div className="accepted-schedules__route">
          <span title={item.loadingAddress ?? undefined}><b>From</b> {item.sellerName ?? "-"}{item.loadingPlace ? `, ${item.loadingPlace}` : ""}</span>
          <span title={item.deliveryAddress ?? undefined}><b>To</b> {item.buyerName ?? "-"}{item.deliveryPlace ? `, ${item.deliveryPlace}` : ""}</span>
        </div>
        <div className="accepted-schedules__qty">
          <span>{mt(t.quantityMT)} @ ₹{item.freightPerMT}/MT</span>
          <span className={loaded ? "accepted-schedules__done" : "accepted-schedules__left"}>{loaded ? "Loaded" : "On the way"}</span>
        </div>
      </header>

      <ul className="accepted-schedules__trucks">
        <li className={editing ? "is-editing" : undefined}>
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
              onClick={() => setEditing((e) => !e)}
              aria-label={`Edit truck ${t.truckNumber ?? ""}`}
              aria-pressed={editing}
              title="Edit this truck"
            >
              <PenLineIcon aria-hidden />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="accepted-schedules__icon accepted-schedules__icon--small accepted-schedules__icon--delete"
              onClick={() => setConfirming(true)}
              disabled={deleting}
              aria-label={`Delete truck ${t.truckNumber ?? ""}`}
              title="Delete this truck"
            >
              <Trash2Icon aria-hidden />
            </button>
          )}
        </li>
      </ul>
      {deleteError && <p className="accepted-schedules__error" role="alert">{deleteError}</p>}
      <ConfirmDialog
        open={confirming}
        title="Delete this truck?"
        message={
          `${t.truckNumber ?? "This truck"} (${mt(t.quantityMT)}) will be taken off this contract. Its ${mt(t.quantityMT)} goes back to the contract's pending quantity.` +
          (t.inChain ? " It has been re-assigned, so it comes off every contract it serves too." : "") +
          " The buyer and seller of each contract are notified."
        }
        confirmLabel="Delete truck"
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />

      {editing && t.editable && (
        <AddTrucksForm
          // An instant truck can be raised by what is still unassigned on its contract.
          schedule={{ dispatchScheduleTransporterId: 0, remainingQuantityMT: item.contractPendingQuantityMT }}
          limitScope="contract"
          lookups={lookups}
          refreshLookups={refreshLookups}
          editing={t}
          onClose={() => setEditing(false)}
        />
      )}
    </article>
  );
};

/** Instant trucks of the transporter (added straight to a contract), newest first. Edit while not Loaded. */
const InstantTrucks = ({ showTransporter, from, to }: { showTransporter: boolean; /** Assigned-date range (yyyy-MM-dd), optional. */ from?: string; to?: string }) => {
  const { data, isLoading, isError, error } = useGetInstantTrucksQuery({ from, to });
  const { data: lookups, refetch: refetchLookups } = useGetTruckLookupsQuery();
  const refreshLookups = async () => (await refetchLookups()).data;
  const items = data ?? [];
  const onTheWay = items.filter((i) => i.truck.status === "Assigned").length;
  // the last delete's confirmation (its card is gone)
  const [note, setNote] = useState("");

  return (
    <section className="transporter-requests__section">
      <div className="transporter-requests__section-head">
        <h2>
          Instant Trucks <span className="transporter-requests__count">{items.length}</span>
        </h2>
      </div>
      <p className="accepted-schedules__hint">
        Trucks added straight to a contract (not through a schedule){onTheWay > 0 ? `; ${onTheWay} on the way can still be edited until they are loaded` : ""}.
      </p>
      {note && <p className="accepted-schedules__success" role="status">{note}</p>}
      {isError && <p className="manage-schedule-table__error" role="alert">{getErrorMessage(error, "The instant trucks could not be loaded. Please try again.")}</p>}
      {isLoading ? (
        <p className="transporter-requests__empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="transporter-requests__empty">{from || to ? "No instant trucks in this period." : "No instant trucks."}</p>
      ) : (
        <div className="accepted-schedules">
          {items.map((item) => (
            <InstantTruckCard key={item.contractDispatchId} item={item} lookups={lookups} refreshLookups={refreshLookups} showTransporter={showTransporter} onDeleted={setNote} />
          ))}
        </div>
      )}
    </section>
  );
};

export default InstantTrucks;
