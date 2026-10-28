export type TestimonialStatus = "Active" | "Inactive";

export interface Testimonial {
  id: string;
  customerName: string;
  customerEmail: string;
  /** Shown under the author's name, e.g. "Customer". */
  designation: string;
  title: string;
  content: string;
  /** 1 to 5. */
  rating: number;
  status: TestimonialStatus;
  /** yyyy-mm-dd */
  date: string;
}

/** What the Create / Edit panel collects. */
export interface TestimonialForm {
  customerName: string;
  customerEmail: string;
  title: string;
  content: string;
  rating: string;
  status: TestimonialStatus;
}

export const TESTIMONIAL_STATUSES: TestimonialStatus[] = ["Active", "Inactive"];
export const MAX_RATING = 5;

export const EMPTY_FORM: TestimonialForm = { customerName: "", customerEmail: "", title: "", content: "", rating: "0", status: "Active" };

// TODO: replace with the testimonials API once it is available.
export const initialTestimonials: Testimonial[] = [
  {
    id: "1",
    customerName: "Surya",
    customerEmail: "surya@gmail.com",
    designation: "Customer",
    title: "Prompt service",
    content: "Thank You FeedXchange Service for prompt service and timely delivery of every order.",
    rating: 5,
    status: "Active",
    date: "2026-03-03",
  },
  {
    id: "2",
    customerName: "Praveen",
    customerEmail: "praveen@gmail.com",
    designation: "Customer",
    title: "Streamlined supply chain",
    content: "FeedXchange streamlined our entire supply chain. We now source feed ingredients in days instead of weeks.",
    rating: 5,
    status: "Active",
    date: "2026-03-29",
  },
  {
    id: "3",
    customerName: "Kishore",
    customerEmail: "kishore@gmail.com",
    designation: "Customer",
    title: "Trustworthy platform",
    content: "The platform is incredibly trustworthy. Every transaction is transparent and payments are always on time.",
    rating: 4,
    status: "Active",
    date: "2026-03-29",
  },
  {
    id: "4",
    customerName: "Kiran Kumar",
    customerEmail: "kiran@gmail.com",
    designation: "Customer",
    title: "Delivers on its promise",
    content: "Finally, a feed trading platform that delivers on its promises. Quality products and great support.",
    rating: 5,
    status: "Active",
    date: "2026-03-29",
  },
];
