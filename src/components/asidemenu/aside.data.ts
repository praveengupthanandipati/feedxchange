import {
  FiHome,
  FiFileText,
  FiActivity,
  FiGrid,
  FiUser,
  FiSettings,
  FiBell,
  FiMessageSquare,
  FiBriefcase,
  FiTruck,
  FiPieChart,
  FiUsers,
  FiTag,
  FiUserPlus,
  FiCheckSquare,
  FiPackage,
  FiSend,
} from "react-icons/fi";
import type { AsideNavSection } from "./aside.types";

// TODO: replace with real navigation items once routes/permissions are finalized.
export const asideNavSections: AsideNavSection[] = [
  {
    id: "your-company",
    title: "FeedxChange",
    items: [
      { id: "dashboard", label: "Dashboard", icon: FiHome, path: "/dashboard" },
      { id: "contract", label: "Contracts", icon: FiFileText, path: "/contracts" },
      { id: "contract-status", label: "Contract Status", icon: FiActivity, path: "/contract-status" },
      // {
      //   id: "task",
      //   label: "Task",
      //   icon: FiCheckSquare,
      //   children: [
      //     { id: "task-list", label: "Task List", path: "/task/list" },
      //     { id: "task-board", label: "Task Board", path: "/task/board" },
      //   ],
      // },
      // { id: "performance", label: "Performance", icon: FiTrendingUp, path: "/performance" },
      // { id: "projects", label: "Projects", icon: FiFolder, path: "/projects" },
    ],
  },
   {
    id: "truck-management",
    title: "Truck Management",
    items: [
      {
        id: "pending-contracts",
        label: "Pending Contracts",
        icon: FiFileText,
        path: "/truck-management/pending-contracts",
      },
      {
        id: "bulk-freight-approval",
        label: "Bulk Freight Approval",
        icon: FiCheckSquare,
        path: "/truck-management/bulk-freight-approval",
      },
      {
        id: "pending-delivery-orders",
        label: "Pending Delivery Orders",
        icon: FiPackage,
        path: "/truck-management/pending-delivery-orders",
      },
      {
        id: "add-dispatch-by-user",
        label: "Add Dispatch By User",
        icon: FiUserPlus,
        path: "/truck-management/add-dispatch-by-user",
      },
      {
        id: "truck-transporters",
        label: "Transporters",
        icon: FiTruck,
        children: [
          {
            id: "truck-transporters-freight-approval",
            label: "Freight Approval",
            path: "/truck-management/transporters/freight-approval",
          },
          {
            id: "truck-transporters-dashboard",
            label: "Transport Dashboard",
            path: "/truck-management/transporters/transport-dashboard",
          },
          {
            id: "truck-transporters-master",
            label: "Truck Master",
            path: "/truck-management/transporters/truck-master",
          },
           {
            id: "driver-master",
            label: "Drivers Master",
            path: "/truck-management/transporters/driver-master",
          },
        ],
      },
      {
        id: "seller-dispatches-new",
        label: "Seller Dispatches New",
        icon: FiSend,
        path: "/truck-management/seller-dispatches-new",
      },
    ],
  },
   {
    id: "user-management",
    title: "User Management",
    items: [
      {
        id: "business-owners",
        label: "Business Owners",
        icon: FiBriefcase,
        path: "/business-owners",
        children: [
          { id: "business-owners-profile", label: "Business Profile", path: "/business-owners/profile" },
          { id: "business-owners-contacts", label: "Contacts & Addresses", path: "/business-owners/contacts" },
          { id: "business-owners-documents", label: "Documents", path: "/business-owners/documents" },
          { id: "business-owners-bank-details", label: "Bank Details", path: "/business-owners/bank-details" },
          { id: "business-owners-profile-settings", label: "Profile Settings", path: "/business-owners/profile-settings" },
        ],
      },
      {
        id: "transporters",
        label: "Transporters",
        icon: FiTruck,
        path: "/transporters",
        children: [
          { id: "transporters-profile", label: "Transporter Profile", path: "/transporters/profile" },
          { id: "transporters-contacts", label: "Contacts & Addresses", path: "/transporters/contacts" },
          { id: "transporters-documents", label: "Documents", path: "/transporters/documents" },
          { id: "transporters-bank-details", label: "Bank Details", path: "/transporters/bank-details" },
          { id: "transporters-profile-settings", label: "Profile Settings", path: "/transporters/profile-settings" },
        ],
      },
      {
        id: "promoters-dashboard",
        label: "Promoters Dashboard",
        icon: FiPieChart,
        path: "/promoter-dashboard",
      },
      {
        id: "promoters",
        label: "Promoters",
        icon: FiUsers,
        path: "/promoters",
        children: [
          { id: "promoters-profile", label: "Promoter Profile", path: "/promoters/profile" },
          { id: "promoters-documents", label: "Documents", path: "/promoters/documents" },
          { id: "promoters-profile-settings", label: "Profile Settings", path: "/promoters/profile-settings" },
        ],
      },
      { id: "promocodes", label: "Promocodes", icon: FiTag, path: "/promocodes" },
      {
        id: "referred-profiles",
        label: "Referred Profiles",
        icon: FiUserPlus,
        path: "/referred-profiles",
      },
    ],
  },
  {
    id: "our-features",
    title: "Product Management",
    items: [
      { id: "categories", label: "Categories", icon: FiMessageSquare, path: "/categories" },
      {
        id: "apps",
        label: "Products",
        icon: FiGrid,
        children: [
          { id: "products-products", label: "Products", path: "/products" },
          { id: "products-price-tracking", label: "Price Tracking", path: "/products/price-tracking" },
          { id: "products-price-history", label: "Price History", path: "/products/price-history" },
          {
            id: "products-formula-calculations",
            label: "Formula Calculations",
            path: "/products/formula-calculations",
          },
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
      
    ],
  }, 
];
