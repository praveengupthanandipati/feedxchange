import type { IconType } from "react-icons";

export interface AsideNavChild {
  id: string;
  label: string;
  path: string;
  /** Shown when the user holds ANY of these permission keys. Omit to inherit the parent item's. */
  permissions?: string[];
  /** Screens reached from this item that live outside its path, so it stays highlighted there. */
  relatedPaths?: string[];
}

export interface AsideNavItem {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  /** Shown when the user holds ANY of these keys. A group without keys shows when any child does. */
  permissions?: string[];
  children?: AsideNavChild[];
}

export interface AsideNavSection {
  id: string;
  title?: string;
  items: AsideNavItem[];
}
