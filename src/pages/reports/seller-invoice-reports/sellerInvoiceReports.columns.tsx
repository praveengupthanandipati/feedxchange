import { FiEye, FiEdit2, FiMail, FiSend, FiTrash2, FiMinusCircle } from "react-icons/fi";
import RowActionsMenu from "../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../components/table/table.types";
import type { SellerInvoiceRow } from "./sellerInvoiceReports.data";

interface ColumnHandlers {
  onView: (row: SellerInvoiceRow) => void;
  onEdit: (row: SellerInvoiceRow) => void;
  onEmail: (row: SellerInvoiceRow) => void;
  onSms: (row: SellerInvoiceRow) => void;
  onDelete: (row: SellerInvoiceRow) => void;
  onDeductions: (row: SellerInvoiceRow) => void;
}

export function buildSellerInvoiceColumns({
  onView,
  onEdit,
  onEmail,
  onSms,
  onDelete,
  onDeductions,
}: ColumnHandlers): TableColumn<SellerInvoiceRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4.5rem",
    },
    {
      key: "contractNumber",
      header: "Contract #",
      sortable: true,
      render: (row) => <span className="seller-invoice-table__contract">{row.contractNumber}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <RowActionsMenu
          actions={[
            { key: "view", label: "View", icon: FiEye, onClick: () => onView(row) },
            { key: "edit", label: "Edit", icon: FiEdit2, onClick: () => onEdit(row) },
            { key: "email", label: "Email", icon: FiMail, onClick: () => onEmail(row) },
            { key: "sms", label: "SMS", icon: FiSend, onClick: () => onSms(row) },
            { key: "delete", label: "Delete", icon: FiTrash2, onClick: () => onDelete(row), danger: true, dividerBefore: true },
            { key: "deductions", label: "Deductions", icon: FiMinusCircle, onClick: () => onDeductions(row) },
          ]}
        />
      ),
    },
    {
      key: "invDate",
      header: "Inv.Date",
      headerTooltip: "Invoice Date",
      sortable: true,
      sortValue: (row) => row.invDateValue,
    },
    {
      key: "invQty",
      header: "Inv. Qty",
      headerTooltip: "Invoiced Quantity",
      sortable: true,
      sortValue: (row) => row.invQtyValue,
    },
    {
      key: "balQty",
      header: "Bal.Qty",
      headerTooltip: "Balance Quantity",
      sortable: true,
      sortValue: (row) => row.balQtyValue,
      render: (row) => (
        <span className={row.balQtyValue > 0 ? "seller-invoice-table__qty--pending" : ""}>{row.balQty}</span>
      ),
    },
    {
      key: "bags",
      header: "Bags",
      sortable: true,
    },
    {
      key: "freight",
      header: "Freight",
      sortable: true,
      sortValue: (row) => row.freightValue,
    },
    {
      key: "invAmount",
      header: "Inv.Amount",
      headerTooltip: "Invoice Amount",
      sortable: true,
      sortValue: (row) => row.invAmountValue,
    },
    {
      key: "netAmount",
      header: "Net Amount",
      sortable: true,
      sortValue: (row) => row.netAmountValue,
      render: (row) => <strong className="seller-invoice-table__net-amount">{row.netAmount}</strong>,
    },
  ];
}
