import { matchPath } from "react-router-dom";

/**
 * Which permission a screen needs (ANY of the keys). First matching rule wins, so specific
 * paths such as ".../new" come before their ":id" siblings. Paths with no rule stay open to any
 * signed-in user. "x.manage" also satisfies "x.view".
 */
interface RoutePermissionRule {
  path: string;
  any: string[];
}

const OPEN_PENDING = "/admin/truck-management/open-pending-contracts";
const TRANSPORTERS = "/admin/truck-management/transporters";

export const routePermissionRules: RoutePermissionRule[] = [
  { path: "/", any: ["dashboard"] },
  { path: "/admin/dashboard", any: ["dashboard"] },

  { path: "/admin/contracts/new", any: ["contracts.manage"] },
  { path: "/admin/contracts", any: ["contracts.view"] },
  { path: "/admin/contracts/:id", any: ["contracts.view"] },
  { path: "/admin/contracts/:id/notifications", any: ["notifications.history"] },
  { path: "/admin/notification-templates", any: ["notification-templates.view"] },
  { path: "/admin/notification-preferences", any: ["notification-preferences.view"] },
  { path: "/admin/my-notification-preferences", any: ["my-notification-preferences"] },
  { path: "/admin/contract-status", any: ["contract-status"] },

  // Truck management
  { path: "/admin/truck-management/pending-contracts", any: ["pending-contracts"] },
  { path: "/admin/truck-management/pending-delivery-orders", any: ["pending-delivery-orders"] },
  { path: "/admin/truck-management/pending-delivery-orders/*", any: ["pending-delivery-orders"] },
  { path: "/admin/truck-management/add-dispatch-by-user", any: ["dispatch-by-user.manage"] },
  { path: "/admin/truck-management/seller-dispatches-new", any: ["dispatch-by-admin.view"] },
  { path: "/admin/truck-management/seller-dispatches-new/*", any: ["dispatch-by-admin.view"] },
  { path: OPEN_PENDING, any: ["pending-contracts"] },
  { path: `${OPEN_PENDING}/*`, any: ["pending-contracts"] },
  { path: "/admin/truck-management/bulk-freight-approval", any: ["bulk-freight-approval"] },
  { path: "/admin/truck-management/assign-transports", any: ["pending-contracts", "freight-approval"] },
  { path: `${TRANSPORTERS}/freight-approval`, any: ["freight-approval"] },
  { path: `${TRANSPORTERS}/transport-dashboard`, any: ["transport-dashboard"] },
  { path: `${TRANSPORTERS}/dashboard`, any: ["transport-dashboard"] },
  { path: `${TRANSPORTERS}/driver-master/new`, any: ["drivers-master.manage"] },
  { path: `${TRANSPORTERS}/driver-master`, any: ["drivers-master.view"] },
  { path: `${TRANSPORTERS}/driver-master/:id`, any: ["drivers-master.view"] },
  { path: `${TRANSPORTERS}/truck-master/new`, any: ["truck-master.manage"] },
  { path: `${TRANSPORTERS}/truck-master`, any: ["truck-master.view"] },
  { path: `${TRANSPORTERS}/truck-master/:id`, any: ["truck-master.view"] },
  { path: `${TRANSPORTERS}/driver-truck-mapping`, any: ["driver-truck-mapping.view"] },
  { path: `${TRANSPORTERS}/truck-trips/new`, any: ["truck-trips.manage"] },
  { path: `${TRANSPORTERS}/truck-trips`, any: ["truck-trips.view"] },
  { path: `${TRANSPORTERS}/truck-trips/:id`, any: ["truck-trips.view"] },

  // Overview page of each Sub Module: shown when any page inside it is
  { path: "/admin/truck-management/transporters/overview", any: ["freight-approval", "transport-dashboard", "truck-master.view", "drivers-master.view", "driver-truck-mapping.view", "truck-trips.view"] },
  { path: "/admin/payments/overview", any: ["payment-advice", "refunds.view", "seller-invoice.view", "payment-allocation"] },
  { path: "/admin/product-management/overview", any: ["products.view", "products.manage", "categories.view", "price.tracking", "price.history", "price.formula"] },
  { path: "/admin/reports/overview", any: ["reports"] },

  // Payments
  { path: "/admin/payments/seller-invoice", any: ["seller-invoice.view"] },
  { path: "/admin/payments/seller-invoice-edit", any: ["seller-invoice.view"] },
  { path: "/admin/payments/payment-advice", any: ["payment-advice"] },
  { path: "/admin/payments/payment-allocation", any: ["payment-allocation"] },
  { path: "/admin/payments/refunds", any: ["refunds.view"] },

  // User management. The wizard steps create/edit a profile; the list and detail pages only view it.
  ...[
    ["business-owners", "profiles.business"],
    ["transporters", "profiles.transporter"],
    ["promoters", "profiles.promoter"],
  ].flatMap(([base, key]) => [
    ...["profile", "contacts", "documents", "bank-details", "profile-settings"].map((step) => ({
      path: `/${base}/${step}`,
      any: [`${key}.manage`],
    })),
    { path: `/${base}`, any: [`${key}.view`] },
    { path: `/${base}/:id`, any: [`${key}.view`] },
  ]),
  { path: "/admin/promoter-dashboard", any: ["profiles.promoter-dashboard"] },
  { path: "/admin/promocodes", any: ["promocodes.view"] },
  { path: "/admin/referred-profiles", any: ["profiles.referred"] },

  // Product management
  { path: "/admin/categories", any: ["categories.view"] },
  { path: "/admin/products/new", any: ["products.manage"] },
  { path: "/admin/products/price-tracking", any: ["price.tracking"] },
  { path: "/admin/products/price-history", any: ["price.history"] },
  { path: "/admin/products/formula-calculations", any: ["price.formula"] },
  { path: "/admin/notifications", any: ["subscriptions.view", "notifications.history"] },
  // Interest of Payments has no permission keys yet, so its screens are open to any signed-in user.

  { path: "/admin/products", any: ["products.view"] },
  { path: "/admin/products/:id", any: ["products.view"] },

  { path: "/admin/reports/*", any: ["reports"] },

  // Settings -> Menu Management
  { path: "/admin/menu-management/overview", any: ["roles-permissions"] },
  { path: "/admin/menu-management/assign-role", any: ["roles-permissions"] },
  { path: "/admin/menu-management/assign-user", any: ["roles-permissions"] },
];

/** The keys the screen at `pathname` requires, or `null` when it has no rule (open to any signed-in user). */
export const requiredPermissionsFor = (pathname: string): string[] | null => {
  const rule = routePermissionRules.find((r) => matchPath({ path: r.path, end: true }, pathname));
  return rule ? rule.any : null;
};
