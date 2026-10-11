import { formatEnquiryDate, NOT_ASSIGNED } from "../productEnquiries.utils";
import { EnquiryEmail, EnquiryPhone } from "./EnquiryContact";
import type { EnquiryListProps } from "./EnquiriesTable";
import EnquiryStatusBadge from "./EnquiryStatusBadge";

/** Phones and tablets: one card per enquiry instead of the wide table. */
const EnquiryCards = ({ rows, emptyMessage, onUpdateStatus }: EnquiryListProps) => (
  <ul className="product-enquiries__cards">
    {rows.length === 0 && <li className="product-enquiries__cards-empty">{emptyMessage}</li>}
    {rows.map((row) => (
      <li key={row.id} className="product-enquiries__card">
        <div className="product-enquiries__card-top">
          <strong>
            {row.productName} · {row.qtyMt} MT
          </strong>
          <EnquiryStatusBadge status={row.status} />
        </div>
        <dl>
          <div className="product-enquiries__card-full">
            <dt>Company Name</dt>
            <dd>{row.companyName}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{row.city}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatEnquiryDate(row.date)}</dd>
          </div>
          <div className="product-enquiries__card-full">
            <dt>Nature of Business</dt>
            <dd>{row.natureOfBusiness}</dd>
          </div>
          <div className="product-enquiries__card-full">
            <dt>Email</dt>
            <dd>
              <EnquiryEmail email={row.email} />
            </dd>
          </div>
          <div>
            <dt>Phone Number</dt>
            <dd>
              <EnquiryPhone phone={row.phone} />
            </dd>
          </div>
          <div>
            <dt>Assign To</dt>
            <dd>{row.assignedTo || NOT_ASSIGNED}</dd>
          </div>
        </dl>
        <div className="product-enquiries__card-actions">
          <button type="button" className="product-enquiries__btn product-enquiries__btn--navy" onClick={() => onUpdateStatus(row)}>
            Update Status
          </button>
        </div>
      </li>
    ))}
  </ul>
);

export default EnquiryCards;
