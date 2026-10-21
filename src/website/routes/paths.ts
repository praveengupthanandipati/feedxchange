/** Every website URL lives under this prefix, so it never collides with the admin app's routes. */
export const WEBSITE_BASE = "/website";

export const sitePaths = {
  home: WEBSITE_BASE,
  about: `${WEBSITE_BASE}/about`,
  services: `${WEBSITE_BASE}/services`,
  contact: `${WEBSITE_BASE}/contact`,
  /** The admin application's sign-in, linked from the header. */
  login: "/login",
} as const;
