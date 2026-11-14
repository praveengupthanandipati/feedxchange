import { useMemo, useState } from "react";
import { withCity } from "../../../shared/hooks/useProfileCities";
// Bootstrap's dropdown behaviour (data-bs-toggle="dropdown") for the Share information menu; only this screen needs it
import "bootstrap/js/dist/dropdown";
import { Link, useParams } from "react-router-dom";
import Can from "../../../core/auth/Can";
import NotifyModal from "../../../shared/notifications/NotifyModal";
import ShareInformationModal from "../../../shared/notifications/ShareInformationModal";
import { INFORMATION_TYPES } from "../../../shared/notifications/informationTypes";
import { useGetContractFullDetailsQuery } from "../../../core/store/contractsApi";
import { DownloadIcon, PrinterIcon } from "../../../shared/components/icon";
import { date, money, qty, text, travelTime } from "./contract-detail/format";
import {
  ActivityTab,
  InvoicesTab,
  OverviewTab,
  PartiesTab,
  PaymentsTab,
  QualityTab,
  TrucksTab,
} from "./contract-detail/sections";
import { Kpi, Progress, StatusPill } from "./contract-detail/ui";
import { downloadContractPdf } from "./contract-detail/contractPdf";
import "./ContractDetail.scss";

type TabKey = "overview" | "parties" | "quality" | "trucks" | "invoices" | "payments" | "activity";

const ContractDetail = () => {
  const { id = "" } = useParams<{ id: string }>();
  const contractNo = decodeURIComponent(id);
  const [tab, setTab] = useState<TabKey>("overview");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [shareType, setShareType] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const { data, isLoading, isFetching, isError, refetch } = useGetContractFullDetailsQuery(contractNo, { skip: !id });

  const tabs = useMemo(
    () =>
      data
        ? ([
            { key: "overview", label: "Overview" },
            { key: "parties", label: "Seller & Buyer" },
            { key: "quality", label: "Quality", count: data.sellerConditions.qualitySpecifications.length + data.buyerConditions.qualitySpecifications.length },
            { key: "trucks", label: "Trucks", count: data.trucks.length },
            { key: "invoices", label: "Invoices", count: data.invoices.length },
            { key: "payments", label: "Payments", count: data.receipts.length + data.refunds.length },
            { key: "activity", label: "Activity", count: data.statusHistory.length },
          ] as { key: TabKey; label: string; count?: number }[])
        : [],
    [data],
  );

  const handleDownloadPdf = async () => {
    if (!data || pdfBusy) return;
    setPdfBusy(true);
    setPdfError("");
    try {
      await downloadContractPdf(data);
    } catch (error) {
      console.error("Contract PDF failed", error);
      setPdfError("The PDF could not be created. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  const back = (
    <Link to="/admin/contracts?show=all" className="contract-detail__back">
      Back to Contracts
    </Link>
  );

  if (isLoading) {
    return (
      <div className="contract-detail">
        {back}
        <div className="cd-state" role="status" aria-live="polite">
          <div className="cd-state__spinner" />
          <span>Loading contract {contractNo}…</span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="contract-detail">
        {back}
        <div className="cd-state">
          <strong>No contract found for "{contractNo}".</strong>
          <span>It may not exist, you may not have access to it, or the details could not be loaded.</span>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const o = data.overview;
  const s = data.summary;
  const sym = o.currencySymbol;
  // Contract value follows the GST choice: "Including GST" shows the net rate (with GST), "Excluding GST" the contract rate.
  const includesGst = /includ/i.test(o.gstDetails ?? "");
  // The rate with GST: the API's net rate, else worked out from the rate and its GST (per MT amount, else the %), so an
  // "incl. GST" label never shows the amount before GST.
  const rateWithGst =
    o.netRatePerMT ||
    o.pricePerMT + (o.gstAmountPerMT || (o.pricePerMT * (o.gstPercentage ?? 0)) / 100);
  const shownRate = includesGst ? rateWithGst : o.pricePerMT;
  const shownValue = includesGst ? Math.round(s.totalQuantityMT * rateWithGst * 100) / 100 : s.contractValue;
  const number = o.contractNumber || contractNo;

  return (
    <div className="contract-detail">
      {back}

      {/* ---------- header ---------- */}
      <div className="cd-hero">
        <div className="cd-hero__main">
          <div className="cd-hero__title">
            <h1>Contract {number}</h1>
            <StatusPill status={o.status} />
            {isFetching && <span className="cd-muted">Refreshing…</span>}
          </div>
          <p className="cd-hero__parties">
            <strong>{withCity(text(data.seller.legalName), data.seller.contractAddress?.city)}</strong> <span aria-hidden>→</span> <strong>{withCity(text(data.buyer.legalName), data.buyer.contractAddress?.city)}</strong>
          </p>
          <p className="cd-hero__meta">
            {text(o.productName)} · {qty(o.totalQuantityMT)} @ {money(shownRate, sym)}/MT{o.gstDetails ? ` (${includesGst ? "incl." : "excl."} GST)` : ""} · {date(o.contractDate)}
            {o.approxTravelDays != null || o.approxTravelHours != null ? ` · Travel ~${travelTime(o.approxTravelDays, o.approxTravelHours)}` : ""}
          </p>
        </div>
        <div className="cd-hero__actions">
          <Can any={["notifications.send"]}>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setNotifyOpen(true)}>
              Notify
            </button>
          </Can>
          <Can any={["notifications.send"]}>
            <div className="dropdown">
              <button type="button" className="btn btn-outline-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                Share information
              </button>
              <ul className="dropdown-menu">
                {INFORMATION_TYPES.map((t) => (
                  <li key={t.value}>
                    <button type="button" className="dropdown-item" onClick={() => setShareType(t.value)}>
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Can>
          <Can any={["notifications.history"]}>
            <Link className="btn btn-outline-secondary btn-sm" to={`/admin/contracts/${encodeURIComponent(number)}/notifications`}>
              Notification history
            </Link>
          </Can>
          <button type="button" className="btn btn-primary btn-sm cd-print-hide" onClick={handleDownloadPdf} disabled={pdfBusy}>
            <DownloadIcon aria-hidden /> {pdfBusy ? "Preparing PDF…" : "Download PDF"}
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm cd-print-hide" onClick={() => window.print()}>
            <PrinterIcon aria-hidden /> Print
          </button>
        </div>
      </div>

      {pdfError && (
        <div className="alert alert-danger py-2 mb-0" role="alert">
          {pdfError}
        </div>
      )}

      <ShareInformationModal
        open={shareType !== null}
        onClose={() => setShareType(null)}
        informationType={shareType ?? "GREETING"}
        contractNumber={number}
      />
      <NotifyModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        title={`Notify about contract ${number}`}
        eventCode="OPEN_TEXT_SHARED"
        contractNumber={number}
      />

      {/* ---------- at-a-glance ---------- */}
      <div className="cd-kpis">
        <Kpi
          label={o.gstDetails ? `Contract Value (${includesGst ? "incl." : "excl."} GST)` : "Contract Value"}
          value={money(shownValue, sym)}
          hint={`${qty(s.totalQuantityMT)} × ${money(shownRate, sym)}`}
        />
        <Kpi label="Invoiced (incl. GST)" value={money(s.invoiceTotal, sym)} hint={`${s.invoiceCount} invoice${s.invoiceCount === 1 ? "" : "s"}`} />
        <Kpi label="Paid / Adjusted" value={money(s.paidAgainstInvoices, sym)} tone="success" hint={`Receipts ${money(s.receiptsTotal, sym)}`} />
        <Kpi
          label="Outstanding"
          value={money(s.outstandingAmount, sym)}
          tone={s.outstandingAmount > 0 ? "warning" : "success"}
          hint={s.refundsTotal > 0 ? `Refunded ${money(s.refundsTotal, sym)}` : undefined}
        />
      </div>

      <div className="cd-card cd-progress-card">
        <div className="cd-progress-grid">
          {/* Order per UAT: Invoiced, Arranged, Pending. "Invoiced" is the quantity dispatched on seller invoices. */}
          <Progress label="Invoiced" value={s.dispatchedQuantityMT} total={s.totalQuantityMT} valueLabel={`${qty(s.dispatchedQuantityMT)} of ${qty(s.totalQuantityMT)}`} />
          <Progress label="Arranged" value={s.arrangedQuantityMT} total={s.totalQuantityMT} valueLabel={`${qty(s.arrangedQuantityMT)} of ${qty(s.totalQuantityMT)}`} />
          <Progress label="Pending" value={s.pendingQuantityMT} total={s.totalQuantityMT} valueLabel={`${qty(s.pendingQuantityMT)} of ${qty(s.totalQuantityMT)}`} />
        </div>
      </div>

      {/* ---------- tabs ---------- */}
      <div className="cd-tabs" role="tablist" aria-label="Contract sections">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`cd-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`cd-panel-${t.key}`}
            className={`cd-tabs__tab${tab === t.key ? " is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count !== undefined && <span className="cd-tabs__count">{t.count}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`cd-panel-${tab}`} aria-labelledby={`cd-tab-${tab}`} className="cd-panel">
        {tab === "overview" && <OverviewTab d={data} />}
        {tab === "parties" && <PartiesTab d={data} />}
        {tab === "quality" && <QualityTab d={data} />}
        {tab === "trucks" && <TrucksTab d={data} />}
        {tab === "invoices" && <InvoicesTab d={data} />}
        {tab === "payments" && <PaymentsTab d={data} />}
        {tab === "activity" && <ActivityTab d={data} />}
      </div>
    </div>
  );
};

export default ContractDetail;
