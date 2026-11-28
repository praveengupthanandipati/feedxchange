import { useEffect, useMemo, useState, type ReactElement } from "react";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import {
  ArrowLeftRightIcon,
  Building2Icon,
  CalendarIcon,
  ChartColumnIcon,
  ClipboardIcon,
  FileTextIcon,
  IndianRupeeIcon,
  InfoIcon,
  PhoneIcon,
  ReceiptIcon,
  WalletIcon,
  type IconComponent,
} from "../../../../shared/components/icon";
import { useGetAllContractsByFiltersQuery } from "../../../../core/store/contractsApi";
import { useGetDashboardProfilesQuery } from "../../../../core/store/businessDashboardApi";
import { useProfileCities, withCity } from "../../../../shared/hooks/useProfileCities";
import { AllContractsReport, PendingContractsReport } from "./contractReports";
import { AvgPaymentDaysReport, DuePaymentsReport, PaymentAdvicesReport, PaymentsPendingReport, UnallocatedAdvicesReport } from "./paymentReports";
import { ContactInfoReport, ProfileInfoReport, ProfileOverviewReport } from "./profileReports";
import {
  DATE_PRESET_OPTIONS,
  REPORT_GROUPS,
  otherRole,
  rangeFor,
  type AccountContext,
  type DatePreset,
  type PartyRole,
  type ReportDef,
  type ReportId,
} from "./sellerBuyerAccounts.data";
import "./SellerBuyerAccounts.scss";

const REPORTS: Record<ReportId, (props: { report: ReportDef; ctx: AccountContext }) => ReactElement> = {
  "all-contracts": AllContractsReport,
  "profile-overview": ProfileOverviewReport,
  "pending-contracts": PendingContractsReport,
  "payments-pending": PaymentsPendingReport,
  "due-payments": DuePaymentsReport,
  "unallocated-advices": UnallocatedAdvicesReport,
  "avg-payment-days": AvgPaymentDaysReport,
  "payment-advices": PaymentAdvicesReport,
  "profile-info": ProfileInfoReport,
  "contact-info": ContactInfoReport,
};

/** One icon for every report and for the two group headings. */
const REPORT_ICONS: Record<ReportId, IconComponent> = {
  "all-contracts": FileTextIcon,
  "profile-overview": Building2Icon,
  "pending-contracts": ClipboardIcon,
  "payments-pending": WalletIcon,
  "due-payments": CalendarIcon,
  "unallocated-advices": ReceiptIcon,
  "avg-payment-days": ChartColumnIcon,
  "payment-advices": IndianRupeeIcon,
  "profile-info": InfoIcon,
  "contact-info": PhoneIcon,
};

const ALL_REPORTS: ReportDef[] = REPORT_GROUPS.flatMap((group) => [group.overview, ...group.reports]);

/** Seller / Buyer toggle: the role of the business owner above it. */
const RoleToggle = ({ value, onChange, label }: { value: PartyRole; onChange: (role: PartyRole) => void; label: string }) => (
  <div className="sba-toggle" role="group" aria-label={label}>
    {(["Seller", "Buyer"] as PartyRole[]).map((role) => (
      <button key={role} type="button" className={value === role ? "is-active" : ""} aria-pressed={value === role} onClick={() => onChange(role)}>
        {role}
      </button>
    ))}
  </div>
);

const SellerBuyerAccounts = () => {
  const { cityOf } = useProfileCities();
  const { data: contracts = [], isFetching: contractsLoading, isError: contractsFailed } = useGetAllContractsByFiltersQuery();
  const { data: profiles = [] } = useGetDashboardProfilesQuery();

  // first business owner and its role; the second business owner is the other side of the same contracts
  const [aRole, setARole] = useState<PartyRole>("Seller");
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [preset, setPreset] = useState<DatePreset>("thisYear");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [reportId, setReportId] = useState<ReportId>("all-contracts");

  // everyone who is a seller (or buyer) on a contract the signed-in user can see
  const partiesIn = (role: PartyRole, counterpartOf?: number) => {
    const map = new Map<number, string>();
    contracts.forEach((c) => {
      const id = role === "Seller" ? c.sellerId : c.buyerId;
      const name = role === "Seller" ? c.sellerName : c.buyerName;
      const otherId = role === "Seller" ? c.buyerId : c.sellerId;
      if (id == null || !name) return;
      if (counterpartOf !== undefined && otherId !== counterpartOf) return;
      map.set(id, name);
    });
    return [...map.entries()].map(([id, name]) => ({ value: String(id), label: withCity(name, cityOf(id)) })).sort((x, y) => x.label.localeCompare(y.label));
  };
  const aOptions = useMemo(() => partiesIn(aRole), [contracts, aRole, cityOf]); // eslint-disable-line react-hooks/exhaustive-deps
  const bOptions = useMemo(() => (aId ? partiesIn(otherRole(aRole), Number(aId)) : partiesIn(otherRole(aRole))), [contracts, aRole, aId, cityOf]); // eslint-disable-line react-hooks/exhaustive-deps

  // a business owner starts on their own business; a single choice is taken at once
  useEffect(() => {
    if (aId || aOptions.length === 0) return;
    const own = profiles.find((p) => p.isOwn);
    if (own && aOptions.some((o) => o.value === String(own.profileId))) setAId(String(own.profileId));
    else if (aOptions.length === 1) setAId(aOptions[0].value);
  }, [aOptions, aId, profiles]);

  /** The two business owners swap sides (the second becomes the first). */
  const swapSides = () => {
    setARole(otherRole(aRole));
    setAId(bId);
    setBId(aId);
  };
  const changeRole = (role: PartyRole) => {
    if (role !== aRole) swapSides();
  };

  const labelOf = (options: { value: string; label: string }[], id: string) => options.find((o) => o.value === id)?.label ?? "";
  const aLabel = labelOf(aOptions, aId);
  const bLabel = labelOf(bOptions, bId);
  const range = useMemo(() => rangeFor(preset, customFrom, customTo), [preset, customFrom, customTo]);
  const ctx: AccountContext = useMemo(
    () => ({
      aId: aId ? Number(aId) : undefined,
      bId: bId ? Number(bId) : undefined,
      aRole,
      aLabel,
      bLabel,
      sellerId: aRole === "Seller" ? (aId ? Number(aId) : undefined) : bId ? Number(bId) : undefined,
      buyerId: aRole === "Buyer" ? (aId ? Number(aId) : undefined) : bId ? Number(bId) : undefined,
      range,
    }),
    [aId, bId, aRole, aLabel, bLabel, range],
  );

  const report = ALL_REPORTS.find((r) => r.id === reportId) ?? ALL_REPORTS[0];
  const ActiveReport = REPORTS[report.id];
  const bRole = otherRole(aRole);
  const customIncomplete = preset === "custom" && (!customFrom || !customTo);

  return (
    <div className="sba-page">
      <header className="sba-top">
        <div>
          <h1>Seller / Buyer Accounts</h1>
          <p>Contracts, payments, dues and profile of a business owner, with a download on every report.</p>
        </div>
        {aId && (
          <p className="sba-now" aria-live="polite" title={`${aLabel} as ${aRole.toLowerCase()} with ${bId ? bLabel : `all ${bRole.toLowerCase()}s`} · ${range.label}`}>
            <strong>{aLabel}</strong>
            <span>as {aRole.toLowerCase()}</span>
            <span className="sba-now__sep">with</span>
            <strong>{bId ? bLabel : `all ${bRole.toLowerCase()}s`}</strong>
            <span className="sba-now__sep">·</span>
            <span>{range.label}</span>
          </p>
        )}
      </header>

      <section className="sba-filterbar" aria-label="Filters">
        <div className="sba-party">
          <span className="sba-label">Business Owner</span>
          <SearchableSelect
            options={aOptions}
            value={aId}
            onChange={(value) => {
              setAId(value);
              setBId("");
            }}
            placeholder={contractsLoading ? "Loading business owners…" : `Select ${aRole.toLowerCase()}`}
            ariaLabel="First business owner"
          />
          <RoleToggle value={aRole} onChange={changeRole} label="Role of the first business owner" />
        </div>

        <button type="button" className="sba-swap" onClick={swapSides} title="Swap seller and buyer" aria-label="Swap seller and buyer">
          <ArrowLeftRightIcon aria-hidden />
        </button>

        <div className="sba-party">
          <span className="sba-label">Business Owner</span>
          <SearchableSelect
            options={[{ value: "", label: `All ${bRole.toLowerCase()}s` }, ...bOptions]}
            value={bId}
            onChange={setBId}
            placeholder={`All ${bRole.toLowerCase()}s`}
            ariaLabel="Second business owner"
            disabled={!aId}
          />
          <RoleToggle value={bRole} onChange={(role) => changeRole(otherRole(role))} label="Role of the second business owner" />
        </div>

        <div className="sba-date">
          <span className="sba-label sba-label--split">
            Date
            {preset !== "custom" && <small>{range.label}</small>}
          </span>
          <select value={preset} onChange={(event) => setPreset(event.target.value as DatePreset)} aria-label="Date">
            {DATE_PRESET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {preset === "custom" ? (
            <span className="sba-custom">
              <input type="date" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} aria-label="From date" />
              <span>to</span>
              <input type="date" value={customTo} min={customFrom || undefined} onChange={(event) => setCustomTo(event.target.value)} aria-label="To date" />
            </span>
          ) : null}
        </div>
      </section>
      {contractsFailed && (
        <p className="sba-error" role="alert">
          The business owners could not be loaded.
        </p>
      )}

      <div className="sba-body">
        <nav className="sba-side" aria-label="Reports">
          {REPORT_GROUPS.map((group) => (
            <div key={group.id} className="sba-side__group">
              <button
                type="button"
                className={`sba-side__head${reportId === group.overview.id ? " is-active" : ""}`}
                aria-current={reportId === group.overview.id ? "page" : undefined}
                title={group.overview.hint}
                onClick={() => setReportId(group.overview.id)}
              >
                <span className="sba-side__text">
                  {(() => {
                    const GroupIcon = REPORT_ICONS[group.overview.id];
                    return <GroupIcon aria-hidden />;
                  })()}
                  {group.label}
                </span>
                <small>{group.overview.label === group.label ? "Overview" : "All"}</small>
              </button>
              <div className="sba-side__items">
                {group.reports.map((item) => (
                  <button key={item.id} type="button" className={reportId === item.id ? "is-active" : ""} aria-current={reportId === item.id ? "page" : undefined} title={item.hint} onClick={() => setReportId(item.id)}>
                    {(() => {
                      const ItemIcon = REPORT_ICONS[item.id];
                      return <ItemIcon aria-hidden />;
                    })()}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <main className="sba-main">
          {!aId ? (
            <div className="sba-empty">
              <strong>Select a business owner</strong>
              <p>Choose the {aRole.toLowerCase()} above to see the reports. The other side is optional: leave it on "All {bRole.toLowerCase()}s" to see every one of them.</p>
            </div>
          ) : customIncomplete ? (
            <div className="sba-empty">
              <strong>Choose the dates</strong>
              <p>Enter both the From and the To date of the custom range.</p>
            </div>
          ) : (
            <ActiveReport key={`${report.id}-${aRole}-${aId}-${bId}-${range.from}-${range.to}`} report={report} ctx={ctx} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerBuyerAccounts;
