import { useCallback, useRef, useState } from "react";
import { FiEye, FiEyeOff, FiDownload, FiCheck, FiRefreshCw } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import BuyerWise from "./buyer-wise/BuyerWise";
import CommodityWise from "./commodity-wise/CommodityWise";
import MonthlyWise from "./monthly-wise/MonthlyWise";
import SellerWise from "./seller-wise/SellerWise";
import {
  defaultFinancialYear,
  financialYearOptions,
  monthlyReportsTabs,
  type MonthlyReportsTabId,
} from "./monthlyReports.data";
import "./MonthlyReports.scss";

const MonthlyReports = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<MonthlyReportsTabId>("month");

  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");

  const exportHandlerRef = useRef<(() => void) | null>(null);
  const registerExport = useCallback((handler: (() => void) | null) => {
    exportHandlerRef.current = handler;
  }, []);

  const handleApply = () => setAppliedFinancialYear(selectedFinancialYear);

  const handleReset = () => {
    setSelectedFinancialYear("");
    setAppliedFinancialYear("");
  };

  const handleExport = () => exportHandlerRef.current?.();

  return (
    <div className="monthly-reports-page">
      <div className="monthly-reports-card">
        <div className="monthly-reports-card__header">
          <h1>Monthly Reports</h1>
          <div className="monthly-reports-card__actions">
            <button
              type="button"
              className="monthly-reports-btn monthly-reports-btn--hide"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="monthly-reports-btn monthly-reports-btn--export" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="monthly-reports-filters">
            <div className="monthly-reports-filters__field">
              <SearchableSelect
                options={financialYearOptions}
                value={selectedFinancialYear}
                onChange={setSelectedFinancialYear}
                placeholder="Select Financial Year"
                ariaLabel="Select Financial Year"
              />
            </div>

            <button type="button" className="monthly-reports-filters__apply" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="monthly-reports-filters__reset" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        )}

        <div className="monthly-reports-tabs" role="tablist">
          {monthlyReportsTabs.map((tab) => (
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

        {activeTab === "month" && (
          <MonthlyWise financialYear={appliedFinancialYear || defaultFinancialYear} onRegisterExport={registerExport} />
        )}
        {activeTab === "commodity" && <CommodityWise onRegisterExport={registerExport} />}
        {activeTab === "seller" && <SellerWise onRegisterExport={registerExport} />}
        {activeTab === "buyer" && <BuyerWise onRegisterExport={registerExport} />}
      </div>
    </div>
  );
};

export default MonthlyReports;
