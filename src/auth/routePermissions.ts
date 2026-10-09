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

const OPEN_PENDING = "/truck-management/open-pending-contracts";
const TRANSPORTERS = "/truck-management/transporters";

export const routePermissionRules: RoutePermissionRule[] = [
  { path: "/", any: ["dashboard"] },
  { path: "/dashboard", any: ["dashboard"] },

  { path: "/contracts/new", any: ["contracts.manage"] },
  { path: "/contracts", any: ["contracts.view"] },
  { path: "/contracts/:id", any: ["contracts.view"] },
  { path: "/contract-status", any: ["contract-status"] },

  // Truck management
  { path: "/truck-management/pending-contracts", any: ["pending-contracts"] },
  { path: "/truck-management/pending-delivery-orders", any: ["pending-delivery-orders"] },
  { path: "/truck-management/pending-delivery-orders/*", any: ["pending-delivery-orders"] },
  { path: OPEN_PENDING, any: ["pending-contracts"] },
  { path: `${OPEN_PENDING}/*`, any: ["pending-contracts"] },
  { path: "/truck-management/bulk-freight-approval", any: ["bulk-freight-approval"] },
  { path: "/truck-management/assign-transports", any: ["pending-contracts", "freight-approval"] },
  { path: `${TRANSPORTERS}/freight-approval`, any: ["freight-approval"] },
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
  { path: "/truck-management/transporters/overview", any: ["freight-approval", "transport-dashboard", "truck-master.view", "drivers-master.view", "driver-truck-mapping.view", "truck-trips.view"] },
  { path: "/payments/overview", any: ["payment-advice", "refunds.view", "seller-invoice.view", "payment-allocation"] },
  { path: "/product-management/overview", any: ["products.view", "products.manage", "categories.view", "price.tracking", "price.history", "price.formula"] },
  { path: "/reports/overview", any: ["reports"] },

  // Payments
  { path: "/payments/seller-invoice", any: ["seller-invoice.view"] },
  { path: "/payments/seller-invoice-edit", any: ["seller-invoice.view"] },
  { path: "/payments/payment-advice", any: ["payment-advice"] },
  { path: "/payments/payment-allocation", any: ["payment-allocation"] },
  { path: "/payments/refunds", any: ["refunds.view"] },

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
  { path: "/promoter-dashboard", any: ["profiles.promoter-dashboard"] },
  { path: "/promocodes", any: ["promocodes.view"] },
  { path: "/referred-profiles", any: ["profiles.referred"] },

  // Product management
  { path: "/categories", any: ["categories.view"] },
  { path: "/products/new", any: ["products.manage"] },
  { path: "/products/price-tracking", any: ["price.tracking"] },
  { path: "/products/price-history", any: ["price.history"] },
  { path: "/products/formula-calculations", any: ["price.formula"] },
  { path: "/products", any: ["products.view"] },
  { path: "/products/:id", any: ["products.view"] },

  { path: "/reports/*", any: ["reports"] },

  // Settings -> Menu Management
  { path: "/menu-management/overview", any: ["roles-permissions"] },
  { path: "/menu-management/assign-role", any: ["roles-permissions"] },
  { path: "/menu-management/assign-user", any: ["roles-permissions"] },
];

/** The keys the screen at `pathname` requires, or `null` when it has no rule (open to any signed-in user). */
export const requiredPermissionsFor = (pathname: string): string[] | null => {
  const rule = routePermissionRules.find((r) => matchPath({ path: r.path, end: true }, pathname));
  return rule ? rule.any : null;
};
