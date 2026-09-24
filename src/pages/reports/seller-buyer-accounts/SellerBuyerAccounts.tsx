import { useState, type ReactElement } from "react";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import AvgPayments from "./avg-payments/AvgPayments";
import ContactInfo from "./contact-info/ContactInfo";
import Contracts from "./contracts/Contracts";
import OverDuePay from "./over-due-pay/OverDuePay";
import Payments from "./payments/Payments";
import PendingPayments from "./pending-payments/PendingPayments";
import PendingSupplies from "./pending-supplies/PendingSupplies";
import Profile from "./profile/Profile";
import Summary from "./summary/Summary";
import UnaccountBalance from "./unaccount-balance/UnaccountBalance";
import {
  accountTabs,
  businessOptions,
  partyRoleOptions,
  type AccountTabId,
  type PartyRole,
} from "./sellerBuyerAccounts.data";
import "./SellerBuyerAccounts.scss";

const tabContent: Partial<Record<AccountTabId, () => ReactElement>> = {
  contracts: Contracts,
  "pending-supplies": PendingSupplies,
  summary: Summary,
  "pending-payments": PendingPayments,
  "over-due-pay": OverDuePay,
  "un-account-bal": UnaccountBalance,
  "avg-payments": AvgPayments,
  payments: Payments,
  profile: Profile,
  "contact-info": ContactInfo,
};

const SellerBuyerAccounts = () => {
  const [role, setRole] = useState<PartyRole>("Seller");
  const [selectedBusiness, setSelectedBusiness] = useState(businessOptions[0].value);
  const [activeTab, setActiveTab] = useState<AccountTabId>("contracts");

  const selectedBusinessLabel =
    businessOptions.find((business) => business.value === selectedBusiness)?.label ?? "";

  // TODO: wire up to the reports API once available.
  const handleFindDetails = () => undefined;

  const activeTabLabel = accountTabs.find((tab) => tab.id === activeTab)?.label ?? "";
  const ActiveTabComponent = tabContent[activeTab];

  return (
    <div className="seller-buyer-accounts-page">
      <div className="seller-buyer-accounts-card">
        <h1>{role} Account</h1>

        <div className="seller-buyer-accounts-controls">
          <SearchableSelect
            options={businessOptions}
            value={selectedBusiness}
            onChange={setSelectedBusiness}
            placeholder="Select Business"
            ariaLabel="Select Business"
          />
          <SearchableSelect
            options={partyRoleOptions}
            value={role}
            onChange={(value) => setRole(value as PartyRole)}
            placeholder="Select Role"
            ariaLabel="Select Seller or Buyer"
          />
          <button type="button" className="seller-buyer-accounts-find-btn" onClick={handleFindDetails}>
            Find Details
          </button>
          <p className="seller-buyer-accounts-controls__party">
            {role} Name: <strong>{selectedBusinessLabel}</strong>
          </p>
        </div>

        <div className="seller-buyer-accounts-tabs-mobile">
          <select
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value as AccountTabId)}
            aria-label="Select account section"
          >
            {accountTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        <div className="seller-buyer-accounts-tabs" role="tablist">
          {accountTabs.map((tab) => (
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

        {ActiveTabComponent ? (
          <ActiveTabComponent />
        ) : (
          <div className="seller-buyer-accounts-placeholder">
            <p>{activeTabLabel} content coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerBuyerAccounts;
