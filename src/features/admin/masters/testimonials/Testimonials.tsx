import { useCallback, useMemo, useState } from "react";
import { CircleCheckBigIcon } from "../../../../shared/components/icon";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import { initialTestimonials, type Testimonial, type TestimonialForm } from "./testimonials.data";
import { matchesSearch, today } from "./testimonials.utils";
import TestimonialCards from "./components/TestimonialCards";
import TestimonialOffcanvas from "./components/TestimonialOffcanvas";
import TestimonialsHeader from "./components/TestimonialsHeader";
import TestimonialsPagination from "./components/TestimonialsPagination";
import TestimonialsTable from "./components/TestimonialsTable";
import "./Testimonials.scss";

const PAGE_SIZE = 10;

/** Which testimonial the panel is open for: a new one, an existing one, or closed. */
type PanelState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; testimonial: Testimonial };

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => testimonials.filter((testimonial) => matchesSearch(testimonial, search)), [testimonials, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = search.trim() ? "No testimonials match your search." : "No testimonials yet. Use New to add one.";

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);

  const openEdit = (testimonial: Testimonial) => {
    setMessage("");
    setPanel({ mode: "edit", testimonial });
  };

  const handleSave = (form: TestimonialForm) => {
    const values = {
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      title: form.title.trim(),
      content: form.content.trim(),
      rating: Number(form.rating),
      status: form.status,
    };
    // TODO: send the testimonial to the API once the endpoint is available.
    if (panel.mode === "edit") {
      setTestimonials((prev) => prev.map((item) => (item.id === panel.testimonial.id ? { ...item, ...values } : item)));
      setMessage(`Testimonial from ${values.customerName} updated.`);
    } else {
      setTestimonials((prev) => [...prev, { id: `${Date.now()}`, designation: "Customer", date: today(), ...values }]);
      setMessage(`Testimonial from ${values.customerName} created.`);
    }
    closePanel();
  };

  return (
    <div className="testimonials">
      <TestimonialsHeader
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onNew={() => {
          setMessage("");
          setPanel({ mode: "create" });
        }}
      />

      {message && (
        <p className="testimonials__message" role="status">
          <CircleCheckBigIcon aria-hidden /> {message}
        </p>
      )}

      <TestimonialsTable rows={paged} emptyMessage={emptyMessage} onEdit={openEdit} onDelete={setDeleting} />
      <TestimonialCards rows={paged} emptyMessage={emptyMessage} onEdit={openEdit} onDelete={setDeleting} />

      <TestimonialsPagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      {panel.mode !== "closed" && (
        <TestimonialOffcanvas
          // A fresh form each time the panel opens for a different testimonial.
          key={panel.mode === "edit" ? panel.testimonial.id : "new"}
          testimonial={panel.mode === "edit" ? panel.testimonial : null}
          onSave={handleSave}
          onClose={closePanel}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete testimonial"
        message={deleting ? `Delete the testimonial from ${deleting.customerName}? This cannot be undone.` : ""}
        onConfirm={() => {
          // TODO: send the delete to the API once the endpoint is available.
          if (deleting) {
            setTestimonials((prev) => prev.filter((item) => item.id !== deleting.id));
            setMessage(`Testimonial from ${deleting.customerName} deleted.`);
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default Testimonials;
