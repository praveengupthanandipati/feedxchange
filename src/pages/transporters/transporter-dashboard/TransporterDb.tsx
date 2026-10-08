import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHourglassHalf, FaRupeeSign } from "react-icons/fa";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiHardDrive,
  FiRefreshCw,
  FiTruck,
} from "react-icons/fi";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import MultiSelect from "../../../components/dropdown/MultiSelect";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import { transportRows, type TransportRow, type TransportStatus } from "./transporterDb.data";
import "./TransporterDb.scss";

const PAGE_SIZE = 10;
const VIEW_TRUCKS_PATH = "/truck-management/open-pending-contracts/view-trucks";

interface Filters {
  from: string;
  to: string;
  loadingCities: string[];
  unloadingCities: string[];
  freightMin: string;
  freightMax: string;
  status: string;
}

const EMPTY_FILTERS: Filters = {
  from: "",
  to: "",
  loadingCities: [],
  unloadingCities: [],
  freightMin: "",
  freightMax: "",
  status: "All",
};

const STATUS_ICONS: Record<TransportStatus, typeof FiClock> = {
  Pending: FiClock,
  Submitted: FiFileText,
  Approved: FiCheckCircle,
};

const formatInr = (value: number) => value.toLocaleString("en-IN");

const cityOptions = (values: string[]) =>
  Array.from(new Set(values)).map((value) => ({ value, label: value }));

const Rupees = ({ value }: { value: number }) => (
  <span className="transport-db__amount">
    <FaRupeeSign aria-hidden className="transport-db__rupee" />
    {formatInr(value)}
  </span>
);

const Party = ({ name, city }: { name: string; city: string }) => (
  <span className="transport-db__party">
    {name}
    <small>,{city}</small>
    <InfoTooltip text={`${name}, ${city}`} />
  </span>
);

const StatusBadge = ({ status }: { status: TransportStatus }) => {
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`transport-db__status transport-db__status--${status.toLowerCase()}`}>
      <Icon aria-hidden /> {status}
    </span>
  );
};

const BillChange = ({ value }: { value: TransportRow["billChange"] }) => (
  <span className={value === "Change Bill" ? "transport-db__bill--change" : ""}>{value}</span>
);

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TransporterDb = () => {
  const navigate = useNavigate();
  const rows = transportRows;

  const [filtersVisible, setFiltersVisible] = useState(false);
  // Edits go into `draft`; the table only changes when Apply copies them into `applied`.
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const updateDraft = (patch: Partial<Filters>) => setDraft((prev) => ({ ...prev, ...patch }));

  const loadingOptions = useMemo(() => cityOptions(rows.map((row) => row.loadingCity)), [rows]);
  const unloadingOptions = useMemo(() => cityOptions(rows.map((row) => row.unloadingCity)), [rows]);
  const statusOptions = useMemo(
    () => [{ value: "All", label: "All Status" }, ...cityOptions(rows.map((row) => row.status))],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const min = applied.freightMin === "" ? null : Number(applied.freightMin);
    const max = applied.freightMax === "" ? null : Number(applied.freightMax);

    return rows.filter((row) => {
      if (applied.from && row.scheduleDate < applied.from) return false;
      if (applied.to && row.scheduleDate > applied.to) return false;
      if (applied.loadingCities.length && !applied.loadingCities.includes(row.loadingCity)) return false;
      if (applied.unloadingCities.length && !applied.unloadingCities.includes(row.unloadingCity)) return false;
      if (min !== null && row.freight < min) return false;
      if (max !== null && row.freight > max) return false;
      if (applied.status !== "All" && row.status !== applied.status) return false;
      return true;
    });
  }, [rows, applied]);

  const stats = useMemo(
    () => ({
      trucks: filteredRows.length,
      qty: filteredRows.reduce((sum, row) => sum + row.qty, 0),
      freight: filteredRows.reduce((sum, row) => sum + row.freight, 0),
      pendingFreight: filteredRows
        .filter((row) => row.status === "Pending")
        .reduce((sum, row) => sum + row.freight, 0),
    }),
    [filteredRows],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApply = () => {
    setApplied(draft);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  const viewTrucksButton = (row: TransportRow) => (
    <button
      type="button"
      className="transport-db__view-btn"
      onClick={() => navigate(VIEW_TRUCKS_PATH)}
      aria-label={`View trucks for ${row.seller} to ${row.buyer}`}
    >
      View Trucks
    </button>
  );

  const columns: TableColumn<TransportRow>[] = [
    {
      key: "seller",
      header: "Seller",
      sortable: true,
      render: (row) => <Party name={row.seller} city={row.sellerCity} />,
    },
    {
      key: "buyer",
      header: "Buyer",
      sortable: true,
      render: (row) => <Party name={row.buyer} city={row.buyerCity} />,
    },
    { key: "scheduleDate", header: "Schedule Date", sortable: true },
    {
      key: "billChange",
      header: "Bill Change",
      sortable: true,
      render: (row) => <BillChange value={row.billChange} />,
    },
    { key: "actions", header: "Actions", render: viewTrucksButton, exportValue: () => "" },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
    { key: "loadingCity", header: "Loading City", sortable: true },
    { key: "unloadingCity", header: "Unloading City", sortable: true },
    { key: "pendingTrucks", header: "P. Trucks", headerTooltip: "Pending Trucks", sortable: true },
    {
      key: "qty",
      header: "Qty (MT)",
      sortable: true,
      render: (row) => `${row.qty} MT`,
      exportValue: (row) => `${row.qty} MT`,
    },
    {
      key: "freight",
      header: "Freight",
      sortable: true,
      render: (row) => <Rupees value={row.freight} />,
      exportValue: (row) => `₹${formatInr(row.freight)}`,
    },
  ];

  const handleExport = () => {
    const exportColumns = columns.filter((column) => column.key !== "actions");
    const head = exportColumns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const body = filteredRows
      .map((row) => {
        const cells = exportColumns
          .map((column) => {
            const value = column.exportValue
              ? column.exportValue(row)
              : String((row as unknown as Record<string, unknown>)[column.key] ?? "");
            return `<td>${escapeHtml(value)}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<meta charset="utf-8"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "transport-dashboard.xls";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="transport-db">
      <div className="transport-db__stats">
        <div className="transport-db__stat transport-db__stat--navy">
          <span><FiTruck aria-hidden /> Total Trucks</span>
          <strong>{stats.trucks}</strong>
        </div>
        <div className="transport-db__stat transport-db__stat--green">
          <span><FiHardDrive aria-hidden /> Total Qty</span>
          <strong>{stats.qty} MT</strong>
        </div>
        <div className="transport-db__stat transport-db__stat--blue">
          <span><FaRupeeSign aria-hidden /> Total Freight</span>
          <strong>₹{formatInr(stats.freight)}</strong>
        </div>
        <div className="transport-db__stat transport-db__stat--orange">
          <span><FaHourglassHalf aria-hidden /> Pending Freight</span>
          <strong>₹{formatInr(stats.pendingFreight)}</strong>
        </div>
      </div>

      <div className="transport-db__card">
        <div className="transport-db__header">
          <h1>Transport Dashboard</h1>
          <div className="transport-db__actions">
            <button
              type="button"
              className="transport-db__btn transport-db__btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
              aria-expanded={filtersVisible}
              aria-controls="transport-db-filters"
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="transport-db__btn transport-db__btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div id="transport-db-filters" className="transport-db__filters">
            <DateRangeInput
              from={draft.from}
              to={draft.to}
              onChange={(from, to) => updateDraft({ from, to })}
              placeholder="Select date range..."
              ariaLabel="Schedule date range"
            />
            <MultiSelect
              options={loadingOptions}
              value={draft.loadingCities}
              onChange={(loadingCities) => updateDraft({ loadingCities })}
              placeholder="Loading cities..."
              ariaLabel="Loading cities"
            />
            <MultiSelect
              options={unloadingOptions}
              value={draft.unloadingCities}
              onChange={(unloadingCities) => updateDraft({ unloadingCities })}
              placeholder="Unloading cities..."
              ariaLabel="Unloading cities"
            />
            <div className="transport-db__freight">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Freight Min"
                aria-label="Freight minimum"
                value={draft.freightMin}
                onChange={(event) => updateDraft({ freightMin: event.target.value })}
              />
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Freight Max"
                aria-label="Freight maximum"
                value={draft.freightMax}
                onChange={(event) => updateDraft({ freightMax: event.target.value })}
              />
            </div>
            <SearchableSelect
              options={statusOptions}
              value={draft.status}
              onChange={(status) => updateDraft({ status })}
              placeholder="Select status..."
              ariaLabel="Status"
            />
            <div className="transport-db__filter-actions">
              <button type="button" className="transport-db__btn transport-db__btn--success" onClick={handleApply}>
                <FiCheck aria-hidden /> Apply
              </button>
              <button type="button" className="transport-db__btn transport-db__btn--danger" onClick={handleReset}>
                <FiRefreshCw aria-hidden /> Reset
              </button>
            </div>
          </div>
        )}

        <div className="transport-db__table-view">
          <Table
            columns={columns}
            data={pagedRows}
            rowKey={(row) => row.id}
            emptyMessage="No transports match the current filters."
          />
        </div>

        <ul className="transport-db__cards">
          {pagedRows.length === 0 && (
            <li className="transport-db__cards-empty">
              <FiAlertCircle aria-hidden /> No transports match the current filters.
            </li>
          )}
          {pagedRows.map((row) => (
            <li key={row.id} className="transport-db__row-card">
              <div className="transport-db__row-card-top">
                <span>{row.scheduleDate}</span>
                <StatusBadge status={row.status} />
              </div>
              <dl>
                <div className="transport-db__full">
                  <dt>Seller</dt>
                  <dd>{row.seller}, {row.sellerCity}</dd>
                </div>
                <div className="transport-db__full">
                  <dt>Buyer</dt>
                  <dd>{row.buyer}, {row.buyerCity}</dd>
                </div>
                <div>
                  <dt>Loading City</dt>
                  <dd>{row.loadingCity}</dd>
                </div>
                <div>
                  <dt>Unloading City</dt>
                  <dd>{row.unloadingCity}</dd>
                </div>
                <div>
                  <dt>Bill Change</dt>
                  <dd><BillChange value={row.billChange} /></dd>
                </div>
                <div>
                  <dt>P. Trucks</dt>
                  <dd>{row.pendingTrucks}</dd>
                </div>
                <div>
                  <dt>Qty</dt>
                  <dd>{row.qty} MT</dd>
                </div>
                <div>
                  <dt>Freight</dt>
                  <dd><Rupees value={row.freight} /></dd>
                </div>
              </dl>
              <div className="transport-db__row-card-action">{viewTrucksButton(row)}</div>
            </li>
          ))}
        </ul>

        <div className="transport-db__pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, filteredRows.length)} of ${filteredRows.length} Results`}
          </p>
          <div className="transport-db__pages">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setCurrentPage(page - 1)}
              aria-label="Previous page"
            >
              <FiChevronLeft aria-hidden />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                className={number === page ? "is-active" : ""}
                onClick={() => setCurrentPage(number)}
                aria-current={number === page ? "page" : undefined}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setCurrentPage(page + 1)}
              aria-label="Next page"
            >
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterDb;
