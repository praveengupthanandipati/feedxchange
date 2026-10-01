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
  FiSettings,
} from "react-icons/fi";
import type { AsideNavSection } from "./aside.types";

// TODO: replace with real navigation items once routes/permissions are finalized.
export const asideNavSections: AsideNavSection[] = [
  {
    id: "your-company",
    title: "FeedxChange",
    items: [
      { id: "dashboard", permissions: ["dashboard"], label: "Dashboard", icon: FiHome, path: "/dashboard" },
      { id: "contract", permissions: ["contracts.view"], label: "Contracts", icon: FiFileText, path: "/contracts" },
      { id: "contract-status", permissions: ["contract-status"], label: "Contract Status", icon: FiActivity, path: "/contract-status" },
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
        id: "contract-dispatch-management", permissions: ["pending-contracts"],
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
        id: "bulk-freight-approval", permissions: ["bulk-freight-approval"],
        label: "Bulk Freight Approval",
        icon: FiCheckSquare,
        path: "/truck-management/bulk-freight-approval",
      },
      {
        id: "pending-delivery-orders", permissions: ["pending-delivery-orders"],
        label: "Pending Delivery Orders",
        icon: FiPackage,
        path: "/truck-management/pending-delivery-orders",
      },
      {
        id: "add-dispatch-by-user", permissions: ["dispatch-by-user.manage"],
        label: "Add Dispatch By User",
        icon: FiUserPlus,
        path: "/truck-management/add-dispatch-by-user",
      },
      {
        id: "truck-transporters",
        label: "Transporters",
        icon: FiTruck,
        path: "/truck-management/transporters/overview",
        children: [
          {
            id: "truck-transporters-freight-approval", permissions: ["freight-approval"],
            label: "Freight Approval",
            path: "/truck-management/transporters/freight-approval",
          },
          {
            id: "truck-transporters-dashboard", permissions: ["transport-dashboard"],
            label: "Transport Dashboard",
            path: "/truck-management/transporters/transport-dashboard",
          },
          {
            id: "truck-transporters-master", permissions: ["truck-master.view"],
            label: "Truck Master",
            path: "/truck-management/transporters/truck-master",
          },
          {
            id: "driver-master", permissions: ["drivers-master.view"],
            label: "Drivers Master",
            path: "/truck-management/transporters/driver-master",
          },
          {
            id: "driver-truck-mapping", permissions: ["driver-truck-mapping.view"],
            label: "Driver-Truck Mapping",
            path: "/truck-management/transporters/driver-truck-mapping",
          },
          {
            id: "truck-trips", permissions: ["truck-trips.view"],
            label: "Truck Trips",
            path: "/truck-management/transporters/truck-trips",
          },
        ],
      },
      {
        id: "seller-dispatches-new", permissions: ["dispatch-by-admin.view"],
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
          { id: "payments-seller-invoice", permissions: ["seller-invoice.view"], label: "Seller Invoice", path: "/payments/seller-invoice" },
          { id: "payments-seller-invoice-edit", permissions: ["seller-invoice.view"], label: "Edit Seller Invoices", path: "/payments/seller-invoice-edit" },
          { id: "payments-payment-advice", permissions: ["payment-advice"], label: "Payment Advice", path: "/payments/payment-advice" },
          { id: "payments-payment-allocation", permissions: ["payment-allocation"], label: "Payment Allocation", path: "/payments/payment-allocation" },
          { id: "payments-refunds", permissions: ["refunds.view"], label: "Refunds", path: "/payments/refunds" },
        ],
      },
    ],
  },
   {
    id: "user-management",
    title: "User Management",
    items: [
      {
        id: "business-owners", permissions: ["profiles.business.view"],
        label: "Business Owners",
        icon: FiBriefcase,
        path: "/business-owners",
        children: [
          { id: "business-owners-profile", permissions: ["profiles.business.manage"], label: "Business Profile", path: "/business-owners/profile" },
          { id: "business-owners-contacts", permissions: ["profiles.business.manage"], label: "Contacts & Addresses", path: "/business-owners/contacts" },
          { id: "business-owners-documents", permissions: ["profiles.business.manage"], label: "Documents", path: "/business-owners/documents" },
          { id: "business-owners-bank-details", permissions: ["profiles.business.manage"], label: "Bank Details", path: "/business-owners/bank-details" },
          { id: "business-owners-profile-settings", permissions: ["profiles.business.manage"], label: "Profile Settings", path: "/business-owners/profile-settings" },
        ],
      },
      {
        id: "transporters", permissions: ["profiles.transporter.view"],
        label: "Transporters",
        icon: FiTruck,
        path: "/transporters",
        children: [
          { id: "transporters-profile", permissions: ["profiles.transporter.manage"], label: "Transporter Profile", path: "/transporters/profile" },
          { id: "transporters-contacts", permissions: ["profiles.transporter.manage"], label: "Contacts & Addresses", path: "/transporters/contacts" },
          { id: "transporters-documents", permissions: ["profiles.transporter.manage"], label: "Documents", path: "/transporters/documents" },
          { id: "transporters-bank-details", permissions: ["profiles.transporter.manage"], label: "Bank Details", path: "/transporters/bank-details" },
          { id: "transporters-profile-settings", permissions: ["profiles.transporter.manage"], label: "Profile Settings", path: "/transporters/profile-settings" },
        ],
      },
      {
        id: "promoters-dashboard", permissions: ["profiles.promoter-dashboard"],
        label: "Promoters Dashboard",
        icon: FiPieChart,
        path: "/promoter-dashboard",
      },
      {
        id: "promoters", permissions: ["profiles.promoter.view"],
        label: "Promoters",
        icon: FiUsers,
        path: "/promoters",
        children: [
          { id: "promoters-profile", permissions: ["profiles.promoter.manage"], label: "Promoter Profile", path: "/promoters/profile" },
          { id: "promoters-documents", permissions: ["profiles.promoter.manage"], label: "Documents", path: "/promoters/documents" },
          { id: "promoters-profile-settings", permissions: ["profiles.promoter.manage"], label: "Profile Settings", path: "/promoters/profile-settings" },
        ],
      },
      { id: "promocodes", permissions: ["promocodes.view"], label: "Promocodes", icon: FiTag, path: "/promocodes" },
      {
        id: "referred-profiles", permissions: ["profiles.referred"],
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
      { id: "categories", permissions: ["categories.view"], label: "Categories", icon: FiMessageSquare, path: "/categories" },
      {
        id: "apps",
        label: "Products",
        icon: FiGrid,
        children: [
          { id: "products-products", permissions: ["products.view"], label: "Products", path: "/products" },
          { id: "products-price-tracking", permissions: ["price.tracking"], label: "Price Tracking", path: "/products/price-tracking" },
          { id: "products-price-history", permissions: ["price.history"], label: "Price History", path: "/products/price-history" },
          {
            id: "products-formula-calculations", permissions: ["price.formula"],
            label: "Formula Calculations",
            path: "/products/formula-calculations",
          },
        ],
      },

      { id: "notifications", permissions: ["subscriptions.view"], label: "Notifications", icon: FiBell, path: "/notifications" },

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
          { id: "reports-seller-invoice", permissions: ["reports"], label: "Seller Invoice Reports", path: "/reports/seller-invoice-reports" },
          { id: "reports-seller-buyer-account", permissions: ["reports"], label: "Seller Buyer Account", path: "/reports/seller-buyer-accounts" },
          { id: "reports-contract-wise-status", permissions: ["reports"], label: "Contract wise Status", path: "/reports/contract-wise-status" },
          { id: "reports-contract-summary", permissions: ["reports"], label: "Contract Summary", path: "/reports/contract-summary" },
          { id: "reports-account-statement", permissions: ["reports"], label: "Account Statement", path: "/reports/account-statement" },
          { id: "reports-pending-payments", permissions: ["reports"], label: "Pending Payments", path: "/reports/pending-payments" },
          { id: "reports-pending-supplies", permissions: ["reports"], label: "Pending Supplies", path: "/reports/pending-supplies" },
          { id: "reports-monthly-reports", permissions: ["reports"], label: "Monthly Reports", path: "/reports/monthly-reports" },
          { id: "reports-do-truck-history", permissions: ["reports"], label: "DO Truck History", path: "/reports/do-truck-history" },
        ],
      },

    ],
  },
  {
    id: "settings",
    title: "Settings",
    items: [
      {
        id: "menu-management",
        label: "Menu Management",
        icon: FiSettings,
        path: "/menu-management/overview",
        permissions: ["roles-permissions"],
        children: [
          { id: "assign-menu-role", label: "Assign Menu Item to Role", path: "/menu-management/assign-role" },
          { id: "assign-menu-user", label: "Assign Menu Item to User", path: "/menu-management/assign-user" },
        ],
      },
    ],
  },
];
