import { API_URL } from "../../../../core/api/api";
import type { Blogger } from "../../../../core/store/bloggersApi";

export type BlogStatus = "Active" | "Inactive";

export interface Blog {
  id: string;
  title: string;
  description: string;
  /** URL or data URL of the blog image. */
  image: string;
  link: string;
  priority: number;
  status: BlogStatus;
}

/** What the Create / Edit panel collects. */
export interface BlogForm {
  title: string;
  description: string;
  image: string;
  /** Name of the newly picked file, for the "No file chosen" box. */
  fileName: string;
  link: string;
  priority: string;
  status: BlogStatus;
}

export const BLOG_STATUSES: BlogStatus[] = ["Active", "Inactive"];
export const STATUS_OPTIONS = BLOG_STATUSES.map((status) => ({ value: status, label: status }));
export const MAX_DESCRIPTION_WORDS = 20;

export const EMPTY_FORM: BlogForm = { title: "", description: "", image: "", fileName: "", link: "", priority: "", status: "Active" };

/** Stand-in picture for a blog the API sends without an image. */
export const NO_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="120" height="80" fill="#e7ebf0"/><path d="M42 54l14-16 10 11 7-7 13 12z" fill="#b5bfcc"/><circle cx="76" cy="30" r="6" fill="#b5bfcc"/></svg>`,
)}`;

/** A post from GetAllBloggers as this screen shows it. */
export const fromBlogger = (post: Blogger): Blog => ({
  id: String(post.id),
  title: post.name?.trim() ?? "",
  description: post.description?.trim() ?? "",
  image: post.fileName ? `${API_URL}${post.fileName}` : NO_IMAGE,
  link: post.link_URL?.trim() ?? "",
  priority: post.priority,
  status: post.isActive ? "Active" : "Inactive",
});
