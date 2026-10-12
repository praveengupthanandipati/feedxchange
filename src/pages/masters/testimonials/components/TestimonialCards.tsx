import { TestimonialActions, TestimonialStatusBadge } from "./TestimonialBits";
import type { TestimonialListProps } from "./TestimonialsTable";

/** Phones: one card per testimonial instead of the table. */
const TestimonialCards = ({ rows, emptyMessage, onEdit, onDelete }: TestimonialListProps) => (
  <ul className="testimonials__cards">
    {rows.length === 0 && <li className="testimonials__cards-empty">{emptyMessage}</li>}
    {rows.map((testimonial) => (
      <li key={testimonial.id} className="testimonials__card">
        <div className="testimonials__card-top">
          <span className="testimonials__author">
            <strong>{testimonial.customerName}</strong>
            <small>{testimonial.designation}</small>
          </span>
          <TestimonialStatusBadge status={testimonial.status} />
        </div>
        <p className="testimonials__card-content">{testimonial.content}</p>
        <div className="testimonials__card-meta">
          <span>{testimonial.date}</span>
          <TestimonialActions testimonial={testimonial} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </li>
    ))}
  </ul>
);

export default TestimonialCards;
