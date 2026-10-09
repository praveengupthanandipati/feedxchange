import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { EstimationContract } from "../commissionEstimation.data";
import { contractCommission, formatNumber, isTicked, type Selection } from "../commissionEstimation.utils";
import CommissionInput from "./CommissionInput";
import ExpandButton from "./ExpandButton";
import InvoiceTable from "./InvoiceTable";

/** What the desktop table and the mobile cards both need to show and change contracts. */
export interface ContractListProps {
  rows: EstimationContract[];
  selection: Selection;
  expandedIds: string[];
  emptyMessage: string;
  onToggleContract: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onToggleInvoice: (contractId: string, invoiceId: string) => void;
  onCommissionChange: (id: string, value: number) => void;
}

interface ContractsTableProps extends ContractListProps {
  onToggleAllContracts: (checked: boolean) => void;
  onToggleAllInvoices: (contractId: string, checked: boolean) => void;
}

const ContractsTable = ({
  rows,
  selection,
  expandedIds,
  emptyMessage,
  onToggleContract,
  onToggleAllContracts,
  onToggleExpanded,
  onToggleInvoice,
  onToggleAllInvoices,
  onCommissionChange,
}: ContractsTableProps) => {
  const columns: TableColumn<EstimationContract>[] = [
    {
      key: "expand",
      header: "",
      width: "3rem",
      align: "center",
      render: (row) => <ExpandButton expanded={expandedIds.includes(row.id)} contractNo={row.contractNo} onToggle={() => onToggleExpanded(row.id)} />,
    },
    { key: "contractDate", header: "Contract Dt", sortable: true, render: (row) => formatDisplayDate(row.contractDate) },
    { key: "contractNo", header: "Contract No", sortable: true, sortValue: (row) => Number(row.contractNo) || row.contractNo },
    { key: "partyName", header: "Party Name", sortable: true, render: (row) => <span className="commission-estimations__party">{row.partyName}</span> },
    {
      key: "actionType",
      header: "Action Type",
      sortable: true,
      render: (row) => <span className={`commission-estimations__action commission-estimations__action--${row.actionType.toLowerCase()}`}>{row.actionType}</span>,
    },
    { key: "commodity", header: "Commodity", sortable: true },
    { key: "contractRate", header: "Contract Rate", sortable: true, render: (row) => formatNumber(row.contractRate) },
    { key: "quantityMt", header: "No of MT", sortable: true },
    {
      key: "commissionPerMt",
      header: "Commission / MT",
      sortable: true,
      render: (row) => <CommissionInput value={row.commissionPerMt} contractNo={row.contractNo} onChange={(value) => onCommissionChange(row.id, value)} />,
    },
    { key: "total", header: "Total Commission", sortable: true, sortValue: contractCommission, render: (row) => <strong>{formatNumber(contractCommission(row))}</strong> },
  ];

  return (
    <div className="commission-estimations__table-view">
      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        selectable
        selectedRowKeys={rows.filter((row) => isTicked(selection, row.id)).map((row) => row.id)}
        onSelectRow={onToggleContract}
        onSelectAll={onToggleAllContracts}
        expandedRowKeys={expandedIds}
        renderExpandedRow={(row) => (
          <InvoiceTable
            contract={row}
            selectedIds={selection[row.id] ?? []}
            onToggle={(invoiceId) => onToggleInvoice(row.id, invoiceId)}
            onToggleAll={(checked) => onToggleAllInvoices(row.id, checked)}
          />
        )}
        className="commission-estimations__table"
        emptyMessage={emptyMessage}
      />
    </div>
  );
};

export default ContractsTable;
