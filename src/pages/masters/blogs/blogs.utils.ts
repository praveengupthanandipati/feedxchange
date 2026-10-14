import { MAX_DESCRIPTION_WORDS, type Blog, type BlogForm } from "./blogs.data";

export type FormErrors = Partial<Record<"title" | "description" | "image" | "link" | "priority", string>>;

export const toForm = (blog: Blog): BlogForm => ({
  title: blog.title,
  description: blog.description,
  image: blog.image,
  fileName: "",
  link: blog.link,
  priority: String(blog.priority),
  status: blog.status,
});

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/** Priorities 1..n, with one spare slot past the last blog so a new one can go at the end. */
export const priorityOptions = (count: number) =>
  Array.from({ length: Math.max(10, count + 1) }, (_, index) => String(index + 1)).map((value) => ({ value, label: value }));

export function validateBlog(form: BlogForm, blogs: Blog[], editingId: string | null): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Enter the blog title.";
  else if (blogs.some((blog) => blog.id !== editingId && blog.title.trim().toLowerCase() === form.title.trim().toLowerCase())) {
    errors.title = "A blog with this title already exists.";
  }

  if (countWords(form.description) > MAX_DESCRIPTION_WORDS) errors.description = `Keep the description to ${MAX_DESCRIPTION_WORDS} words or fewer.`;
  if (!form.image) errors.image = "Choose a blog image.";
  if (form.link.trim() && !isHttpUrl(form.link.trim())) errors.link = "Enter a full URL starting with http:// or https://.";
  if (!form.priority) errors.priority = "Select a priority.";
  return errors;
}

export function matchesSearch(blog: Blog, query: string) {
  const term = query.trim().toLowerCase();
  return !term || blog.title.toLowerCase().includes(term);
}
