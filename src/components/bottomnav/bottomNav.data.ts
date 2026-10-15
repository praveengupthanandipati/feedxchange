import type { IconType } from "react-icons";
import { FiFileText, FiHome, FiPieChart, FiSettings } from "react-icons/fi";

export interface BottomNavItem {
  id: string;
  label: string;
  icon: IconType;
  /** Where the tab goes. */
  path: string;
  /** Path prefixes that light the tab up (e.g. every /contracts/... screen). */
  match: string[];
  /** Shown when the user holds ANY of these keys; no keys = everyone. Same keys as the side menu. */
  permissions?: string[];
}

export const bottomNavItems: BottomNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: FiHome, path: "/dashboard", match: ["/dashboard"], permissions: ["dashboard"] },
  { id: "contracts", label: "Contracts", icon: FiFileText, path: "/contracts", match: ["/contracts"], permissions: ["contracts.view"] },
  { id: "reports", label: "Reports", icon: FiPieChart, path: "/reports/overview", match: ["/reports"], permissions: ["reports"] },
  { id: "settings", label: "Settings", icon: FiSettings, path: "/settings", match: ["/settings"] },
];

/** True when `pathname` is the tab's screen or one beneath it. "/" counts as the Dashboard. */
export const isTabActive = (item: BottomNavItem, pathname: string) =>
  (item.id === "dashboard" && pathname === "/") || item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
