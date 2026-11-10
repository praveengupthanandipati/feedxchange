import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/AuthContext";
import { useGetBusinessProfileSummaryQuery } from "../../../core/store/businessProfilesApi";
import { useGetAllContractsByFiltersQuery } from "../../../core/store/contractsApi";
import {
  type IconComponent,
  ArrowRightIcon,
  CircleAlertIcon,
  FileTextIcon,
  ReceiptIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TruckIcon,
  WalletIcon,
} from "../../../shared/components/icon";
import { Skeleton } from "../../../shared/components/ui";
import { formatMT, formatRupees } from "../contracts/dashboard/contractsDashboard.utils";
import { PERIODS, buildHomeMetrics, buildInvoiceFigures, changeOf, type HomeMetrics, type InvoiceFigures, type PeriodKey } from "./homeDashboard.utils";
import { HomeLiveContext, buildActivity, buildSales, buildTopBuyers, buildTopProducts, type HomeLive } from "./homeLive";
import { useAllInvoices } from "./useAllInvoices";
import StatCard from "./StatCard";
import type { StatCard as StatCardData } from "./dashboard.data";
import { useContractParties } from "./useContractParties";

const PERIOD_KEY = "fx-home-period";
const readPeriod = (): PeriodKey => {
  try {
    const saved = localStorage.getItem(PERIOD_KEY);
    return PERIODS.some((period) => period.key === saved) ? (saved as PeriodKey) : "month";
  } catch {
    return "month";
  }
};

/** Shortcuts: a button each, and Alt + the letter anywhere on the dashboard (not while typing). */
const SHORTCUTS = [
  { key: "c", label: "Create Contract", to: "/admin/contracts/new", permission: "contracts.manage", icon: FileTextIcon },
  { key: "i", label: "Create Seller Invoice", to: "/admin/payments/seller-invoice", permission: "seller-invoice.view", icon: ReceiptIcon },
  { key: "p", label: "Create Payment", to: "/admin/payments/payment-advice", permission: "payment-advice", icon: WalletIcon },
] as const;

const percent = (fraction: number) => `${fraction > 0 ? "+" : ""}${(fraction * 100).toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;

const ActionCard = ({ icon: Icon, title, count, text, to, cta, tone }: { icon: IconComponent; title: string; count: number | null; text: string; to: string; cta: string; tone: string }) => (
  <Link to={to} className={`home-action home-action--${tone}`} title={`${text} - ${cta}`}>
    <span className="home-action__icon" aria-hidden>
      <Icon />
    </span>
    <span className="home-action__title">{title}</span>
    {count !== null && <span className="home-action__count">{count.toLocaleString("en-IN")}</span>}
    <span className="visually-hidden">
      : {text}. {cta}
    </span>
    <ArrowRightIcon aria-hidden className="home-action__go" />
  </Link>
);

/**
 * The live widgets at the top of the Home dashboard, worked out from the contracts list. `afterKpis` (the dashboard's own
 * stat cards) is shown right under the contract cards, before the actions and the analytics.
 */
/** The contract cards, in the dashboard's own stat-card look: figure, label, a small bar chart and "vs last month". */
const contractCards = (metrics: HomeMetrics, previousLabel: string): StatCardData[] => {
  const change = (now: number, before: number): Pick<StatCardData, "deltaPercent" | "deltaDirection" | "deltaLabel" | "hideDelta"> => {
    const fraction = changeOf(now, before);
    return {
      deltaPercent: fraction === null ? 0 : Math.round(Math.abs(fraction) * 10000) / 100,
      deltaDirection: fraction !== null && fraction < 0 ? "down" : "up",
      deltaLabel: `vs ${previousLabel}`,
      hideDelta: fraction === null,
    };
  };
  const { totals, previousTotals } = metrics;
  return [
    {
      id: "contract-quantity",
      label: "Contract Quantity",
      value: formatMT(totals.quantity),
      visual: "bars",
      color: "var(--fx-sky-60)",
      sparkline: metrics.quantityTrend,
      ...change(totals.quantity, previousTotals.quantity),
    },
    {
      id: "contract-value",
      label: "Contract Value",
      value: formatRupees(totals.value),
      visual: "bars",
      color: "var(--fx-teal-38)",
      sparkline: metrics.valueTrend,
      ...change(totals.value, previousTotals.value),
    },
    {
      id: "contracts",
      label: "Contracts",
      value: totals.contracts.toLocaleString("en-IN"),
      visual: "bars",
      color: "var(--fx-violet-66)",
      sparkline: metrics.countTrend,
      ...change(totals.contracts, previousTotals.contracts),
    },
  ];
};

/** The live figures for the dashboard's own stat cards, for the chosen period. */
export interface LiveFigures {
  /** Businesses trading in the period (null while the contracts load). */
  customers: { count: number; change: number | null; activeBusinesses: number } | null;
  /** Revenue and orders from the seller invoices (null while they load). */
  invoices: InvoiceFigures | null;
  /** The invoices could not be read (e.g. no permission for them). */
  invoicesFailed: boolean;
  /** "last month", "last FY"…, for "vs …" on the cards. */
  previousLabel: string;
}

/** `children` (the dashboard's other widgets) come after the overview and read its live data through HomeLiveContext. */
const HomeOverview = ({ afterKpis, children }: { afterKpis?: (live: LiveFigures) => ReactNode; children?: ReactNode }) => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [period, setPeriod] = useState<PeriodKey>(readPeriod);
  const [now] = useState(() => Date.now());
  const { data: contracts, isLoading, isError } = useGetAllContractsByFiltersQuery();
  const { data: businesses } = useGetBusinessProfileSummaryQuery();
  const { invoices: allInvoices, failed: invoicesFailed } = useAllInvoices();

  // Buyer / seller ids from each contract's own record where the list has none (for the Customers count).
  const withParties = useContractParties(contracts, period, now);
  const metrics = useMemo(() => (withParties ? buildHomeMetrics(withParties, period, now) : null), [withParties, period, now]);
  const activeBusinesses = useMemo(() => (businesses ?? []).filter((profile) => profile.status?.toLowerCase() === "active").length, [businesses]);
  const shortcuts = SHORTCUTS.filter((shortcut) => can(shortcut.permission));
  const periodLabel = PERIODS.find((item) => item.key === period)?.label ?? "";
  const previousLabel = period === "fy" ? "last FY" : period === "month" ? "last month" : period === "fortnight" ? "previous 14 days" : "day before";

  const pickPeriod = (key: PeriodKey) => {
    setPeriod(key);
    try {
      localStorage.setItem(PERIOD_KEY, key);
    } catch {
      /* storage blocked: the choice lasts for this visit */
    }
  };

  // Figures for the dashboard's own stat cards; all follow the chosen period.
  const invoiceFigures = useMemo(() => (allInvoices ? buildInvoiceFigures(allInvoices, period, now) : null), [allInvoices, period, now]);
  const live: LiveFigures = {
    customers: metrics
      ? { count: metrics.totals.customers, change: changeOf(metrics.totals.customers, metrics.previousTotals.customers), activeBusinesses }
      : null,
    invoices: invoiceFigures,
    invoicesFailed,
    previousLabel,
  };

  // The other widgets (Sales Analytics, Top Selling Products, Top Users, Recent Activity) for the same period.
  const homeLive = useMemo<HomeLive>(
    () => ({
      periodLabel,
      sales: allInvoices ? buildSales(allInvoices, period, now) : null,
      topProducts: allInvoices ? buildTopProducts(allInvoices, period, now) : null,
      topBuyers: allInvoices ? buildTopBuyers(allInvoices, period, now) : null,
      activity: allInvoices && withParties ? buildActivity(allInvoices, withParties, period, now) : null,
      invoicesFailed,
    }),
    [allInvoices, withParties, period, now, periodLabel, invoicesFailed],
  );

  // Alt + C / I / P open the shortcuts (ignored while typing in a field).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const shortcut = shortcuts.find((item) => item.key === event.key.toLowerCase());
      if (!shortcut) return;
      event.preventDefault();
      navigate(shortcut.to);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcuts, navigate]);

  const maxShare = Math.max(0.0001, ...(metrics?.commodities ?? []).map((item) => item.share));

  return (
    <HomeLiveContext.Provider value={homeLive}>
    <div className="home">
      {/* ---------------- header: period toggle + shortcuts ---------------- */}
      <div className="home__toolbar">
        <div className="home-periods" role="radiogroup" aria-label="Period">
          {PERIODS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={period === item.key}
              className={`home-periods__option ${period === item.key ? "is-active" : ""}`}
              onClick={() => pickPeriod(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {shortcuts.length > 0 && (
          <nav className="home-shortcuts" aria-label="Shortcuts">
            {shortcuts.map(({ key, label, to, icon: Icon }) => (
              <Link key={key} to={to} className="home-shortcuts__link" aria-keyshortcuts={`Alt+${key.toUpperCase()}`} title={`${label} (Alt+${key.toUpperCase()})`}>
                <Icon aria-hidden />
                <span>{label}</span>
                <kbd aria-hidden>Alt+{key.toUpperCase()}</kbd>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {isError ? (
        <div className="home-card home-card--message" role="alert">
          <CircleAlertIcon aria-hidden /> The dashboard could not be loaded. Please refresh the page.
        </div>
      ) : isLoading || !metrics ? (
        <div className="home__kpis" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className="home-kpi">
              <Skeleton lines={3} />
            </div>
          ))}
        </div>
      ) : null}

      {/* The stat cards wait for nothing: shown in every state, right after the contract cards. */}
      {(isError || isLoading || !metrics) && afterKpis?.(live)}

      {!isError && !isLoading && metrics && (
        <>
          {/* ---------------- headline numbers for the period ---------------- */}
          <section className="home__kpis" aria-label={`${periodLabel} at a glance`}>
            {contractCards(metrics, previousLabel).map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
            {/* Needs action now (not tied to the period), in the fourth place of the row. */}
            <div className="home__actions" role="group" aria-label="Needs action">
              <ActionCard
                tone="blue"
                icon={FileTextIcon}
                title="Contract approval"
                count={metrics.awaitingApproval}
                text="Contracts waiting to be approved"
                to="/admin/contracts?focus=approval"
                cta="Review"
              />
              <ActionCard
                tone="orange"
                icon={TruckIcon}
                title="Truck placement"
                count={metrics.awaitingTrucks}
                text="Open contracts with no trucks arranged"
                to="/admin/truck-management/open-pending-contracts"
                cta="Place trucks"
              />
              <ActionCard
                tone="green"
                icon={TruckIcon}
                title="Truck approval"
                count={null}
                text="Freight and trucks waiting for approval"
                to="/admin/truck-management/open-pending-contracts"
                cta="Approve"
              />
            </div>
          </section>

          {afterKpis?.(live)}

          <div className="home__grid">
            {/* ---------------- commodity analytics ---------------- */}
            <section className="home-card" aria-labelledby="home-commodity-title">
              <div className="home-card__head">
                <div>
                  <h2 id="home-commodity-title" className="home-card__title">
                    Commodity analytics
                  </h2>
                  <p className="home-card__sub">Quantity by product · {periodLabel}</p>
                </div>
              </div>
              {metrics.commodities.length === 0 ? (
                <p className="home-card__empty">No contracts in this period.</p>
              ) : (
                <ul className="home-commodities">
                  {metrics.commodities.map((item) => (
                    <li key={item.name}>
                      <div className="home-commodities__row">
                        <span className="home-commodities__name">{item.name}</span>
                        <span className="home-commodities__value">
                          {formatMT(item.quantity)} · {Math.round(item.share * 100)}%
                        </span>
                      </div>
                      <span className="home-commodities__bar" aria-hidden>
                        <span style={{ width: `${(item.share / maxShare) * 100}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ---------------- price movements ---------------- */}
            <section className="home-card" aria-labelledby="home-prices-title">
              <div className="home-card__head">
                <div>
                  <h2 id="home-prices-title" className="home-card__title">
                    Price movements
                  </h2>
                  <p className="home-card__sub">Average contract rate per MT vs {previousLabel}</p>
                </div>
              </div>
              {metrics.prices.length === 0 ? (
                <p className="home-card__empty">No contracts in this period.</p>
              ) : (
                <table className="home-prices">
                  <thead>
                    <tr>
                      <th scope="col">Product</th>
                      <th scope="col">Rate</th>
                      <th scope="col">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.prices.map((item) => {
                      const tone = item.change === null ? "none" : item.change > 0.0005 ? "up" : item.change < -0.0005 ? "down" : "flat";
                      const Glyph = tone === "up" ? TrendingUpIcon : tone === "down" ? TrendingDownIcon : null;
                      return (
                        <tr key={item.product}>
                          <th scope="row">{item.product}</th>
                          <td>{item.current !== null ? formatRupees(item.current) : "—"}</td>
                          <td>
                            {item.change === null ? (
                              <span className="home-change home-change--none">New</span>
                            ) : (
                              <span className={`home-change home-change--${tone}`}>
                                {Glyph && <Glyph aria-hidden />} {percent(item.change)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </>
      )}
    </div>
    {children}
    </HomeLiveContext.Provider>
  );
};

export default HomeOverview;
