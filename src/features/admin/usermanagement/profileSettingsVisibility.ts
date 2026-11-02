// The Profile Settings step of the business owner, transporter and promoter wizards is hidden for now: it is left out of
// the wizard steps and the side menu, and the step before it goes on to Notification Preferences (or finishes).
// Set to true to bring it back; nothing else needs to change.
export const SHOW_PROFILE_SETTINGS = false;

const isProfileSettingsPath = (path: string | undefined) => Boolean(path?.split("?")[0].endsWith("/profile-settings"));

/** Filters wizard steps / menu entries, dropping Profile Settings while it is hidden. */
export const isShownProfileStep = (item: { path?: string }) => SHOW_PROFILE_SETTINGS || !isProfileSettingsPath(item.path);
