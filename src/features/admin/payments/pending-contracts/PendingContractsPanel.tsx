import { useMemo, useState } from "react";
import { useOpenAndPendingContracts } from "../../../../core/store/useOpenAndPendingContracts";
import { useProfileCities } from "../../../../shared/hooks/useProfileCities";
import { FileTextIcon, PlusIcon, SearchIcon } from "../../../../shared/components/icon";
import { useGetInvoiceContractsQuery, type InvoiceContract } from "../../../../core/store/sellerInvoiceApi";
import { financialYearOf } from "../../contracts/contract-status/contractStatus.data";
import { money } from "../seller-invoice/sellerInvoice.data";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import "./PendingContractsPanel.scss";

interface PendingContractsPanelProps {
  /** e.g. "2026-2027": only contracts dated in this financial year are listed ("" = all years). */
  financialYear: string;
  /** Adds an invoice against the contract. */
  onSelect: (contract: InvoiceContract) => void;
  onDetails: (contractNumber: string) => void;
}

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  if (!iso || iso.startsWith("0001")) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : "";
}

const mt = (value: number | null | undefined) => (value == null ? "" : `${value}`);

/**
 * The contracts that can still be invoiced (open, with quantity pending), as a table with the same details as the
 * Open & Pending Contracts screen – quantities (contract / despatched / arranged / pending / invoiced), rate, GST,
 * delivery schedule and payment terms – and "Add invoice" on each row. Filtered by financial year and a search.
 */
const PendingContractsPanel = ({ financialYear, onSelect, onDetails }: PendingContractsPanelProps) => {
  const [search, setSearch] = useState("");
  const { label: partyLabel } = useProfileCities();
  const { data: contracts, isLoading, isError, refetch } = useGetInvoiceContractsQuery({}, { refetchOnMountOrArgChange: true });
  // The details the Open & Pending Contracts screen shows (despatched / arranged quantity, delivery schedule, payment terms).
  const { data: openAndPending } = useOpenAndPendingContracts();
  const details = useMemo(() => new Map((openAndPending ?? []).map((row) => [row.contractNumber, row])), [openAndPending]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (contracts ?? [])
      .filter((c) => c.canInvoice && c.pendingQtyMT > 0)
      .filter((c) => !financialYear || financialYearOf(c.contractDate) === financialYear)
      .filter(
        (c) =>
          !term ||
          [c.contractNumber, c.sellerName, c.buyerName, c.productName].some((v) => (v ?? "").toLowerCase().includes(term)),
      )
      .sort((a, b) => (b.contractDate ?? "").localeCompare(a.contractDate ?? ""));
  }, [contracts, financialYear, search]);

  /** Despatched / arranged / pending from the Open & Pending list (undefined until it loads). */
  const qty = (c: InvoiceContract) => {
    const d = details.get(c.contractNumber);
    const total = d?.totalQuantityMT ?? c.totalQtyMT;
    const despatched = d?.dispatchedQuantityMT;
    const pending = d?.pendingQuantityMT;
    return { d, total, despatched, pending, arranged: d ? Math.max(total - (despatched ?? 0) - (pending ?? 0), 0) : undefined };
  };
  const num = (key: string, header: string, value: (c: InvoiceContract) => number | null | undefined, title?: string): TableColumn<InvoiceContract> => ({
    key, header, headerTooltip: title, sortable: true, align: "right",
    render: (c) => mt(value(c)), sortValue: (c) => value(c) ?? -1, exportValue: (c) => mt(value(c)),
  });
  const columns: TableColumn<InvoiceContract>[] = [
    { key: "contractNumber", header: "Contract #", sortable: true, hideable: false, render: (c) => <span className="si-pending__contract-no">{c.contractNumber}</span> },
    { key: "contractDate", header: "Contract Date", sortable: true, render: (c) => formatDate(c.contractDate), exportValue: (c) => formatDate(c.contractDate) },
    { key: "sellerName", header: "Seller", sortable: true, render: (c) => partyLabel(c.sellerName, c.sellerId), exportValue: (c) => partyLabel(c.sellerName, c.sellerId) },
    { key: "buyerName", header: "Buyer", sortable: true, render: (c) => partyLabel(c.buyerName, c.buyerId), exportValue: (c) => partyLabel(c.buyerName, c.buyerId) },
    { key: "productName", header: "Product", sortable: true },
    { key: "ratePerMT", header: "Rate / MT", sortable: true, align: "right", render: (c) => money(c.ratePerMT), exportValue: (c) => String(c.ratePerMT) },
    { key: "gstPercent", header: "GST %", sortable: true, align: "right", render: (c) => `${c.gstPercent}%` },
    num("totalQty", "Contract Qty", (c) => qty(c).total),
    num("despatched", "Despatched", (c) => qty(c).despatched),
    num("arranged", "Arranged", (c) => qty(c).arranged),
    num("pending", "Pending", (c) => qty(c).pending),
    num("pendingQtyMT", "To Invoice", (c) => c.pendingQtyMT, "Contract quantity not invoiced yet"),
    { key: "deliverySchedule", header: "Delivery Schedule", priority: "low", render: (c) => qty(c).d?.deliverySchedule ?? "", exportValue: (c) => qty(c).d?.deliverySchedule ?? "" },
    { key: "paymentTermName", header: "Payment Terms", priority: "low", render: (c) => qty(c).d?.paymentTermName ?? "", exportValue: (c) => qty(c).d?.paymentTermName ?? "" },
    {
      key: "actions",
      header: "",
      hideable: false,
      render: (c) => (
        <div className="si-pending__actions">
          <button type="button" className="si-icon-btn" onClick={() => onDetails(c.contractNumber)} aria-label={`Contract ${c.contractNumber} details`} title="Contract details">
            <SearchIcon aria-hidden />
          </button>
          <button type="button" className="si-pending__select" onClick={() => onSelect(c)} title="Add an invoice against this contract">
            <PlusIcon aria-hidden /> Add invoice
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="si-pending" aria-labelledby="si-pending-title">
      <div className="si-pending__head">
        <h2 id="si-pending-title" className="si-pending__title">
          <FileTextIcon aria-hidden /> Pending Contracts
          <span className="si-pending__count">{isLoading ? "…" : rows.length}</span>
        </h2>
        <div className="si-pending__search">
          <SearchIcon aria-hidden />
          <input
            type="search"
            className="si-input"
            placeholder="Search contract #, seller, buyer, product"
            aria-label="Search pending contracts"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {isError ? (
        <p className="si-pending__empty">
          The pending contracts could not be loaded.{" "}
          <button type="button" className="si-link-btn" onClick={() => refetch()}>
            Try again
          </button>
        </p>
      ) : (
        <Table
          exportName="Contracts to Invoice"
          exportSubtitle={financialYear ? `Financial year ${financialYear}` : undefined}
          columnToggle
          columns={columns}
          data={rows}
          rowKey={(c) => c.contractNumber}
          pageSize={PAGE_SIZE}
          loading={isLoading}
          stickyFirstColumn
          className="si-pending__table"
          emptyMessage={search.trim() ? "No pending contracts match your search." : `No pending contracts${financialYear ? ` in ${financialYear}` : ""}.`}
        />
      )}
    </section>
  );
};

export default PendingContractsPanel;
