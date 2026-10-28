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

/** Two-tone placeholder standing in for the sample photos until real uploads exist. */
const placeholder = (from: string, to: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="120" height="80" fill="url(#g)"/><circle cx="78" cy="44" r="20" fill="${to}" opacity=".55"/><circle cx="40" cy="30" r="12" fill="${from}" opacity=".6"/></svg>`,
  )}`;

// TODO: replace with the blogs API once it is available.
export const initialBlogs: Blog[] = [
  {
    id: "1",
    title: "Fish Farms",
    description: "Fish contains rich in nutrients and proteins that keep farmed stock healthy.",
    image: placeholder("#9cc3e6", "#2c5d8a"),
    link: "https://www.google.com/",
    priority: 1,
    status: "Active",
  },
  {
    id: "2",
    title: "Hen Food",
    description: "Hen food in Telangana",
    image: placeholder("#e3c49a", "#8a5a2b"),
    link: "https://www.google.com/",
    priority: 2,
    status: "Active",
  },
  {
    id: "3",
    title: "New Blog Title",
    description: "Finally, a feed trading platform that delivers on its promises.",
    image: placeholder("#a9d4dc", "#1f4e5f"),
    link: "https://www.google.com/",
    priority: 3,
    status: "Active",
  },
  {
    id: "4",
    title: "Upeted Blogs Title",
    description: "Finally, a feed trading platform that delivers on its promises.",
    image: placeholder("#7fa7d9", "#1b2f5c"),
    link: "https://www.yahoo.com/",
    priority: 4,
    status: "Active",
  },
];
