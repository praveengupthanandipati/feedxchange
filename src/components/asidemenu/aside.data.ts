import {
  FiHome,
  FiFileText,
  FiUserCheck,
  FiDollarSign,
  FiCheckSquare,
  FiTrendingUp,
  FiFolder,
  FiGrid,
  FiUser,
  FiSettings,
  FiBell,
  FiMessageSquare,
} from "react-icons/fi";
import type { AsideNavSection } from "./aside.types";

// TODO: replace with real navigation items once routes/permissions are finalized.
export const asideNavSections: AsideNavSection[] = [
  {
    id: "your-company",
    title: "Your Company",
    items: [
      { id: "dashboard", label: "Dashboard", icon: FiHome, path: "/dashboard" },
      { id: "contract", label: "Contracts", icon: FiFileText, path: "/contracts" },
      { id: "core-hr", label: "Core HR", icon: FiUserCheck, path: "/core-hr" },
      { id: "finance", label: "Finance", icon: FiDollarSign, path: "/finance" },
      {
        id: "task",
        label: "Task",
        icon: FiCheckSquare,
        children: [
          { id: "task-list", label: "Task List", path: "/task/list" },
          { id: "task-board", label: "Task Board", path: "/task/board" },
        ],
      },
      { id: "performance", label: "Performance", icon: FiTrendingUp, path: "/performance" },
      { id: "projects", label: "Projects", icon: FiFolder, path: "/projects" },
    ],
  },
  {
    id: "our-features",
    title: "Our Features",
    items: [
      {
        id: "apps",
        label: "Apps",
        icon: FiGrid,
        children: [
          { id: "apps-calendar", label: "Calendar", path: "/apps/calendar" },
          { id: "apps-chat", label: "Chat", path: "/apps/chat" },
        ],
      },
      {
        id: "profile",
        label: "Profile",
        icon: FiUser,
        children: [
          { id: "profile-view", label: "View Profile", path: "/profile/view" },
          { id: "profile-edit", label: "Edit Profile", path: "/profile/edit" },
        ],
      },
      {
        id: "account",
        label: "Account",
        icon: FiSettings,
        children: [
          { id: "account-security", label: "Security", path: "/account/security" },
          { id: "account-billing", label: "Billing", path: "/account/billing" },
        ],
      },
      { id: "notifications", label: "Notifications", icon: FiBell, path: "/notifications" },
      { id: "messages", label: "Messages", icon: FiMessageSquare, path: "/messages" },
    ],
  },
];
