import type { IconType } from "react-icons";

export interface AsideNavChild {
  id: string;
  label: string;
  path: string;
  /** Screens reached from this item that live outside its path, so it stays highlighted there. */
  relatedPaths?: string[];
}

export interface AsideNavItem {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  children?: AsideNavChild[];
}

export interface AsideNavSection {
  id: string;
  title?: string;
  items: AsideNavItem[];
}
