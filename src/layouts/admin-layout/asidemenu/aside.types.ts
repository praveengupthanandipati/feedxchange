import { type IconComponent } from "../../../shared/components/icon";

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
  icon: IconComponent;
  path?: string;
  /** Shown when the user holds ANY of these keys. A group without keys shows when any child does. */
  permissions?: string[];
  children?: AsideNavChild[];
  /** Keeps the submenu closed until it's clicked, even while one of its pages is open. */
  collapsedByDefault?: boolean;
}

export interface AsideNavSection {
  id: string;
  title?: string;
  items: AsideNavItem[];
}
