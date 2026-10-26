import { FiEdit, FiTrash2 } from "react-icons/fi";
import type { Testimonial, TestimonialStatus } from "../testimonials.data";

export interface TestimonialActionHandlers {
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
}

export const TestimonialStatusBadge = ({ status }: { status: TestimonialStatus }) => (
  <span className={`testimonials__status testimonials__status--${status.toLowerCase()}`}>{status}</span>
);

/** Edit and Delete icon buttons. */
export const TestimonialActions = ({ testimonial, onEdit, onDelete }: TestimonialActionHandlers & { testimonial: Testimonial }) => (
  <div className="testimonials__actions">
    <button
      type="button"
      className="testimonials__icon-btn testimonials__icon-btn--edit"
      onClick={() => onEdit(testimonial)}
      aria-label={`Edit testimonial from ${testimonial.customerName}`}
      title="Edit"
    >
      <FiEdit aria-hidden />
    </button>
    <button
      type="button"
      className="testimonials__icon-btn testimonials__icon-btn--delete"
      onClick={() => onDelete(testimonial)}
      aria-label={`Delete testimonial from ${testimonial.customerName}`}
      title="Delete"
    >
      <FiTrash2 aria-hidden />
    </button>
  </div>
);
