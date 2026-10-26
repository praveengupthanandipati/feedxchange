import type { Page, Route } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Fixed data for the screenshot tests. Every /api and /hubs request is answered here (on whatever host VITE_API_URL points at),
// so the tests never reach a real server and every run shows the same rows.

export const FIXED_NOW = new Date("2026-10-26T10:30:00+05:30");

const contracts = [
  ["FX/2026/101", "Sri Balaji Feeds", "Godavari Poultry", "Maize DDGS", 24500, 300, "Open"],
  ["FX/2026/102", "Annapurna Oils", "Krishna Hatcheries", "Soya DOC", 41200, 150, "Pending"],
  ["FX/2026/103", "Deccan Agro", "Vijaya Layers", "DORB", 15800, 500, "Completed"],
  ["FX/2026/104", "Sri Balaji Feeds", "Coastal Aqua", "Crude Oil", 98500, 60, "Open"],
  ["FX/2026/105", "Nandi Proteins", "Godavari Poultry", "DOC", 22300, 220, "Cancelled"],
].map(([contractNumber, sellerName, buyerName, productName, contractRate, quantity, calculatedStatus], index) => ({
  contractId: 101 + index,
  contractNumber,
  contractDate: `2026-10-${String(10 + index).padStart(2, "0")}T00:00:00`,
  sellerId: 10 + index,
  sellerName,
  buyerId: 20 + index,
  buyerName,
  productId: 30 + index,
  productName,
  createdBy: "Test Admin",
  createdAt: `2026-10-${String(10 + index).padStart(2, "0")}T09:00:00`,
  updatedBy: null,
  updatedAt: null,
  basicDetails: {
    contractRate,
    quantity,
    quantityMeasure: "MT",
    minQuantity: Number(quantity) * 0.95,
    maxQuantity: Number(quantity) * 1.05,
    deliverySchedule: "Weekly",
    deliveryType: "Ex-works",
    deliveryFromDate: "2026-11-01T00:00:00",
    deliveryToDate: "2026-12-31T00:00:00",
    calculatedStatus,
    gstPercentage: 5,
    netRate: Number(contractRate) * 1.05,
    arrangedQuantity: Number(quantity) / 2,
    dispatchedQuantity: Number(quantity) / 4,
    pendingQuantity: (Number(quantity) * 3) / 4,
  },
}));

const contractStatuses = ["Open", "Pending", "Completed", "Cancelled"].map((statusName, index) => ({
  contractStatusId: index + 1,
  statusName,
  displayName: statusName,
  description: statusName,
  isActive: true,
  sortOrder: index + 1,
}));

const businessOwners = [
  ["Sri Balaji Feeds Pvt Ltd", "Sri Balaji Feeds", "Seller", "Active", "Hyderabad", "Telangana"],
  ["Godavari Poultry Farms", "Godavari Poultry", "Buyer", "Active", "Rajahmundry", "Andhra Pradesh"],
  ["Annapurna Oils LLP", "Annapurna Oils", "Seller", "Inactive", "Guntur", "Andhra Pradesh"],
  ["Coastal Aqua Exports", "Coastal Aqua", "Buyer", "Active", "Nellore", "Andhra Pradesh"],
].map(([legalName, tradingName, businessUnitTypeName, status, location, stateName], index) => ({
  profileId: 10 + index,
  profileTypeName: "Business",
  legalName,
  tradingName,
  yearOfEstablishment: "2012",
  panNumber: `ABCDE${1230 + index}F`,
  gstNumber: `36ABCDE${1230 + index}F1Z5`,
  emailId: `contact${index}@example.com`,
  mobileNumber: `98480${10000 + index}`,
  alternativeContactNumber: "",
  websiteUrl: "",
  status,
  businessUnitTypeName,
  businessLineName: "Animal feed",
  location,
  stateName,
  businessTypeName: "Manufacturer",
  businessSubTypeName: "Feed mill",
  buyCharge: 50,
  sellCharge: 75,
}));

/** Responses by API path (case-insensitive, without the query string). Anything not listed gets an empty list. */
const responses: Record<string, unknown> = {
  "/api/contracts/getallcontractsbyfilters": contracts,
  "/api/contracts/getallcontracts": contracts,
  "/api/contracts/getcontractstatuses": contractStatuses,
  "/api/businessprofiles/getbusinessprofilesummary": businessOwners,
  "/api/notifications/unread-count": 0,
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

// Google Fonts, from a local copy after the first download: ~150 page loads in a run would otherwise be throttled now and then,
// and a page drawn in the fallback font fails its screenshot.
const FONT_CACHE = join("node_modules", ".cache", "visual-fonts");

const serveFont = async (route: Route) => {
  const key = createHash("sha1").update(route.request().url()).digest("hex");
  const body = join(FONT_CACHE, key);
  const meta = `${body}.json`;
  if (existsSync(body) && existsSync(meta)) {
    const { contentType } = JSON.parse(readFileSync(meta, "utf8")) as { contentType: string };
    return route.fulfill({ status: 200, contentType, body: readFileSync(body), headers: { "access-control-allow-origin": "*" } });
  }
  const response = await route.fetch();
  const buffer = await response.body();
  if (response.ok()) {
    mkdirSync(FONT_CACHE, { recursive: true });
    writeFileSync(body, buffer);
    writeFileSync(meta, JSON.stringify({ contentType: response.headers()["content-type"] ?? "application/octet-stream" }));
  }
  return route.fulfill({ response, body: buffer });
};

/** Answers every API and live-notification request with fixed data. Call before the first navigation. */
export const stubApi = async (page: Page) => {
  await page.route(/\/(api|hubs)\//i, (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.toLowerCase();
    // live notifications: refuse the connection; the app treats that as offline and carries on
    if (path.startsWith("/hubs/")) return route.fulfill({ status: 503, body: "" });
    if (route.request().method() !== "GET") return json(route, {});
    return json(route, path in responses ? responses[path] : []);
  });
  // other outside calls (pincode lookup and the like) are not needed for a screenshot
  await page.route("https://api.postalpincode.in/**", (route) => json(route, []));
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, serveFont);
};

/** Signs in without the API: writes the keys src/core/auth/session.ts and Login.tsx read. No permission keys = nothing hidden. */
export const seedSession = async (page: Page) => {
  await page.addInitScript(() => {
    const values: Record<string, string> = {
      authUser: JSON.stringify({ email: "test.admin@example.com", token: "visual-test-token" }),
      refreshToken: "visual-test-refresh",
      accessTokenExpiresAt: "2099-01-01T00:00:00Z",
      userId: "1",
      firstName: "Test",
      lastName: "Admin",
      email: "test.admin@example.com",
      roleName: "Administrator",
      businessUnitType: "",
    };
    try {
      for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
    } catch {
      /* storage blocked: the test will show the login page and fail visibly */
    }
  });
};
