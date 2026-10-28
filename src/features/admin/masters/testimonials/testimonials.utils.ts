import { MAX_RATING, type Testimonial, type TestimonialForm } from "./testimonials.data";

export type FormErrors = Partial<Record<"customerName" | "customerEmail" | "title" | "content" | "rating", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const toForm = (testimonial: Testimonial): TestimonialForm => ({
  customerName: testimonial.customerName,
  customerEmail: testimonial.customerEmail,
  title: testimonial.title,
  content: testimonial.content,
  rating: String(testimonial.rating),
  status: testimonial.status,
});

export function validateTestimonial(form: TestimonialForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.customerName.trim()) errors.customerName = "Enter the customer name.";

  if (!form.customerEmail.trim()) errors.customerEmail = "Enter the customer email.";
  else if (!EMAIL_PATTERN.test(form.customerEmail.trim())) errors.customerEmail = "Enter a valid email address.";

  if (!form.title.trim()) errors.title = "Enter the title.";
  if (!form.content.trim()) errors.content = "Enter the review content.";

  const rating = Number(form.rating);
  if (!form.rating.trim()) errors.rating = "Enter the rating.";
  else if (!Number.isInteger(rating) || rating < 1 || rating > MAX_RATING) errors.rating = `Rating must be a whole number from 1 to ${MAX_RATING}.`;
  return errors;
}

/** Today as yyyy-mm-dd in the user's time zone. */
export const today = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const matchesSearch = (testimonial: Testimonial, query: string) => {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return [testimonial.customerName, testimonial.customerEmail, testimonial.title, testimonial.content].some((value) => value.toLowerCase().includes(term));
};
