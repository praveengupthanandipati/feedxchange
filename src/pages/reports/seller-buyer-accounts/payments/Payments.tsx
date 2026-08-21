import { useMemo, useState } from "react";
import Table from "../../../../components/table/Table";
import { buildPaymentsColumns } from "./payments.columns";
import { paymentRows, type PaymentRow } from "./payments.data";
import "./Payments.scss";

const PaymentSubTable = ({ row }: { row: PaymentRow }) => (
  <div className="payments-entries">
    <div className="payments-entries__table-wrapper">
      <table className="payments-entries__table">
        <thead>
          <tr>
            <th>Towards</th>
            <th>Payment of</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {row.entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.towards}</td>
              <td>{entry.paymentOf}</td>
              <td>{entry.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Payments = () => {
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

  // The shared Table component only supports one expanded row at a time
  // (accordion-style), so "Expand All" opens the first row and "Collapse
  // All" closes whichever row is currently open.
  const firstRowId = paymentRows[0]?.id ?? null;
  const allExpanded = expandedRowKey !== null;

  const handleToggleRow = (row: PaymentRow) => {
    setExpandedRowKey((prev) => (prev === row.id ? null : row.id));
  };

  const handleToggleExpandAll = () => {
    setExpandedRowKey((prev) => (prev ? null : firstRowId));
  };

  const columns = useMemo(() => buildPaymentsColumns({ expandedRowKey }), [expandedRowKey]);

  return (
    <>
      <div className="payments-header">
        <h2>Payment Receipts</h2>
        <button
          type="button"
          className="payments-expand-all-btn"
          onClick={handleToggleExpandAll}
          disabled={paymentRows.length === 0}
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <Table
        columns={columns}
        data={paymentRows}
        rowKey={(row) => row.id}
        emptyMessage="No payment receipts found."
        expandedRowKey={expandedRowKey}
        renderExpandedRow={(row) => <PaymentSubTable row={row} />}
        onRowClick={handleToggleRow}
        minHeight
        className="payments-main-table"
      />
    </>
  );
};

export default Payments;
