export type BannerStatus = "Active" | "Inactive";

export interface Banner {
  id: string;
  title: string;
  linkUrl: string;
  priority: number;
  /** URL or data URL of the banner image. */
  image: string;
  status: BannerStatus;
}

/** What the Create / Edit panel collects. */
export interface BannerForm {
  title: string;
  linkUrl: string;
  priority: string;
  image: string;
  /** Name of the newly picked file, for the "No file chosen" box. */
  fileName: string;
  status: BannerStatus;
}

export const EMPTY_FORM: BannerForm = { title: "", linkUrl: "", priority: "", image: "", fileName: "", status: "Active" };

/** Accepted banner image types and size. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Warm two-tone placeholder standing in for the sample photos until real uploads exist. */
const placeholder = (from: string, to: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="120" height="80" fill="url(#g)"/><circle cx="78" cy="44" r="20" fill="${to}" opacity=".55"/><circle cx="40" cy="30" r="12" fill="${from}" opacity=".6"/></svg>`,
  )}`;

// TODO: replace with the banners API once it is available.
export const initialBanners: Banner[] = [
  { id: "1", title: "Banner Title 01", linkUrl: "httpss://choco", priority: 1, image: placeholder("#c8b79a", "#5b4632"), status: "Active" },
  { id: "2", title: "Banner", linkUrl: "https://happybanners", priority: 2, image: placeholder("#d9a066", "#6b3a1f"), status: "Active" },
  { id: "3", title: "Banner 02", linkUrl: "httpss://choco", priority: 3, image: placeholder("#e8e2d6", "#4a2a1c"), status: "Active" },
];
