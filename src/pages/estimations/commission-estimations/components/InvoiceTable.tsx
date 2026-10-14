import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { EstimationContract, EstimationInvoice } from "../commissionEstimation.data";
import { formatNumber } from "../commissionEstimation.utils";

interface InvoiceTableProps {
  contract: EstimationContract;
  selectedIds: string[];
  onToggle: (invoiceId: string) => void;
  onToggleAll: (checked: boolean) => void;
}

type Row = EstimationInvoice & { sNo: number };

const columns: TableColumn<Row>[] = [
  { key: "sNo", header: "S.No", sortable: true },
  { key: "invoiceDate", header: "Invoice Dt", sortable: true, render: (row) => formatDisplayDate(row.invoiceDate) },
  { key: "invoiceNo", header: "Invoice No", sortable: true },
  { key: "qty", header: "Qty", sortable: true },
  { key: "truckNumber", header: "Truck Number", sortable: true },
  { key: "amount", header: "Invoice Amount", sortable: true, render: (row) => formatNumber(row.amount) },
];

/** Invoices raised against a contract, shown under its row in the desktop table. */
const InvoiceTable = ({ contract, selectedIds, onToggle, onToggleAll }: InvoiceTableProps) => (
  <div className="commission-estimations__invoices">
    <Table
      columns={columns}
      data={contract.invoices.map((invoice, index) => ({ ...invoice, sNo: index + 1 }))}
      rowKey={(row) => row.id}
      selectable
      selectedRowKeys={selectedIds}
      onSelectRow={onToggle}
      onSelectAll={onToggleAll}
      variant="light"
      className="commission-estimations__invoice-table"
      emptyMessage={`No invoices raised against contract ${contract.contractNo} yet.`}
    />
  </div>
);

export default InvoiceTable;
