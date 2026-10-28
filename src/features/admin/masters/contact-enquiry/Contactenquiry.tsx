import { useCallback, useMemo, useState } from "react";
import { CircleCheckBigIcon } from "../../../../shared/components/icon";
import { contactEnquiries, type ContactEnquiry, type ContactEnquiryUpdate } from "./contactEnquiry.data";
import { exportContactEnquiries, matchesSearch } from "./contactEnquiry.utils";
import ContactCards from "./components/ContactCards";
import ContactFilters from "./components/ContactFilters";
import ContactHeader from "./components/ContactHeader";
import ContactPagination from "./components/ContactPagination";
import ContactStatusOffcanvas from "./components/ContactStatusOffcanvas";
import ContactTable from "./components/ContactTable";
import "./Contactenquiry.scss";

const PAGE_SIZE = 10;

const Contactenquiry = () => {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>(contactEnquiries);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<ContactEnquiry | null>(null);
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
  const emptyMessage = search.trim() || status ? "No enquiries match the current filters." : "No contact enquiries yet.";

  const closePanel = useCallback(() => setUpdating(null), []);

  const handleSave = (update: ContactEnquiryUpdate) => {
    if (!updating) return;
    // TODO: send the update to the API once the endpoint is available.
    setEnquiries((prev) => prev.map((enquiry) => (enquiry.id === updating.id ? { ...enquiry, ...update } : enquiry)));
    setMessage(`Enquiry from ${updating.fullName} updated to ${update.status}.`);
    closePanel();
  };

  const openPanel = (enquiry: ContactEnquiry) => {
    setMessage("");
    setUpdating(enquiry);
  };

  return (
    <div className="contact-enquiry">
      <ContactHeader
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible((prev) => !prev)}
        onExport={() => exportContactEnquiries(filtered)}
        canExport={filtered.length > 0}
      />

      {filtersVisible && (
        <ContactFilters
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
        <p className="contact-enquiry__message" role="status">
          <CircleCheckBigIcon aria-hidden /> {message}
        </p>
      )}

      <ContactTable rows={paged} emptyMessage={emptyMessage} onUpdateStatus={openPanel} />
      <ContactCards rows={paged} emptyMessage={emptyMessage} onUpdateStatus={openPanel} />

      <ContactPagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      {updating && <ContactStatusOffcanvas key={updating.id} enquiry={updating} onSave={handleSave} onClose={closePanel} />}
    </div>
  );
};

export default Contactenquiry;
