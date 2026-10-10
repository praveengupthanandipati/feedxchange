import type { EnquiryStatus } from "../productEnquiries.data";

const EnquiryStatusBadge = ({ status }: { status: EnquiryStatus }) => (
  <span className={`product-enquiries__status product-enquiries__status--${status.toLowerCase()}`}>{status}</span>
);

export default EnquiryStatusBadge;
