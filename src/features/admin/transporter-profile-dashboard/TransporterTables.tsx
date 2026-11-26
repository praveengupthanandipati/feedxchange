import { useMemo, useState } from "react";
import type {
  TransporterCustomer,
  TransporterRequest,
  TransporterRoute,
  TransporterTrip,
  TransporterTruck,
} from "../../../core/store/transporterDashboardApi";
import Table from "../../../shared/components/table/Table";
import type { TableColumn } from "../../../shared/components/table/table.types";
import { ExternalLinkIcon, FileTextIcon, SearchIcon, XIcon } from "../../../shared/components/icon";
import { Badge, Button, Input, Select, type BadgeTone } from "../../../shared/components/ui";
import { formatAmount, formatDate, formatDateTime, formatQty, truckTone } from "../business-dashboard/businessDashboard.utils";

const PAGE_SIZE = 10;

const matches = (needle: string, ...values: (string | null | undefined)[]) =>
  !needle || values.some((value) => value?.toLowerCase().includes(needle));

const Toolbar = ({ children }: { children: React.ReactNode }) => (
  <div className="bd-toolbar">
    <div className="bd-toolbar__filters">{children}</div>
  </div>
);

const unique = (values: (string | null | undefined)[]) =>
  [...new Set(values.filter((v): v is string => !!v && v.trim() !== ""))].sort((a, b) => a.localeCompare(b));

const requestTone = (statusName: string): BadgeTone =>
  statusName === "Accepted" || statusName === "PartiallyAccepted"
    ? "success"
    : statusName === "Pending" || statusName === "FreightProposed"
      ? "warning"
      : statusName === "Rejected"
        ? "danger"
        : "neutral";

// ---------------------------------------------------------------- trips

interface TripsTableProps {
  trips: TransporterTrip[];
  /** Contract number set from another tab; "" = every contract. */
  contractFilter: string;
  onClearContract: () => void;
  truncated: boolean;
  maxRows: number;
  /** Transporter and period, printed under the PDF title. */
  subtitle: string;
}

export const TripsTable = ({ trips, contractFilter, onClearContract, truncated, maxRows, subtitle }: TripsTableProps) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [business, setBusiness] = useState("all");
  const [fromCity, setFromCity] = useState("all");
  const [toCity, setToCity] = useState("all");
  const [freightMin, setFreightMin] = useState("");
  const [freightMax, setFreightMax] = useState("");

  const businesses = useMemo(() => {
    const map = new Map<number, string>();
    trips.forEach((t) => {
      map.set(t.sellerId, t.seller);
      map.set(t.buyerId, t.buyer);
    });
    return [...map.entries()].filter(([, name]) => name).sort((a, b) => a[1].localeCompare(b[1]));
  }, [trips]);
  const fromCities = useMemo(() => unique(trips.map((t) => t.fromCity)), [trips]);
  const toCities = useMemo(() => unique(trips.map((t) => t.toCity)), [trips]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const min = freightMin === "" ? null : Number(freightMin);
    const max = freightMax === "" ? null : Number(freightMax);
    return trips.filter(
      (t) =>
        (!contractFilter || t.contractNumber === contractFilter) &&
        (status === "all" || t.statusName === status) &&
        (business === "all" || String(t.sellerId) === business || String(t.buyerId) === business) &&
        (fromCity === "all" || t.fromCity === fromCity) &&
        (toCity === "all" || t.toCity === toCity) &&
        (min === null || t.freightPerMT >= min) &&
        (max === null || t.freightPerMT <= max) &&
        matches(needle, t.truckNumber, t.contractNumber, t.driverName, t.lrNumber, t.seller, t.buyer, t.productName, t.fromCity, t.toCity),
    );
  }, [trips, search, status, business, fromCity, toCity, freightMin, freightMax, contractFilter]);

  const filtered = search !== "" || status !== "all" || business !== "all" || fromCity !== "all" || toCity !== "all" || freightMin !== "" || freightMax !== "";
  const clear = () => {
    setSearch("");
    setStatus("all");
    setBusiness("all");
    setFromCity("all");
    setToCity("all");
    setFreightMin("");
    setFreightMax("");
  };

  const columns: TableColumn<TransporterTrip>[] = [
    {
      key: "truckNumber",
      header: "Truck",
      sortable: true,
      hideable: false,
      render: (t) => (
        <span className="bd-cell-stack">
          <strong>{t.truckNumber || "—"}</strong>
          <small>{[t.truckType, t.capacity ? `${formatQty(t.capacity)} MT` : null].filter(Boolean).join(" · ") || t.assignmentType}</small>
        </span>
      ),
    },
    {
      key: "contractNumber",
      header: "Contract",
      sortable: true,
      render: (t) => (
        <span className="bd-cell-stack">
          <span>{t.contractNumber}</span>
          <small>{t.productName}</small>
        </span>
      ),
      exportValue: (t) => `${t.contractNumber} (${t.productName})`,
    },
    {
      key: "parties",
      header: "Seller → Buyer",
      render: (t) => (
        <span className="bd-cell-stack">
          <span>{t.seller || "—"}</span>
          <small>→ {t.buyer || "—"}</small>
        </span>
      ),
      exportValue: (t) => `${t.seller} -> ${t.buyer}`,
    },
    {
      key: "route",
      header: "Route",
      render: (t) => (t.fromCity || t.toCity ? `${t.fromCity ?? "—"} → ${t.toCity ?? "—"}` : "—"),
      exportValue: (t) => `${t.fromCity ?? ""} -> ${t.toCity ?? ""}`,
    },
    {
      key: "driverName",
      header: "Driver",
      sortable: true,
      priority: "low",
      render: (t) => (
        <span className="bd-cell-stack">
          <span>{t.driverName || "—"}</span>
          {t.driverMobile && <small>{t.driverMobile}</small>}
        </span>
      ),
    },
    { key: "quantityMT", header: "Qty (MT)", sortable: true, align: "right", render: (t) => formatQty(t.quantityMT) },
    { key: "freightPerMT", header: "Freight / MT", sortable: true, align: "right", render: (t) => formatAmount(t.freightPerMT) },
    { key: "freightValue", header: "Freight", sortable: true, align: "right", render: (t) => formatAmount(t.freightValue) },
    { key: "lrNumber", header: "LR No.", sortable: true, priority: "low", render: (t) => t.lrNumber || "—" },
    {
      key: "doNumber",
      header: "DO",
      sortable: true,
      priority: "low",
      render: (t) =>
        t.doNumber ? (
          <span className="bd-cell-stack">
            <span>{t.doNumber}</span>
            {t.doDate && <small>{formatDate(t.doDate)}</small>}
          </span>
        ) : (
          <span className="bd-muted">Pending</span>
        ),
      exportValue: (t) => (t.doNumber ? `${t.doNumber}${t.doDate ? ` (${formatDate(t.doDate)})` : ""}` : "Pending"),
      sortValue: (t) => t.doNumber ?? "",
    },
    { key: "assignedOn", header: "Assigned", sortable: true, render: (t) => formatDateTime(t.assignedOn), exportValue: (t) => formatDateTime(t.assignedOn) },
    {
      key: "statusName",
      header: "Status",
      sortable: true,
      render: (t) => (
        <span className="bd-cell-inline">
          <Badge tone={truckTone(t.statusName)}>{t.statusDisplay}</Badge>
          {t.hasInvoice && (
            <span className="bd-muted" title="Invoice attached">
              <FileTextIcon size={14} aria-label="Invoice attached" />
            </span>
          )}
          {t.trackingUrl && /^https?:\/\//i.test(t.trackingUrl) && (
            <a href={t.trackingUrl} target="_blank" rel="noopener noreferrer" className="bd-link" title="Track this truck">
              <ExternalLinkIcon size={14} aria-label={`Track ${t.truckNumber}`} />
            </a>
          )}
        </span>
      ),
      exportValue: (t) => t.statusDisplay,
    },
  ];

  const toolbar = (
    <Toolbar>
      <Input
        icon={SearchIcon}
        type="search"
        placeholder="Truck, contract, driver, LR, party…"
        aria-label="Search trips"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fieldClassName="bd-toolbar__search"
      />
      <Select aria-label="Trip status" value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="all">All statuses</option>
        <option value="Assigned">Assigned</option>
        <option value="Loaded">Loaded</option>
        <option value="Cancelled">Cancelled</option>
      </Select>
      <Select aria-label="Business" value={business} onChange={(event) => setBusiness(event.target.value)}>
        <option value="all">All businesses</option>
        {businesses.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
      <Select aria-label="Loading city" value={fromCity} onChange={(event) => setFromCity(event.target.value)}>
        <option value="all">Any loading city</option>
        {fromCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </Select>
      <Select aria-label="Delivery city" value={toCity} onChange={(event) => setToCity(event.target.value)}>
        <option value="all">Any delivery city</option>
        {toCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </Select>
      <Input type="number" min={0} aria-label="Minimum freight per MT" placeholder="Freight ≥ ₹/MT" value={freightMin} onChange={(event) => setFreightMin(event.target.value)} />
      <Input type="number" min={0} aria-label="Maximum freight per MT" placeholder="Freight ≤ ₹/MT" value={freightMax} onChange={(event) => setFreightMax(event.target.value)} />
      {contractFilter && (
        <Button size="sm" variant="ghost" icon={XIcon} onClick={onClearContract} title="Show the trips of every contract">
          Contract {contractFilter}
        </Button>
      )}
      {filtered && (
        <Button size="sm" variant="ghost" icon={XIcon} onClick={clear}>
          Clear filters
        </Button>
      )}
    </Toolbar>
  );

  return (
    <>
      {truncated && (
        <p className="bd-note" role="note">
          Showing the latest {maxRows} trips. Narrow the period to see older ones; the totals above count every trip.
        </p>
      )}
      <Table
        toolbar={toolbar}
        exportName="Transporter trips"
        exportSubtitle={subtitle}
        columns={columns}
        data={rows}
        rowKey={(t) => String(t.contractDispatchId)}
        pageSize={PAGE_SIZE}
        variant="light"
        mobileCards
        columnToggle
        emptyMessage="No trips match these filters for the selected period."
      />
    </>
  );
};

// ---------------------------------------------------------------- truck requests

export const RequestsTable = ({ requests, truncated, maxRows, subtitle }: { requests: TransporterRequest[]; truncated: boolean; maxRows: number; subtitle: string }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [negotiated, setNegotiated] = useState("all");

  const statuses = useMemo(
    () => [...new Map(requests.map((r) => [r.statusName, r.statusDisplay])).entries()].sort((a, b) => a[1].localeCompare(b[1])),
    [requests],
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return requests.filter(
      (r) =>
        (status === "all" || r.statusName === status) &&
        (negotiated === "all" || (negotiated === "yes") === r.negotiated) &&
        matches(needle, r.contractNumber, r.seller, r.buyer, r.productName, r.fromCity, r.toCity),
    );
  }, [requests, search, status, negotiated]);

  const columns: TableColumn<TransporterRequest>[] = [
    {
      key: "contractNumber",
      header: "Contract",
      sortable: true,
      hideable: false,
      render: (r) => (
        <span className="bd-cell-stack">
          <strong>{r.contractNumber}</strong>
          <small>{r.productName}</small>
        </span>
      ),
      exportValue: (r) => `${r.contractNumber} (${r.productName})`,
    },
    {
      key: "parties",
      header: "Seller → Buyer",
      render: (r) => (
        <span className="bd-cell-stack">
          <span>{r.seller || "—"}</span>
          <small>→ {r.buyer || "—"}</small>
        </span>
      ),
      exportValue: (r) => `${r.seller} -> ${r.buyer}`,
    },
    {
      key: "route",
      header: "Route",
      render: (r) => (r.fromCity || r.toCity ? `${r.fromCity ?? "—"} → ${r.toCity ?? "—"}` : "—"),
      exportValue: (r) => `${r.fromCity ?? ""} -> ${r.toCity ?? ""}`,
    },
    { key: "scheduleDateTime", header: "Schedule", sortable: true, render: (r) => formatDateTime(r.scheduleDateTime), exportValue: (r) => formatDateTime(r.scheduleDateTime) },
    {
      key: "offeredQuantityMT",
      header: "Qty (MT)",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="bd-cell-stack bd-cell-stack--end">
          <span>{formatQty(r.offeredQuantityMT)}</span>
          {r.acceptedQuantityMT !== null && <small>{formatQty(r.acceptedQuantityMT)} accepted</small>}
        </span>
      ),
      sortValue: (r) => r.offeredQuantityMT ?? -1,
      exportValue: (r) => `${formatQty(r.offeredQuantityMT)} (accepted ${formatQty(r.acceptedQuantityMT)})`,
    },
    {
      key: "offeredFreightPerMT",
      header: "Freight / MT",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="bd-cell-stack bd-cell-stack--end">
          <span>{formatAmount(r.offeredFreightPerMT)}</span>
          {r.acceptedFreightPerMT !== null && r.acceptedFreightPerMT !== r.offeredFreightPerMT && <small>{formatAmount(r.acceptedFreightPerMT)} agreed</small>}
        </span>
      ),
      sortValue: (r) => r.offeredFreightPerMT ?? -1,
      exportValue: (r) => `${formatAmount(r.offeredFreightPerMT)} (agreed ${formatAmount(r.acceptedFreightPerMT)})`,
    },
    { key: "notifiedOn", header: "Sent", sortable: true, priority: "low", render: (r) => formatDateTime(r.notifiedOn), exportValue: (r) => formatDateTime(r.notifiedOn) },
    { key: "respondedOn", header: "Answered", sortable: true, priority: "low", render: (r) => formatDateTime(r.respondedOn), sortValue: (r) => r.respondedOn ?? "", exportValue: (r) => formatDateTime(r.respondedOn) },
    {
      key: "statusName",
      header: "Status",
      sortable: true,
      render: (r) => (
        <span className="bd-cell-inline">
          <Badge tone={requestTone(r.statusName)}>{r.statusDisplay}</Badge>
          {r.negotiated && <Badge tone="info">Negotiated</Badge>}
        </span>
      ),
      exportValue: (r) => `${r.statusDisplay}${r.negotiated ? " (negotiated)" : ""}`,
    },
  ];

  const toolbar = (
    <Toolbar>
      <Input
        icon={SearchIcon}
        type="search"
        placeholder="Contract, party, product, city…"
        aria-label="Search truck requests"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fieldClassName="bd-toolbar__search"
      />
      <Select aria-label="Request status" value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="all">All statuses</option>
        {statuses.map(([name, label]) => (
          <option key={name} value={name}>
            {label}
          </option>
        ))}
      </Select>
      <Select aria-label="Freight negotiation" value={negotiated} onChange={(event) => setNegotiated(event.target.value)}>
        <option value="all">Negotiated or not</option>
        <option value="yes">Negotiated</option>
        <option value="no">Not negotiated</option>
      </Select>
    </Toolbar>
  );

  return (
    <>
      {truncated && (
        <p className="bd-note" role="note">
          Showing the latest {maxRows} requests. Narrow the period to see older ones; the totals above count every request.
        </p>
      )}
      <Table
        toolbar={toolbar}
        exportName="Truck requests"
        exportSubtitle={subtitle}
        columns={columns}
        data={rows}
        rowKey={(r) => String(r.dispatchScheduleTransporterId)}
        pageSize={PAGE_SIZE}
        variant="light"
        mobileCards
        columnToggle
        emptyMessage="No truck requests match these filters for the selected period."
      />
    </>
  );
};

// ---------------------------------------------------------------- fleet

export const FleetTable = ({ fleet, subtitle }: { fleet: TransporterTruck[]; subtitle: string }) => {
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<"all" | "onTrip" | "idle" | "inactive">("all");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return fleet.filter(
      (t) =>
        (show === "all" || (show === "onTrip" ? t.onTrip : show === "idle" ? t.isActive && !t.onTrip : !t.isActive)) &&
        matches(needle, t.truckNumber, t.truckType, t.makeModel, t.ownershipType),
    );
  }, [fleet, search, show]);

  const columns: TableColumn<TransporterTruck>[] = [
    {
      key: "truckNumber",
      header: "Truck",
      sortable: true,
      hideable: false,
      render: (t) => (
        <span className="bd-cell-stack">
          <strong>{t.truckNumber}</strong>
          <small>{[t.truckType, t.makeModel].filter(Boolean).join(" · ") || "—"}</small>
        </span>
      ),
      exportValue: (t) => `${t.truckNumber} (${[t.truckType, t.makeModel].filter(Boolean).join(" ")})`,
    },
    { key: "capacity", header: "Capacity (MT)", sortable: true, align: "right", render: (t) => formatQty(t.capacity), sortValue: (t) => t.capacity ?? -1 },
    { key: "ownershipType", header: "Ownership", sortable: true, priority: "low", render: (t) => t.ownershipType || "—" },
    { key: "trips", header: "Trips", sortable: true, align: "center" },
    { key: "quantityMT", header: "Carried (MT)", sortable: true, align: "right", render: (t) => formatQty(t.quantityMT) },
    { key: "freight", header: "Freight", sortable: true, align: "right", render: (t) => formatAmount(t.freight) },
    { key: "lastTripOn", header: "Last trip", sortable: true, priority: "low", render: (t) => formatDate(t.lastTripOn), sortValue: (t) => t.lastTripOn ?? "", exportValue: (t) => formatDate(t.lastTripOn) },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (t) => (
        <span className="bd-cell-inline">
          {!t.isActive ? <Badge tone="neutral">Inactive</Badge> : t.onTrip ? <Badge tone="info">On trip</Badge> : <Badge tone="success">{t.status || "Available"}</Badge>}
          {t.trackingUrl && /^https?:\/\//i.test(t.trackingUrl) && (
            <a href={t.trackingUrl} target="_blank" rel="noopener noreferrer" className="bd-link" title="Track this truck">
              <ExternalLinkIcon size={14} aria-label={`Track ${t.truckNumber}`} />
            </a>
          )}
        </span>
      ),
      exportValue: (t) => (!t.isActive ? "Inactive" : t.onTrip ? "On trip" : t.status),
    },
  ];

  const toolbar = (
    <Toolbar>
      <Input
        icon={SearchIcon}
        type="search"
        placeholder="Truck number, type, make…"
        aria-label="Search fleet"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fieldClassName="bd-toolbar__search"
      />
      <Select aria-label="Which trucks" value={show} onChange={(event) => setShow(event.target.value as typeof show)}>
        <option value="all">All trucks</option>
        <option value="onTrip">On a trip now</option>
        <option value="idle">Active, not on a trip</option>
        <option value="inactive">Inactive</option>
      </Select>
    </Toolbar>
  );

  return (
    <Table
      toolbar={toolbar}
      exportName="Fleet"
      exportSubtitle={subtitle}
      columns={columns}
      data={rows}
      rowKey={(t) => String(t.truckId)}
      pageSize={PAGE_SIZE}
      variant="light"
      mobileCards
      emptyMessage="No trucks registered for this transporter."
    />
  );
};

// ---------------------------------------------------------------- customers and routes

export const CustomersTable = ({ customers, subtitle }: { customers: TransporterCustomer[]; subtitle: string }) => {
  const [search, setSearch] = useState("");
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return customers.filter((c) => matches(needle, c.name, c.city));
  }, [customers, search]);

  const columns: TableColumn<TransporterCustomer>[] = [
    {
      key: "name",
      header: "Business",
      sortable: true,
      hideable: false,
      render: (c) => (
        <span className="bd-cell-stack">
          <strong>{c.name || "—"}</strong>
          {c.city && <small>{c.city}</small>}
        </span>
      ),
      exportValue: (c) => `${c.name}${c.city ? ` (${c.city})` : ""}`,
    },
    { key: "contracts", header: "Contracts", sortable: true, align: "center" },
    { key: "trips", header: "Trips", sortable: true, align: "center" },
    { key: "quantityMT", header: "Carried (MT)", sortable: true, align: "right", render: (c) => formatQty(c.quantityMT) },
    { key: "freight", header: "Freight", sortable: true, align: "right", render: (c) => formatAmount(c.freight) },
    { key: "lastTripOn", header: "Last trip", sortable: true, priority: "low", render: (c) => formatDate(c.lastTripOn), sortValue: (c) => c.lastTripOn ?? "", exportValue: (c) => formatDate(c.lastTripOn) },
  ];

  const toolbar = (
    <Toolbar>
      <Input icon={SearchIcon} type="search" placeholder="Business or city…" aria-label="Search businesses" value={search} onChange={(event) => setSearch(event.target.value)} fieldClassName="bd-toolbar__search" />
    </Toolbar>
  );

  return (
    <Table
      toolbar={toolbar}
      exportName="Customers"
      exportSubtitle={subtitle}
      columns={columns}
      data={rows}
      rowKey={(c) => String(c.profileId)}
      pageSize={PAGE_SIZE}
      variant="light"
      mobileCards
      emptyMessage="No trips in this period, so no businesses to show."
    />
  );
};

export const RoutesTable = ({ routes, subtitle }: { routes: TransporterRoute[]; subtitle: string }) => {
  const [search, setSearch] = useState("");
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return routes.filter((r) => matches(needle, r.fromCity, r.toCity));
  }, [routes, search]);

  const columns: TableColumn<TransporterRoute>[] = [
    {
      key: "route",
      header: "Route",
      sortable: true,
      hideable: false,
      render: (r) => (
        <strong>
          {r.fromCity} → {r.toCity}
        </strong>
      ),
      sortValue: (r) => `${r.fromCity} ${r.toCity}`,
      exportValue: (r) => `${r.fromCity} -> ${r.toCity}`,
    },
    { key: "trips", header: "Trips", sortable: true, align: "center" },
    { key: "quantityMT", header: "Carried (MT)", sortable: true, align: "right", render: (r) => formatQty(r.quantityMT) },
    { key: "averageFreightPerMT", header: "Avg freight / MT", sortable: true, align: "right", render: (r) => formatAmount(r.averageFreightPerMT) },
    { key: "freight", header: "Freight", sortable: true, align: "right", render: (r) => formatAmount(r.freight) },
  ];

  const toolbar = (
    <Toolbar>
      <Input icon={SearchIcon} type="search" placeholder="City…" aria-label="Search routes" value={search} onChange={(event) => setSearch(event.target.value)} fieldClassName="bd-toolbar__search" />
    </Toolbar>
  );

  return (
    <Table
      toolbar={toolbar}
      exportName="Routes"
      exportSubtitle={subtitle}
      columns={columns}
      data={rows}
      rowKey={(r) => `${r.fromCity}|${r.toCity}`}
      pageSize={PAGE_SIZE}
      variant="light"
      mobileCards
      emptyMessage="No routes in this period."
    />
  );
};
