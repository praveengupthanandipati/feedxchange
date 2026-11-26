import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGetNegotiationHistoryQuery, type NegotiationStep } from "../../../../core/store/scheduleNegotiationApi";
import { getErrorMessage } from "../../../../core/api/getErrorMessage";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { HistoryIcon, XIcon } from "../../../../shared/components/icon";
import { Badge, Button, Skeleton } from "../../../../shared/components/ui";
import { formatApiDateTime } from "../../../../shared/utils/apiDateTime";
import { ACTION_LABELS, ACTION_TONES, ACTOR_LABELS, mt, rupees } from "./negotiation";
import "./Negotiation.scss";

const who = (s: NegotiationStep) =>
  [ACTOR_LABELS[s.actorRole] ?? s.actorRole, s.actorCompany, s.actorName].filter(Boolean).join(" · ");

const freightText = (s: NegotiationStep) =>
  s.freightPerMT === null ? "—" : s.previousFreightPerMT !== null && s.previousFreightPerMT !== s.freightPerMT
    ? `${rupees(s.previousFreightPerMT)} → ${rupees(s.freightPerMT)}`
    : rupees(s.freightPerMT);

const columns: TableColumn<NegotiationStep>[] = [
  { key: "sequence", header: "#", width: "3rem", hideable: false },
  { key: "createdOn", header: "When", render: (s) => formatApiDateTime(s.createdOn), exportValue: (s) => formatApiDateTime(s.createdOn) },
  {
    key: "actorRole",
    header: "By",
    render: (s) => (
      <span className="bargain__who">
        <strong>{ACTOR_LABELS[s.actorRole] ?? s.actorRole}</strong>
        {(s.actorCompany || s.actorName) && <small>{[s.actorCompany, s.actorName].filter(Boolean).join(" · ")}</small>}
      </span>
    ),
    exportValue: who,
  },
  {
    key: "action",
    header: "Step",
    hideable: false,
    render: (s) => <Badge tone={ACTION_TONES[s.action] ?? "neutral"}>{ACTION_LABELS[s.action] ?? s.action}</Badge>,
    exportValue: (s) => ACTION_LABELS[s.action] ?? s.action,
  },
  { key: "quantityMT", header: "Quantity", align: "right", render: (s) => mt(s.quantityMT), exportValue: (s) => mt(s.quantityMT) },
  {
    key: "freightPerMT",
    header: "Freight / MT",
    align: "right",
    render: (s) => <span className={s.previousFreightPerMT !== null && s.previousFreightPerMT !== s.freightPerMT ? "bargain__changed" : undefined}>{freightText(s)}</span>,
    exportValue: freightText,
  },
  { key: "remarks", header: "Remarks", render: (s) => <span className="bargain__remarks">{s.remarks || "—"}</span>, exportValue: (s) => s.remarks ?? "" },
  { key: "statusDisplay", header: "Status after", priority: "low", render: (s) => s.statusDisplay ?? "—", exportValue: (s) => s.statusDisplay ?? "" },
];

/** The bargain history of one truck request, oldest step first, with where it stands now. */
export const BargainHistory = ({ dispatchScheduleTransporterId }: { dispatchScheduleTransporterId: number }) => {
  const { data, isLoading, isError, error } = useGetNegotiationHistoryQuery(dispatchScheduleTransporterId, { refetchOnMountOrArgChange: true });

  if (isLoading) return <Skeleton lines={4} />;
  if (isError || !data) return <p className="bargain__error" role="alert">{getErrorMessage(error, "The bargain history could not be loaded.")}</p>;

  const rounds = data.steps.filter((s) => s.action === "CounterProposed" || s.action === "Revised").length;
  const agreed = data.acceptedFreightPerMT;
  return (
    <div className="bargain">
      <dl className="bargain__summary">
        <div>
          <dt>Transporter</dt>
          <dd>{data.transporterName}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{data.statusDisplay}</dd>
        </div>
        <div>
          <dt>Freight now offered</dt>
          <dd>{rupees(data.offeredFreightPerMT)}/MT</dd>
        </div>
        {data.proposedFreightPerMT !== null && (
          <div>
            <dt>Transporter proposes</dt>
            <dd className="bargain__changed">{rupees(data.proposedFreightPerMT)}/MT · {mt(data.proposedQuantityMT)}</dd>
          </div>
        )}
        {agreed !== null && (
          <div>
            <dt>Agreed</dt>
            <dd>{rupees(agreed)}/MT · {mt(data.acceptedQuantityMT)}</dd>
          </div>
        )}
        <div>
          <dt>Rounds</dt>
          <dd>{rounds}</dd>
        </div>
      </dl>
      <Table
        exportName={`Bargain history - ${data.transporterName}`}
        exportSubtitle={`Request #${data.dispatchScheduleTransporterId} | ${data.statusDisplay}`}
        columns={columns}
        data={data.steps}
        rowKey={(s) => String(s.sequence)}
        emptyMessage="Nothing has happened on this request yet."
        mobileCards
      />
    </div>
  );
};

/** A small "Bargain history" button that opens the history in a dialog. */
export const BargainHistoryButton = ({ dispatchScheduleTransporterId, rounds }: { dispatchScheduleTransporterId: number; rounds?: number }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="bargain-link" onClick={() => setOpen(true)} title="Every offer, proposal and approval on this request">
        <HistoryIcon aria-hidden /> Bargain history{rounds ? ` (${rounds} round${rounds === 1 ? "" : "s"})` : ""}
      </button>
      {open &&
        createPortal(
          <div className="bargain-dialog__backdrop" onClick={() => setOpen(false)}>
            <div className="bargain-dialog" role="dialog" aria-modal="true" aria-label="Bargain history" onClick={(e) => e.stopPropagation()}>
              <header className="bargain-dialog__head">
                <h2>
                  <HistoryIcon aria-hidden /> Bargain history
                </h2>
                <Button variant="ghost" iconOnly icon={XIcon} aria-label="Close" onClick={() => setOpen(false)} />
              </header>
              <div className="bargain-dialog__body">
                <BargainHistory dispatchScheduleTransporterId={dispatchScheduleTransporterId} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
