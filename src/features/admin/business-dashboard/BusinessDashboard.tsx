import { useEffect, useMemo, useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  useGetBusinessDashboardQuery,
  useGetDashboardProfilesQuery,
  type BusinessDashboard as Dashboard,
  type DashboardProfile,
} from "../../../core/store/businessDashboardApi";
import { getErrorMessage } from "../../../core/api/getErrorMessage";
import {
  Building2Icon,
  CircleAlertIcon,
  CircleCheckBigIcon,
  ClockIcon,
  FileTextIcon,
  IndianRupeeIcon,
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
  STATUS_COLOURS,
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
} from "./businessDashboard.utils";
import { ContractsTable, ProductsTable, TrucksTable, type StageFilter } from "./DashboardTables";
import "./BusinessDashboard.scss";

type Tab = "contracts" | "trucks" | "products";

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
    .join("") || "B";

const ProfilePanel = ({ profile }: { profile: DashboardProfile }) => {
  const address = profile.primaryAddress;
  const addressText = address
    ? [address.line1, address.line2, address.city, address.district !== address.city ? address.district : null, address.state, address.pincode]
        .filter(Boolean)
        .join(", ")
    : null;
  const statusTone = profile.status === "Active" ? "success" : profile.status === "Pending" ? "warning" : "neutral";

  return (
    <Card className="bd-profile" aria-label="Business profile">
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
            {profile.businessLine && <Badge tone="info">{profile.businessLine}</Badge>}
          </div>
        </div>
      </div>

      <dl className="bd-profile__grid">
        <Detail label="GSTIN">{profile.gstNumber && <span className="bd-mono">{profile.gstNumber}</span>}</Detail>
        <Detail label="PAN">{profile.panNumber && <span className="bd-mono">{profile.panNumber}</span>}</Detail>
        <Detail label="Business type">{[profile.businessType, profile.businessSubType].filter(Boolean).join(" · ")}</Detail>
        <Detail label="Established">{profile.yearOfEstablishment}</Detail>
        <Detail label="Annual turnover">{profile.annualTurnover ? formatRupees(profile.annualTurnover) : null}</Detail>
        <Detail label="Employees">{profile.employeeCount ? formatCount(profile.employeeCount) : null}</Detail>
        <Detail label="Member since">{formatDate(profile.memberSince)}</Detail>
        <Detail label="Group">{profile.groupName}</Detail>
      </dl>

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
          <span>Addresses{profile.unloadingLocationCount > 0 ? ` (${profile.unloadingLocationCount} unloading)` : ""}</span>
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

      {profile.childBusinesses.length > 0 && (
        <div className="bd-profile__children">
          <span className="bd-muted">Group businesses:</span> {profile.childBusinesses.map((child) => child.name).join(", ")}
        </div>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------- charts

const ChartEmpty = () => <p className="bd-chart__empty">No contracts in this period</p>;

const StatusChart = ({ dashboard }: { dashboard: Dashboard }) => {
  const slices = dashboard.contractStatuses.filter((s) => s.count > 0);
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  return (
    <Card title="Contracts by status" className="bd-chart">
      {total === 0 ? (
        <ChartEmpty />
      ) : (
        <div className="bd-donut">
          <div className="bd-donut__chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="count" nameKey="displayName" innerRadius="62%" outerRadius="92%" paddingAngle={1.5} stroke="none" isAnimationActive={false}>
                  {slices.map((slice) => (
                    <Cell key={slice.statusName} fill={STATUS_COLOURS[slice.statusName] ?? "var(--fx-slate-65)"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} contracts`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <span className="bd-donut__total">
              <strong>{total}</strong>
              <small>contracts</small>
            </span>
          </div>
          <ul className="bd-legend">
            {dashboard.contractStatuses.map((slice) => (
              <li key={slice.statusName} className={slice.count === 0 ? "is-zero" : ""}>
                <span className="bd-legend__swatch" style={{ background: STATUS_COLOURS[slice.statusName] ?? "var(--fx-slate-65)" }} aria-hidden />
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
  const empty = data.every((m) => m.contracts === 0);
  return (
    <Card title="Monthly volume" className="bd-chart bd-chart--wide">
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
                formatter={(value, name) => (name === "Contracts" ? [String(value), name] : [formatMT(Number(value)), name])}
                labelFormatter={(label) => String(label)}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="mt" dataKey="quantityMT" name="Contracted MT" fill="var(--fx-chart-1)" radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              <Bar yAxisId="mt" dataKey="dispatchedMT" name="Dispatched MT" fill="var(--fx-chart-2)" radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              <Line yAxisId="count" type="monotone" dataKey="contracts" name="Contracts" stroke="var(--fx-chart-3)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

const TopProducts = ({ dashboard, onOpen }: { dashboard: Dashboard; onOpen: () => void }) => {
  const traded = dashboard.products.filter((p) => p.contracts > 0).slice(0, 5);
  const max = Math.max(1, ...traded.map((p) => p.soldMT + p.boughtMT));
  return (
    <Card
      title="Top products"
      className="bd-chart"
      actions={
        <button type="button" className="bd-link" onClick={onOpen}>
          View all
        </button>
      }
    >
      {traded.length === 0 ? (
        <ChartEmpty />
      ) : (
        <ul className="bd-ranked">
          {traded.map((p) => {
            const qty = p.soldMT + p.boughtMT;
            return (
              <li key={p.productId}>
                <span className="bd-ranked__name" title={p.name}>
                  {p.name}
                </span>
                <span className="bd-ranked__value">
                  {formatMT(qty)} · {formatRupees(p.value)}
                </span>
                <span className="bd-ranked__bar" aria-hidden>
                  <span className="bd-ranked__sold" style={{ width: `${(p.soldMT / max) * 100}%` }} />
                  <span className="bd-ranked__bought" style={{ width: `${(p.boughtMT / max) * 100}%` }} />
                </span>
              </li>
            );
          })}
          <li className="bd-ranked__key bd-muted">
            <span className="bd-legend__swatch bd-ranked__sold" aria-hidden /> Sold <span className="bd-legend__swatch bd-ranked__bought" aria-hidden /> Bought
          </li>
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

const STORAGE_KEY = "fx.businessDashboard.period";

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
 * FeedXchange -> Business Dashboard: one business at a glance. Profile details, contracts executing and executed in a period
 * (by contract date), the trucks on those contracts and the products it lists or traded. Business users see their own business
 * (and its group businesses, through the picker); FeedXchange staff pick any business.
 */
const BusinessDashboard = () => {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [draft, setDraft] = useState({ from: period.from, to: period.to });
  const [profileId, setProfileId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("contracts");
  const [stage, setStage] = useState<StageFilter>("all");
  const [truckContract, setTruckContract] = useState("");

  const profiles = useGetDashboardProfilesQuery();
  const options = useMemo(() => profiles.data ?? [], [profiles.data]);

  // Business users start on their own business; staff on the first in the list.
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
  const query = useGetBusinessDashboardQuery(
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

  const openContracts = (next: StageFilter) => {
    setStage(next);
    setTab("contracts");
    revealDetails();
  };

  const openTrucks = (contractNumber = "") => {
    setTruckContract(contractNumber);
    setTab("trucks");
    revealDetails();
  };

  // printed under each table's PDF title
  const subtitle = dashboard ? `${dashboard.profile.name} | ${describePeriod(period.from, period.to)}` : "";
  const s = dashboard?.summary;

  const filters = (
    <div className="bd-filters">
      {options.length > 1 && (
        <Select
          label="Business"
          value={profileId ?? ""}
          onChange={(event) => {
            setProfileId(Number(event.target.value));
            setTruckContract("");
          }}
          fieldClassName="bd-filters__business"
        >
          {options.map((o) => (
            <option key={o.profileId} value={o.profileId}>
              {o.name}
              {o.city ? ` (${o.city})` : ""}
              {o.isOwn ? " – your business" : ""}
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
    body = <EmptyState icon={Building2Icon} title="No business to show" description="Your account is not linked to a business profile." />;
  } else if (!dashboard || !s) {
    body = <LoadingView />;
  } else {
    body = (
      <div className={`bd-layout ${query.isFetching ? "is-refreshing" : ""}`}>
        <div className="bd-kpis">
          <Kpi
            tone="blue"
            icon={FileTextIcon}
            label="Contracts"
            value={formatCount(s.totalContracts)}
            note={`${s.contractsAsSeller} sales · ${s.contractsAsBuyer} purchases`}
            onClick={() => openContracts("all")}
            title="Show every contract of the period"
          />
          <Kpi
            tone="teal"
            icon={ClockIcon}
            label="Executing"
            value={formatCount(s.executingContracts)}
            note={s.pendingApprovalContracts > 0 ? `${s.pendingApprovalContracts} awaiting approval` : "Open and partially dispatched"}
            onClick={() => openContracts("Executing")}
            active={tab === "contracts" && stage === "Executing"}
            title="Show contracts being executed"
          />
          <Kpi
            tone="green"
            icon={CircleCheckBigIcon}
            label="Executed"
            value={formatCount(s.executedContracts)}
            note={s.rejectedContracts > 0 ? `${s.rejectedContracts} rejected` : "Dispatched and closed"}
            onClick={() => openContracts("Executed")}
            active={tab === "contracts" && stage === "Executed"}
            title="Show executed contracts"
          />
          <Kpi
            tone="orange"
            icon={PackageIcon}
            label="Dispatched"
            value={formatMT(s.dispatchedQuantityMT)}
            note={`of ${formatMT(s.contractedQuantityMT)} · ${formatMT(s.pendingQuantityMT)} pending`}
            meter={{ percent: s.fulfilmentPercent, label: "Share of contracted quantity dispatched" }}
          />
          <Kpi
            tone="purple"
            icon={IndianRupeeIcon}
            label="Contract value"
            value={formatRupees(s.contractValue)}
            note={`${formatRupees(s.salesValue)} sales · ${formatRupees(s.purchaseValue)} purchases`}
          />
          <Kpi
            tone="amber"
            icon={TruckIcon}
            label="Trucks"
            value={formatCount(s.totalTrucks - s.trucksCancelled)}
            note={`${s.trucksLoaded} loaded · ${s.trucksAssigned} assigned${s.trucksCancelled ? ` · ${s.trucksCancelled} cancelled` : ""}`}
            meter={{ percent: s.totalTrucks - s.trucksCancelled > 0 ? Math.round((s.trucksLoaded * 100) / (s.totalTrucks - s.trucksCancelled)) : 0, label: "Share of trucks loaded" }}
            onClick={() => openTrucks()}
            active={tab === "trucks"}
            title="Show the trucks"
          />
        </div>

        <div className="bd-row">
          <ProfilePanel profile={dashboard.profile} />
          <div className="bd-row__side">
            <StatusChart dashboard={dashboard} />
            <TopProducts
              dashboard={dashboard}
              onOpen={() => {
                setTab("products");
                revealDetails();
              }}
            />
          </div>
        </div>

        <TrendChart dashboard={dashboard} />

        <Card className="bd-details" id="bd-details">
          <div className="bd-tabs" role="tablist" aria-label="Dashboard details">
            {(
              [
                ["contracts", "Contracts", dashboard.contracts.length],
                ["trucks", "Trucks", s.totalTrucks],
                ["products", "Products", dashboard.products.length],
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
            {tab === "contracts" && <ContractsTable contracts={dashboard.contracts} stage={stage} onStage={setStage} onShowTrucks={openTrucks} subtitle={subtitle} />}
            {tab === "trucks" && (
              <TrucksTable
                trucks={dashboard.trucks}
                contractFilter={truckContract}
                onClearContract={() => setTruckContract("")}
                truncated={dashboard.trucksTruncated}
                maxRows={dashboard.maxTruckRows}
                subtitle={subtitle}
              />
            )}
            {tab === "products" && <ProductsTable products={dashboard.products} subtitle={subtitle} />}
          </div>
        </Card>

        <p className="bd-footnote">
          Contracts are filtered on their contract date. Quantities and values count executing and executed contracts only. Updated {formatDateTime(dashboard.generatedAt)}.
        </p>
      </div>
    );
  }

  return (
    <div className="business-dashboard">
      <PageHeader
        title="Business Dashboard"
        description={dashboard ? `${dashboard.profile.name} · ${describePeriod(period.from, period.to)}` : describePeriod(period.from, period.to)}
        actions={filters}
      />
      {body}
    </div>
  );
};

export default BusinessDashboard;
