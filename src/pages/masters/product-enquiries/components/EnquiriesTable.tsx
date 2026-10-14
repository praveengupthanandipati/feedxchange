import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { ProductEnquiry } from "../productEnquiries.data";
import { formatEnquiryDate, NOT_ASSIGNED } from "../productEnquiries.utils";
import { EnquiryEmail, EnquiryPhone } from "./EnquiryContact";
import EnquiryStatusBadge from "./EnquiryStatusBadge";

export interface EnquiryListProps {
  rows: ProductEnquiry[];
  emptyMessage: string;
  onUpdateStatus: (enquiry: ProductEnquiry) => void;
}

/** Laptop and desktop view. */
const EnquiriesTable = ({ rows, emptyMessage, onUpdateStatus }: EnquiryListProps) => {
  const columns: TableColumn<ProductEnquiry>[] = [
    { key: "productName", header: "Product Name", sortable: true },
    { key: "qtyMt", header: "Qty in MT", sortable: true },
    { key: "companyName", header: "Company Name", sortable: true, render: (row) => <span className="product-enquiries__wrap">{row.companyName}</span> },
    { key: "city", header: "City", sortable: true },
    { key: "natureOfBusiness", header: "Nature of Business", sortable: true, render: (row) => <span className="product-enquiries__wrap">{row.natureOfBusiness}</span> },
    { key: "email", header: "Email", sortable: true, render: (row) => <EnquiryEmail email={row.email} /> },
    { key: "phone", header: "Phone Number", sortable: true, render: (row) => <EnquiryPhone phone={row.phone} /> },
    { key: "date", header: "Date", sortable: true, render: (row) => formatEnquiryDate(row.date) },
    { key: "status", header: "Status", sortable: true, render: (row) => <EnquiryStatusBadge status={row.status} /> },
    { key: "assignedTo", header: "Assign To", sortable: true, render: (row) => row.assignedTo || NOT_ASSIGNED },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button type="button" className="product-enquiries__btn product-enquiries__btn--navy product-enquiries__btn--sm" onClick={() => onUpdateStatus(row)} aria-label={`Update status of ${row.productName} enquiry from ${row.companyName}`}>
          Update Status
        </button>
      ),
    },
  ];

  return (
    <div className="product-enquiries__table-view">
      <Table columns={columns} data={rows} rowKey={(row) => row.id} className="product-enquiries__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default EnquiriesTable;
