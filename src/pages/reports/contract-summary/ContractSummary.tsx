import { useCallback, useRef, useState } from "react";
import { FiEye, FiEyeOff, FiDownload, FiCheck, FiRefreshCw } from "react-icons/fi";
import DateRangeInput from "../../../components/dropdown/DateRangeInput";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import AccountSummaryTab from "./account-summary-tab/AccountSummaryTab";
import ContractSummaryTab from "./contract-summary-tab/ContractSummaryTab";
import { filterOptions, summaryTabs, type SummaryTabId } from "./contractSummary.data";
import "./ContractSummary.scss";

const ContractSummary = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<SummaryTabId>("contract");

  const [selectedFilter, setSelectedFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  const exportHandlerRef = useRef<(() => void) | null>(null);
  const registerExport = useCallback((handler: (() => void) | null) => {
    exportHandlerRef.current = handler;
  }, []);

  const handleApply = () => {
    setAppliedFilter(selectedFilter);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const handleReset = () => {
    setSelectedFilter("");
    setAppliedFilter("");
    setDateFrom("");
    setDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
  };

  const handleExport = () => exportHandlerRef.current?.();

  return (
    <div className="contract-summary-page">
      <div className="contract-summary-card">
        <div className="contract-summary-card__header">
          <h1>Contract Summary Statement</h1>
          <div className="contract-summary-card__actions">
            <button
              type="button"
              className="contract-summary-btn contract-summary-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="contract-summary-btn contract-summary-btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="contract-summary-filters">
            <div className="contract-summary-filters__field">
              <SearchableSelect
                options={filterOptions}
                value={selectedFilter}
                onChange={setSelectedFilter}
                placeholder="Select Filter"
                ariaLabel="Select Filter"
                clearable
              />
            </div>

            <div className="contract-summary-filters__field">
              <DateRangeInput
                from={dateFrom}
                to={dateTo}
                onChange={(from, to) => {
                  setDateFrom(from);
                  setDateTo(to);
                }}
                ariaLabel="Select date range"
              />
            </div>

            <button type="button" className="contract-summary-filters__apply" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="contract-summary-filters__reset" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        )}

        <div className="contract-summary-tabs" role="tablist">
          {summaryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "contract" ? (
          <ContractSummaryTab
            filterValue={appliedFilter}
            dateFrom={appliedDateFrom}
            dateTo={appliedDateTo}
            onRegisterExport={registerExport}
          />
        ) : (
          <AccountSummaryTab onRegisterExport={registerExport} />
        )}
      </div>
    </div>
  );
};

export default ContractSummary;
