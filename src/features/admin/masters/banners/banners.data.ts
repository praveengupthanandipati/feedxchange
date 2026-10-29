export type BannerStatus = "Active" | "Inactive";

export interface Banner {
  id: number;
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
  /** The newly picked file itself, sent to the API as BannerImage. Null until a file is chosen. */
  file: File | null;
  status: BannerStatus;
}

export const EMPTY_FORM: BannerForm = { title: "", linkUrl: "", priority: "", image: "", fileName: "", file: null, status: "Active" };

/** Accepted banner image types and size. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
