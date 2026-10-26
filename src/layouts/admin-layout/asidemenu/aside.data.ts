import {
  ActivityIcon,
  BellIcon,
  BriefcaseIcon,
  ChartPieIcon,
  CopyIcon,
  FileTextIcon,
  FolderIcon,
  HouseIcon,
  LayersIcon,
  LayoutGridIcon,
  MessageSquareIcon,
  PackageIcon,
  PercentIcon,
  SendIcon,
  SettingsIcon,
  TagIcon,
  TruckIcon,
  UserPlusIcon,
  UsersIcon,
} from "../../../shared/components/icon";
import type { AsideNavSection } from "./aside.types";

/**
 * Interest of Payments is not in the backend Modules/Pages tables yet, so the sidebar adds it after
 * User Management whichever menu source is in use (see withLocalSections in aside.tsx).
 * TODO: add permission keys once the backend defines them; until then any signed-in user sees it.
 */
export const interestOfPaymentsSection: AsideNavSection = {
  id: "interest-of-payments-module",
   title: "Manage Interest of Payments",
  items: [
    {
      id: "interest-of-payments",
      label: "Interest of Payments",
      icon: PercentIcon,
      path: "/admin/interest-payments/overview",
      children: [
        { id: "interest-create", label: "Create Interest", path: "/admin/interest-payments/create" },
        { id: "interest-view", label: "View Interest", path: "/admin/interest-payments/view" },
        { id: "interest-detail", label: "View Interest Detail", path: "/admin/interest-payments/detail" },
      ],
    },
  ],
};

/** Company Invoices: also not in the backend menu yet; added right after Interest of Payments. TODO: permission keys. */
export const companyInvoicesSection: AsideNavSection = {
  id: "company-invoices-module",
  title: "Manage Company Invoices",
  items: [
    {
      id: "company-invoices",
      label: "Company Invoices",
      icon: CopyIcon,
      path: "/admin/company-invoices/overview",
      children: [
        { id: "company-invoices-generate", label: "Generate Invoice", path: "/admin/company-invoices/generate" },
        { id: "company-invoices-view", label: "View Invoices", path: "/admin/company-invoices/view" },
      ],
    },
  ],
};

/** Estimations: also not in the backend menu yet; added right after Company Invoices. TODO: permission keys. */
export const estimationsSection: AsideNavSection = {
  id: "estimations-module",
  title: "Manage Estimations",
  items: [
    {
      id: "estimations",
      label: "Estimations",
      icon: PercentIcon,
      path: "/admin/estimations/overview",
      children: [
        { id: "estimations-commission", label: "Commission Estimation", path: "/admin/estimations/commission" },
        { id: "estimations-view", label: "View Estimations", path: "/admin/estimations/view" },
        { id: "estimations-detail", label: "Estimations Detail", path: "/admin/estimations/detail" },
      ],
    },
  ],
};

/** Masters: also not in the backend menu yet; added right after Estimations. TODO: permission keys and pages. */
export const mastersSection: AsideNavSection = {
  id: "masters-module",
  title: "Masters",
  items: [
    {
      id: "masters",
      label: "Masters",
      icon: LayersIcon,
      path: "/admin/masters/overview",
      collapsedByDefault: true,
      children: [
        // { id: "masters-notify-subscriptions", label: "Notify Subscriptions", path: "/admin/masters/notify-subscriptions" },
        // { id: "masters-roles-permissions", label: "Roles & Permissions", path: "/admin/masters/roles-permissions" },
        // { id: "masters-templates", label: "Templates", path: "/admin/masters/templates" },
        { id: "masters-banners", label: "Banners", path: "/admin/masters/banners" },
        { id: "masters-subscriptions", label: "Subscriptions", path: "/admin/masters/subscriptions" },
        { id: "masters-product-enquiry", label: "Product Enquiry", path: "/admin/masters/product-enquiry" },
        { id: "masters-contact-enquiry", label: "Contact Enquiry", path: "/admin/masters/contact-enquiry" },
        { id: "masters-testimonials", label: "Testimonials", path: "/admin/masters/testimonials" },
        { id: "masters-blogs", label: "Blogs", path: "/admin/masters/blogs" },
        { id: "masters-users", label: "Users", path: "/admin/masters/users" },
        { id: "masters-registration-details", label: "Registration Details", path: "/admin/masters/registration-details" },
      ],
    },
  ],
};

/** Sections the backend menu doesn't know yet, in the order they appear after User Management. */
export const localNavSections: AsideNavSection[] = [interestOfPaymentsSection, companyInvoicesSection, estimationsSection, mastersSection];

// TODO: replace with real navigation items once routes/permissions are finalized.
export const asideNavSections: AsideNavSection[] = [
  {
    id: "your-company",
    title: "FeedxChange",
    items: [
      { id: "dashboard", permissions: ["dashboard"], label: "Dashboard", icon: HouseIcon, path: "/admin/dashboard" },
      { id: "contract", permissions: ["contracts.view"], label: "Contracts", icon: FileTextIcon, path: "/admin/contracts" },
      { id: "contract-status", permissions: ["contract-status"], label: "Contract Status", icon: ActivityIcon, path: "/admin/contract-status" },
      // {
      //   id: "task",
      //   label: "Task",
      //   icon: FiCheckSquare,
      //   children: [
      //     { id: "task-list", label: "Task List", path: "/admin/task/list" },
      //     { id: "task-board", label: "Task Board", path: "/admin/task/board" },
      //   ],
      // },
      // { id: "performance", label: "Performance", icon: TrendingUpIcon, path: "/admin/performance" },
      // { id: "projects", label: "Projects", icon: FolderIcon, path: "/admin/projects" },
    ],
  },
  {
    id: "truck-management",
    title: "Truck Management",
    items: [
      //{
      //      id: "pending-contracts",
      //  label: "Pending Contracts",
      // icon: FileTextIcon,
      //  path: "/admin/truck-management/pending-contracts",
      //  },
      {
        id: "contract-dispatch-management", permissions: ["pending-contracts"],
        label: "Pending Contracts",
        icon: SendIcon,
        path: "/admin/truck-management/open-pending-contracts",
        children: [
          {
            id: "contract-dispatch-add-instant-truck",
            label: "Add Instant Truck",
            path: "/admin/truck-management/open-pending-contracts/instant-truck",
          },
          {
            id: "contract-dispatch-schedule-dispatch",
            label: "Schedule Dispatch",
            path: "/admin/truck-management/open-pending-contracts/schedule-dispatch",
          },
          {
            id: "contract-dispatch-manage-schedule",
            label: "Manage Schedule",
            path: "/admin/truck-management/open-pending-contracts/manage-schedule",
            // "Add Truck" on an accepted request opens its own screen.
            relatedPaths: ["/admin/truck-management/open-pending-contracts/add-truck-to-schedule"],
          },
          {
            id: "contract-dispatch-update-truck-status",
            label: "Update Truck Status",
            path: "/admin/truck-management/open-pending-contracts/update-truck-status",
          },
          {
            id: "contract-dispatch-view-all-trucks",
            label: "View All Trucks By Contract",
            path: "/admin/truck-management/open-pending-contracts/view-trucks",
            // Re-assign and the contract chain are both opened from a truck card here.
            relatedPaths: [
              "/admin/truck-management/open-pending-contracts/reassign-truck",
              "/admin/truck-management/open-pending-contracts/truck-chain",
            ],
          },
        ],
      },
      {
        id: "pending-delivery-orders", permissions: ["pending-delivery-orders"],
        label: "Pending Delivery Orders",
        icon: PackageIcon,
        path: "/admin/truck-management/pending-delivery-orders",
      },
      {
        id: "add-dispatch-by-user", permissions: ["dispatch-by-user.manage"],
        label: "Add Dispatch By User",
        icon: UserPlusIcon,
        path: "/admin/truck-management/add-dispatch-by-user",
      },
      {
        id: "truck-transporters",
        label: "Transporters",
        icon: TruckIcon,
        path: "/admin/truck-management/transporters/overview",
        children: [
          {
            id: "truck-transporters-dashboard", permissions: ["transport-dashboard"],
            label: "Transport Dashboard",
            path: "/admin/truck-management/transporters/transport-dashboard",
          },
          {
            id: "truck-transporters-master", permissions: ["truck-master.view"],
            label: "Truck Master",
            path: "/admin/truck-management/transporters/truck-master",
          },
          {
            id: "driver-master", permissions: ["drivers-master.view"],
            label: "Drivers Master",
            path: "/admin/truck-management/transporters/driver-master",
          },
          {
            id: "driver-truck-mapping", permissions: ["driver-truck-mapping.view"],
            label: "Driver-Truck Mapping",
            path: "/admin/truck-management/transporters/driver-truck-mapping",
          },
          {
            id: "truck-trips", permissions: ["truck-trips.view"],
            label: "Truck Trips",
            path: "/admin/truck-management/transporters/truck-trips",
          },
        ],
      },
      {
        id: "seller-dispatches-new", permissions: ["dispatch-by-admin.view"],
        label: "Seller Dispatches New",
        icon: SendIcon,
        path: "/admin/truck-management/seller-dispatches-new",
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
        icon: FolderIcon,
        children: [
          { id: "payments-seller-invoice", permissions: ["seller-invoice.view"], label: "Seller Invoice", path: "/admin/payments/seller-invoice" },
          { id: "payments-seller-invoice-edit", permissions: ["seller-invoice.view"], label: "Edit Seller Invoices", path: "/admin/payments/seller-invoice-edit" },
          { id: "payments-payment-advice", permissions: ["payment-advice"], label: "Payment Advice", path: "/admin/payments/payment-advice" },
          { id: "payments-payment-allocation", permissions: ["payment-allocation"], label: "Payment Allocation", path: "/admin/payments/payment-allocation" },
          { id: "payments-refunds", permissions: ["refunds.view"], label: "Refunds", path: "/admin/payments/refunds" },
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
        icon: BriefcaseIcon,
        path: "/admin/business-owners",
        children: [
          { id: "business-owners-profile", permissions: ["profiles.business.manage"], label: "Business Profile", path: "/admin/business-owners/profile" },
          { id: "business-owners-contacts", permissions: ["profiles.business.manage"], label: "Contacts & Addresses", path: "/admin/business-owners/contacts" },
          { id: "business-owners-documents", permissions: ["profiles.business.manage"], label: "Documents", path: "/admin/business-owners/documents" },
          { id: "business-owners-bank-details", permissions: ["profiles.business.manage"], label: "Bank Details", path: "/admin/business-owners/bank-details" },
          { id: "business-owners-profile-settings", permissions: ["profiles.business.manage"], label: "Profile Settings", path: "/admin/business-owners/profile-settings" },
        ],
      },
      {
        id: "transporters", permissions: ["profiles.transporter.view"],
        label: "Transporters",
        icon: TruckIcon,
        path: "/admin/transporters",
        children: [
          { id: "transporters-profile", permissions: ["profiles.transporter.manage"], label: "Transporter Profile", path: "/admin/transporters/profile" },
          { id: "transporters-contacts", permissions: ["profiles.transporter.manage"], label: "Contacts & Addresses", path: "/admin/transporters/contacts" },
          { id: "transporters-documents", permissions: ["profiles.transporter.manage"], label: "Documents", path: "/admin/transporters/documents" },
          { id: "transporters-bank-details", permissions: ["profiles.transporter.manage"], label: "Bank Details", path: "/admin/transporters/bank-details" },
          { id: "transporters-profile-settings", permissions: ["profiles.transporter.manage"], label: "Profile Settings", path: "/admin/transporters/profile-settings" },
        ],
      },
      {
        id: "promoters-dashboard", permissions: ["profiles.promoter-dashboard"],
        label: "Promoters Dashboard",
        icon: ChartPieIcon,
        path: "/admin/promoter-dashboard",
      },
      {
        id: "promoters", permissions: ["profiles.promoter.view"],
        label: "Promoters",
        icon: UsersIcon,
        path: "/admin/promoters",
        children: [
          { id: "promoters-profile", permissions: ["profiles.promoter.manage"], label: "Promoter Profile", path: "/admin/promoters/profile" },
          { id: "promoters-documents", permissions: ["profiles.promoter.manage"], label: "Documents", path: "/admin/promoters/documents" },
          { id: "promoters-profile-settings", permissions: ["profiles.promoter.manage"], label: "Profile Settings", path: "/admin/promoters/profile-settings" },
        ],
      },
      { id: "promocodes", permissions: ["promocodes.view"], label: "Promocodes", icon: TagIcon, path: "/admin/promocodes" },
      {
        id: "referred-profiles", permissions: ["profiles.referred"],
        label: "Referred Profiles",
        icon: UserPlusIcon,
        path: "/admin/referred-profiles",
      },
    ],
  },
  interestOfPaymentsSection,
  companyInvoicesSection,
  estimationsSection,
  mastersSection,
  {
    id: "our-features",
    title: "Product Management",
    items: [
      { id: "categories", permissions: ["categories.view"], label: "Categories", icon: MessageSquareIcon, path: "/admin/categories" },
      {
        id: "apps",
        label: "Products",
        icon: LayoutGridIcon,
        path: "/admin/product-management/overview",
        children: [
          { id: "products-products", permissions: ["products.view"], label: "Products", path: "/admin/products" },
          { id: "products-price-tracking", permissions: ["price.tracking"], label: "Price Tracking", path: "/admin/products/price-tracking" },
          { id: "products-price-history", permissions: ["price.history"], label: "Price History", path: "/admin/products/price-history" },
          {
            id: "products-formula-calculations", permissions: ["price.formula"],
            label: "Formula Calculations",
            path: "/admin/products/formula-calculations",
          },
        ],
      },

      { id: "notifications", permissions: ["subscriptions.view", "notifications.history"], label: "Notifications", icon: BellIcon, path: "/admin/notifications" },

    ],
  },
  {
    id: "reports-statements",
    title: "Reports & Statements",
    items: [
      {
        id: "reports",
        label: "Reports",
        icon: FileTextIcon,
        path: "/admin/reports/overview",
        children: [
          { id: "reports-seller-invoice", permissions: ["reports"], label: "Seller Invoice Reports", path: "/admin/reports/seller-invoice-reports" },
          { id: "reports-seller-buyer-account", permissions: ["reports"], label: "Seller Buyer Account", path: "/admin/reports/seller-buyer-accounts" },
          { id: "reports-contract-wise-status", permissions: ["reports"], label: "Contract wise Status", path: "/admin/reports/contract-wise-status" },
          { id: "reports-contract-summary", permissions: ["reports"], label: "Contract Summary", path: "/admin/reports/contract-summary" },
          { id: "reports-account-statement", permissions: ["reports"], label: "Account Statement", path: "/admin/reports/account-statement" },
          { id: "reports-pending-payments", permissions: ["reports"], label: "Pending Payments", path: "/admin/reports/pending-payments" },
          { id: "reports-pending-supplies", permissions: ["reports"], label: "Pending Supplies", path: "/admin/reports/pending-supplies" },
          { id: "reports-monthly-reports", permissions: ["reports"], label: "Monthly Reports", path: "/admin/reports/monthly-reports" },
          { id: "reports-do-truck-history", permissions: ["reports"], label: "DO Truck History", path: "/admin/reports/do-truck-history" },
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
        icon: SettingsIcon,
        path: "/admin/menu-management/overview",
        permissions: ["roles-permissions"],
        children: [
          { id: "assign-menu-role", label: "Assign Menu Item to Role", path: "/admin/menu-management/assign-role" },
          { id: "assign-menu-user", label: "Assign Menu Item to User", path: "/admin/menu-management/assign-user" },
        ],
      },
    ],
  },
];
