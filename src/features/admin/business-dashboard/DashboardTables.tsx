import { useMemo, useState } from "react";
import type { ContractStage, DashboardContract, DashboardProduct, DashboardTruck } from "../../../core/store/businessDashboardApi";
import Table from "../../../shared/components/table/Table";
import type { TableColumn } from "../../../shared/components/table/table.types";
import { ExternalLinkIcon, FileTextIcon, SearchIcon, XIcon } from "../../../shared/components/icon";
import { Badge, Button, Input, Select } from "../../../shared/components/ui";
import {
  STAGE_TONES,
  formatAmount,
  formatDate,
  formatDateTime,
  formatQty,
  truckTone,
} from "./businessDashboard.utils";

const PAGE_SIZE = 10;

const matches = (needle: string, ...values: (string | null | undefined)[]) =>
  !needle || values.some((value) => value?.toLowerCase().includes(needle));

const Progress = ({ percent, label }: { percent: number; label: string }) => (
  <span className="bd-progress" title={`${percent}% dispatched`}>
    <span className="bd-progress__track" role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <span className="bd-progress__fill" style={{ width: `${Math.min(100, percent)}%` }} />
    </span>
    <span className="bd-progress__value">{percent}%</span>
  </span>
);

/** The table's own filters; the row count, CSV / PDF export and Columns come from the shared Table, in the same row. */
const Toolbar = ({ children }: { children: React.ReactNode }) => (
  <div className="bd-toolbar">
    <div className="bd-toolbar__filters">{children}</div>
  </div>
);

// ---------------------------------------------------------------- contracts

export type StageFilter = ContractStage | "all" | "active";

interface ContractsTableProps {
  contracts: DashboardContract[];
  stage: StageFilter;
  onStage: (stage: StageFilter) => void;
  /** Opens the Trucks tab for one contract. */
  onShowTrucks: (contractNumber: string) => void;
  /** Business and period, printed under the PDF title. */
  subtitle: string;
}

export const ContractsTable = ({ contracts, stage, onStage, onShowTrucks, subtitle }: ContractsTableProps) => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | "Seller" | "Buyer">("all");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return contracts.filter(
      (c) =>
        (stage === "all" || (stage === "active" ? c.stage === "Executing" || c.stage === "Executed" : c.stage === stage)) &&
        (role === "all" || c.role === role) &&
        matches(needle, c.contractNumber, c.counterparty, c.counterpartyCity, c.productName),
    );
  }, [contracts, search, role, stage]);

  const columns: TableColumn<DashboardContract>[] = [
    {
      key: "contractNumber",
      header: "Contract",
      sortable: true,
      hideable: false,
      render: (c) => (
        <span className="bd-cell-stack">
          <strong>{c.contractNumber}</strong>
          <small>{formatDate(c.contractDate)}</small>
        </span>
      ),
      sortValue: (c) => c.contractDate,
      exportValue: (c) => `${c.contractNumber} (${formatDate(c.contractDate)})`,
    },
    {
      key: "role",
      header: "Side",
      sortable: true,
      render: (c) => <Badge tone={c.role === "Seller" ? "primary" : "neutral"}>{c.role === "Seller" ? "Sale" : "Purchase"}</Badge>,
      exportValue: (c) => (c.role === "Seller" ? "Sale" : "Purchase"),
    },
    {
      key: "counterparty",
      header: "Counterparty",
      sortable: true,
      render: (c) => (
        <span className="bd-cell-stack">
          <span>{c.counterparty || "—"}</span>
          {c.counterpartyCity && <small>{c.counterpartyCity}</small>}
        </span>
      ),
    },
    { key: "productName", header: "Product", sortable: true },
    { key: "totalQuantityMT", header: "Qty (MT)", sortable: true, align: "right", render: (c) => formatQty(c.totalQuantityMT) },
    {
      key: "progressPercent",
      header: "Dispatched",
      sortable: true,
      render: (c) => (
        <span className="bd-cell-stack">
          <Progress percent={c.progressPercent} label={`Dispatched share of ${c.contractNumber}`} />
          <small>
            {formatQty(c.dispatchedQuantityMT)} of {formatQty(c.totalQuantityMT)} MT
          </small>
        </span>
      ),
    },
    { key: "pricePerMT", header: "Rate / MT", sortable: true, align: "right", priority: "low", render: (c) => formatAmount(c.pricePerMT) },
    { key: "contractValue", header: "Value", sortable: true, align: "right", render: (c) => formatAmount(c.contractValue) },
    {
      key: "effectiveTo",
      header: "Delivery window",
      sortable: true,
      priority: "low",
      render: (c) => `${formatDate(c.effectiveFrom)} – ${formatDate(c.effectiveTo)}`,
      exportValue: (c) => `${formatDate(c.effectiveFrom)} - ${formatDate(c.effectiveTo)}`,
      sortValue: (c) => c.effectiveTo,
    },
    {
      key: "truckCount",
      header: "Trucks",
      sortable: true,
      align: "center",
      render: (c) =>
        c.truckCount > 0 ? (
          <button type="button" className="bd-link" onClick={() => onShowTrucks(c.contractNumber)} title={`Show the trucks of ${c.contractNumber}`}>
            {c.loadedTruckCount}/{c.truckCount}
          </button>
        ) : (
          <span className="bd-muted">0</span>
        ),
      exportValue: (c) => `${c.loadedTruckCount}/${c.truckCount}`,
    },
    {
      key: "statusDisplay",
      header: "Status",
      sortable: true,
      render: (c) => (c.stage ? <Badge tone={STAGE_TONES[c.stage]}>{c.statusDisplay}</Badge> : c.statusDisplay),
    },
  ];


  // search / filters / export, in one row with the table's Columns button
  const toolbar = (
      <Toolbar>
        <Input
          icon={SearchIcon}
          type="search"
          placeholder="Contract, counterparty, product…"
          aria-label="Search contracts"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fieldClassName="bd-toolbar__search"
        />
        <Select aria-label="Contract stage" value={stage} onChange={(event) => onStage(event.target.value as StageFilter)}>
          <option value="all">All stages</option>
          <option value="active">Executing + executed</option>
          <option value="Executing">Executing</option>
          <option value="Executed">Executed</option>
          <option value="PendingApproval">Pending approval</option>
          <option value="Rejected">Rejected</option>
        </Select>
        <Select aria-label="Side" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
          <option value="all">Sales and purchases</option>
          <option value="Seller">Sales (as seller)</option>
          <option value="Buyer">Purchases (as buyer)</option>
        </Select>
      </Toolbar>
  );

  return (
    <>
      <Table
        toolbar={toolbar}
        exportName="Contracts"
        exportSubtitle={subtitle}
        columns={columns}
        data={rows}
        rowKey={(c) => String(c.contractId)}
        pageSize={PAGE_SIZE}
        variant="light"
        mobileCards
        columnToggle
        emptyMessage="No contracts match these filters for the selected period."
      />
    </>
  );
};

// ---------------------------------------------------------------- trucks

interface TrucksTableProps {
  trucks: DashboardTruck[];
  contractFilter: string;
  onClearContract: () => void;
  truncated: boolean;
  maxRows: number;
  /** Business and period, printed under the PDF title. */
  subtitle: string;
}

export const TrucksTable = ({ trucks, contractFilter, onClearContract, truncated, maxRows, subtitle }: TrucksTableProps) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return trucks.filter(
      (t) =>
        (!contractFilter || t.contractNumber === contractFilter) &&
        (status === "all" || t.statusName === status) &&
        matches(needle, t.truckNumber, t.contractNumber, t.driverName, t.transporter, t.lrNumber, t.fromCity, t.toCity),
    );
  }, [trucks, search, status, contractFilter]);

  const columns: TableColumn<DashboardTruck>[] = [
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
          <small>{t.role === "Seller" ? "Sale" : t.role === "Buyer" ? "Purchase" : ""}</small>
        </span>
      ),
    },
    {
      key: "driverName",
      header: "Driver",
      sortable: true,
      render: (t) => (
        <span className="bd-cell-stack">
          <span>{t.driverName || "—"}</span>
          {t.driverMobile && <small>{t.driverMobile}</small>}
        </span>
      ),
    },
    { key: "transporter", header: "Transporter", sortable: true, priority: "low", render: (t) => t.transporter || "—" },
    {
      key: "route",
      header: "Route",
      render: (t) => (t.fromCity || t.toCity ? `${t.fromCity ?? "—"} → ${t.toCity ?? "—"}` : "—"),
      exportValue: (t) => `${t.fromCity ?? ""} -> ${t.toCity ?? ""}`,
    },
    { key: "quantityMT", header: "Qty (MT)", sortable: true, align: "right", render: (t) => formatQty(t.quantityMT) },
    { key: "freightPerMT", header: "Freight / MT", sortable: true, align: "right", priority: "low", render: (t) => formatAmount(t.freightPerMT) },
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
    },
  ];


  // search / filters / export, in one row with the table's Columns button
  const toolbar = (
      <Toolbar>
        <Input
          icon={SearchIcon}
          type="search"
          placeholder="Truck, driver, transporter, LR…"
          aria-label="Search trucks"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fieldClassName="bd-toolbar__search"
        />
        <Select aria-label="Truck status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Loaded">Loaded</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
        {contractFilter && (
          <Button size="sm" variant="ghost" icon={XIcon} onClick={onClearContract} title="Show the trucks of every contract">
            Contract {contractFilter}
          </Button>
        )}
      </Toolbar>
  );

  return (
    <>
      {truncated && (
        <p className="bd-note" role="note">
          Showing the latest {maxRows} trucks. Narrow the period to see older ones; the totals above count every truck.
        </p>
      )}
      <Table
        toolbar={toolbar}
        exportName="Trucks"
        exportSubtitle={subtitle}
        columns={columns}
        data={rows}
        rowKey={(t) => String(t.contractDispatchId)}
        pageSize={PAGE_SIZE}
        variant="light"
        mobileCards
        columnToggle
        emptyMessage="No trucks match these filters for the selected period."
      />
    </>
  );
};

// ---------------------------------------------------------------- products

export const ProductsTable = ({ products, subtitle }: { products: DashboardProduct[]; subtitle: string }) => {
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<"all" | "traded" | "catalog">("all");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return products.filter(
      (p) => (show === "all" || (show === "traded" ? p.contracts > 0 : p.inCatalog)) && matches(needle, p.name, p.category, p.sku),
    );
  }, [products, search, show]);

  const columns: TableColumn<DashboardProduct>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      hideable: false,
      render: (p) => (
        <span className="bd-cell-stack">
          <strong>{p.name}</strong>
          <small>{[p.category, p.sku].filter(Boolean).join(" · ") || "—"}</small>
        </span>
      ),
    },
    {
      key: "dealsIn",
      header: "Deals in",
      render: (p) =>
        p.inCatalog ? (
          <span className="bd-cell-inline">
            {p.isSeller && <Badge tone="primary">Sells</Badge>}
            {p.isBuyer && <Badge>Buys</Badge>}
            {p.isManufacturer && <Badge tone="info">Manufactures</Badge>}
            {!p.isSeller && !p.isBuyer && !p.isManufacturer && <Badge>Listed</Badge>}
          </span>
        ) : (
          <span className="bd-muted" title="Traded on a contract but not listed on the business profile">Not listed</span>
        ),
      exportValue: (p) => [p.isSeller && "Sells", p.isBuyer && "Buys", p.isManufacturer && "Manufactures"].filter(Boolean).join(" / "),
    },
    { key: "contracts", header: "Contracts", sortable: true, align: "center" },
    { key: "soldMT", header: "Sold (MT)", sortable: true, align: "right", render: (p) => formatQty(p.soldMT) },
    { key: "boughtMT", header: "Bought (MT)", sortable: true, align: "right", render: (p) => formatQty(p.boughtMT) },
    { key: "dispatchedMT", header: "Dispatched (MT)", sortable: true, align: "right", priority: "low", render: (p) => formatQty(p.dispatchedMT) },
    {
      key: "avgPricePerMT",
      header: "Avg rate / MT",
      sortable: true,
      align: "right",
      render: (p) =>
        p.avgPricePerMT === null ? (
          "—"
        ) : (
          <span className="bd-cell-stack bd-cell-stack--end">
            <span>{formatAmount(p.avgPricePerMT)}</span>
            {p.minPricePerMT !== p.maxPricePerMT && (
              <small>
                {formatAmount(p.minPricePerMT)} – {formatAmount(p.maxPricePerMT)}
              </small>
            )}
          </span>
        ),
      sortValue: (p) => p.avgPricePerMT ?? -1,
    },
    { key: "value", header: "Value", sortable: true, align: "right", render: (p) => formatAmount(p.value) },
    { key: "gstPercent", header: "GST", sortable: true, align: "right", priority: "low", render: (p) => `${formatQty(p.gstPercent)}%` },
    { key: "lastTradedOn", header: "Last traded", sortable: true, priority: "low", render: (p) => formatDate(p.lastTradedOn), sortValue: (p) => p.lastTradedOn ?? "", exportValue: (p) => formatDate(p.lastTradedOn) },
  ];


  // search / filters / export, in one row with the table's Columns button
  const toolbar = (
      <Toolbar>
        <Input
          icon={SearchIcon}
          type="search"
          placeholder="Product, category, SKU…"
          aria-label="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fieldClassName="bd-toolbar__search"
        />
        <Select aria-label="Which products" value={show} onChange={(event) => setShow(event.target.value as typeof show)}>
          <option value="all">Listed and traded</option>
          <option value="traded">Traded in this period</option>
          <option value="catalog">Listed on the profile</option>
        </Select>
      </Toolbar>
  );

  return (
    <>
      <Table
        toolbar={toolbar}
        exportName="Products"
        exportSubtitle={subtitle}
        columns={columns}
        data={rows}
        rowKey={(p) => String(p.productId)}
        pageSize={PAGE_SIZE}
        variant="light"
        mobileCards
        emptyMessage="No products listed or traded for the selected period."
      />
    </>
  );
};
