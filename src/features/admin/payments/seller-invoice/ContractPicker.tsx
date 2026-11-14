import { useMemo, useState } from "react";
import { useProfileCities } from "../../../../shared/hooks/useProfileCities";
import { ChevronDownIcon, FileTextIcon } from "../../../../shared/components/icon";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import { useGetInvoiceContractsQuery, type InvoiceContract } from "../../../../core/store/sellerInvoiceApi";
import { useGetAllOpenAndPendingContractsQuery } from "../../../../core/store/contractsApi";
import { financialYearOf } from "../../contracts/contract-status/contractStatus.data";
import { money } from "./sellerInvoice.data";
import "./ContractPicker.scss";

interface ContractPickerProps {
  /** e.g. "2026-2027": only contracts dated in this financial year are offered. */
  financialYear: string;
  /** The contract shown in the overview (the one last picked, or opened from Pending Contracts). */
  value: string;
  onSelect: (contract: InvoiceContract) => void;
  onDetails: (contractNumber: string) => void;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso || iso.startsWith("0001")) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : "";
}

/**
 * "Select contract" at the top of Seller Invoice: a searchable list of the contracts that can still be invoiced
 * (in the chosen financial year), and a collapsible overview of the picked one – parties, product, rate, GST and the
 * quantities – so the invoice can be checked against it. Picking a contract puts it into the invoice below.
 */
const ContractPicker = ({ financialYear, value, onSelect, onDetails }: ContractPickerProps) => {
  const [open, setOpen] = useState(true);
  const { label: partyLabel } = useProfileCities();
  const { data: contracts, isLoading, isError } = useGetInvoiceContractsQuery({}, { refetchOnMountOrArgChange: true });
  const { data: openAndPending } = useGetAllOpenAndPendingContractsQuery();

  const pending = useMemo(
    () =>
      (contracts ?? [])
        .filter((c) => c.canInvoice && c.pendingQtyMT > 0)
        // The picked contract stays in the list even when it is dated in another financial year (e.g. opened from
        // Update Truck Status for an older contract), so the box shows it.
        .filter(
          (c) =>
            !financialYear ||
            financialYearOf(c.contractDate) === financialYear ||
            c.contractNumber.toLowerCase() === value.trim().toLowerCase(),
        )
        .sort((a, b) => (b.contractDate ?? "").localeCompare(a.contractDate ?? "")),
    [contracts, financialYear, value],
  );
  const options = useMemo(
    () =>
      pending.map((c) => ({
        value: c.contractNumber,
        label: `${c.contractNumber} · ${partyLabel(c.sellerName, c.sellerId)} → ${partyLabel(c.buyerName, c.buyerId)} · ${c.productName} · ${c.pendingQtyMT} MT to invoice`,
      })),
    [pending, partyLabel],
  );

  const key = value.trim().toLowerCase();
  const selected = key ? (contracts ?? []).find((c) => c.contractNumber.toLowerCase() === key) : undefined;
  const detail = selected ? (openAndPending ?? []).find((row) => row.contractNumber === selected.contractNumber) : undefined;
  const arranged = detail ? Math.max(detail.totalQuantityMT - detail.dispatchedQuantityMT - detail.pendingQuantityMT, 0) : undefined;

  const item = (label: string, content: React.ReactNode) => (
    <div className="si-picker__item">
      <dt>{label}</dt>
      <dd>{content === "" || content == null ? "—" : content}</dd>
    </div>
  );

  return (
    <section className="si-picker" aria-labelledby="si-picker-title">
      <div className="si-picker__row">
        <h2 id="si-picker-title" className="si-picker__title">
          <FileTextIcon aria-hidden /> Select contract
        </h2>
        <div className="si-picker__select">
          <SearchableSelect
            options={options}
            value={selected && options.some((o) => o.value === selected.contractNumber) ? selected.contractNumber : ""}
            onChange={(number) => {
              const contract = pending.find((c) => c.contractNumber === number);
              if (contract) {
                onSelect(contract);
                setOpen(true);
              }
            }}
            placeholder={
              isLoading
                ? "Loading contracts…"
                : isError
                  ? "The contracts could not be loaded"
                  : options.length
                    ? "Search pending contracts"
                    : `No pending contracts${financialYear ? ` in ${financialYear}` : ""}`
            }
            ariaLabel="Select contract"
            disabled={isLoading || options.length === 0}
          />
        </div>
        {selected && (
          <button
            type="button"
            className="si-picker__toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="si-picker-overview"
          >
            Contract overview <ChevronDownIcon aria-hidden className={open ? "is-open" : ""} />
          </button>
        )}
      </div>

      {selected && open && (
        <div id="si-picker-overview" className="si-picker__overview">
          <dl className="si-picker__grid">
            {item(
              "Contract #",
              <button type="button" className="si-link-btn" onClick={() => onDetails(selected.contractNumber)} title="Contract details">
                {selected.contractNumber}
              </button>,
            )}
            {item("Contract date", formatDate(selected.contractDate))}
            {item("Status", selected.statusName)}
            {item("Seller", partyLabel(selected.sellerName, selected.sellerId))}
            {item("Buyer", partyLabel(selected.buyerName, selected.buyerId))}
            {item("Product", selected.productName)}
            {item("Rate / MT", money(selected.ratePerMT))}
            {item("GST", `${selected.gstPercent}%`)}
            {item("Net rate / MT", money(selected.netRatePerMT))}
            {item("Contract value", money(selected.totalContractValue))}
            {item("Contract qty", `${selected.totalQtyMT} MT`)}
            {item("Invoiced", `${selected.invoicedQtyMT} MT`)}
            {item("To invoice", <strong>{selected.pendingQtyMT} MT</strong>)}
            {item("Max allowed now", `${selected.maxAllowedQtyMT} MT`)}
            {item("Despatched", detail ? `${detail.dispatchedQuantityMT} MT` : "")}
            {item("Arranged", arranged != null ? `${arranged} MT` : "")}
            {item("Delivery schedule", detail?.deliverySchedule)}
            {item("Payment terms", detail?.paymentTermName)}
          </dl>
        </div>
      )}
    </section>
  );
};

export default ContractPicker;
