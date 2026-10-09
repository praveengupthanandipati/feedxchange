import { Link } from "react-router-dom";
import { FiArrowUpRight, FiFileText, FiLayers, FiDollarSign, FiCalendar, FiTrendingUp } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./ReportsDashboard.scss";

interface DashboardEntry {
  id: string;
  label: string;
  path: string;
}

interface ReportsDashboardProps {
  entries: DashboardEntry[];
}

const REPORT_GROUPS = [
  {
    id: "sales",
    label: "Sales & accounts",
    icon: FiDollarSign,
    color: "reports-dashboard__card--blue",
    paths: ["/reports/seller-invoice-reports", "/reports/seller-buyer-accounts", "/reports/account-statement"],
  },
  {
    id: "contracts",
    label: "Contracts & supply",
    icon: FiLayers,
    color: "reports-dashboard__card--navy",
    paths: ["/reports/contract-wise-status", "/reports/contract-summary", "/reports/pending-supplies"],
  },
  {
    id: "payments",
    label: "Payments",
    icon: FiTrendingUp,
    color: "reports-dashboard__card--green",
    paths: ["/reports/pending-payments"],
  },
  {
    id: "periodic",
    label: "Monthly reports",
    icon: FiCalendar,
    color: "reports-dashboard__card--orange",
    paths: ["/reports/monthly-reports"],
  },
] as const;

const VALID_REPORT_PATHS = new Set(REPORT_GROUPS.flatMap((group) => group.paths));

const ReportsDashboard = ({ entries }: ReportsDashboardProps) => {
  const reports = entries.filter((entry) => VALID_REPORT_PATHS.has(entry.path as (typeof REPORT_GROUPS)[number]["paths"][number]));
  const groups = REPORT_GROUPS.map((group) => ({
    ...group,
    reports: group.paths.flatMap((path) => reports.filter((entry) => entry.path === path)),
  })).filter((group) => group.reports.length > 0);
  const chartData = groups.map((group) => ({ category: group.label, reports: group.reports.length }));
  const reportCount = reports.length;

  return (
    <section className="reports-dashboard" aria-label="Reports overview">
      <div className="reports-dashboard__intro">
        <div>
          <p className="reports-dashboard__eyebrow">REPORTS OVERVIEW</p>
          <h2 className="reports-dashboard__heading">Reports dashboard</h2>
          <p className="reports-dashboard__description">Find the right report for sales, accounts, contracts, and payments.</p>
        </div>
      </div>

      <div className="reports-dashboard__grid">
        {groups.map(({ id, label, icon: Icon, color, reports: groupReports }) => (
          <Link className={`reports-dashboard__card ${color}`} to={groupReports[0].path} key={id}>
            <span className="reports-dashboard__icon"><Icon aria-hidden /></span>
            <span className="reports-dashboard__content">
              <span className="reports-dashboard__label">{label}</span>
              <strong className="reports-dashboard__value">{groupReports.length} {groupReports.length === 1 ? "report" : "reports"}</strong>
            </span>
          </Link>
        ))}
      </div>

      <div className="reports-dashboard__lower">
        <section className="reports-dashboard__panel">
          <div className="reports-dashboard__panel-heading">
            <span className="reports-dashboard__panel-icon"><FiFileText aria-hidden /></span>
            <div>
              <h3>Report types available</h3>
              <p>{reportCount} reports are available in your menu. Open a report to view its data.</p>
            </div>
          </div>
          {chartData.length === 0 ? (
            <p className="reports-dashboard__muted">No reports are available for your account.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260} minWidth={0}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="category" width={125} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value} ${Number(value) === 1 ? "report" : "reports"}`, "Available"]} />
                <Bar dataKey="reports" name="Reports" fill="#2f8fd6" radius={[0, 5, 5, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="reports-dashboard__panel reports-dashboard__panel--links">
          <div>
            <h3>Open a report</h3>
            <p>Choose a report to view details</p>
          </div>
          <div className="reports-dashboard__links">
            {reports.map((entry) => (
              <Link to={entry.path} key={entry.id} className="reports-dashboard__quick-link">
                <span>{entry.label}</span><FiArrowUpRight aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default ReportsDashboard;
