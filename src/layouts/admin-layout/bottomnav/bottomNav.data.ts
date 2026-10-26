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
  { id: "dashboard", label: "Dashboard", icon: FiHome, path: "/admin/dashboard", match: ["/admin/dashboard"], permissions: ["dashboard"] },
  { id: "contracts", label: "Contracts", icon: FiFileText, path: "/admin/contracts", match: ["/admin/contracts"], permissions: ["contracts.view"] },
  { id: "reports", label: "Reports", icon: FiPieChart, path: "/admin/reports/overview", match: ["/admin/reports"], permissions: ["reports"] },
  { id: "settings", label: "Settings", icon: FiSettings, path: "/admin/settings", match: ["/admin/settings"] },
];

/** True when `pathname` is the tab's screen or one beneath it. "/admin" counts as the Dashboard. */
export const isTabActive = (item: BottomNavItem, pathname: string) =>
  (item.id === "dashboard" && pathname === "/admin") || item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
