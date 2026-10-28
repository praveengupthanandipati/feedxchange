import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ActivityIcon,
  ArrowUpRightIcon,
  TagIcon,
  UserPlusIcon,
  UsersIcon,
} from "../../../../../shared/components/icon";
import { useAuth } from "../../../../../core/auth/AuthContext";
import { useGetPromoterProfileSummaryQuery } from "../../../../../core/store/promotersApi";
import "./PromoterDashboard.scss";

const CHART_COLORS = ["var(--fx-chart-1)", "var(--fx-chart-2)", "var(--fx-chart-3)", "var(--fx-chart-4)", "var(--fx-chart-5)"];

const PromoterDashboard = () => {
  const { can } = useAuth();
  const canViewPromoters = can("profiles.promoter.view", "profiles.promoter.manage");
  const canViewReferrals = can("profiles.referred");
  const canViewPromoCodes = can("promocodes.view");
  const {
    data: promoters,
    isFetching,
    isError,
  } = useGetPromoterProfileSummaryQuery(undefined, {
    skip: !canViewPromoters,
    refetchOnMountOrArgChange: true,
  });

  const summary = useMemo(() => {
    const profiles = promoters ?? [];
    return {
      profiles,
      activePromoters: profiles.filter((promoter) => promoter.status === "Active").length,
      totalReferrals: profiles.reduce((total, promoter) => total + promoter.totalReferrals, 0),
      activeReferrals: profiles.reduce((total, promoter) => total + promoter.totalActiveReferrals, 0),
      topPromoters: [...profiles]
        .sort((a, b) => b.totalReferrals - a.totalReferrals)
        .slice(0, 5)
        .map((promoter) => ({
          name: promoter.tradingName || promoter.legalName,
          referrals: promoter.totalReferrals,
        })),
      promoterStatuses: Array.from(
        profiles.reduce((statuses, promoter) => {
          statuses.set(promoter.status, (statuses.get(promoter.status) ?? 0) + 1);
          return statuses;
        }, new Map<string, number>()),
        ([status, count]) => ({ status, count }),
      ),
    };
  }, [promoters]);

  const value = (count: number) => {
    if (isFetching) return "…";
    if (isError) return "—";
    return count.toLocaleString("en-IN");
  };

  const quickLinks = [
    ...(canViewPromoters ? [{ label: "Promoter profiles", path: "/admin/promoters", icon: UsersIcon }] : []),
    ...(canViewReferrals ? [{ label: "Referred profiles", path: "/admin/referred-profiles", icon: UserPlusIcon }] : []),
    ...(canViewPromoCodes ? [{ label: "Promocodes", path: "/admin/promocodes", icon: TagIcon }] : []),
  ];

  if (!canViewPromoters && quickLinks.length === 0) {
    return (
      <section className="promoter-overview">
        <div className="promoter-overview__intro">
          <p className="promoter-overview__eyebrow">PROMOTER OVERVIEW</p>
          <h1 className="promoter-overview__heading">Promoter performance</h1>
          <p className="promoter-overview__description">No promoter dashboard data or actions are available for your role.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="promoter-overview" aria-label="Promoter dashboard">
      <div className="promoter-overview__intro">
        <div>
          <p className="promoter-overview__eyebrow">PROMOTER OVERVIEW</p>
          <h1 className="promoter-overview__heading">Promoter performance</h1>
          <p className="promoter-overview__description">
            Referral activity and promoter profile totals at a glance.
          </p>
        </div>
      </div>

      {canViewPromoters && (
        <>
          {isError && (
            <p className="promoter-overview__message promoter-overview__message--error" role="alert">
              Could not load promoter dashboard data. Please try again later.
            </p>
          )}
          <div className="promoter-overview__grid">
            <Link to="/admin/promoters" className="promoter-overview__card promoter-overview__card--navy">
              <span className="promoter-overview__icon"><UsersIcon aria-hidden /></span>
              <span className="promoter-overview__content">
                <span className="promoter-overview__label">Promoter Profiles</span>
                <strong className="promoter-overview__value">{value(summary.profiles.length)}</strong>
              </span>
            </Link>
            <Link to="/admin/promoters" className="promoter-overview__card promoter-overview__card--blue">
              <span className="promoter-overview__icon"><ActivityIcon aria-hidden /></span>
              <span className="promoter-overview__content">
                <span className="promoter-overview__label">Active Promoters</span>
                <strong className="promoter-overview__value">{value(summary.activePromoters)}</strong>
              </span>
            </Link>
            <Link to={canViewReferrals ? "/admin/referred-profiles" : "/admin/promoters"} className="promoter-overview__card promoter-overview__card--green">
              <span className="promoter-overview__icon"><UserPlusIcon aria-hidden /></span>
              <span className="promoter-overview__content">
                <span className="promoter-overview__label">Total Referrals</span>
                <strong className="promoter-overview__value">{value(summary.totalReferrals)}</strong>
              </span>
            </Link>
            <Link to={canViewReferrals ? "/admin/referred-profiles" : "/admin/promoters"} className="promoter-overview__card promoter-overview__card--orange">
              <span className="promoter-overview__icon"><UserPlusIcon aria-hidden /></span>
              <span className="promoter-overview__content">
                <span className="promoter-overview__label">Active Referrals</span>
                <strong className="promoter-overview__value">{value(summary.activeReferrals)}</strong>
              </span>
            </Link>
          </div>

          <div className="promoter-overview__lower">
            <section className="promoter-overview__panel">
              <div className="promoter-overview__panel-heading">
                <span className="promoter-overview__panel-icon"><ActivityIcon aria-hidden /></span>
                <div>
                  <h2>Referral analytics</h2>
                  <p>Top promoters by total referrals and profile status</p>
                </div>
              </div>
              {isFetching ? (
                <p className="promoter-overview__muted" role="status">Loading promoter analytics…</p>
              ) : isError ? (
                <p className="promoter-overview__muted">Referral analytics are unavailable because promoter data could not be loaded.</p>
              ) : summary.profiles.length === 0 ? (
                <p className="promoter-overview__muted">No promoter profiles found.</p>
              ) : (
                <div className="promoter-overview__charts">
                  <div className="promoter-overview__chart">
                    <h3>Top promoters by referrals</h3>
                    <ResponsiveContainer width="100%" height={240} minWidth={0}>
                      <BarChart data={summary.topPromoters} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="referrals" name="Referrals" fill="var(--fx-chart-1)" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="promoter-overview__chart">
                    <h3>Promoter profile status</h3>
                    <ResponsiveContainer width="100%" height={240} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={summary.promoterStatuses}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius="72%"
                        >
                          {summary.promoterStatuses.map((entry, index) => (
                            <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </section>

            {quickLinks.length > 0 && (
              <section className="promoter-overview__panel promoter-overview__panel--links">
                <h2>Quick access</h2>
                <p>Open a promoter management area</p>
                <div className="promoter-overview__links">
                  {quickLinks.map(({ label, path, icon: Icon }) => (
                    <Link to={path} key={path} className="promoter-overview__quick-link">
                      <span><Icon aria-hidden />{label}</span>
                      <ArrowUpRightIcon aria-hidden />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}

      {!canViewPromoters && quickLinks.length > 0 && (
        <section className="promoter-overview__panel promoter-overview__panel--links">
          <h2>Quick access</h2>
          <p>Open an area available to your role</p>
          <div className="promoter-overview__links">
            {quickLinks.map(({ label, path, icon: Icon }) => (
              <Link to={path} key={path} className="promoter-overview__quick-link">
                <span><Icon aria-hidden />{label}</span>
                <ArrowUpRightIcon aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default PromoterDashboard;
