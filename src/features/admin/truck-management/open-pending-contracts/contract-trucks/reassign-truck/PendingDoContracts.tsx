import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  useEnterDeliveryOrderMutation,
  useGetDoContractsQuery,
  type DoContract,
  type DoTruck,
} from "../../../../../../core/store/truckDeliveryOrdersApi";
import { getErrorMessage } from "../../../../../../core/api/getErrorMessage";
import { useBusinessFilter } from "../../../../common/business-period/useBusinessFilter";
import SearchableSelectField from "../../../../../../shared/components/dropdown/SearchableSelectField";
import { CircleAlertIcon, CircleCheckBigIcon, FileTextIcon, RefreshCwIcon, SearchIcon, TruckIcon, XIcon } from "../../../../../../shared/components/icon";
import { Badge, Button, Card, EmptyState, Input, Skeleton } from "../../../../../../shared/components/ui";
import { formatDate, formatDateTime, formatQty } from "../../../../business-dashboard/businessDashboard.utils";
import "./PendingDoContracts.scss";

type Tab = "pending" | "issued";

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const matches = (needle: string, ...values: (string | null | undefined)[]) =>
  !needle || values.some((value) => value?.toLowerCase().includes(needle));

const reassignPath = (contractNumber: string, truck: DoTruck) =>
  `/admin/truck-management/open-pending-contracts/reassign-truck?contract=${encodeURIComponent(contractNumber)}&contractTruckId=${truck.contractDispatchId}`;

// ---------------------------------------------------------------- the DO dialog

interface DoDialogProps {
  contract: DoContract;
  truck: DoTruck;
  onClose: () => void;
  onDone: (message: string) => void;
}

const DoDialog = ({ contract, truck, onClose, onDone }: DoDialogProps) => {
  const [doNumber, setDoNumber] = useState("");
  const [doDate, setDoDate] = useState(todayIso());
  const [doMessage, setDoMessage] = useState("");
  const [error, setError] = useState("");
  const [enterDo, { isLoading }] = useEnterDeliveryOrderMutation();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && !isLoading && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, isLoading]);

  const submit = async () => {
    if (!doNumber.trim()) return setError("Enter the DO number.");
    if (!doDate) return setError("Enter the DO date.");
    setError("");
    try {
      const result = await enterDo({ contractDispatchId: truck.contractDispatchId, doNumber: doNumber.trim(), doDate, doMessage: doMessage.trim() || undefined }).unwrap();
      const where = result.legsUpdated > 1 ? ` It was copied to all ${result.legsUpdated} contracts of this truck (${result.contracts.join(", ")}).` : "";
      onDone(`DO ${result.doNumber} entered for truck ${truck.truckNumber}.${where} The transporter and FeedXchange have been notified.`);
    } catch (err) {
      setError(getErrorMessage(err, "The DO could not be saved. Please try again."));
    }
  };

  return createPortal(
    <div className="pdo-backdrop" onClick={() => !isLoading && onClose()}>
      <div className="pdo-dialog" role="dialog" aria-modal="true" aria-labelledby="pdo-dialog-title" onClick={(event) => event.stopPropagation()}>
        <div className="pdo-dialog__head">
          <h2 id="pdo-dialog-title">Enter DO</h2>
          <button type="button" className="pdo-dialog__close" aria-label="Close" onClick={onClose} disabled={isLoading}>
            <XIcon size={18} aria-hidden />
          </button>
        </div>
        <p className="pdo-dialog__summary">
          Truck <strong>{truck.truckNumber}</strong> · Contract <strong>{contract.contractNumber}</strong> · {contract.productName} · {formatQty(truck.quantityMT)} MT
        </p>
        {truck.chainLegs > 1 && (
          <p className="pdo-dialog__note" role="note">
            This truck serves {truck.chainLegs} contracts. The DO is copied to every one of them.
          </p>
        )}
        <div className="pdo-dialog__fields">
          <Input label="DO number *" value={doNumber} onChange={(event) => setDoNumber(event.target.value)} maxLength={50} autoFocus />
          <Input label="DO date *" type="date" value={doDate} max={todayIso()} onChange={(event) => setDoDate(event.target.value)} />
          <label className="pdo-dialog__message">
            <span>Message (optional)</span>
            <textarea value={doMessage} onChange={(event) => setDoMessage(event.target.value)} maxLength={500} rows={3} placeholder="Anything the transporter or the yard should know" />
          </label>
        </div>
        {error && (
          <p className="pdo-dialog__error" role="alert">
            <CircleAlertIcon size={16} aria-hidden /> {error}
          </p>
        )}
        <div className="pdo-dialog__actions">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={isLoading}>
            Save DO
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ---------------------------------------------------------------- one contract

interface ContractCardProps {
  contract: DoContract;
  tab: Tab;
  onEnterDo: (contract: DoContract, truck: DoTruck) => void;
}

const ContractCard = ({ contract, tab, onEnterDo }: ContractCardProps) => (
  <Card
    className="pdo-contract"
    title={
      <span className="pdo-contract__title">
        <Link to={`/admin/contracts/${encodeURIComponent(contract.contractNumber)}`} className="pdo-link">
          {contract.contractNumber}
        </Link>
        <Badge tone="neutral">{formatDate(contract.contractDate)}</Badge>
      </span>
    }
    actions={
      <span className="pdo-muted">
        {contract.trucks.length} truck{contract.trucks.length === 1 ? "" : "s"} {tab === "pending" ? "without a DO" : "with a DO"}
      </span>
    }
  >
    <p className="pdo-contract__meta">
      <span>
        <span className="pdo-muted">Buyer</span> {contract.buyer || "—"}
      </span>
      <span>
        <span className="pdo-muted">Product</span> {contract.productName || "—"}
      </span>
      <span>
        <span className="pdo-muted">Contract quantity</span> {formatQty(contract.totalQuantityMT)} MT
      </span>
    </p>

    <div className="pdo-table-wrap">
      <table className="pdo-table">
        <thead>
          <tr>
            <th>Truck</th>
            <th>Driver</th>
            <th>Transporter</th>
            <th className="is-num">Qty (MT)</th>
            <th>Route</th>
            <th>Assigned</th>
            {tab === "issued" && <th>DO</th>}
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {contract.trucks.map((truck) => (
            <tr key={truck.contractDispatchId}>
              <td>
                <strong>{truck.truckNumber || "—"}</strong>
                <small>
                  {[truck.truckType, truck.lrNumber ? `LR ${truck.lrNumber}` : null].filter(Boolean).join(" · ")}
                </small>
                {truck.chainLegs > 1 && (
                  <Badge tone="info" title="This truck serves more than one contract (re-assigned)">
                    {truck.isReassigned ? "Re-assigned" : "Re-assigned onwards"} · {truck.chainLegs} contracts
                  </Badge>
                )}
              </td>
              <td>
                {truck.driverName || "—"}
                {truck.driverMobile && <small>{truck.driverMobile}</small>}
              </td>
              <td>{truck.transporter || "—"}</td>
              <td className="is-num">{formatQty(truck.quantityMT)}</td>
              <td>{truck.fromCity || truck.toCity ? `${truck.fromCity ?? "—"} → ${truck.toCity ?? "—"}` : "—"}</td>
              <td>{formatDateTime(truck.assignedOn)}</td>
              {tab === "issued" && (
                <td>
                  <strong>{truck.doNumber}</strong>
                  <small>{truck.doDate ? formatDate(truck.doDate) : ""}</small>
                  {truck.doMessage && <small>{truck.doMessage}</small>}
                </td>
              )}
              <td className="is-actions">
                {tab === "pending" && (
                  <>
                    <Button size="sm" variant="primary" icon={FileTextIcon} onClick={() => onEnterDo(contract, truck)}>
                      Enter DO
                    </Button>
                    <Link to={reassignPath(contract.contractNumber, truck)} className="pdo-reassign" title="Move this truck onto another contract where you are the buyer of the same product">
                      <TruckIcon size={16} aria-hidden /> Re-assign
                    </Link>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ---------------------------------------------------------------- page

/**
 * Re-assign Truck, without a truck picked: the seller's contracts that have trucks assigned but no Delivery Order (DO) yet, contract by contract.
 * For each truck the seller can enter the DO (it is copied to every leg of the truck's re-assignment chain, and the transporter and FeedXchange are
 * told) or re-assign the truck to another contract where they are the buyer of the same product.
 */
const PendingDoContracts = () => {
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{ contract: DoContract; truck: DoTruck } | null>(null);
  const [notice, setNotice] = useState("");

  const business = useBusinessFilter();
  const query = useGetDoContractsQuery({ issued: tab === "issued" }, { refetchOnMountOrArgChange: true });

  const contracts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (query.data ?? [])
      .filter((c) => business.matches(c.sellerId, null))
      .filter(
        (c) =>
          matches(needle, c.contractNumber, c.buyer, c.productName) ||
          c.trucks.some((t) => matches(needle, t.truckNumber, t.transporter, t.driverName, t.lrNumber)),
      );
  }, [query.data, search, business]);

  const truckCount = contracts.reduce((sum, c) => sum + c.trucks.length, 0);

  const businessOptions = [
    { value: "all", label: "All" },
    ...business.options.map((o) => ({ value: String(o.profileId), label: `${o.name}${o.city ? ` (${o.city})` : ""}${o.isOwn ? " – your business" : ""}` })),
  ];

  let body: React.ReactNode;
  if (query.isError) {
    body = (
      <EmptyState
        icon={CircleAlertIcon}
        title="The contracts could not be loaded"
        description={getErrorMessage(query.error, "Please try again in a moment.")}
        action={<Button onClick={() => query.refetch()}>Try again</Button>}
      />
    );
  } else if (query.isLoading) {
    body = (
      <Card>
        <Skeleton lines={6} />
      </Card>
    );
  } else if (contracts.length === 0) {
    body = (
      <EmptyState
        icon={CircleCheckBigIcon}
        title={tab === "pending" ? "No trucks are waiting for a DO" : "No DOs entered yet"}
        description={
          tab === "pending"
            ? "Every truck assigned to your contracts as seller already has its DO, or none has been assigned yet."
            : "DOs you enter will be listed here, contract by contract."
        }
      />
    );
  } else {
    body = (
      <div className="pdo-list">
        {contracts.map((contract) => (
          <ContractCard key={contract.contractId} contract={contract} tab={tab} onEnterDo={(c, t) => setDialog({ contract: c, truck: t })} />
        ))}
      </div>
    );
  }

  return (
    <div className="pending-do">
      <div className="pending-do__toolbar">
        <div className="pending-do__tabs" role="tablist" aria-label="DO status">
          {(["pending", "issued"] as const).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} className={`pending-do__tab ${tab === key ? "is-active" : ""}`} onClick={() => setTab(key)}>
              {key === "pending" ? "DO pending" : "DO entered"}
            </button>
          ))}
        </div>
        <div className="pending-do__filters">
          {business.options.length > 1 && <SearchableSelectField label="Business" value={business.value} onChange={business.setValue} options={businessOptions} />}
          <Input icon={SearchIcon} type="search" placeholder="Contract, buyer, product, truck, transporter…" aria-label="Search contracts and trucks" value={search} onChange={(event) => setSearch(event.target.value)} fieldClassName="pending-do__search" />
          <Button iconOnly icon={RefreshCwIcon} aria-label="Refresh" title="Refresh" onClick={() => query.refetch()} loading={query.isFetching && !query.isLoading} />
        </div>
      </div>

      {notice && (
        <p className="pending-do__notice" role="status">
          <CircleCheckBigIcon size={18} aria-hidden /> {notice}
          <button type="button" className="pending-do__notice-close" aria-label="Dismiss" onClick={() => setNotice("")}>
            <XIcon size={16} aria-hidden />
          </button>
        </p>
      )}

      {!query.isLoading && !query.isError && contracts.length > 0 && (
        <p className="pdo-muted pending-do__count">
          {contracts.length} contract{contracts.length === 1 ? "" : "s"} · {truckCount} truck{truckCount === 1 ? "" : "s"}
        </p>
      )}

      {body}

      {dialog && (
        <DoDialog
          contract={dialog.contract}
          truck={dialog.truck}
          onClose={() => setDialog(null)}
          onDone={(message) => {
            setDialog(null);
            setNotice(message);
          }}
        />
      )}
    </div>
  );
};

export default PendingDoContracts;
