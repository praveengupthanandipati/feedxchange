import { useEffect, useMemo, useState } from "react";
import { useProfileCities } from "../../../../shared/hooks/useProfileCities";
import { ChevronLeftIcon, ChevronRightIcon, FileTextIcon, PlusIcon, SearchIcon } from "../../../../shared/components/icon";
import { useGetInvoiceContractsQuery, type InvoiceContract } from "../../../../core/store/sellerInvoiceApi";
import { useGetAllOpenAndPendingContractsQuery } from "../../../../core/store/contractsApi";
import { financialYearOf } from "../../contracts/contract-status/contractStatus.data";
import { money } from "../seller-invoice/sellerInvoice.data";
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
  const [page, setPage] = useState(1);
  const { label: partyLabel } = useProfileCities();
  const { data: contracts, isLoading, isError, refetch } = useGetInvoiceContractsQuery({}, { refetchOnMountOrArgChange: true });
  // The details the Open & Pending Contracts screen shows (despatched / arranged quantity, delivery schedule, payment terms).
  const { data: openAndPending } = useGetAllOpenAndPendingContractsQuery();
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

  useEffect(() => setPage(1), [financialYear, search]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const colCount = 15;

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

      <div className="si-pending__table-wrapper">
        <table className="si-pending__table">
          <thead>
            <tr>
              <th>Contract #</th>
              <th>Contract Date</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Product</th>
              <th className="si-pending__num">Rate / MT</th>
              <th className="si-pending__num">GST %</th>
              <th className="si-pending__num">Contract Qty</th>
              <th className="si-pending__num">Despatched</th>
              <th className="si-pending__num">Arranged</th>
              <th className="si-pending__num">Pending</th>
              <th className="si-pending__num">To Invoice</th>
              <th>Delivery Schedule</th>
              <th>Payment Terms</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colCount} className="si-pending__empty">Loading pending contracts…</td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={colCount} className="si-pending__empty">
                  The pending contracts could not be loaded.{" "}
                  <button type="button" className="si-link-btn" onClick={() => refetch()}>
                    Try again
                  </button>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="si-pending__empty">
                  {search.trim()
                    ? "No pending contracts match your search."
                    : `No pending contracts${financialYear ? ` in ${financialYear}` : ""}.`}
                </td>
              </tr>
            ) : (
              pageRows.map((c) => {
                const d = details.get(c.contractNumber);
                const total = d?.totalQuantityMT ?? c.totalQtyMT;
                const despatched = d?.dispatchedQuantityMT;
                const pending = d?.pendingQuantityMT;
                const arranged = d ? Math.max(total - (despatched ?? 0) - (pending ?? 0), 0) : undefined;
                return (
                  <tr key={c.contractNumber}>
                    <td className="si-pending__contract-no">{c.contractNumber}</td>
                    <td>{formatDate(c.contractDate)}</td>
                    <td className="si-pending__party" title={partyLabel(c.sellerName, c.sellerId)}>{partyLabel(c.sellerName, c.sellerId)}</td>
                    <td className="si-pending__party" title={partyLabel(c.buyerName, c.buyerId)}>{partyLabel(c.buyerName, c.buyerId)}</td>
                    <td>{c.productName}</td>
                    <td className="si-pending__num">{money(c.ratePerMT)}</td>
                    <td className="si-pending__num">{c.gstPercent}%</td>
                    <td className="si-pending__num">{mt(total)}</td>
                    <td className="si-pending__num">{mt(despatched)}</td>
                    <td className="si-pending__num">{mt(arranged)}</td>
                    <td className="si-pending__num">{mt(pending)}</td>
                    <td className="si-pending__num" title="Contract quantity not invoiced yet">{mt(c.pendingQtyMT)}</td>
                    <td>{d?.deliverySchedule ?? ""}</td>
                    <td>{d?.paymentTermName ?? ""}</td>
                    <td>
                      <div className="si-pending__actions">
                        <button type="button" className="si-icon-btn" onClick={() => onDetails(c.contractNumber)} aria-label={`Contract ${c.contractNumber} details`} title="Contract details">
                          <SearchIcon aria-hidden />
                        </button>
                        <button type="button" className="si-pending__select" onClick={() => onSelect(c)} title="Add an invoice against this contract">
                          <PlusIcon aria-hidden /> Add invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && pageCount > 1 && (
        <div className="si-pending__pager">
          <span>
            {start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}
          </span>
          <button type="button" className="si-icon-btn" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page">
            <ChevronLeftIcon aria-hidden />
          </button>
          <button type="button" className="si-icon-btn" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount} aria-label="Next page">
            <ChevronRightIcon aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
};

export default PendingContractsPanel;
