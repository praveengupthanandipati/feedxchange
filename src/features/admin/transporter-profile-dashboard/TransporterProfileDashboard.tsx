import { useEffect, useMemo, useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  useGetTransporterDashboardProfilesQuery,
  useGetTransporterDashboardQuery,
  type TransporterDashboard as Dashboard,
  type TransporterProfile,
} from "../../../core/store/transporterDashboardApi";
import { getErrorMessage } from "../../../core/api/getErrorMessage";
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  FileTextIcon,
  IndianRupeeIcon,
  InboxIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  RefreshCwIcon,
  ShieldIcon,
  TruckIcon,
  UsersIcon,
  type IconComponent,
} from "../../../shared/components/icon";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Skeleton } from "../../../shared/components/ui";
import {
  PERIOD_OPTIONS,
  describePeriod,
  formatCount,
  formatDate,
  formatDateTime,
  formatMT,
  formatRupees,
  monthLabel,
  periodFor,
  type Period,
  type PeriodKey,
} from "../business-dashboard/businessDashboard.utils";
import { ServingStateChips } from "../usermanagement/transporters/ServingLocations";
import { CustomersTable, FleetTable, RequestsTable, RoutesTable, TripsTable } from "./TransporterTables";
// the layout, cards, charts and tables share the Business Dashboard's styles (all scoped under .business-dashboard)
import "../business-dashboard/BusinessDashboard.scss";

type Tab = "trips" | "requests" | "fleet" | "customers" | "routes";

const TRIP_COLOURS: Record<string, string> = {
  Assigned: "var(--fx-chart-1)",
  Loaded: "var(--fx-chart-2)",
  Cancelled: "var(--fx-chart-5)",
};

// ---------------------------------------------------------------- KPI card

interface KpiProps {
  tone: "blue" | "teal" | "green" | "orange" | "purple" | "amber";
  icon: IconComponent;
  label: string;
  value: string;
  note: React.ReactNode;
  /** 0-100 */
  meter?: { percent: number; label: string };
  onClick?: () => void;
  active?: boolean;
  title?: string;
}

const Kpi = ({ tone, icon: Glyph, label, value, note, meter, onClick, active, title }: KpiProps) => {
  const body = (
    <>
      <span className="bd-kpi__head">
        <span className="bd-kpi__label">{label}</span>
        <span className="bd-kpi__icon" aria-hidden>
          <Glyph size={16} />
        </span>
      </span>
      <strong className="bd-kpi__value">{value}</strong>
      <span className="bd-kpi__meter" aria-hidden={!meter}>
        {meter && (
          <span
            className="bd-kpi__meter-fill"
            role="progressbar"
            aria-label={meter.label}
            aria-valuenow={meter.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: meter.percent > 0 ? `max(${Math.min(100, meter.percent)}%, 6px)` : 0 }}
          />
        )}
      </span>
      <span className="bd-kpi__note">{note}</span>
    </>
  );
  const className = `bd-kpi bd-tint--${tone} ${active ? "is-active" : ""}`;
  return onClick ? (
    <button type="button" className={`${className} bd-kpi--button`} onClick={onClick} aria-pressed={active} title={title}>
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
};

// ---------------------------------------------------------------- profile panel

const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="bd-detail">
    <dt>{label}</dt>
    <dd>{children || "—"}</dd>
  </div>
);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => /^[a-z]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "T";

const ProfilePanel = ({ profile }: { profile: TransporterProfile }) => {
  const address = profile.primaryAddress;
  const addressText = address
    ? [address.line1, address.line2, address.city, address.district !== address.city ? address.district : null, address.state, address.pincode]
        .filter(Boolean)
        .join(", ")
    : null;
  const statusTone = profile.status === "Active" ? "success" : profile.status === "Pending" ? "warning" : "neutral";

  return (
    <Card className="bd-profile" aria-label="Transporter profile">
      <div className="bd-profile__head">
        <span className="bd-profile__avatar" aria-hidden>
          {profile.profilePictureUrl && /^https?:\/\//i.test(profile.profilePictureUrl) ? <img src={profile.profilePictureUrl} alt="" /> : initials(profile.name)}
        </span>
        <div className="bd-profile__title">
          <h2>{profile.name}</h2>
          {profile.tradingName && profile.tradingName !== profile.name && <p className="bd-muted">Trading as {profile.tradingName}</p>}
          <div className="bd-profile__badges">
            <Badge tone={statusTone}>{profile.status ?? "Unknown"}</Badge>
            {profile.isVerified ? (
              <Badge tone="success" icon={CircleCheckBigIcon} title={profile.verifiedOn ? `Verified on ${formatDate(profile.verifiedOn)}` : undefined}>
                Verified
              </Badge>
            ) : (
              <Badge tone="warning" icon={ShieldIcon}>
                Not verified
              </Badge>
            )}
            {profile.transporterLine && <Badge tone="info">{profile.transporterLine}</Badge>}
          </div>
        </div>
      </div>

      <dl className="bd-profile__grid">
        <Detail label="GSTIN">{profile.gstNumber && <span className="bd-mono">{profile.gstNumber}</span>}</Detail>
        <Detail label="PAN">{profile.panNumber && <span className="bd-mono">{profile.panNumber}</span>}</Detail>
        <Detail label="Transporter type">{[profile.transporterType, profile.transporterSubType].filter(Boolean).join(" · ")}</Detail>
        <Detail label="Operating since">{profile.operatingSince ? formatDate(profile.operatingSince) : null}</Detail>
        <Detail label="Declared fleet">{profile.declaredFleetCount ? formatCount(profile.declaredFleetCount) : null}</Detail>
        <Detail label="Member since">{formatDate(profile.memberSince)}</Detail>
        <Detail label="Group">{profile.groupName}</Detail>
        <Detail label="Services">{profile.serviceDescription}</Detail>
      </dl>

      <div className="bd-profile__serving" aria-label="Serving locations">
        <ServingStateChips source={profile.sourceStates} destination={profile.destinationStates} compact />
      </div>

      <ul className="bd-profile__contact">
        {addressText && (
          <li>
            <MapPinIcon size={16} aria-hidden />
            <span>
              {address?.officeName && <strong>{address.officeName}: </strong>}
              {addressText}
              {address?.googleLocationUrl && /^https?:\/\//i.test(address.googleLocationUrl) && (
                <>
                  {" "}
                  <a href={address.googleLocationUrl} target="_blank" rel="noopener noreferrer" className="bd-link">
                    Map
                  </a>
                </>
              )}
            </span>
          </li>
        )}
        {(profile.mobile || profile.alternativeMobile) && (
          <li>
            <PhoneIcon size={16} aria-hidden />
            <span>{[profile.mobile, profile.alternativeMobile].filter(Boolean).join(" / ")}</span>
          </li>
        )}
        {profile.email && (
          <li>
            <MailIcon size={16} aria-hidden />
            <a href={`mailto:${profile.email}`} className="bd-link">
              {profile.email}
            </a>
          </li>
        )}
        {profile.primaryContact?.name && (
          <li>
            <UsersIcon size={16} aria-hidden />
            <span>
              {profile.primaryContact.name}
              {profile.primaryContact.designation && <span className="bd-muted"> · {profile.primaryContact.designation}</span>}
              {profile.primaryContact.mobile && <span className="bd-muted"> · {profile.primaryContact.mobile}</span>}
            </span>
          </li>
        )}
      </ul>

      <ul className="bd-profile__counts" aria-label="Profile completeness">
        <li>
          <strong>{profile.addressCount}</strong>
          <span>Addresses</span>
        </li>
        <li>
          <strong>{profile.contactCount}</strong>
          <span>Contacts</span>
        </li>
        <li>
          <strong>
            {profile.verifiedDocumentCount}/{profile.documentCount}
          </strong>
          <span>Documents verified</span>
        </li>
        <li>
          <strong>{profile.bankAccountCount}</strong>
          <span>Bank accounts</span>
        </li>
        <li>
          <strong>{profile.userCount}</strong>
          <span>Users</span>
        </li>
      </ul>
    </Card>
  );
};

// ---------------------------------------------------------------- charts

const ChartEmpty = ({ text = "No trips in this period" }: { text?: string }) => <p className="bd-chart__empty">{text}</p>;

const StatusChart = ({ dashboard }: { dashboard: Dashboard }) => {
  const slices = dashboard.tripStatuses.filter((s) => s.count > 0);
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  return (
    <Card title="Trips by status" className="bd-chart">
      {total === 0 ? (
        <ChartEmpty />
      ) : (
        <div className="bd-donut">
          <div className="bd-donut__chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="count" nameKey="displayName" innerRadius="62%" outerRadius="92%" paddingAngle={1.5} stroke="none" isAnimationActive={false}>
                  {slices.map((slice) => (
                    <Cell key={slice.statusName} fill={TRIP_COLOURS[slice.statusName] ?? "var(--fx-slate-65)"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} trips`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <span className="bd-donut__total">
              <strong>{total}</strong>
              <small>trips</small>
            </span>
          </div>
          <ul className="bd-legend">
            {dashboard.tripStatuses.map((slice) => (
              <li key={slice.statusName} className={slice.count === 0 ? "is-zero" : ""}>
                <span className="bd-legend__swatch" style={{ background: TRIP_COLOURS[slice.statusName] ?? "var(--fx-slate-65)" }} aria-hidden />
                <span className="bd-legend__label">{slice.displayName}</span>
                <span className="bd-legend__value">{slice.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

const TrendChart = ({ dashboard }: { dashboard: Dashboard }) => {
  const data = dashboard.monthlyTrend.map((m) => ({ ...m, label: monthLabel(m.month) }));
  const empty = data.every((m) => m.trips === 0);
  return (
    <Card title="Monthly trips and freight" className="bd-chart bd-chart--wide">
      {empty ? (
        <ChartEmpty />
      ) : (
        <div className="bd-chart__body">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--fx-chart-grid)" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--fx-chart-axis)", fontSize: 12 }} interval="preserveStartEnd" minTickGap={8} />
              <YAxis yAxisId="mt" axisLine={false} tickLine={false} tick={{ fill: "var(--fx-chart-axis)", fontSize: 12 }} width={52} tickFormatter={(v: number) => v.toLocaleString("en-IN")} />
              <YAxis yAxisId="count" orientation="right" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--fx-chart-axis)", fontSize: 12 }} width={28} />
              <Tooltip
                formatter={(value, name) =>
                  name === "Trips" ? [String(value), name] : name === "Freight" ? [formatRupees(Number(value)), name] : [formatMT(Number(value)), name]
                }
                labelFormatter={(label) => String(label)}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="mt" dataKey="quantityMT" name="Carried MT" fill="var(--fx-chart-1)" radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              <Line yAxisId="count" type="monotone" dataKey="trips" name="Trips" stroke="var(--fx-chart-3)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

const TopCustomers = ({ dashboard, onOpen }: { dashboard: Dashboard; onOpen: () => void }) => {
  const top = dashboard.customers.slice(0, 5);
  const max = Math.max(1, ...top.map((c) => c.quantityMT));
  return (
    <Card
      title="Top businesses"
      className="bd-chart"
      actions={
        <button type="button" className="bd-link" onClick={onOpen}>
          View all
        </button>
      }
    >
      {top.length === 0 ? (
        <ChartEmpty />
      ) : (
        <ul className="bd-ranked">
          {top.map((c) => (
            <li key={c.profileId}>
              <span className="bd-ranked__name" title={c.name}>
                {c.name}
              </span>
              <span className="bd-ranked__value">
                {formatMT(c.quantityMT)} · {formatRupees(c.freight)}
              </span>
              <span className="bd-ranked__bar" aria-hidden>
                <span className="bd-ranked__sold" style={{ width: `${(c.quantityMT / max) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------- loading

const LoadingView = () => (
  <div className="bd-layout" aria-busy="true">
    <div className="bd-kpis">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="bd-kpi">
          <Skeleton lines={3} />
        </div>
      ))}
    </div>
    <div className="bd-row">
      <Card className="bd-profile">
        <Skeleton lines={8} />
      </Card>
      <Card className="bd-chart">
        <Skeleton height="12rem" />
      </Card>
    </div>
    <Card>
      <Skeleton lines={6} />
    </Card>
  </div>
);

// ---------------------------------------------------------------- page

const STORAGE_KEY = "fx.transporterDashboard.period";

const initialPeriod = (): Period => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Period | null;
    if (saved && PERIOD_OPTIONS.some((o) => o.key === saved.key)) {
      return saved.key === "custom" ? saved : periodFor(saved.key);
    }
  } catch {
    /* storage unavailable: use the default */
  }
  return periodFor("thisFY");
};

/**
 * feedXchange -> Transporter Dashboard: one transporter at a glance. Profile details, the trips (trucks assigned in a period) with their freight,
 * truck requests and how they were answered, the registered fleet, the businesses it carries for and its routes. Transporter users see their own
 * profile; feedXchange staff pick any transporter.
 */
const TransporterProfileDashboard = () => {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [draft, setDraft] = useState({ from: period.from, to: period.to });
  const [profileId, setProfileId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("trips");
  const [tripContract, setTripContract] = useState("");

  const profiles = useGetTransporterDashboardProfilesQuery();
  const options = useMemo(() => profiles.data ?? [], [profiles.data]);

  // Transporter users start on their own profile; staff on the first in the list.
  useEffect(() => {
    if (profileId === null && options.length > 0) setProfileId((options.find((o) => o.isOwn) ?? options[0]).profileId);
  }, [options, profileId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(period));
    } catch {
      /* not saved: fine */
    }
  }, [period]);

  const customInvalid = period.key === "custom" && !!draft.from && !!draft.to && draft.from > draft.to;
  const query = useGetTransporterDashboardQuery(
    { profileId, fromDate: period.from || null, toDate: period.to || null },
    { skip: profileId === null, refetchOnMountOrArgChange: 60 },
  );
  const dashboard = query.data;

  const choosePeriod = (key: PeriodKey) => {
    if (key === "custom") {
      setPeriod({ key, from: period.from, to: period.to });
      setDraft({ from: period.from, to: period.to });
      return;
    }
    const next = periodFor(key);
    setPeriod(next);
    setDraft({ from: next.from, to: next.to });
  };

  const applyCustom = () => {
    if (!customInvalid) setPeriod({ key: "custom", from: draft.from, to: draft.to });
  };

  // after the tab has rendered, so the list's new height does not move the page away from it
  const revealDetails = () =>
    requestAnimationFrame(() => document.getElementById("bd-details")?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const openTab = (next: Tab) => {
    setTab(next);
    revealDetails();
  };

  const subtitle = dashboard ? `${dashboard.profile.name} | ${describePeriod(period.from, period.to)}` : "";
  const s = dashboard?.summary;

  const filters = (
    <div className="bd-filters">
      {options.length > 1 && (
        <Select
          label="Transporter"
          value={profileId ?? ""}
          onChange={(event) => {
            setProfileId(Number(event.target.value));
            setTripContract("");
          }}
          fieldClassName="bd-filters__business"
        >
          {options.map((o) => (
            <option key={o.profileId} value={o.profileId}>
              {o.name}
              {o.city ? ` (${o.city})` : ""}
              {o.isOwn ? " – your company" : ""}
            </option>
          ))}
        </Select>
      )}
      <Select label="Period" value={period.key} onChange={(event) => choosePeriod(event.target.value as PeriodKey)}>
        {PERIOD_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </Select>
      {period.key === "custom" && (
        <>
          <Input label="From" type="date" value={draft.from} max={draft.to || undefined} onChange={(event) => setDraft((d) => ({ ...d, from: event.target.value }))} />
          <Input
            label="To"
            type="date"
            value={draft.to}
            min={draft.from || undefined}
            onChange={(event) => setDraft((d) => ({ ...d, to: event.target.value }))}
            error={customInvalid ? "To must be on or after From" : undefined}
          />
          <Button variant="primary" onClick={applyCustom} disabled={customInvalid || (draft.from === period.from && draft.to === period.to)}>
            Apply
          </Button>
        </>
      )}
      <Button iconOnly icon={RefreshCwIcon} aria-label="Refresh" title="Refresh" onClick={() => query.refetch()} loading={query.isFetching && !!dashboard} disabled={profileId === null} />
    </div>
  );

  let body: React.ReactNode;
  if (profiles.isError || query.isError) {
    const error = profiles.error ?? query.error;
    body = (
      <EmptyState
        icon={CircleAlertIcon}
        title="The dashboard could not be loaded"
        description={getErrorMessage(error, "Please try again in a moment.")}
        action={<Button onClick={() => (profiles.isError ? profiles.refetch() : query.refetch())}>Try again</Button>}
      />
    );
  } else if (profiles.isSuccess && options.length === 0) {
    body = <EmptyState icon={TruckIcon} title="No transporter to show" description="Your account is not linked to a transporter profile." />;
  } else if (!dashboard || !s) {
    body = <LoadingView />;
  } else {
    const liveTrips = s.totalTrips - s.tripsCancelled;
    body = (
      <div className={`bd-layout ${query.isFetching ? "is-refreshing" : ""}`}>
        <div className="bd-kpis">
          <Kpi
            tone="blue"
            icon={TruckIcon}
            label="Trips"
            value={formatCount(liveTrips)}
            note={`${s.tripsLoaded} loaded · ${s.tripsAssigned} assigned${s.tripsCancelled ? ` · ${s.tripsCancelled} cancelled` : ""}`}
            meter={{ percent: liveTrips > 0 ? Math.round((s.tripsLoaded * 100) / liveTrips) : 0, label: "Share of trips loaded" }}
            onClick={() => openTab("trips")}
            active={tab === "trips"}
            title="Show the trips"
          />
          <Kpi
            tone="orange"
            icon={PackageIcon}
            label="Quantity"
            value={formatMT(s.quantityMT)}
            note={`${formatMT(s.loadedQuantityMT)} loaded · ${s.trucksUsed} trucks · ${s.driversUsed} drivers`}
            meter={{ percent: s.quantityMT > 0 ? Math.round((s.loadedQuantityMT * 100) / s.quantityMT) : 0, label: "Share of quantity loaded" }}
          />
          <Kpi
            tone="green"
            icon={IndianRupeeIcon}
            label="Freight earned"
            value={formatRupees(s.freightEarned)}
            note={`On loaded trips · avg ${formatRupees(s.averageFreightPerMT)} / MT`}
          />
          <Kpi tone="amber" icon={FileTextIcon} label="Freight pending" value={formatRupees(s.freightPending)} note="Trips assigned, not loaded yet" />
          <Kpi
            tone="purple"
            icon={InboxIcon}
            label="Truck requests"
            value={formatCount(s.totalRequests)}
            note={`${s.requestsPending + s.requestsAwaitingApproval} awaiting · ${s.requestsAccepted} accepted · ${s.requestsRejected} rejected`}
            meter={{ percent: s.acceptanceRatePercent, label: "Share of answered requests accepted" }}
            onClick={() => openTab("requests")}
            active={tab === "requests"}
            title="Show the truck requests"
          />
          <Kpi
            tone="teal"
            icon={UsersIcon}
            label="Fleet"
            value={formatCount(s.fleetTotal)}
            note={`${s.fleetOnTrip} on a trip · ${s.fleetActive} active · ${s.customerCount} businesses served`}
            onClick={() => openTab("fleet")}
            active={tab === "fleet"}
            title="Show the fleet"
          />
        </div>

        <div className="bd-row">
          <ProfilePanel profile={dashboard.profile} />
          <div className="bd-row__side">
            <StatusChart dashboard={dashboard} />
            <TopCustomers dashboard={dashboard} onOpen={() => openTab("customers")} />
          </div>
        </div>

        <TrendChart dashboard={dashboard} />

        <Card className="bd-details" id="bd-details">
          <div className="bd-tabs" role="tablist" aria-label="Dashboard details">
            {(
              [
                ["trips", "Trips", dashboard.trips.length],
                ["requests", "Truck requests", s.totalRequests],
                ["fleet", "Fleet", dashboard.fleet.length],
                ["customers", "Businesses", dashboard.customers.length],
                ["routes", "Routes", dashboard.routes.length],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`bd-tab-${key}`}
                aria-selected={tab === key}
                aria-controls={`bd-panel-${key}`}
                className={`bd-tabs__tab ${tab === key ? "is-active" : ""}`}
                onClick={() => setTab(key)}
              >
                {label} <span className="bd-tabs__count">{count}</span>
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`bd-panel-${tab}`} aria-labelledby={`bd-tab-${tab}`} className="bd-tabpanel">
            {tab === "trips" && (
              <TripsTable
                trips={dashboard.trips}
                contractFilter={tripContract}
                onClearContract={() => setTripContract("")}
                truncated={dashboard.tripsTruncated}
                maxRows={dashboard.maxRows}
                subtitle={subtitle}
              />
            )}
            {tab === "requests" && <RequestsTable requests={dashboard.requests} truncated={dashboard.requestsTruncated} maxRows={dashboard.maxRows} subtitle={subtitle} />}
            {tab === "fleet" && <FleetTable fleet={dashboard.fleet} subtitle={subtitle} />}
            {tab === "customers" && <CustomersTable customers={dashboard.customers} subtitle={subtitle} />}
            {tab === "routes" && <RoutesTable routes={dashboard.routes} subtitle={subtitle} />}
          </div>
        </Card>

        <p className="bd-footnote">
          Trips are filtered on the date the truck was assigned and truck requests on the date they were sent. Quantity and freight leave out cancelled trips; freight
          is quantity × freight per MT. The fleet lists every registered truck, whatever the period. Updated {formatDateTime(dashboard.generatedAt)}.
        </p>
      </div>
    );
  }

  return (
    <div className="business-dashboard transporter-dashboard">
      <PageHeader
        title="Transporter Dashboard"
        description={dashboard ? `${dashboard.profile.name} · ${describePeriod(period.from, period.to)}` : describePeriod(period.from, period.to)}
        actions={filters}
      />
      {body}
    </div>
  );
};

export default TransporterProfileDashboard;
