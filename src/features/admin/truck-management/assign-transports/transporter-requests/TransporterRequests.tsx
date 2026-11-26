import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
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
import { BargainHistoryButton } from "../../negotiation/BargainHistory";
import { mt, rupees } from "../../negotiation/negotiation";
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
const PendingRow = ({ request, canRespond, showTransporter, when, fullAddresses, highlighted = false }: { request: TransporterRequest; canRespond: boolean; showTransporter: boolean; when: When; fullAddresses: boolean; highlighted?: boolean }) => {
  const [respond, { isLoading }] = useRespondToTransporterRequestMutation();
  const notify = useNotifyPrompt();
  const [qty, setQty] = useState(String(request.availableQuantityMT));
  const [freight, setFreight] = useState(request.offeredFreightPerMT > 0 ? String(request.offeredFreightPerMT) : "");
  // a revised freight (bargaining) changes what is offered: start from the new figure
  useEffect(() => {
    setFreight(request.offeredFreightPerMT > 0 ? String(request.offeredFreightPerMT) : "");
  }, [request.offeredFreightPerMT]);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  // a freight other than the one offered is a counter-offer (it waits for approval) rather than an acceptance
  const isCounter = freight.trim() !== "" && Number(freight) > 0 && Number(freight) !== request.offeredFreightPerMT;

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
      // An acceptance and a counter-offer are told to the admins and whoever created the schedule by the server, straight away.
      // A rejection still asks whom to tell, as before.
      if (!accept) {
        notify.ask({
          eventCode: "TRANSPORTER_REJECTED",
          title: "Notify about this rejection",
          sourceEntityType: "DispatchScheduleTransporter",
          sourceEntityId: request.dispatchScheduleTransporterId,
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not save your response. Please try again."));
    }
  };

  return (
    <tr
      id={`transporter-request-${request.dispatchScheduleTransporterId}`}
      className={`transporter-requests__row transporter-requests__row--${when}${highlighted ? " is-highlighted" : ""}`}
    >
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
        {(request.negotiationRounds ?? 0) > 0 && (
          <BargainHistoryButton dispatchScheduleTransporterId={request.dispatchScheduleTransporterId} rounds={request.negotiationRounds} />
        )}
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
                <button type="button" className="review-assign-trucks-btn review-assign-trucks-btn--accept manage-schedule-table__icon-btn" onClick={() => submit(true)} disabled={isLoading} title={isCounter ? "Send counter-offer" : "Accept"} aria-label={isCounter ? "Send counter-offer" : "Accept request"}>
                  <CheckIcon aria-hidden />
                </button>
                <button type="button" className="review-assign-trucks-btn review-assign-trucks-btn--reject manage-schedule-table__icon-btn" onClick={() => submit(false)} disabled={isLoading} title="Reject" aria-label="Reject request">
                  <XIcon aria-hidden />
                </button>
              </span>
            </div>
          )}
          {isCounter && (
            <span className="transporter-requests__counter-note">
              {request.offeredFreightPerMT > 0
                ? <>Counter-offer: {rupees(Number(freight))}/MT instead of {rupees(request.offeredFreightPerMT)}/MT goes to FeedXchange for approval. You can add trucks once it is approved.</>
                : <>Your freight of {rupees(Number(freight))}/MT goes to FeedXchange for approval. You can add trucks once it is approved.</>}
            </span>
          )}
          {!isCounter && request.offeredFreightPerMT <= 0 && (
            <span className="transporter-requests__counter-note">No freight was set for this request. Enter your freight per MT to accept it.</span>
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
  // Counter-offers waiting for FeedXchange / the requester to approve (freight bargaining)
  const proposedStatusId = statuses?.find((s) => s.statusName.toLowerCase() === "freightproposed")?.responseStatusId;
  const proposedQuery = useGetTransporterRequestsQuery({ statusId: proposedStatusId ?? -1 }, { skip: proposedStatusId === undefined });
  const awaiting = proposedQuery.data ?? [];

  const pending = pendingQuery.data ?? [];
  const pendingControls = useColumnControls(pending, "asc");
  const today = todayKey();
  const failed = pendingQuery.isError;

  // Opened from Schedules Management with ?request=<id>: open that request's group, bring it into view and mark it for a moment.
  const [searchParams] = useSearchParams();
  const focusId = Number(searchParams.get("request")) || 0;
  const [highlightId, setHighlightId] = useState(0);
  const [focusMissing, setFocusMissing] = useState(false);
  const focusedFor = useRef(0);
  useEffect(() => {
    if (!focusId || focusedFor.current === focusId || !pendingQuery.data) return;
    focusedFor.current = focusId;
    const target = pendingQuery.data.find((r) => r.dispatchScheduleTransporterId === focusId);
    if (!target) {
      setFocusMissing(true);
      return;
    }
    setFocusMissing(false);
    setOpenGroups((g) => ({ ...g, [whenOf(target.scheduleDateTime, today)]: true }));
    setHighlightId(focusId);
    // After the group has rendered its rows. Not cancelled on a re-render: a refetch must not leave the row marked for good.
    window.setTimeout(() => {
      document.getElementById(`transporter-request-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    window.setTimeout(() => setHighlightId(0), 4000);
  }, [focusId, pendingQuery.data, today]);

  return (
    <div className="transporter-requests">
      <div className="transporter-requests__header">
        <h1>
          <TruckIcon aria-hidden /> {isOwn ? "Truck Requests" : "Transporter Requests"}
        </h1>
        <p>{isOwn ? "Requests received from FeedXchange. Accept or reject the new ones, then add trucks under Schedules Management > Add Trucks to Schedules." : "Requests sent to transporters. Trucks for the accepted ones are added under Schedules Management > Add Trucks to Schedules."}</p>
      </div>

      {failed && <p className="manage-schedule-table__error" role="alert">The requests could not be loaded. Please try again.</p>}
      {focusMissing && (
        <p className="transporter-requests__notice" role="status">
          The request you opened is no longer awaiting a response: it has been answered, has expired or was cancelled. See Schedules Management for where it stands.
        </p>
      )}

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
                        <PendingRow key={request.dispatchScheduleTransporterId} request={request} canRespond={isOwn} showTransporter={!isOwn} when={when} fullAddresses={fullAddresses} highlighted={highlightId === request.dispatchScheduleTransporterId} />
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {awaiting.length > 0 && (
        <section className="transporter-requests__section" aria-label="Awaiting approval">
          <div className="transporter-requests__section-head">
            <h2>
              Awaiting Approval <span className="transporter-requests__count">{awaiting.length}</span>
            </h2>
          </div>
          <p className="transporter-requests__empty">
            {isOwn
              ? "Your counter-offers. FeedXchange or the requester will approve them or send a revised freight; a revised request comes back under New Requests."
              : "Counter-offers from transporters, waiting for FeedXchange or the requester. Approve or revise them on the contract's Manage Schedule screen."}
          </p>
          <div className="manage-schedule-table__wrapper">
            <table className="manage-schedule-table">
              <thead>
                <tr>
                  {!isOwn && <th>Transporter</th>}
                  <th>Scheduled</th>
                  <th>Product</th>
                  <th>Route</th>
                  <th>Offered</th>
                  <th>{isOwn ? "Your proposal" : "Proposal"}</th>
                  <th>Proposed on</th>
                </tr>
              </thead>
              <tbody>
                {awaiting.map((r) => (
                  <tr key={r.dispatchScheduleTransporterId}>
                    {!isOwn && <td>{r.transporterName}</td>}
                    <td>{formatApiDateTime(r.scheduleDateTime)}</td>
                    <td>{r.productName ?? "-"}</td>
                    <td>
                      {r.sellerName} → {r.buyerName}
                      <span className="manage-schedule-table__timestamps">{[r.loadingPlace, r.deliveryPlace].filter(Boolean).join(" → ")}</span>
                    </td>
                    <td>
                      {mt(r.offeredQuantityMT)} @ {rupees(r.offeredFreightPerMT)}/MT
                    </td>
                    <td>
                      <strong>
                        {mt(r.proposedQuantityMT)} @ {rupees(r.proposedFreightPerMT)}/MT
                      </strong>
                      <span className="review-assign-trucks-panel__status review-assign-trucks-panel__status--pending">Awaiting approval</span>
                      <BargainHistoryButton dispatchScheduleTransporterId={r.dispatchScheduleTransporterId} rounds={r.negotiationRounds} />
                    </td>
                    <td>{formatApiDateTime(r.responseDateTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default TransporterRequests;
