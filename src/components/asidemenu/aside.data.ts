import {
  FiHome,
  FiFileText,
  FiActivity,
  FiGrid,
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
  FiFolder,
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
      //{
      //      id: "pending-contracts",
      //  label: "Pending Contracts",
      // icon: FiFileText,
      //  path: "/truck-management/pending-contracts",
      //  },
      {
        id: "contract-dispatch-management",
        label: "Pending Contracts",
        icon: FiSend,
        path: "/truck-management/open-pending-contracts",
        children: [
          {
            id: "contract-dispatch-add-instant-truck",
            label: "Add Instant Truck",
            path: "/truck-management/open-pending-contracts/instant-truck",
          },
          {
            id: "contract-dispatch-schedule-dispatch",
            label: "Schedule Dispatch",
            path: "/truck-management/open-pending-contracts/schedule-dispatch",
          },
          {
            id: "contract-dispatch-manage-schedule",
            label: "Manage Schedule",
            path: "/truck-management/open-pending-contracts/manage-schedule",
            // "Add Truck" on an accepted request opens its own screen.
            relatedPaths: ["/truck-management/open-pending-contracts/add-truck-to-schedule"],
          },
          {
            id: "contract-dispatch-update-truck-status",
            label: "Update Truck Status",
            path: "/truck-management/open-pending-contracts/update-truck-status",
          },
          {
            id: "contract-dispatch-view-all-trucks",
            label: "View All Trucks By Contract",
            path: "/truck-management/open-pending-contracts/view-trucks",
            // Re-assign and the contract chain are both opened from a truck card here.
            relatedPaths: [
              "/truck-management/open-pending-contracts/reassign-truck",
              "/truck-management/open-pending-contracts/truck-chain",
            ],
          },
        ],
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
          {
            id: "driver-truck-mapping",
            label: "Driver-Truck Mapping",
            path: "/truck-management/transporters/driver-truck-mapping",
          },
          {
            id: "truck-trips",
            label: "Truck Trips",
            path: "/truck-management/transporters/truck-trips",
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
    id: "payments-management",
    title: "Payments Management",
    items: [
      {
        id: "payments",
        label: "Payments",
        icon: FiFolder,
        children: [
          { id: "payments-seller-invoice", label: "Seller Invoice", path: "/payments/seller-invoice" },
          { id: "payments-payment-advice", label: "Payment Advice", path: "/payments/payment-advice" },
          { id: "payments-payment-allocation", label: "Payment Allocation", path: "/payments/payment-allocation" },
          { id: "payments-refunds", label: "Refunds", path: "/payments/refunds" },
        ],
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

      { id: "notifications", label: "Notifications", icon: FiBell, path: "/notifications" },

    ],
  },
  {
    id: "reports-statements",
    title: "Reports & Statements",
    items: [
      {
        id: "reports",
        label: "Reports",
        icon: FiFileText,
        children: [
          { id: "reports-seller-invoice", label: "Seller Invoice Reports", path: "/reports/seller-invoice-reports" },
          { id: "reports-seller-buyer-account", label: "Seller Buyer Account", path: "/reports/seller-buyer-accounts" },
          { id: "reports-contract-wise-status", label: "Contract wise Status", path: "/reports/contract-wise-status" },
          { id: "reports-contract-summary", label: "Contract Summary", path: "/reports/contract-summary" },
          { id: "reports-account-statement", label: "Account Statement", path: "/reports/account-statement" },
          { id: "reports-pending-payments", label: "Pending Payments", path: "/reports/pending-payments" },
          { id: "reports-pending-supplies", label: "Pending Supplies", path: "/reports/pending-supplies" },
          { id: "reports-monthly-reports", label: "Monthly Reports", path: "/reports/monthly-reports" },
          { id: "reports-do-truck-history", label: "DO Truck History", path: "/reports/do-truck-history" },
        ],
      },

    ],
  },
];
