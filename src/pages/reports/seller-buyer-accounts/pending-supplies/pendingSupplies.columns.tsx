import { FiPlusCircle, FiEye, FiFileText } from "react-icons/fi";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../../components/table/table.types";
import type { PendingSupplyRow } from "./pendingSupplies.data";

interface ColumnHandlers {
  onCreateInterest: (row: PendingSupplyRow) => void;
  onViewInterest: (row: PendingSupplyRow) => void;
  onViewInterestDetail: (row: PendingSupplyRow) => void;
}

export function buildPendingSuppliesColumns({
  onCreateInterest,
  onViewInterest,
  onViewInterestDetail,
}: ColumnHandlers): TableColumn<PendingSupplyRow>[] {
  return [
    {
      key: "actions",
      header: "",
      render: (row) => (
        <RowActionsMenu
          menuAlign="left"
          menuHeader="Interest of Payments"
          actions={[
            { key: "create", label: "Create Interest", icon: FiPlusCircle, onClick: () => onCreateInterest(row) },
            { key: "view", label: "View Interest", icon: FiEye, onClick: () => onViewInterest(row) },
            { key: "detail", label: "View Interest Detail", icon: FiFileText, onClick: () => onViewInterestDetail(row) },
          ]}
        />
      ),
    },
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "contDate",
      header: "Cont Dt",
      sortable: true,
      sortValue: (row) => row.contDateValue,
    },
    {
      key: "contractNumber",
      header: "Contract#",
      sortable: true,
      render: (row) => <span className="pending-supplies-table__contract">{row.contractNumber}</span>,
    },
    {
      key: "buyerName",
      header: "Buyer Name",
      sortable: true,
    },
    {
      key: "productName",
      header: "Product Name",
      sortable: true,
    },
    {
      key: "qty",
      header: "Qty",
      sortable: true,
    },
    {
      key: "netRate",
      header: "Net Rate",
      sortable: true,
    },
    {
      key: "suppliedQty",
      header: "Supplied Qty",
      sortable: true,
    },
    {
      key: "balanceQty",
      header: "Balance Qty",
      sortable: true,
      render: (row) => (
        <span className={row.balanceQty > 0 ? "pending-supplies-table__balance--pending" : ""}>
          {row.balanceQty}
        </span>
      ),
    },
    {
      key: "package",
      header: "Package",
    },
    {
      key: "deliverySchedule",
      header: "Delivery Schedule",
    },
    {
      key: "paymentTerms",
      header: "Payment Terms",
    },
    {
      key: "dcType",
      header: "DC Type",
    },
  ];
}
