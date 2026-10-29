import { API_URL } from "../../core/api/api";

// Turns the filePath FileUpload/UploadDocument returned (and the profile stores) into a link the browser can open:
// a full URL is used as is; a server folder path keeps only the part under wwwroot; anything else is a path on the API.
// Returns "" when there is no path.
export function fileUrl(filePath: string | null | undefined): string {
  const raw = (filePath ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  let path = raw.replace(/\\/g, "/");
  const webRoot = path.toLowerCase().indexOf("wwwroot/");
  if (webRoot >= 0) path = path.slice(webRoot + "wwwroot".length);
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_URL}${encodeURI(path)}`;
}
