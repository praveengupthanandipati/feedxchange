import { IMAGE_TYPES, MAX_IMAGE_BYTES, type Banner, type BannerForm } from "./banners.data";

export type FormErrors = Partial<Record<"title" | "linkUrl" | "priority" | "image", string>>;

export const toForm = (banner: Banner): BannerForm => ({
  title: banner.title,
  linkUrl: banner.linkUrl,
  priority: String(banner.priority),
  image: banner.image,
  fileName: "",
  status: banner.status,
});

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export function validateBanner(form: BannerForm, banners: Banner[], editingId: string | null): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Enter the banner title.";
  else if (banners.some((banner) => banner.id !== editingId && banner.title.trim().toLowerCase() === form.title.trim().toLowerCase())) {
    errors.title = "A banner with this title already exists.";
  }

  if (!form.linkUrl.trim()) errors.linkUrl = "Enter the link URL.";
  else if (!isHttpUrl(form.linkUrl.trim())) errors.linkUrl = "Enter a full URL starting with http:// or https://.";

  const priority = Number(form.priority);
  if (!form.priority.trim()) errors.priority = "Enter the priority.";
  else if (!Number.isInteger(priority) || priority < 1) errors.priority = "Priority must be a whole number of 1 or more.";

  if (!form.image) errors.image = "Choose a banner image.";
  return errors;
}

/** Problem with a picked file, or "" when it can be used. */
export function imageFileError(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG, WebP or GIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "The image must be 2 MB or smaller.";
  return "";
}

export const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const matchesSearch = (banner: Banner, query: string) => {
  const term = query.trim().toLowerCase();
  return !term || banner.title.toLowerCase().includes(term) || banner.linkUrl.toLowerCase().includes(term);
};
