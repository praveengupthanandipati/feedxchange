import type { Page, Route } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Fixed data for the screenshot tests. Every /api and /hubs request is answered here (on whatever host VITE_API_URL points at),
// so the tests never reach a real server and every run shows the same rows.

export const FIXED_NOW = new Date("2026-10-26T10:30:00+05:30");

// 18 contracts over the last year, with the real status names (the API sends the status's display name) and delivery
// windows around FIXED_NOW, so every "needs attention" group of the contracts overview has members.
// [number, seller, buyer, product, rate per MT, quantity MT, status, contract date, delivery to, arranged, dispatched]
const contractRows: [string, string, string, string, number, number, string, string, string, number, number][] = [
  ["2025-11", "Sri Balaji Feeds", "Godavari Poultry", "Maize DDGS", 24500, 300, "Closed", "2025-11-08", "2025-12-20", 300, 300],
  ["2025-12", "Annapurna Oils", "Krishna Hatcheries", "Soya DOC", 41200, 150, "Dispatched", "2025-12-14", "2026-01-31", 150, 150],
  ["2026-01", "Deccan Agro", "Vijaya Layers", "DORB", 15800, 500, "Closed", "2026-01-09", "2026-03-15", 500, 500],
  ["2026-02", "Nandi Proteins", "Godavari Poultry", "Soya DOC", 40600, 220, "Dispatched", "2026-02-18", "2026-04-10", 220, 220],
  ["2026-03", "Sri Balaji Feeds", "Coastal Aqua", "Crude Oil", 98500, 60, "Partially Dispatched", "2026-03-05", "2026-09-30", 45, 40],
  ["2026-4", "Deccan Agro", "Krishna Hatcheries", "Maize DDGS", 23900, 400, "Dispatched", "2026-04-22", "2026-06-30", 400, 400],
  ["2026-5", "Annapurna Oils", "Vijaya Layers", "DOC", 22300, 180, "Partially Dispatched", "2026-05-11", "2026-10-15", 120, 90],
  ["2026-6", "Nandi Proteins", "Coastal Aqua", "Soya DOC", 41800, 250, "Open", "2026-06-03", "2026-10-20", 0, 0],
  ["2026-7", "Sri Balaji Feeds", "Godavari Poultry", "Maize DDGS", 24800, 350, "Partially Dispatched", "2026-07-16", "2026-10-30", 200, 150],
  ["2026-8", "Deccan Agro", "Krishna Hatcheries", "DORB", 16200, 600, "Open", "2026-08-02", "2026-11-01", 0, 0],
  ["2026-9", "Annapurna Oils", "Godavari Poultry", "Crude Oil", 99200, 80, "Open", "2026-08-27", "2026-11-18", 30, 0],
  ["2026-10", "Nandi Proteins", "Vijaya Layers", "Soya DOC", 42100, 200, "Partially Dispatched", "2026-09-09", "2026-11-22", 120, 80],
  ["2026-11", "Sri Balaji Feeds", "Coastal Aqua", "DOC", 22900, 140, "Open", "2026-09-21", "2026-12-15", 60, 0],
  ["2026-12", "Deccan Agro", "Godavari Poultry", "Maize DDGS", 25100, 450, "Pending for Approval", "2026-10-06", "2026-12-31", 0, 0],
  ["2026-13", "Annapurna Oils", "Krishna Hatcheries", "Soya DOC", 42400, 120, "Pending for Approval", "2026-10-14", "2027-01-15", 0, 0],
  ["2026-14", "Nandi Proteins", "Godavari Poultry", "DORB", 16400, 300, "Open", "2026-10-19", "2027-01-31", 100, 0],
  ["2026-15", "Sri Balaji Feeds", "Vijaya Layers", "Maize DDGS", 25300, 280, "Pending for Approval", "2026-10-23", "2027-02-15", 0, 0],
  ["2026-16", "Deccan Agro", "Coastal Aqua", "Crude Oil", 99800, 50, "Open", "2026-10-24", "2027-02-28", 0, 0],
];

const contracts = contractRows.map(([number, sellerName, buyerName, productName, contractRate, quantity, calculatedStatus, date, deliveryTo, arranged, dispatchedQty], index) => ({
  contractId: 101 + index,
  contractNumber: `FX/${number}`,
  contractDate: `${date}T00:00:00`,
  sellerId: 10 + (index % 4),
  sellerName,
  buyerId: 20 + (index % 4),
  buyerName,
  productId: 30 + (index % 5),
  productName,
  createdBy: "Test Admin",
  createdAt: `${date}T09:00:00`,
  updatedBy: null,
  updatedAt: null,
  basicDetails: {
    contractRate,
    quantity,
    quantityMeasure: "MT",
    minQuantity: quantity * 0.95,
    maxQuantity: quantity * 1.05,
    deliverySchedule: "Weekly",
    deliveryType: index % 2 ? "Delivered" : "Ex-works",
    deliveryFromDate: `${date}T00:00:00`,
    deliveryToDate: `${deliveryTo}T00:00:00`,
    calculatedStatus,
    gstPercentage: 5,
    netRate: contractRate * 1.05,
    arrangedQuantity: arranged,
    dispatchedQuantity: dispatchedQty,
    pendingQuantity: quantity - dispatchedQty,
  },
}));

const contractStatuses = [
  ["Pending", "Pending for Approval"],
  ["Open", "Open"],
  ["PartiallyDispatched", "Partially Dispatched"],
  ["Dispatched", "Dispatched"],
  ["Closed", "Closed"],
].map(([statusName, displayName], index) => ({
  contractStatusId: index + 1,
  statusName,
  displayName,
  description: displayName,
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

const preferenceProfiles = [
  "Anitha Reddy Marketing", "Balaji Carriers", "Coastal Feeds", "Deccan Agro", "Eswar Industries", "Godavari Poultry",
  "Krishna Hatcheries", "Lakshmi Poultry Complex", "Mini Transporter", "Nandi Proteins", "Purnima Feeds", "Raghavendra Seeds",
  "SL International", "Sri Balaji Feeds", "Tara Poultry Farm", "Vijaya Layers", "Annapurna Oils", "Elite Agro Foods",
].map((name, index) => ({ profileId: 200 + index, name, contactCount: (index % 4) + 1, dispatchMode: index % 3 === 0 ? "Auto" : "Manual" }));

/** Responses by API path (case-insensitive, without the query string). Anything not listed gets an empty list. */
const responses: Record<string, unknown> = {
  "/api/contracts/getallcontractsbyfilters": contracts,
  "/api/contracts/getallcontracts": contracts,
  "/api/contracts/getcontractstatuses": contractStatuses,
  "/api/businessprofiles/getbusinessprofilesummary": businessOwners,
  "/api/notifications/unread-count": 0,
  "/api/notificationpreferences/profiles": preferenceProfiles,
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
