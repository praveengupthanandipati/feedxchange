import hero960Jpg from "./hero-960.jpg";
import hero960Webp from "./hero-960.webp";
import hero1920Jpg from "./hero-1920.jpg";
import hero1920Webp from "./hero-1920.webp";

// The home page photo, chosen once per visit: WebP where the browser can make one (Chrome, Edge, Firefox; the original JPEG
// was 663 KB, the WebP is 47 KB), a recompressed JPEG elsewhere, and half the width on phones. The hero's background and
// the website loader (which waits for it) use this same URL, so the photo is downloaded once.

const supportsWebp = () => {
  try {
    return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
};

let chosen: string | null = null;

export const heroImage = (): string => {
  if (chosen) return chosen;
  if (typeof window === "undefined") return hero1920Jpg;
  const small = window.innerWidth * (window.devicePixelRatio || 1) <= 1100;
  const webp = supportsWebp();
  chosen = small ? (webp ? hero960Webp : hero960Jpg) : webp ? hero1920Webp : hero1920Jpg;
  return chosen;
};
