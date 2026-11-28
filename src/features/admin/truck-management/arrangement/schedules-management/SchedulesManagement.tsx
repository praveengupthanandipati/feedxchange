import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ChangeEvent, ReactNode } from "react";
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BanIcon,
  BoxIcon,
  CalendarIcon,
  ChevronDownIcon,
  CircleCheckBigIcon,
  CircleMinusIcon,
  CirclePauseIcon,
  Columns3Icon,
  DownloadIcon,
  CircleXIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HistoryIcon,
  InboxIcon,
  LayersIcon,
  LayoutGridIcon,
  MapPinIcon,
  MessageSquareIcon,
  PackageIcon,
  ReceiptIcon,
  RefreshCwIcon,
  RouteIcon,
  SearchIcon,
  SendIcon,
  TrendingUpIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "../../../../../shared/components/icon";
import { useAuth } from "../../../../../core/auth/AuthContext";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";
import { formatApiDateTime, parseApiDateTime } from "../../../../../shared/utils/apiDateTime";
import { useGetScheduleDashboardQuery, type ScheduleDashboardRow } from "../../../../../core/store/transporterRequestsApi";
import FilterDropdown, { type FilterOption } from "./FilterDropdown";
import { DATE_PRESETS, dayKey, presetRange, shortDate, type DatePreset, type Period } from "../periods";
import { BargainHistoryButton } from "../../negotiation/BargainHistory";
import "./SchedulesManagement.scss";

// ------------------------------------------------------------------------------------------------ vocabulary

type ResponseKey = "Pending" | "FreightProposed" | "Accepted" | "PartiallyAccepted" | "Rejected" | "Expired" | "Cancelled";
type Icon = typeof TruckIcon;
const RESPONSES: { key: ResponseKey; label: string; icon: Icon }[] = [
  { key: "Pending", label: "Awaiting response", icon: ClockIcon },
  // freight bargaining: the transporter proposed a different freight; feedXchange or the requester must approve or revise it
  { key: "FreightProposed", label: "Freight awaiting approval", icon: CirclePauseIcon },
  { key: "Accepted", label: "Accepted", icon: CircleCheckBigIcon },
  { key: "PartiallyAccepted", label: "Partly accepted", icon: CircleMinusIcon },
  { key: "Rejected", label: "Rejected", icon: CircleXIcon },
  { key: "Expired", label: "Expired", icon: HistoryIcon },
  { key: "Cancelled", label: "Cancelled", icon: BanIcon },
];
const responseLabel = (key: string) => RESPONSES.find((r) => r.key === key)?.label ?? key;
const isAccepted = (row: ScheduleDashboardRow) => row.responseStatus === "Accepted" || row.responseStatus === "PartiallyAccepted";


/** The period the schedules are loaded for (by schedule date). The server returns only that period. */
const DEFAULT_PRESET: DatePreset = "thisMonth";

type TruckFilter = "any" | "onTheWay" | "loaded" | "none";
/** The Trucks dropdown. */
const TRUCK_OPTIONS: FilterOption<TruckFilter>[] = [
  { value: "any", label: "Any", hint: "All requests, with or without trucks", icon: LayersIcon },
  { value: "onTheWay", label: "On the way", hint: "Requests with a truck on the way (assigned, not loaded yet)", icon: TruckIcon },
  { value: "loaded", label: "Loaded", hint: "Requests with a loaded truck", icon: BoxIcon },
  { value: "none", label: "No trucks", hint: "Requests without any truck", icon: CirclePauseIcon },
];
type SortKey = "soonest" | "latest" | "mostLeft";

const mt = (value: number) => `${Math.round(value * 1000) / 1000} MT`;
const scheduleDay = (row: ScheduleDashboardRow) => {
  const d = parseApiDateTime(row.request.scheduleDateTime);
  return d ? dayKey(d) : row.request.scheduleDateTime.slice(0, 10);
};
const PAGE_SIZE = 20;

// ------------------------------------------------------------------------------------------------ filters

interface Filters {
  search: string;
  /** One response at a time; null = every response. */
  response: ResponseKey | null;
  /** Set by the "Left to arrange" tile: only accepted requests that still need trucks (none yet, or partly arranged). */
  needsTrucksOnly: boolean;
  product: string;
  transporter: string;
  trucks: TruckFilter;
  billChangeOnly: boolean;
}
const EMPTY_FILTERS: Filters = {
  search: "",
  response: null,
  needsTrucksOnly: false,
  product: "",
  transporter: "",
  trucks: "any",
  billChangeOnly: false,
};

// The schedule date is filtered on the server (the period); everything else here, on what was loaded.
const matches = (row: ScheduleDashboardRow, f: Filters, showTransporter: boolean) => {
  const r = row.request;
  if (f.response && row.responseStatus !== f.response) return false;
  if (f.needsTrucksOnly && row.leftToAssignMT <= 0) return false;
  if (f.product && (r.productName ?? "") !== f.product) return false;
  if (showTransporter && f.transporter && r.transporterName !== f.transporter) return false;
  if (f.billChangeOnly && !r.billChange) return false;
  const live = row.trucks.filter((t) => !t.cancelled);
  if (f.trucks === "onTheWay" && !live.some((t) => t.status === "Assigned")) return false;
  if (f.trucks === "loaded" && !live.some((t) => t.status === "Loaded")) return false;
  if (f.trucks === "none" && live.length > 0) return false;
  const term = f.search.trim().toLowerCase();
  if (term) {
    const haystack = [
      r.productName, r.sellerName, r.buyerName, r.loadingAddress, r.deliveryAddress, r.loadingPlace, r.deliveryPlace,
      r.requestRemarks, r.responseRemarks, showTransporter ? r.transporterName : null, row.contractNumber,
      ...live.flatMap((t) => [t.truckNumber, t.driverName, t.driverPhone, t.lrNumber]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  return true;
};

const activeFilterCount = (f: Filters, showTransporter: boolean) =>
  [
    f.search.trim() !== "",
    f.response !== null,
    f.needsTrucksOnly,
    f.product !== "",
    showTransporter && f.transporter !== "",
    f.trucks !== "any",
    f.billChangeOnly,
  ].filter(Boolean).length;

// ------------------------------------------------------------------------------------------------ pieces

/** A dropdown with an icon in front (native options cannot carry icons, so the icon sits in the closed box). */
const IconSelect = ({ icon: Glyph, label, value, onChange, children, wide = false }: { icon: Icon; label: string; value: string; onChange: (value: string) => void; children: ReactNode; wide?: boolean }) => (
  <label className={`schedules-mgmt__icon-select${wide ? " schedules-mgmt__icon-select--wide" : ""}`}>
    <Glyph aria-hidden className="schedules-mgmt__icon-select-lead" />
    <span className="schedules-mgmt__sr-only">{label}</span>
    <select value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}>{children}</select>
    <ChevronDownIcon aria-hidden className="schedules-mgmt__icon-select-caret" />
  </label>
);

/** Column heading with a small icon. */
const Th = ({ icon: Glyph, children }: { icon: Icon; children: ReactNode }) => (
  <th>
    <span className="schedules-mgmt__th"><Glyph aria-hidden />{children}</span>
  </th>
);

const ResponseChip = ({ status }: { status: string }) => {
  const Glyph = RESPONSES.find((r) => r.key === status)?.icon ?? InboxIcon;
  return (
    <span className={`schedules-mgmt__chip schedules-mgmt__chip--${status.toLowerCase()}`}>
      <Glyph aria-hidden />
      {responseLabel(status)}
    </span>
  );
};

/** Loaded / on the way / left, as one bar. */
const ArrangementBar = ({ row }: { row: ScheduleDashboardRow }) => {
  const total = row.committedQuantityMT;
  if (total <= 0) return <span className="schedules-mgmt__muted">—</span>;
  const pct = (v: number) => `${Math.min(100, (v / total) * 100)}%`;
  return (
    <div className="schedules-mgmt__arrangement">
      <div className="schedules-mgmt__bar" role="img" aria-label={`${mt(row.loadedQuantityMT)} loaded, ${mt(row.assignedQuantityMT)} on trucks, ${mt(row.leftToAssignMT)} left of ${mt(total)}`}>
        <span className="is-loaded" style={{ width: pct(row.loadedQuantityMT) }} />
        <span className="is-assigned" style={{ width: pct(row.assignedQuantityMT) }} />
      </div>
      <span className="schedules-mgmt__arrangement-text">
        {mt(row.assignedQuantityMT + row.loadedQuantityMT)} of {mt(total)}
        {row.leftToAssignMT > 0 && <em> · {mt(row.leftToAssignMT)} left</em>}
      </span>
    </div>
  );
};

interface StatProps {
  icon: typeof TruckIcon;
  label: string;
  value: string;
  hint: string;
  tone: "navy" | "orange" | "green" | "sky" | "red";
  active?: boolean;
  onClick?: () => void;
}
const Stat = ({ icon: Icon, label, value, hint, tone, active, onClick }: StatProps) => (
  <button
    type="button"
    className={`schedules-mgmt__stat schedules-mgmt__stat--${tone}${active ? " is-active" : ""}`}
    onClick={onClick}
    disabled={!onClick}
    aria-pressed={onClick ? Boolean(active) : undefined}
  >
    <span className="schedules-mgmt__stat-icon"><Icon aria-hidden /></span>
    <span className="schedules-mgmt__stat-body">
      <span className="schedules-mgmt__stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </span>
  </button>
);

/** The trucks and remarks of one request, shown when its row is opened. */
const RowDetail = ({ row, isTransporter, colSpan }: { row: ScheduleDashboardRow; isTransporter: boolean; colSpan: number }) => {
  const r = row.request;
  const trucks = row.trucks.filter((t) => !t.cancelled);
  const cancelled = row.trucks.length - trucks.length;
  return (
    <tr className="schedules-mgmt__detail-row">
      <td colSpan={colSpan}>
        <div className="schedules-mgmt__detail">
          <div className="schedules-mgmt__detail-main">
            <h3>Trucks <span className="schedules-mgmt__count">{trucks.length}</span></h3>
            {trucks.length === 0 ? (
              <p className="schedules-mgmt__muted">{isAccepted(row) ? "No trucks added yet." : "Trucks are added once the request is accepted."}</p>
            ) : (
              <div className="schedules-mgmt__table-wrap">
                <table className="schedules-mgmt__trucks">
                  <thead>
                    <tr>
                      <Th icon={TruckIcon}>Truck</Th>
                      <Th icon={UserIcon}>Driver</Th>
                      <Th icon={PackageIcon}>Quantity</Th>
                      <Th icon={FileTextIcon}>LR number</Th>
                      <Th icon={ActivityIcon}>Status</Th>
                      <Th icon={MapPinIcon}>Tracking</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map((t) => (
                      <tr key={t.contractDispatchId}>
                        <td><b>{t.truckNumber ?? "-"}</b></td>
                        <td>{t.driverName ?? "-"}{t.driverPhone && <span className="schedules-mgmt__muted"> · {t.driverPhone}</span>}</td>
                        <td>{mt(t.quantityMT)}</td>
                        <td>{t.lrNumber || "-"}</td>
                        <td>
                          <span className={`schedules-mgmt__chip schedules-mgmt__chip--truck-${t.status.toLowerCase()}`}>
                            {t.status === "Loaded" ? <CircleCheckBigIcon aria-hidden /> : <TruckIcon aria-hidden />}
                            {t.status === "Assigned" ? "On the way" : t.status}
                          </span>
                        </td>
                        <td>
                          {t.trackingUrl ? (
                            <a href={t.trackingUrl} target="_blank" rel="noreferrer" className="schedules-mgmt__link">
                              Track <ExternalLinkIcon aria-hidden />
                            </a>
                          ) : (
                            <span className="schedules-mgmt__muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {cancelled > 0 && <p className="schedules-mgmt__muted">{cancelled} deleted / cancelled {cancelled === 1 ? "truck is" : "trucks are"} not shown.</p>}
          </div>

          <dl className="schedules-mgmt__facts">
            <div><dt><MapPinIcon aria-hidden /> Loading at</dt><dd>{r.loadingAddress || "-"}</dd></div>
            <div><dt><MapPinIcon aria-hidden /> Delivery at</dt><dd>{r.deliveryAddress || "-"}</dd></div>
            <div><dt><SendIcon aria-hidden /> Requested</dt><dd>{r.notifiedDateTime ? formatApiDateTime(r.notifiedDateTime) : "-"}</dd></div>
            <div><dt><InboxIcon aria-hidden /> Responded</dt><dd>{r.responseDateTime ? formatApiDateTime(r.responseDateTime) : "-"}</dd></div>
            {r.requestRemarks && <div><dt><MessageSquareIcon aria-hidden /> feedXchange remarks</dt><dd>{r.requestRemarks}</dd></div>}
            {r.responseRemarks && <div><dt><MessageSquareIcon aria-hidden /> Transporter remarks</dt><dd>{r.responseRemarks}</dd></div>}
            {(r.cancelledQuantityMT ?? 0) > 0 && <div><dt><BanIcon aria-hidden /> Cancelled quantity</dt><dd>{mt(r.cancelledQuantityMT ?? 0)}</dd></div>}
          </dl>

          {isTransporter && (
            <div className="schedules-mgmt__detail-actions">
              {row.responseStatus === "Pending" && (
                <Link to="/admin/truck-management/assign-transports" className="schedules-mgmt__btn schedules-mgmt__btn--primary">
                  Accept or reject in View Schedules
                </Link>
              )}
              {isAccepted(row) && (row.leftToAssignMT > 0 || trucks.some((t) => t.editable)) && (
                <Link to="/admin/truck-management/arrangement/add-trucks-to-schedules" className="schedules-mgmt__btn schedules-mgmt__btn--primary">
                  <TruckIcon aria-hidden /> {row.leftToAssignMT > 0 ? "Add or edit trucks" : "Edit trucks"}
                </Link>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// ------------------------------------------------------------------------------------------------ page

/**
 * Transporters > Schedules Management: every truck request (any response), how much was accepted, and how far the truck arrangement
 * has got, with the trucks themselves. A transporter sees its own requests; feedXchange staff see every transporter's (and the contract).
 */
const SchedulesManagement = () => {
  const { roleName, businessUnitType } = useAuth();
  const isTransporter = `${roleName} ${businessUnitType}`.toLowerCase().includes("transport");
  const showTransporter = !isTransporter;

  const navigate = useNavigate();

  // The period decides what is loaded from the server; it opens on This Month.
  const [period, setPeriod] = useState<Period>(() => {
    const [from, to] = presetRange(DEFAULT_PRESET);
    return { preset: DEFAULT_PRESET, from, to };
  });
  const [rangeFrom, rangeTo] = period.preset === "custom" ? [period.from, period.to] : presetRange(period.preset);
  const customInvalid = period.preset === "custom" && (!rangeFrom || !rangeTo || rangeFrom > rangeTo);
  const choosePreset = (preset: DatePreset) => {
    // Custom starts from the period shown so far, so the list does not jump.
    setPeriod((p) => (preset === "custom" ? { preset, from: rangeFrom, to: rangeTo } : { ...p, preset }));
    setShown(PAGE_SIZE);
    setOpenId(null);
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useGetScheduleDashboardQuery(
    { from: rangeFrom, to: rangeTo },
    { refetchOnMountOrArgChange: true, skip: customInvalid },
  );
  const rows = useMemo(() => data ?? [], [data]);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("soonest");
  const [openId, setOpenId] = useState<number | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  const set = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setShown(PAGE_SIZE);
  };
  // Single choice: picking a response shows only that one; picking the selected one again shows them all.
  const toggleResponse = (key: ResponseKey) => set({ response: filters.response === key ? null : key });

  const products = useMemo(() => [...new Set(rows.map((r) => r.request.productName).filter(Boolean) as string[])].sort(), [rows]);
  const transporters = useMemo(() => [...new Set(rows.map((r) => r.request.transporterName))].sort(), [rows]);
  // The chosen product / transporter stays in its list after a period change that has none of it, so the box never claims "All".
  const productOptions = useMemo<FilterOption<string>[]>(() => {
    const names = filters.product && !products.includes(filters.product) ? [...products, filters.product] : products;
    return [{ value: "", label: "All products", icon: LayersIcon }, ...names.map((p) => ({ value: p, label: p, icon: PackageIcon }))];
  }, [products, filters.product]);
  const transporterOptions = useMemo<FilterOption<string>[]>(() => {
    const names = filters.transporter && !transporters.includes(filters.transporter) ? [...transporters, filters.transporter] : transporters;
    return [{ value: "", label: "All transporters", icon: LayersIcon }, ...names.map((t) => ({ value: t, label: t, icon: UsersIcon }))];
  }, [transporters, filters.transporter]);

  const filtered = useMemo(() => {
    const list = rows.filter((r) => matches(r, filters, showTransporter));
    const byDate = (a: ScheduleDashboardRow, b: ScheduleDashboardRow) => a.request.scheduleDateTime.localeCompare(b.request.scheduleDateTime);
    if (sort === "latest") return list.sort((a, b) => byDate(b, a));
    if (sort === "mostLeft") return list.sort((a, b) => b.leftToAssignMT - a.leftToAssignMT || byDate(a, b));
    return list.sort(byDate);
  }, [rows, filters, showTransporter, sort]);

  // Figures for what is on screen (after the filters), so the tiles always describe the list below them.
  const totals = useMemo(() => {
    const t = { requests: filtered.length, schedules: new Set<number>(), pending: 0, pendingMT: 0, committed: 0, assigned: 0, loaded: 0, left: 0, leftRequests: 0, onTheWay: 0, loadedTrucks: 0, byResponse: {} as Record<string, number> };
    for (const row of filtered) {
      t.schedules.add(row.request.dispatchScheduleId);
      t.byResponse[row.responseStatus] = (t.byResponse[row.responseStatus] ?? 0) + 1;
      if (row.responseStatus === "Pending") {
        t.pending += 1;
        t.pendingMT += row.request.availableQuantityMT;
      }
      t.committed += row.committedQuantityMT;
      t.assigned += row.assignedQuantityMT;
      t.loaded += row.loadedQuantityMT;
      t.left += row.leftToAssignMT;
      if (row.leftToAssignMT > 0) t.leftRequests += 1;
      for (const truck of row.trucks) {
        if (truck.cancelled) continue;
        if (truck.status === "Assigned") t.onTheWay += 1;
        else if (truck.status === "Loaded") t.loadedTrucks += 1;
      }
    }
    return t;
  }, [filtered]);

  const filterCount = activeFilterCount(filters, showTransporter);

  // ---------------------------------------------------------------- downloads (PDF / CSV of the period)
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);
  const [onlyFiltered, setOnlyFiltered] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const downloadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!downloadOpen) return;
    const onDown = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) setDownloadOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDownloadOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [downloadOpen]);

  /** The screen's filters in words, for the report header when only the filtered requests are exported. */
  const filtersNote = [
    filters.response && `Response: ${responseLabel(filters.response)}`,
    filters.trucks !== "any" && `Trucks: ${TRUCK_OPTIONS.find((o) => o.value === filters.trucks)?.label}`,
    filters.product && `Product: ${filters.product}`,
    showTransporter && filters.transporter && `Transporter: ${filters.transporter}`,
    filters.billChangeOnly && "Bill change only",
    filters.needsTrucksOnly && "Needs trucks",
    filters.search.trim() && `Search: "${filters.search.trim()}"`,
  ].filter(Boolean).join(", ");
  const useFiltered = onlyFiltered && filterCount > 0;
  // The report is sorted by schedule date (soonest first), whatever the screen's sort.
  const reportRows = useMemo(
    () => [...(useFiltered ? filtered : rows)].sort((a, b) => a.request.scheduleDateTime.localeCompare(b.request.scheduleDateTime)),
    [useFiltered, filtered, rows],
  );
  const download = async (kind: "pdf" | "csv") => {
    setDownloadError("");
    setDownloading(kind);
    try {
      const { downloadSchedulesCsv, downloadSchedulesPdf } = await import("./schedulesReport");
      const meta = {
        periodLabel: DATE_PRESETS.find((p) => p.key === period.preset)?.label ?? "Period",
        from: rangeFrom,
        to: rangeTo,
        showTransporter,
        filtersNote: useFiltered ? filtersNote : undefined,
      };
      if (kind === "pdf") await downloadSchedulesPdf(reportRows, meta);
      else downloadSchedulesCsv(reportRows, meta);
      setDownloadOpen(false);
    } catch (err) {
      setDownloadError(getErrorMessage(err, "The report could not be created. Please try again."));
    } finally {
      setDownloading(null);
    }
  };
  const colSpan = showTransporter ? 9 : 8;
  const pct = (v: number) => (totals.committed > 0 ? `${Math.min(100, (v / totals.committed) * 100)}%` : "0%");

  return (
    <div className="schedules-mgmt">
      <header className="schedules-mgmt__header">
        <div>
          <h1><LayoutGridIcon aria-hidden /> Schedules Management</h1>
          <p>
            {isTransporter
              ? "Every truck request you received, what you accepted, and the trucks you arranged for it."
              : "Every truck request sent to transporters, their responses, and the trucks arranged against them."}
          </p>
        </div>
        <div className="schedules-mgmt__header-actions">
          <div className="schedules-mgmt__period">
            <IconSelect icon={CalendarIcon} label="Schedule date" value={period.preset} onChange={(v) => choosePreset(v as DatePreset)}>
              {DATE_PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </IconSelect>
            {period.preset === "custom" && (
              <div className="schedules-mgmt__dates">
                <label>
                  <span className="schedules-mgmt__sr-only">From</span>
                  <input type="date" value={period.from} max={period.to || undefined} onChange={(e) => setPeriod((p) => ({ ...p, from: e.target.value }))} aria-label="From date" />
                </label>
                <span aria-hidden>–</span>
                <label>
                  <span className="schedules-mgmt__sr-only">To</span>
                  <input type="date" value={period.to} min={period.from || undefined} onChange={(e) => setPeriod((p) => ({ ...p, to: e.target.value }))} aria-label="To date" />
                </label>
              </div>
            )}
          </div>
          {isTransporter && (
            <Link to="/admin/truck-management/arrangement/add-trucks-to-schedules" className="schedules-mgmt__btn schedules-mgmt__btn--primary">
              <TruckIcon aria-hidden /> Add trucks
            </Link>
          )}
          <div className="schedules-mgmt__download" ref={downloadRef}>
            <button
              type="button"
              className={`schedules-mgmt__btn${downloadOpen ? " is-active" : ""}`}
              onClick={() => setDownloadOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={downloadOpen}
              disabled={isLoading || customInvalid}
            >
              <DownloadIcon aria-hidden /> Download <ChevronDownIcon aria-hidden />
            </button>
            {downloadOpen && (
              <div className="schedules-mgmt__download-menu" role="menu" aria-label="Download report">
                <p className="schedules-mgmt__download-note">
                  {useFiltered
                    ? <>The <b>{filtered.length}</b> request{filtered.length === 1 ? "" : "s"} matching the filters</>
                    : <>All <b>{rows.length}</b> request{rows.length === 1 ? "" : "s"}</>}
                  {" "}scheduled {rangeFrom === rangeTo ? <>on {shortDate(rangeFrom)}</> : <>{shortDate(rangeFrom)} – {shortDate(rangeTo)}</>}, with their trucks and freight.
                </p>
                {filterCount > 0 && (
                  <label className="schedules-mgmt__download-option">
                    <input type="checkbox" checked={onlyFiltered} onChange={(e) => setOnlyFiltered(e.target.checked)} />
                    Only the requests matching the filters
                  </label>
                )}
                <button type="button" role="menuitem" className="schedules-mgmt__download-item" onClick={() => download("pdf")} disabled={downloading !== null}>
                  <FileTextIcon aria-hidden />
                  <span><b>PDF report</b><small>With the feedXchange header, for printing or sharing</small></span>
                  {downloading === "pdf" && <RefreshCwIcon aria-hidden className="is-spinning" />}
                </button>
                <button type="button" role="menuitem" className="schedules-mgmt__download-item" onClick={() => download("csv")} disabled={downloading !== null}>
                  <Columns3Icon aria-hidden />
                  <span><b>CSV (Excel)</b><small>One row per truck, for spreadsheets</small></span>
                  {downloading === "csv" && <RefreshCwIcon aria-hidden className="is-spinning" />}
                </button>
                {downloadError && <p className="schedules-mgmt__error" role="alert">{downloadError}</p>}
              </div>
            )}
          </div>
          <button type="button" className="schedules-mgmt__btn" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCwIcon aria-hidden className={isFetching ? "is-spinning" : undefined} /> {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------ filters: at the top, they apply to the tiles, the bars and the list */}
      <section className="schedules-mgmt__filters" aria-label="Filters">
        <fieldset className="schedules-mgmt__filter schedules-mgmt__filter--wide">
          <legend><InboxIcon aria-hidden /> Response</legend>
          <div className="schedules-mgmt__pills">
            {RESPONSES.map(({ key, label, icon: Glyph }) => (
              <button key={key} type="button" className={filters.response === key ? "is-active" : undefined} onClick={() => toggleResponse(key)} aria-pressed={filters.response === key}>
                <Glyph aria-hidden /> {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="schedules-mgmt__filter schedules-mgmt__filter--dd">
          <span><TruckIcon aria-hidden /> Trucks</span>
          <FilterDropdown label="Trucks" value={filters.trucks} emptyValue="any" options={TRUCK_OPTIONS} onChange={(v) => set({ trucks: v })} />
        </div>

        <div className="schedules-mgmt__filter schedules-mgmt__filter--dd">
          <span><PackageIcon aria-hidden /> Product</span>
          <FilterDropdown label="Product" value={filters.product} emptyValue="" options={productOptions} onChange={(v) => set({ product: v })} />
        </div>

        {showTransporter && (
          <div className="schedules-mgmt__filter schedules-mgmt__filter--dd">
            <span><UsersIcon aria-hidden /> Transporter</span>
            <FilterDropdown label="Transporter" value={filters.transporter} emptyValue="" options={transporterOptions} onChange={(v) => set({ transporter: v })} />
          </div>
        )}

        <label className="schedules-mgmt__check" title="Only requests where a bill change is required">
          <input type="checkbox" checked={filters.billChangeOnly} onChange={(e) => set({ billChangeOnly: e.target.checked })} />
          <ReceiptIcon aria-hidden />
          Bill change only
        </label>

        {filterCount > 0 && (
          <button
            type="button"
            className="schedules-mgmt__btn schedules-mgmt__btn--ghost schedules-mgmt__clear"
            onClick={() => { setFilters(EMPTY_FILTERS); setShown(PAGE_SIZE); }}
            title="Clear all filters and the search"
          >
            <XIcon aria-hidden /> Clear all <span className="schedules-mgmt__count">{filterCount}</span>
          </button>
        )}
      </section>

      {/* ------------------------------------------------------------ tiles: click one to filter by it */}
      <section className="schedules-mgmt__stats" aria-label="Summary">
        <Stat icon={CalendarIcon} tone="navy" label="Requests" value={String(totals.requests)} hint={`${totals.schedules.size} schedule${totals.schedules.size === 1 ? "" : "s"}`} />
        <Stat
          icon={ClockIcon}
          tone="orange"
          label="Awaiting response"
          value={String(totals.pending)}
          hint={`${mt(totals.pendingMT)} open`}
          active={filters.response === "Pending"}
          onClick={() => toggleResponse("Pending")}
        />
        <Stat icon={CircleCheckBigIcon} tone="green" label="Accepted" value={mt(totals.committed)} hint={`${(totals.byResponse.Accepted ?? 0) + (totals.byResponse.PartiallyAccepted ?? 0)} requests`} />
        <Stat icon={TruckIcon} tone="sky" label="Trucks arranged" value={mt(totals.assigned + totals.loaded)} hint={`${totals.onTheWay} on the way · ${totals.loadedTrucks} loaded`} />
        <Stat
          icon={PackageIcon}
          tone="red"
          label="Left to arrange"
          value={mt(totals.left)}
          hint={`${totals.leftRequests} request${totals.leftRequests === 1 ? "" : "s"} need trucks`}
          active={filters.needsTrucksOnly}
          onClick={() => set({ needsTrucksOnly: !filters.needsTrucksOnly })}
        />
      </section>

      {/* ------------------------------------------------------------ overview bars */}
      <section className="schedules-mgmt__overview">
        <div className="schedules-mgmt__panel">
          <h2><ActivityIcon aria-hidden /> Truck arrangement</h2>
          <div className="schedules-mgmt__bar schedules-mgmt__bar--big" role="img" aria-label={`${mt(totals.loaded)} loaded, ${mt(totals.assigned)} on the way, ${mt(totals.left)} left`}>
            <span className="is-loaded" style={{ width: pct(totals.loaded) }} />
            <span className="is-assigned" style={{ width: pct(totals.assigned) }} />
          </div>
          <ul className="schedules-mgmt__legend">
            <li><i className="is-loaded" /> Loaded <b>{mt(totals.loaded)}</b></li>
            <li><i className="is-assigned" /> On the way <b>{mt(totals.assigned)}</b></li>
            <li><i className="is-left" /> Left to arrange <b>{mt(totals.left)}</b></li>
          </ul>
        </div>
        <div className="schedules-mgmt__panel">
          <h2><InboxIcon aria-hidden /> Responses</h2>
          <div className="schedules-mgmt__bar schedules-mgmt__bar--big" role="img" aria-label="Requests by response">
            {RESPONSES.map((r) => {
              const n = totals.byResponse[r.key] ?? 0;
              return n > 0 ? <span key={r.key} className={`is-${r.key.toLowerCase()}`} style={{ width: `${(n / Math.max(totals.requests, 1)) * 100}%` }} /> : null;
            })}
          </div>
          <ul className="schedules-mgmt__legend">
            {RESPONSES.map((r) => (
              <li key={r.key}>
                <button type="button" className={filters.response === r.key ? "is-active" : undefined} onClick={() => toggleResponse(r.key)} aria-pressed={filters.response === r.key}>
                  <i className={`is-${r.key.toLowerCase()}`} /> {r.label} <b>{totals.byResponse[r.key] ?? 0}</b>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ filters + list */}
      <section className="schedules-mgmt__card">
        <div className="schedules-mgmt__toolbar">
          <label className="schedules-mgmt__search">
            <SearchIcon aria-hidden />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => set({ search: e.target.value })}
              placeholder={`Search truck, driver, LR no, seller, buyer, place${showTransporter ? ", transporter, contract" : ""}…`}
              aria-label="Search"
            />
          </label>
          <IconSelect icon={sort === "latest" ? ArrowDownIcon : sort === "mostLeft" ? TrendingUpIcon : ArrowUpIcon} label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)}>
            <option value="soonest">Schedule date: soonest first</option>
            <option value="latest">Schedule date: latest first</option>
            <option value="mostLeft">Most left to arrange</option>
          </IconSelect>
        </div>

        <p className="schedules-mgmt__result-line">
          Showing <b>{Math.min(shown, filtered.length)}</b> of <b>{filtered.length}</b> request{filtered.length === 1 ? "" : "s"}
          {filtered.length !== rows.length && <> (filtered from {rows.length})</>}
          {" "}scheduled {rangeFrom === rangeTo ? <>on <b>{shortDate(rangeFrom)}</b></> : <>between <b>{shortDate(rangeFrom)}</b> and <b>{shortDate(rangeTo)}</b></>}
          {period.preset !== "custom" && <> ({DATE_PRESETS.find((p) => p.key === period.preset)?.label})</>}
        </p>
        {customInvalid && <p className="schedules-mgmt__error" role="alert">Pick a From date that is on or before the To date.</p>}

        {isError && <p className="schedules-mgmt__error" role="alert">{getErrorMessage(error, "The schedules could not be loaded. Please try again.")}</p>}

        {isLoading ? (
          <p className="schedules-mgmt__empty">Loading schedules…</p>
        ) : filtered.length === 0 ? (
          <div className="schedules-mgmt__empty">
            <InboxIcon aria-hidden />
            <p>{rows.length === 0 ? "No truck requests are scheduled in this period." : "No requests match these filters."}</p>
            {filterCount > 0 && <button type="button" className="schedules-mgmt__btn" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>}
          </div>
        ) : (
          <div className="schedules-mgmt__table-wrap">
            <table className="schedules-mgmt__table">
              <thead>
                <tr>
                  <th aria-label="Open" />
                  <Th icon={CalendarIcon}>Scheduled for</Th>
                  <Th icon={PackageIcon}>Product</Th>
                  <Th icon={RouteIcon}>Route</Th>
                  {showTransporter && <Th icon={UsersIcon}>Transporter</Th>}
                  <Th icon={SendIcon}>Offered</Th>
                  <Th icon={CircleCheckBigIcon}>Accepted</Th>
                  <Th icon={TruckIcon}>Trucks arranged</Th>
                  <Th icon={InboxIcon}>Response</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, shown).map((row) => {
                  const r = row.request;
                  const id = r.dispatchScheduleTransporterId;
                  const open = openId === id;
                  const live = row.trucks.filter((t) => !t.cancelled);
                  const day = scheduleDay(row);
                  const today = dayKey(new Date());
                  const when = day === today ? "today" : day > today ? "upcoming" : "past";
                  // A request still awaiting a response is answered on View Schedules: open it there, at this request.
                  const awaiting = row.responseStatus === "Pending";
                  const viewSchedulesUrl = `/admin/truck-management/assign-transports?request=${id}`;
                  const activate = () => (awaiting ? navigate(viewSchedulesUrl) : setOpenId(open ? null : id));
                  return (
                    <Fragment key={id}>
                      <tr
                        className={`schedules-mgmt__row${open ? " is-open" : ""}${awaiting ? " is-link" : ""}`}
                        onClick={activate}
                        title={awaiting ? "Open this request in View Schedules to accept or reject it" : undefined}
                      >
                        <td>
                          {awaiting ? (
                            <Link to={viewSchedulesUrl} className="schedules-mgmt__expand schedules-mgmt__expand--go" aria-label="Open in View Schedules" onClick={(e) => e.stopPropagation()}>
                              <ArrowRightIcon aria-hidden />
                            </Link>
                          ) : (
                            <button type="button" className="schedules-mgmt__expand" aria-expanded={open} aria-label={open ? "Hide trucks" : "Show trucks"} onClick={(e) => { e.stopPropagation(); setOpenId(open ? null : id); }}>
                              <ChevronDownIcon aria-hidden />
                            </button>
                          )}
                        </td>
                        <td>
                          <b>{formatApiDateTime(r.scheduleDateTime)}</b>
                          <span className={`schedules-mgmt__when schedules-mgmt__when--${when}`}>{when === "today" ? "Today" : when === "upcoming" ? "Upcoming" : "Past"}</span>
                          {row.contractNumber && <span className="schedules-mgmt__muted">Contract {row.contractNumber}</span>}
                        </td>
                        <td>
                          {r.productName ?? "-"}
                          {r.billChange && <span className="schedules-mgmt__flag"><ReceiptIcon aria-hidden /> Bill change</span>}
                        </td>
                        <td className="schedules-mgmt__route">
                          <span title={r.loadingAddress ?? undefined}><b>From</b> {r.sellerName ?? "-"}{r.loadingPlace ? `, ${r.loadingPlace}` : ""}</span>
                          <span title={r.deliveryAddress ?? undefined}><b>To</b> {r.buyerName ?? "-"}{r.deliveryPlace ? `, ${r.deliveryPlace}` : ""}</span>
                        </td>
                        {showTransporter && <td>{r.transporterName}</td>}
                        <td className="schedules-mgmt__nowrap">{mt(r.offeredQuantityMT)}<span className="schedules-mgmt__muted">@ ₹{r.offeredFreightPerMT}/MT</span></td>
                        <td className="schedules-mgmt__nowrap">
                          {isAccepted(row) ? (
                            <>{mt(row.committedQuantityMT)}<span className="schedules-mgmt__muted">@ ₹{r.acceptedFreightPerMT ?? r.offeredFreightPerMT}/MT</span></>
                          ) : (
                            <span className="schedules-mgmt__muted">—</span>
                          )}
                        </td>
                        <td>
                          <ArrangementBar row={row} />
                          {live.length > 0 && <span className="schedules-mgmt__muted">{live.length} truck{live.length === 1 ? "" : "s"}</span>}
                        </td>
                        <td>
                          <ResponseChip status={row.responseStatus} />
                          {row.responseStatus === "FreightProposed" && r.proposedFreightPerMT != null && (
                            <span className="schedules-mgmt__muted">Proposed ₹{r.proposedFreightPerMT}/MT</span>
                          )}
                          {/* clicks inside the history (and its dialog, which React bubbles through) must not open / close the row */}
                          <span className="schedules-mgmt__history" onClick={(e) => e.stopPropagation()}>
                            <BargainHistoryButton dispatchScheduleTransporterId={id} rounds={r.negotiationRounds} />
                          </span>
                        </td>
                      </tr>
                      {open && <RowDetail row={row} isTransporter={isTransporter} colSpan={colSpan} />}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > shown && (
          <button type="button" className="schedules-mgmt__btn schedules-mgmt__more" onClick={() => setShown((s) => s + PAGE_SIZE)}>
            Show {Math.min(PAGE_SIZE, filtered.length - shown)} more
          </button>
        )}
      </section>
    </div>
  );
};

export default SchedulesManagement;
