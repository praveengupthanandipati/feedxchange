import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiTruck, FiUser, FiActivity, FiArrowUpRight, FiPackage } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../auth/AuthContext";
import { useGetAllActiveTruckDetailsQuery } from "../../store/trucksApi";
import { useGetAllActiveDriversQuery } from "../../store/driversApi";
import { useGetAllTripsQuery } from "../../store/truckTripApi";
import { useGetTransporterProfileSummaryQuery } from "../../store/transportersApi";
import DatePickerInput from "../../components/dropdown/DatePickerInput";
import "./TransportersDashboard.scss";

interface DashboardMetric {
  label: string;
  value: string | number;
  icon: typeof FiUsers;
  path: string;
  color: string;
}

interface DashboardEntry {
  id: string;
  label: string;
  path: string;
}

interface TransportersDashboardProps {
  entries: DashboardEntry[];
}

const QUICK_LINK_PATHS = new Set([
  "/truck-management/transporters/truck-master",
  "/truck-management/transporters/driver-master",
  "/truck-management/transporters/driver-truck-mapping",
  "/truck-management/transporters/truck-trips",
]);
const CHART_COLORS = ["#2f8fd6", "#2e9e5b", "#faa41a", "#7657d5"];

const isWithinDateRange = (value: string | null | undefined, from: string, to: string) => {
  if (!from && !to) return true;
  if (!value) return false;
  const date = value.slice(0, 10);
  return (!from || date >= from) && (!to || date <= to);
};

const TransportersDashboard = ({ entries }: TransportersDashboardProps) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { can, roleName, businessUnitType } = useAuth();
  const isTransporterUser = `${roleName} ${businessUnitType}`.toLowerCase().includes("transport");
  const canViewTransporters = can("profiles.transporter.view");
  const canViewTrucks = can("truck-master.view", "truck-master.manage");
  const canViewDrivers = can("drivers-master.view", "drivers-master.manage");
  const canViewTrips = can("truck-trips.view", "truck-trips.manage");

  const { data: transporters, isFetching: transportersLoading } = useGetTransporterProfileSummaryQuery(undefined, {
    skip: !canViewTransporters || !isTransporterUser,
  });
  const { data: trucks, isFetching: trucksLoading } = useGetAllActiveTruckDetailsQuery(undefined, {
    skip: !canViewTrucks,
  });
  const { data: drivers, isFetching: driversLoading } = useGetAllActiveDriversQuery(undefined, {
    skip: !canViewDrivers,
  });
  const { data: trips, isFetching: tripsLoading } = useGetAllTripsQuery(undefined, {
    skip: !canViewTrips,
  });

  const filteredTrucks = useMemo(
    () => (trucks ?? []).filter((truck) => truck.isActive && isWithinDateRange(truck.createdOn, dateFrom, dateTo)),
    [trucks, dateFrom, dateTo],
  );
  const filteredDrivers = useMemo(
    () => (drivers ?? []).filter((driver) => driver.isActive && isWithinDateRange(driver.createdOn, dateFrom, dateTo)),
    [drivers, dateFrom, dateTo],
  );
  const filteredTrips = useMemo(
    () => (trips ?? []).filter((trip) => trip.isActive && isWithinDateRange(trip.startDate, dateFrom, dateTo)),
    [trips, dateFrom, dateTo],
  );

  const metrics: DashboardMetric[] = [];
  if (canViewTransporters && isTransporterUser) {
    metrics.push({
      label: "Active Transporters",
      value: transportersLoading ? "…" : (transporters ?? []).filter((item) => item.status === "Active").length,
      icon: FiUsers,
      path: "/transporters",
      color: "transporters-dashboard__card--navy",
    });
  }
  if (canViewTrucks) {
    metrics.push({
      label: "Active Trucks",
      value: trucksLoading ? "…" : filteredTrucks.length,
      icon: FiTruck,
      path: "/truck-management/transporters/truck-master",
      color: "transporters-dashboard__card--blue",
    });
  }
  if (canViewDrivers) {
    metrics.push({
      label: "Active Drivers",
      value: driversLoading ? "…" : filteredDrivers.length,
      icon: FiUser,
      path: "/truck-management/transporters/driver-master",
      color: "transporters-dashboard__card--green",
    });
  }
  if (canViewTrips) {
    metrics.push({
      label: "Active Trips",
      value: tripsLoading ? "…" : filteredTrips.length,
      icon: FiActivity,
      path: "/truck-management/transporters/truck-trips",
      color: "transporters-dashboard__card--orange",
    });
  }

  if (metrics.length === 0) return null;

  const truckTypes = filteredTrucks.reduce<Record<string, number>>((totals, truck) => {
    const type = truck.truckType?.trim() || "Other";
    totals[type] = (totals[type] ?? 0) + 1;
    return totals;
  }, {});
  const truckTypeRows = Object.entries(truckTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const tripStatuses = filteredTrips.reduce<Record<string, number>>((totals, trip) => {
    const status = trip.tripStatus?.trim() || "Unspecified";
    totals[status] = (totals[status] ?? 0) + 1;
    return totals;
  }, {});
  const tripStatusRows = Object.entries(tripStatuses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const quickLinks = entries.filter((entry) => QUICK_LINK_PATHS.has(entry.path));
  const showCharts = canViewTrucks || canViewTrips;

  return (
    <section className="transporters-dashboard" aria-label="Transporters summary">
      <div className="transporters-dashboard__intro">
        <div>
          <p className="transporters-dashboard__eyebrow">TRANSPORTER OVERVIEW</p>
          <h2 className="transporters-dashboard__heading">Transport operations</h2>
          <p className="transporters-dashboard__description">A simplified view of transporters and the tools available to you.</p>
        </div>
      </div>
      {(canViewTrucks || canViewDrivers || canViewTrips) && (
        <div className="transporters-dashboard__filters" aria-label="Filter transporter dashboard by date">
          <label className="transporters-dashboard__filter">
            <span>From</span>
            <DatePickerInput value={dateFrom} onChange={setDateFrom} max={dateTo || undefined} ariaLabel="Filter transporter data from date" clearable />
          </label>
          <label className="transporters-dashboard__filter">
            <span>To</span>
            <DatePickerInput value={dateTo} onChange={setDateTo} min={dateFrom || undefined} ariaLabel="Filter transporter data to date" clearable />
          </label>
          {(dateFrom || dateTo) && (
            <button type="button" className="transporters-dashboard__clear" onClick={() => { setDateFrom(""); setDateTo(""); }}>
              Clear dates
            </button>
          )}
        
        </div>
      )}
      <div className="transporters-dashboard__grid">
        {metrics.map(({ label, value, icon: Icon, path, color }) => (
          <Link className={`transporters-dashboard__card ${color}`} to={path} key={label}>
            <span className="transporters-dashboard__icon"><Icon aria-hidden /></span>
            <span className="transporters-dashboard__content">
              <span className="transporters-dashboard__label">{label}</span>
              <strong className="transporters-dashboard__value">{value}</strong>
            </span>
          </Link>
        ))}
      </div>
      {(showCharts || quickLinks.length > 0) && (
        <div className="transporters-dashboard__lower">
          {showCharts && (
            <section className="transporters-dashboard__panel">
              <div className="transporters-dashboard__panel-heading">
                <span className="transporters-dashboard__panel-icon"><FiPackage aria-hidden /></span>
                <div>
                  <h3>Transporter analytics</h3>
                  <p>Active trucks and trip distribution</p>
                </div>
              </div>
              <div className={`transporters-dashboard__charts ${canViewTrucks && canViewTrips ? "" : "transporters-dashboard__charts--single"}`}>
                {canViewTrucks && (
                  <div className="transporters-dashboard__chart">
                    <h4>Active trucks by type</h4>
                    {trucksLoading ? <p className="transporters-dashboard__muted">Loading trucks…</p> : truckTypeRows.length === 0 ? <p className="transporters-dashboard__muted">No active trucks found.</p> : (
                      <ResponsiveContainer width="100%" height={220} minWidth={0}>
                        <BarChart data={truckTypeRows.map(([type, count]) => ({ type, count }))} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="type" tick={{ fontSize: 11 }} interval={0} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" name="Trucks" fill="#2f8fd6" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
                {canViewTrips && (
                  <div className="transporters-dashboard__chart">
                    <h4>Active trips by status</h4>
                    {tripsLoading ? <p className="transporters-dashboard__muted">Loading trips…</p> : tripStatusRows.length === 0 ? <p className="transporters-dashboard__muted">No active trips found.</p> : (
                      <ResponsiveContainer width="100%" height={220} minWidth={0}>
                        <PieChart>
                          <Pie data={tripStatusRows.map(([status, count]) => ({ status, count }))} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius="72%" label={({ name, value }) => `${name}: ${value}`}>
                            {tripStatusRows.map(([status], index) => <Cell key={status} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
          {quickLinks.length > 0 && (
            <section className="transporters-dashboard__panel transporters-dashboard__panel--links">
              <h3>Quick access</h3>
              <p>Open a transporter management area</p>
              <div className="transporters-dashboard__links">
                {quickLinks.map((entry) => (
                  <Link to={entry.path} key={entry.id} className="transporters-dashboard__quick-link">
                    <span>{entry.label}</span><FiArrowUpRight aria-hidden />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
};

export default TransportersDashboard;
