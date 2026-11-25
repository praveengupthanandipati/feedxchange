import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, EyeIcon, EyeOffIcon, TruckIcon, XIcon } from "../../../../../shared/components/icon";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";
import { formatApiDateTime } from "../../../../../shared/utils/apiDateTime";
import { useNotifyPrompt } from "../../../../../shared/notifications/useNotifyPrompt";
import { useGetTransporterScheduleResponseStatusesQuery } from "../../../../../core/store/contractTrucksApi";
import {
  useGetTransporterRequestsQuery,
  useRespondToTransporterRequestMutation,
  type TransporterRequest,
} from "../../../../../core/store/transporterRequestsApi";
import ColumnHeader,{ useColumnControls, type ColumnFilters } from "./ColumnHeader";
import "../../open-pending-contracts/contract-trucks/manage-schedule/ManageSchedule.scss";
import "../../transporter-review-assign-trucks/ReviewAndAssignTrucks.scss";
import "./TransporterRequests.scss";

interface TransporterRequestsProps {
  /** "transporter": the signed-in transporter's own requests, which it can answer. "all": every transporter's, read-only (FeedXchange staff). */
  mode: "transporter" | "all";
}

/**
 * Two short lines, the party name and "City, State" (the full address is in the hover tooltip). With `full` on, the whole address is written out:
 * "Party name, line 1, line 2, landmark, city, district, state - pincode".
 */
const PartyAddress = ({ party, place, address, full }: { party: string | null; place: string | null; address: string | null; full: boolean }) => {
  // Two lines: the party, then "City, State". If the server did not send the place (an API that has not been restarted), it is read from
  // the end of the full address: "..., city, district, state - pincode".
  const parts = (address ?? "").split(", ");
  const fallbackPlace =
    parts.length >= 5 ? `${parts[parts.length - 3]}, ${parts[parts.length - 1].split(" - ")[0]}` : "";
  const line2 = place || fallbackPlace;
  return (
    <td className={`transporter-requests__address ${full ? "is-full" : ""}`} title={address || undefined}>
      {full ? (
        address || party || "-"
      ) : (
        <>
          <span className="transporter-requests__party">{party || "-"}</span>
          {line2 && <span className="transporter-requests__place">{line2}</span>}
        </>
      )}
    </td>
  );
};

/** Switches both tables between the short "Party, Place" lines and the full addresses. */
const AddressToggle = ({ full, onToggle }: { full: boolean; onToggle: () => void }) => (
  <button type="button" className="transporter-requests__btn transporter-requests__btn--info" onClick={onToggle} aria-pressed={full}>
    {full ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
    {full ? "Short Addresses" : "Full Addresses"}
  </button>
);

type When = "today" | "upcoming" | "earlier";
const WHEN_LABEL: Record<When, string> = { today: "Today", upcoming: "Upcoming", earlier: "Earlier (not answered)" };

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** Where a schedule falls against today (by the calendar day it is scheduled for). */
const whenOf = (scheduleDateTime: string, today: string): When => {
  const day = scheduleDateTime.slice(0, 10);
  return day === today ? "today" : day > today ? "upcoming" : "earlier";
};

/** The product, with a "Bill Change is required" badge under it only when a bill change is needed. */
const ProductCell = ({ product, billChange }: { product: string | null; billChange: boolean }) => (
  <td className="transporter-requests__product">
    <span className="transporter-requests__product-name">{product ?? "-"}</span>
    {billChange && <span className="transporter-requests__bill-tag is-required">Bill Change is required</span>}
  </td>
);

/** The heading cells with sort / filter for the three columns that have them, driven by one table's controls. */
type Controls = ReturnType<typeof useColumnControls>;

const TextFilter = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="column-header__field">
    <span>{label}</span>
    <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Name or address contains…" autoFocus />
    {value && (
      <button type="button" className="column-header__clear" onClick={() => onChange("")}>Clear</button>
    )}
  </label>
);

const ScheduledHeader = ({ c }: { c: Controls }) => (
  <ColumnHeader
    label="Scheduled For"
    sort={c.sort}
    onSort={c.cycleSort}
    filterActive={Boolean(c.filters.from || c.filters.to)}
    filter={
      <div className="column-header__field">
        <label>
          <span>From</span>
          <input type="date" value={c.filters.from} max={c.filters.to || undefined} onChange={(event) => c.setFilters({ ...c.filters, from: event.target.value })} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={c.filters.to} min={c.filters.from || undefined} onChange={(event) => c.setFilters({ ...c.filters, to: event.target.value })} />
        </label>
        {(c.filters.from || c.filters.to) && (
          <button type="button" className="column-header__clear" onClick={() => c.setFilters({ ...c.filters, from: "", to: "" })}>Clear</button>
        )}
      </div>
    }
  />
);

const AddressHeader = ({ c, field, label }: { c: Controls; field: keyof Pick<ColumnFilters, "loading" | "unloading">; label: string }) => (
  <ColumnHeader
    label={label}
    filterActive={Boolean(c.filters[field])}
    filter={<TextFilter label={label} value={c.filters[field]} onChange={(value) => c.setFilters({ ...c.filters, [field]: value })} />}
  />
);

/** One request the transporter can still answer: quantity and freight (prefilled with the offer), accept or reject. */
const PendingRow = ({ request, canRespond, showTransporter, when, fullAddresses }: { request: TransporterRequest; canRespond: boolean; showTransporter: boolean; when: When; fullAddresses: boolean }) => {
  const [respond, { isLoading }] = useRespondToTransporterRequestMutation();
  const notify = useNotifyPrompt();
  const [qty, setQty] = useState(String(request.availableQuantityMT));
  const [freight, setFreight] = useState(String(request.offeredFreightPerMT));
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const submit = async (accept: boolean) => {
    setError("");
    const acceptedQuantityMT = Number(qty);
    const acceptedFreightPerMT = Number(freight);
    if (accept) {
      if (!qty.trim() || Number.isNaN(acceptedQuantityMT) || acceptedQuantityMT <= 0) return setError("Enter a quantity greater than 0.");
      if (acceptedQuantityMT > request.availableQuantityMT) {
        return setError(
          request.availableQuantityMT < request.offeredQuantityMT
            ? `Only ${request.availableQuantityMT} MT is still open; other transporters have accepted the rest.`
            : `The quantity can't exceed the offered ${request.offeredQuantityMT} MT.`,
        );
      }
      if (!freight.trim() || Number.isNaN(acceptedFreightPerMT) || acceptedFreightPerMT <= 0) return setError("Enter a freight greater than 0.");
    }

    try {
      await respond({
        dispatchScheduleTransporterId: request.dispatchScheduleTransporterId,
        accept,
        acceptedQuantityMT: accept ? acceptedQuantityMT : undefined,
        acceptedFreightPerMT: accept ? acceptedFreightPerMT : undefined,
        remarks: remarks.trim() || undefined,
      }).unwrap();
      // The admins and whoever created the schedule are told about the response.
      notify.ask({
        eventCode: accept ? "TRANSPORTER_ACCEPTED" : "TRANSPORTER_REJECTED",
        title: accept ? "Notify about this acceptance" : "Notify about this rejection",
        sourceEntityType: "DispatchScheduleTransporter",
        sourceEntityId: request.dispatchScheduleTransporterId,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not save your response. Please try again."));
    }
  };

  return (
    <tr className={`transporter-requests__row transporter-requests__row--${when}`}>
      {createPortal(notify.element, document.body)}
      {showTransporter && <td>{request.transporterName}</td>}
      <td>
        {formatApiDateTime(request.scheduleDateTime)}
        <span className={`transporter-requests__when transporter-requests__when--${when}`}>{WHEN_LABEL[when]}</span>
      </td>
      <ProductCell product={request.productName} billChange={request.billChange} />
      <PartyAddress party={request.sellerName} place={request.loadingPlace} address={request.loadingAddress} full={fullAddresses} />
      <PartyAddress party={request.buyerName} place={request.deliveryPlace} address={request.deliveryAddress} full={fullAddresses} />
      <td>
        {request.availableQuantityMT < request.offeredQuantityMT ? (
          <>
            {request.availableQuantityMT} MT @ ₹{request.offeredFreightPerMT}/MT
            <span className="manage-schedule-table__timestamps">
              Remaining of {request.offeredQuantityMT} MT; others accepted {request.offeredQuantityMT - request.availableQuantityMT} MT
            </span>
          </>
        ) : (
          <>{request.offeredQuantityMT} MT @ ₹{request.offeredFreightPerMT}/MT</>
        )}
        <span className="manage-schedule-table__timestamps">Notified {formatApiDateTime(request.notifiedDateTime)}</span>
      </td>
      {canRespond ? (
        <td className="manage-schedule-table__action-cell">
          {request.availableQuantityMT === 0 ? (
            <div className="manage-schedule-table__actions">
              <span className="manage-schedule-table__muted">Fully accepted by other transporters — nothing left to accept.</span>
              <span className="manage-schedule-table__buttons">
                <button type="button" className="review-assign-trucks-btn review-assign-trucks-btn--reject manage-schedule-table__icon-btn" onClick={() => submit(false)} disabled={isLoading} title="Reject" aria-label="Reject request">
                  <XIcon aria-hidden />
                </button>
              </span>
            </div>
          ) : (
            <div className="manage-schedule-table__actions">
              <label className="manage-schedule-table__input">
                <input type="text" inputMode="decimal" value={qty} onChange={(event) => setQty(event.target.value)} aria-label="Accepted quantity in MT" />
                <span>MT</span>
              </label>
              <label className="manage-schedule-table__input">
                <span>₹</span>
                <input type="text" inputMode="decimal" value={freight} onChange={(event) => setFreight(event.target.value)} aria-label="Accepted freight per MT" />
                <span>/MT</span>
              </label>
              <span className="manage-schedule-table__buttons">
                <button type="button" className="review-assign-trucks-btn review-assign-trucks-btn--accept manage-schedule-table__icon-btn" onClick={() => submit(true)} disabled={isLoading} title="Accept" aria-label="Accept request">
                  <CheckIcon aria-hidden />
                </button>
                <button type="button" className="review-assign-trucks-btn review-assign-trucks-btn--reject manage-schedule-table__icon-btn" onClick={() => submit(false)} disabled={isLoading} title="Reject" aria-label="Reject request">
                  <XIcon aria-hidden />
                </button>
              </span>
            </div>
          )}
          <input
            type="text"
            className="transporter-requests__remarks-input"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Remarks (optional)"
            maxLength={500}
            aria-label="Your remarks"
          />
          {error && <span className="manage-schedule-table__error">{error}</span>}
        </td>
      ) : (
        <td>
          <span className="review-assign-trucks-panel__status review-assign-trucks-panel__status--pending">Pending</span>
        </td>
      )}
      <td className="manage-schedule-table__remarks transporter-requests__remarks">{request.requestRemarks || "-"}</td>
    </tr>
  );
};

const TransporterRequests = ({ mode }: TransporterRequestsProps) => {
  const isOwn = mode === "transporter";
  const { data: statuses } = useGetTransporterScheduleResponseStatusesQuery();
  const pendingStatusId = statuses?.find((s) => s.statusName.toLowerCase() === "pending")?.responseStatusId ?? 1;

  const [fullAddresses, setFullAddresses] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<When, boolean>>({ today: true, upcoming: false, earlier: false });

  const pendingQuery = useGetTransporterRequestsQuery({ statusId: pendingStatusId });

  const pending = pendingQuery.data ?? [];
  const pendingControls = useColumnControls(pending, "asc");
  const today = todayKey();
  const failed = pendingQuery.isError;

  return (
    <div className="transporter-requests">
      <div className="transporter-requests__header">
        <h1>
          <TruckIcon aria-hidden /> {isOwn ? "Truck Requests" : "Transporter Requests"}
        </h1>
        <p>{isOwn ? "Requests received from FeedXchange. Accept or reject the new ones, then add trucks under Arrangement > Add Trucks to Schedules." : "Requests sent to transporters. Trucks for the accepted ones are added under Arrangement > Add Trucks to Schedules."}</p>
      </div>

      {failed && <p className="manage-schedule-table__error" role="alert">The requests could not be loaded. Please try again.</p>}

      <section className="transporter-requests__section">
        <div className="transporter-requests__section-head">
          <h2>
            New Requests <span className="transporter-requests__count">{pendingControls.shown.length}</span>
          </h2>
          <AddressToggle full={fullAddresses} onToggle={() => setFullAddresses((prev) => !prev)} />
        </div>
        {pendingQuery.isLoading ? (
          <p className="transporter-requests__empty">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="transporter-requests__empty">No new requests.</p>
        ) : (
          <div className="manage-schedule-table__wrapper">
            <table className="manage-schedule-table">
              <thead>
                <tr>
                  {!isOwn && <th>Transporter</th>}
                  <ScheduledHeader c={pendingControls} />
                  <th>Product</th>
                  <AddressHeader c={pendingControls} field="loading" label="Loading Address" />
                  <AddressHeader c={pendingControls} field="unloading" label="Unloading Address" />
                  <th>Offered</th>
                  <th>{isOwn ? "Action" : "Status"}</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {pendingControls.shown.length === 0 && (
                  <tr><td colSpan={8} className="transporter-requests__none">No requests match the column filters.</td></tr>
                )}
                {(["today", "upcoming", "earlier"] as const).map((when) => {
                  const rows = pendingControls.shown.filter((r) => whenOf(r.scheduleDateTime, today) === when);
                  if (rows.length === 0) return null;
                  return (
                    <Fragment key={when}>
                      <tr
                        className={`transporter-requests__group transporter-requests__group--${when}`}
                        onClick={() => setOpenGroups((g) => ({ ...g, [when]: !g[when] }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenGroups((g) => ({ ...g, [when]: !g[when] }));
                          }
                        }}
                        tabIndex={0}
                        aria-expanded={openGroups[when]}
                      >
                        <td colSpan={8}>
                          <span className={`transporter-requests__chevron${openGroups[when] ? " is-open" : ""}`} aria-hidden="true">▸</span>
                          {WHEN_LABEL[when]} <span className="transporter-requests__count">{rows.length}</span>
                          {when === "today" && <small>Trucks are needed today.</small>}
                          {when === "upcoming" && <small>Scheduled for a later day.</small>}
                          {when === "earlier" && <small>The scheduled day has passed and no response was given.</small>}
                        </td>
                      </tr>
                      {openGroups[when] && rows.map((request) => (
                        <PendingRow key={request.dispatchScheduleTransporterId} request={request} canRespond={isOwn} showTransporter={!isOwn} when={when} fullAddresses={fullAddresses} />
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TransporterRequests;
