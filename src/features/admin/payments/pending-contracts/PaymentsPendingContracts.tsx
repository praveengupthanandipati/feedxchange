import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContractDetailsOffcanvas from "../seller-invoice/ContractDetailsOffcanvas";
import PendingContractsPanel from "./PendingContractsPanel";
import { financialYearOf, financialYearOptionsUpTo } from "../../contracts/contract-status/contractStatus.data";
import type { InvoiceContract } from "../../../../core/store/sellerInvoiceApi";
import "../seller-invoice/SellerInvoice.scss";

/**
 * Payments › Pending Contracts: the contracts that can still be invoiced, shown like the Open & Pending Contracts
 * screen. "Add invoice" opens Seller Invoice with that contract filled in.
 */
const PaymentsPendingContracts = () => {
  const navigate = useNavigate();
  const [financialYear, setFinancialYear] = useState(financialYearOf());
  const [detailsContractNumber, setDetailsContractNumber] = useState<string | null>(null);
  const financialYearOptions = useMemo(() => financialYearOptionsUpTo(financialYearOf()).reverse(), []);

  const handleAddInvoice = (contract: InvoiceContract) =>
    navigate(`/admin/payments/seller-invoice?contract=${encodeURIComponent(contract.contractNumber)}`);

  return (
    <div className="seller-invoice-page">
      <div className="si-page-header">
        <div>
          <h1>Pending Contracts</h1>
          <p className="si-muted">Contracts with quantity still to be invoiced. Use Add invoice to enter the seller's invoice against a contract.</p>
        </div>
        <div className="si-page-header__controls">
          <div className="si-page-header__date">
            <label htmlFor="pending-contracts-fy">Financial year</label>
            <select
              id="pending-contracts-fy"
              className="si-input"
              value={financialYear}
              onChange={(event) => setFinancialYear(event.target.value)}
              title="Contracts dated in this financial year (April to March)"
            >
              <option value="">All years</option>
              {financialYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <PendingContractsPanel financialYear={financialYear} onSelect={handleAddInvoice} onDetails={setDetailsContractNumber} />

      <ContractDetailsOffcanvas
        open={detailsContractNumber !== null}
        contractNumber={detailsContractNumber ?? ""}
        onClose={() => setDetailsContractNumber(null)}
      />
    </div>
  );
};

export default PaymentsPendingContracts;
