import { useMemo, useState } from "react";
import Table from "../../../../components/table/Table";
import ContractDetailOffcanvas from "./ContractDetailOffcanvas";
import { buildContractColumns } from "./contracts.columns";
import { contractRows, contractSummaryTotals, money, type ContractRow } from "./contracts.data";
import "./Contracts.scss";

const ContractInvoicesPanel = ({ row }: { row: ContractRow }) => (
  <div className="seller-buyer-accounts-invoices">
    <div className="seller-buyer-accounts-invoices__table-wrapper">
      <table className="seller-buyer-accounts-invoices__table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Invoice Date</th>
            <th>Invoice No</th>
            <th>Truck No</th>
            <th>Bags</th>
            <th>Qty</th>
            <th>Freight</th>
            <th>Deduction</th>
            <th>Invoice Amount</th>
            <th>Pending Amount</th>
            <th>Total Pending of Contract</th>
          </tr>
        </thead>
        <tbody>
          {row.invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.sNo}</td>
              <td>{invoice.invoiceDate}</td>
              <td>{invoice.invoiceNo}</td>
              <td>{invoice.truckNo}</td>
              <td>{invoice.bags}</td>
              <td>{invoice.qty}</td>
              <td>{money(invoice.freight)}</td>
              <td>{money(invoice.deduction)}</td>
              <td>{money(invoice.invoiceAmount)}</td>
              <td>{money(invoice.pendingAmount)}</td>
              <td>{money(invoice.totalPendingOfContract)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Contracts = () => {
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);
  const [viewContractRow, setViewContractRow] = useState<ContractRow | null>(null);

  // The shared Table component only supports one expanded row at a time
  // (accordion-style), so "Expand All" opens the first row with invoice
  // detail and "Collapse All" closes whichever row is currently open.
  const expandableRows = useMemo(() => contractRows.filter((row) => row.invoices.length > 0), []);
  const firstExpandableId = expandableRows[0]?.id ?? null;
  const allExpanded = expandedRowKey !== null;

  const handleToggleExpand = (row: ContractRow) => {
    setExpandedRowKey((prev) => (prev === row.id ? null : row.id));
  };

  const handleToggleExpandAll = () => {
    setExpandedRowKey((prev) => (prev ? null : firstExpandableId));
  };

  const handleViewContract = (row: ContractRow) => setViewContractRow(row);

  const columns = useMemo(
    () => buildContractColumns({ onViewContract: handleViewContract, onToggleExpand: handleToggleExpand, expandedRowKey }),
    [expandedRowKey],
  );

  return (
    <>
      <div className="seller-buyer-accounts-contracts-summary">
        <p>
          Last Year Total : <strong>{contractSummaryTotals.lastYearTotal}</strong> | Current Year Total :{" "}
          <strong>{contractSummaryTotals.currentYearTotal}</strong> | Total of All Contracts &quot;Quantity&quot; :{" "}
          <strong>{contractSummaryTotals.totalQuantity}</strong>
        </p>
        <button
          type="button"
          className="seller-buyer-accounts-expand-all-btn"
          onClick={handleToggleExpandAll}
          disabled={expandableRows.length === 0}
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <Table
        columns={columns}
        data={contractRows}
        rowKey={(row) => row.id}
        emptyMessage="No contracts found."
        expandedRowKey={expandedRowKey}
        renderExpandedRow={(row) => <ContractInvoicesPanel row={row} />}
        minHeight
        className="seller-buyer-accounts-contracts-table"
      />

      <ContractDetailOffcanvas
        open={viewContractRow !== null}
        row={viewContractRow}
        onClose={() => setViewContractRow(null)}
      />
    </>
  );
};

export default Contracts;
