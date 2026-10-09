import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiDollarSign, FiFileText, FiCheckCircle, FiClock } from "react-icons/fi";
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
import { useLazyGetInvoicesQuery, type Invoice } from "../../store/sellerInvoiceApi";
import DatePickerInput from "../../components/dropdown/DatePickerInput";
import SearchableSelect from "../../components/dropdown/SearchableSelect";
import "./PaymentsDashboard.scss";

interface DashboardEntry {
  id: string;
  label: string;
  path: string;
}

interface PaymentsDashboardProps {
  entries: DashboardEntry[];
}

const PAGE_SIZE = 100;
const STATUS_COLORS: Record<string, string> = {
  Paid: "#2e9e5b",
  "Partially Paid": "#2f8fd6",
  Pending: "#faa41a",
  Cancelled: "#e0483c",
};
const CHART_COLORS = ["#2f8fd6", "#2e9e5b", "#faa41a", "#7657d5", "#e0483c"];

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const PaymentsDashboard = ({ entries }: PaymentsDashboardProps) => {
  const { can } = useAuth();
  const canViewInvoices = can("seller-invoice.view");
  const [loadInvoices] = useLazyGetInvoicesQuery();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(canViewInvoices);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [contractFilter, setContractFilter] = useState("");

  useEffect(() => {
    if (!canViewInvoices) {
      setLoading(false);
      setInvoices([]);
      return;
    }

    let active = true;
    setLoading(true);
    setHasError(false);

    const loadAllPages = async (status?: string): Promise<Invoice[]> => {
      const firstPage = await loadInvoices({ page: 1, pageSize: PAGE_SIZE, status }).unwrap();
      const pages: Invoice[][] = [firstPage.items];
      const pageCount = Math.ceil(firstPage.total / PAGE_SIZE);

      for (let start = 2; start <= pageCount; start += 5) {
        const pageNumbers = Array.from({ length: Math.min(5, pageCount - start + 1) }, (_, index) => start + index);
        const results = await Promise.all(
          pageNumbers.map((page) => loadInvoices({ page, pageSize: PAGE_SIZE, status }).unwrap()),
        );
        pages.push(...results.map((result) => result.items));
      }

      return pages.flat();
    };

    Promise.all([loadAllPages(), loadAllPages("Cancelled")])
      .then(([regularInvoices, cancelledInvoices]) => {
        if (active) setInvoices([...regularInvoices, ...cancelledInvoices]);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canViewInvoices, loadInvoices, reloadKey]);

  const contractOptions = useMemo(
    () => Array.from(new Set(invoices.map((invoice) => invoice.contractNumber).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
      .map((contractNumber) => ({ value: contractNumber, label: contractNumber })),
    [invoices],
  );
  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    const invoiceDate = invoice.invoiceDate.slice(0, 10);
    if (dateFrom && invoiceDate < dateFrom) return false;
    if (dateTo && invoiceDate > dateTo) return false;
    if (contractFilter && invoice.contractNumber !== contractFilter) return false;
    return true;
  }), [invoices, dateFrom, dateTo, contractFilter]);
  const activeInvoices = useMemo(() => filteredInvoices.filter((invoice) => invoice.status !== "Cancelled"), [filteredInvoices]);
  const totals = useMemo(() => activeInvoices.reduce(
    (summary, invoice) => ({
      payable: summary.payable + invoice.payableAmount,
      paid: summary.paid + invoice.paidAmount,
      outstanding: summary.outstanding + invoice.balanceAmount,
    }),
    { payable: 0, paid: 0, outstanding: 0 },
  ), [activeInvoices]);

  const statusData = useMemo(() => {
    const counts = filteredInvoices.reduce<Record<string, number>>((result, invoice) => {
      result[invoice.status] = (result[invoice.status] ?? 0) + 1;
      return result;
    }, {});
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [filteredInvoices]);

  const monthlyData = useMemo(() => {
    const toMonth = (value: string) => {
      const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
      return Number.isNaN(date.getTime()) ? null : date;
    };
    const invoiceDates = activeInvoices
      .map((invoice) => toMonth(invoice.invoiceDate))
      .filter((date): date is Date => date !== null);
    const today = new Date();
    const defaultStart = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const earliestInvoice = invoiceDates.length > 0
      ? new Date(Math.min(...invoiceDates.map((date) => date.getTime())))
      : defaultStart;
    const start = dateFrom ? toMonth(dateFrom) : earliestInvoice > defaultStart ? earliestInvoice : defaultStart;
    const end = dateTo ? toMonth(dateTo) : new Date(today.getFullYear(), today.getMonth(), 1);
    if (!start || !end || start > end) return [];
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    const monthCount = (endMonth.getFullYear() - startMonth.getFullYear()) * 12 + endMonth.getMonth() - startMonth.getMonth() + 1;
    const firstMonth = monthCount > 12 ? new Date(endMonth.getFullYear(), endMonth.getMonth() - 11, 1) : startMonth;
    const months = Array.from({ length: Math.max(1, Math.min(monthCount, 12)) }, (_, index) => {
      const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        paid: 0,
        outstanding: 0,
      };
    });
    const monthIndex = new Map(months.map((month, index) => [month.key, index]));

    activeInvoices.forEach((invoice) => {
      const date = new Date(invoice.invoiceDate);
      if (Number.isNaN(date.getTime())) return;
      const index = monthIndex.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (index === undefined) return;
      months[index].paid += invoice.paidAmount;
      months[index].outstanding += invoice.balanceAmount;
    });
    return months;
  }, [activeInvoices, dateFrom, dateTo]);

  const quickLinks = entries;
  const metrics = canViewInvoices ? [
    { label: "Invoices", value: filteredInvoices.length, icon: FiFileText, color: "payments-dashboard__card--navy" },
    { label: "Payable amount", value: money(totals.payable), icon: FiDollarSign, color: "payments-dashboard__card--blue" },
    { label: "Paid amount", value: money(totals.paid), icon: FiCheckCircle, color: "payments-dashboard__card--green" },
    { label: "Amount due", value: money(totals.outstanding), icon: FiClock, color: "payments-dashboard__card--orange" },
  ] : [];

  return (
    <section className="payments-dashboard" aria-label="Payments summary">
      <div className="payments-dashboard__intro">
        <div>
          <p className="payments-dashboard__eyebrow">PAYMENTS OVERVIEW</p>
          <h2 className="payments-dashboard__heading">Payments dashboard</h2>
          <p className="payments-dashboard__description">A clear summary of invoices and payment activity.</p>
        </div>
      </div>

      {canViewInvoices && (
        <>
          <div className="payments-dashboard__filters" aria-label="Filter payment dashboard">
            <label className="payments-dashboard__filter">
              <span>From</span>
              <DatePickerInput value={dateFrom} onChange={setDateFrom} max={dateTo || undefined} ariaLabel="Filter invoices from date" clearable />
            </label>
            <label className="payments-dashboard__filter">
              <span>To</span>
              <DatePickerInput value={dateTo} onChange={setDateTo} min={dateFrom || undefined} ariaLabel="Filter invoices to date" clearable />
            </label>
            <label className="payments-dashboard__filter payments-dashboard__filter--contract">
              <span>Contract</span>
              <SearchableSelect options={contractOptions} value={contractFilter} onChange={setContractFilter} placeholder="All contracts" ariaLabel="Filter by contract" clearable />
            </label>
            {(dateFrom || dateTo || contractFilter) && (
              <button type="button" className="payments-dashboard__clear" onClick={() => { setDateFrom(""); setDateTo(""); setContractFilter(""); }}>
                Clear filters
              </button>
            )}
          </div>
          <div className="payments-dashboard__grid">
            {metrics.map(({ label, value, icon: Icon, color }) => (
              <Link className={`payments-dashboard__card ${color}`} to="/payments/seller-invoice" key={label}>
                <span className="payments-dashboard__icon"><Icon aria-hidden /></span>
                <span className="payments-dashboard__content">
                  <span className="payments-dashboard__label">{label}</span>
                  <strong className="payments-dashboard__value">{loading ? "…" : value}</strong>
                </span>
              </Link>
            ))}
          </div>

          {hasError ? (
            <div className="payments-dashboard__message" role="alert">
              <span>Could not load invoice totals.</span>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
            </div>
          ) : (
            <div className="payments-dashboard__charts">
              <section className="payments-dashboard__panel">
                <div className="payments-dashboard__panel-heading">
                  <span className="payments-dashboard__panel-icon"><FiDollarSign aria-hidden /></span>
                  <div>
                    <h3>Payment activity</h3>
                    <p>Paid and outstanding amounts for the selected filters (up to 12 months shown)</p>
                  </div>
                </div>
                {loading ? <p className="payments-dashboard__muted">Loading payment activity…</p> : (
                  <ResponsiveContainer width="100%" height={260} minWidth={0}>
                    <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(value: number) => value >= 100000 ? `₹${Math.round(value / 100000)}L` : `₹${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => money(Number(value))} />
                      <Bar dataKey="paid" name="Paid" fill="#2e9e5b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outstanding" name="Amount due" fill="#2f8fd6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </section>

              <section className="payments-dashboard__panel">
                <div className="payments-dashboard__panel-heading">
                  <span className="payments-dashboard__panel-icon"><FiFileText aria-hidden /></span>
                  <div>
                    <h3>Invoice status</h3>
                    <p>Invoices grouped by payment status</p>
                  </div>
                </div>
                {loading ? <p className="payments-dashboard__muted">Loading invoice statuses…</p> : statusData.length === 0 ? <p className="payments-dashboard__muted">No invoices match these filters.</p> : (
                  <ResponsiveContainer width="100%" height={260} minWidth={0}>
                    <PieChart>
                      <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius="68%" label={({ name, value }) => `${name}: ${value}`}>
                        {statusData.map(({ status }, index) => <Cell key={status} fill={STATUS_COLORS[status] ?? CHART_COLORS[index % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </section>
            </div>
          )}
        </>
      )}

      {quickLinks.length > 0 && (
        <section className="payments-dashboard__quick-panel">
          <div>
            <h3>Payment tools</h3>
            <p>Open a payment area</p>
          </div>
          <div className="payments-dashboard__links">
            {quickLinks.map((entry) => (
              <Link to={entry.path} key={entry.id} className="payments-dashboard__quick-link">
                <span>{entry.label}</span><FiArrowUpRight aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default PaymentsDashboard;
