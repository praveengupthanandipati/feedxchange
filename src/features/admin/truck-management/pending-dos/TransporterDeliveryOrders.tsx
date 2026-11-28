import { useMemo, useState } from "react";
import { useGetMyDoTrucksQuery, type DoTransporterTruck } from "../../../../core/store/truckDeliveryOrdersApi";
import { getErrorMessage } from "../../../../core/api/getErrorMessage";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { CircleAlertIcon, RefreshCwIcon, SearchIcon } from "../../../../shared/components/icon";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Skeleton } from "../../../../shared/components/ui";
import { formatDate, formatDateTime, formatQty } from "../../business-dashboard/businessDashboard.utils";
import "../open-pending-contracts/contract-trucks/reassign-truck/PendingDoContracts.scss";

const PAGE_SIZE = 10;

const matches = (needle: string, ...values: (string | null | undefined)[]) =>
  !needle || values.some((value) => value?.toLowerCase().includes(needle));

const truckColumns = (withDo: boolean): TableColumn<DoTransporterTruck>[] => {
  const columns: TableColumn<DoTransporterTruck>[] = [
    {
      key: "contractNumber",
      header: "Contract",
      sortable: true,
      hideable: false,
      render: (t) => (
        <span className="pdo-cell">
          <strong>{t.contractNumber}</strong>
          <small>{formatDate(t.contractDate)}</small>
        </span>
      ),
      exportValue: (t) => t.contractNumber,
    },
    {
      key: "seller",
      header: "Seller → Buyer",
      sortable: true,
      render: (t) => (
        <span className="pdo-cell">
          <span>{t.seller || "—"}</span>
          <small>→ {t.buyer || "—"}</small>
        </span>
      ),
      exportValue: (t) => `${t.seller} -> ${t.buyer}`,
    },
    { key: "productName", header: "Product", sortable: true },
    {
      key: "truckNumber",
      header: "Truck",
      sortable: true,
      render: (t) => (
        <span className="pdo-cell">
          <strong>{t.truckNumber || "—"}</strong>
          <small>{[t.truckType, t.driverName, t.lrNumber ? `LR ${t.lrNumber}` : null].filter(Boolean).join(" · ")}</small>
          {t.chainLegs > 1 && <Badge tone="info" title="This truck serves more than one contract">{t.chainLegs} contracts</Badge>}
        </span>
      ),
      exportValue: (t) => t.truckNumber,
    },
    { key: "quantityMT", header: "Qty (MT)", sortable: true, align: "right", render: (t) => formatQty(t.quantityMT) },
    {
      key: "route",
      header: "Route",
      render: (t) => (t.fromCity || t.toCity ? `${t.fromCity ?? "—"} → ${t.toCity ?? "—"}` : "—"),
      exportValue: (t) => `${t.fromCity ?? ""} -> ${t.toCity ?? ""}`,
    },
    { key: "assignedOn", header: "Assigned", sortable: true, render: (t) => formatDateTime(t.assignedOn), exportValue: (t) => formatDateTime(t.assignedOn) },
  ];
  if (withDo) {
    columns.splice(3, 0, {
      key: "doNumber",
      header: "DO",
      sortable: true,
      render: (t) => (
        <span className="pdo-cell">
          <strong>{t.doNumber}</strong>
          <small>{t.doDate ? formatDate(t.doDate) : ""}</small>
          {t.doMessage && <small>{t.doMessage}</small>}
        </span>
      ),
      sortValue: (t) => t.doNumber ?? "",
      exportValue: (t) => `${t.doNumber ?? ""}${t.doDate ? ` (${formatDate(t.doDate)})` : ""}`,
    });
  }
  return columns;
};

interface SectionProps {
  title: string;
  description: string;
  trucks: DoTransporterTruck[];
  withDo: boolean;
  emptyMessage: string;
}

const Section = ({ title, description, trucks, withDo, emptyMessage }: SectionProps) => (
  <Card
    className="pdo-section"
    title={
      <span className="pdo-contract__title">
        {title} <Badge tone={withDo ? "success" : "warning"}>{trucks.length}</Badge>
      </span>
    }
  >
    <p className="pdo-muted pdo-section__intro">{description}</p>
    <Table
      exportName={title}
      columns={truckColumns(withDo)}
      data={trucks}
      rowKey={(t) => String(t.contractDispatchId)}
      pageSize={PAGE_SIZE}
      variant="light"
      mobileCards
      emptyMessage={emptyMessage}
    />
  </Card>
);

/**
 * Pending Delivery Orders, as a transporter sees it: its own trucks that are Assigned (not loaded, not cancelled), in two sections:
 * the trucks whose Delivery Order (DO) the seller has entered, and the trucks still waiting for one.
 */
const TransporterDeliveryOrders = () => {
  const [search, setSearch] = useState("");
  const query = useGetMyDoTrucksQuery(undefined, { refetchOnMountOrArgChange: true });

  const trucks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (query.data ?? []).filter((t) => matches(needle, t.contractNumber, t.seller, t.buyer, t.productName, t.truckNumber, t.driverName, t.lrNumber, t.doNumber));
  }, [query.data, search]);

  const issued = trucks.filter((t) => t.doNumber);
  const pending = trucks.filter((t) => !t.doNumber);

  let body: React.ReactNode;
  if (query.isError) {
    body = (
      <EmptyState
        icon={CircleAlertIcon}
        title="The trucks could not be loaded"
        description={getErrorMessage(query.error, "Please try again in a moment.")}
        action={<Button onClick={() => query.refetch()}>Try again</Button>}
      />
    );
  } else if (query.isLoading) {
    body = (
      <Card>
        <Skeleton lines={6} />
      </Card>
    );
  } else {
    body = (
      <div className="pdo-list">
        <Section
          title="DO issued by the seller"
          description="Assigned trucks whose Delivery Order the seller has entered."
          trucks={issued}
          withDo
          emptyMessage="No assigned truck has a DO yet."
        />
        <Section
          title="DO not issued yet"
          description="Assigned trucks still waiting for the seller's Delivery Order."
          trucks={pending}
          withDo={false}
          emptyMessage="Every assigned truck already has its DO."
        />
      </div>
    );
  }

  return (
    <div className="pending-do">
      <PageHeader
        title="Pending Delivery Orders"
        description="Your assigned trucks: the ones whose DO the seller has entered, and the ones still waiting for it."
        actions={
          <div className="pending-do__filters">
            <Input
              icon={SearchIcon}
              type="search"
              placeholder="Contract, seller, buyer, product, truck, DO…"
              aria-label="Search trucks"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fieldClassName="pending-do__search"
            />
            <Button iconOnly icon={RefreshCwIcon} aria-label="Refresh" title="Refresh" onClick={() => query.refetch()} loading={query.isFetching && !query.isLoading} />
          </div>
        }
      />
      {body}
    </div>
  );
};

export default TransporterDeliveryOrders;
