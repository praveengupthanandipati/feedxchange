import { useCallback, useMemo, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { productEnquiries, type EnquiryUpdate, type ProductEnquiry } from "./productEnquiries.data";
import { exportEnquiries, matchesSearch } from "./productEnquiries.utils";
import EnquiriesFilters from "./components/EnquiriesFilters";
import EnquiriesHeader from "./components/EnquiriesHeader";
import EnquiriesPagination from "./components/EnquiriesPagination";
import EnquiriesTable from "./components/EnquiriesTable";
import EnquiryCards from "./components/EnquiryCards";
import UpdateStatusOffcanvas from "./components/UpdateStatusOffcanvas";
import "./ProductEnquiries.scss";

const PAGE_SIZE = 10;

const ProductEnquiries = () => {
  const [enquiries, setEnquiries] = useState<ProductEnquiry[]>(productEnquiries);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<ProductEnquiry | null>(null);
  const [message, setMessage] = useState("");

  // Newest enquiries first.
  const filtered = useMemo(
    () =>
      enquiries
        .filter((enquiry) => matchesSearch(enquiry, search) && (!status || enquiry.status === status))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [enquiries, search, status],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = search.trim() || status ? "No enquiries match the current filters." : "No product enquiries yet.";

  const closePanel = useCallback(() => setUpdating(null), []);

  const handleSave = (update: EnquiryUpdate) => {
    if (!updating) return;
    // TODO: send the update to the API once the endpoint is available.
    setEnquiries((prev) => prev.map((enquiry) => (enquiry.id === updating.id ? { ...enquiry, ...update } : enquiry)));
    setMessage(`${updating.productName} enquiry from ${updating.companyName} updated to ${update.status}.`);
    closePanel();
  };

  const openPanel = (enquiry: ProductEnquiry) => {
    setMessage("");
    setUpdating(enquiry);
  };

  return (
    <div className="product-enquiries">
      <EnquiriesHeader filtersVisible={filtersVisible} onToggleFilters={() => setFiltersVisible((prev) => !prev)} onExport={() => exportEnquiries(filtered)} canExport={filtered.length > 0} />

      {filtersVisible && (
        <EnquiriesFilters
          search={search}
          status={status}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      )}

      {message && (
        <p className="product-enquiries__message" role="status">
          <FiCheckCircle aria-hidden /> {message}
        </p>
      )}

      <EnquiriesTable rows={paged} emptyMessage={emptyMessage} onUpdateStatus={openPanel} />
      <EnquiryCards rows={paged} emptyMessage={emptyMessage} onUpdateStatus={openPanel} />

      <EnquiriesPagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      {updating && <UpdateStatusOffcanvas key={updating.id} enquiry={updating} onSave={handleSave} onClose={closePanel} />}
    </div>
  );
};

export default ProductEnquiries;
