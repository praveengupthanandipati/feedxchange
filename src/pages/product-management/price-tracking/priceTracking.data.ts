// TODO: replace with real data once the price-tracking API is wired up.

export type PriceStatus = "Not Saved" | "Unsaved" | "Saved";

export interface PriceTrackingRow {
  id: string;
  productName: string;
  category: string;
  sellerName: string;
  sellerCity: string;
  originalPrice: string;
  offerPrice: string;
  resalePrice: string;
  status: PriceStatus;
}

const PRODUCTS = [
  { name: "Premium Floating Feed", category: "Floating Fish Feed" },
  { name: "Classic Sinking Feed", category: "Sinking Fish Feed" },
  { name: "Cattle Growth Feed", category: "Cattle Feed" },
  { name: "Starter Max Feed", category: "Starter Feed" },
];

const SELLERS = [
  { name: "Sai Feeds Pvt Ltd", city: "Pune" },
  { name: "Ankur Animal Feeds", city: "Mumbai" },
  { name: "Blue Aqua Farms", city: "Bangalore" },
  { name: "Green Valley Dairy", city: "Hyderabad" },
  { name: "Shree Animal Nutrition", city: "Chennai" },
  { name: "Farm Fresh Feeds", city: "Delhi" },
  { name: "Oceanic Feeds", city: "Kolkata" },
  { name: "Riverdale Nutrition", city: "Ahmedabad" },
  { name: "AquaMax", city: "Surat" },
  { name: "FeedWorks", city: "Jaipur" },
];

export const productOptions = PRODUCTS.map((product) => ({
  value: product.name,
  label: product.name,
}));

function buildRows(): PriceTrackingRow[] {
  return SELLERS.map((seller, index) => {
    const product = PRODUCTS[index % PRODUCTS.length];
    const isFirst = index === 0;

    return {
      id: `pt-${1000 + index}`,
      productName: product.name,
      category: product.category,
      sellerName: seller.name,
      sellerCity: seller.city,
      originalPrice: isFirst ? "75" : "",
      offerPrice: isFirst ? "50" : "",
      resalePrice: isFirst ? "45" : "",
      status: isFirst ? "Unsaved" : "Not Saved",
    };
  });
}

export const priceTrackingRows: PriceTrackingRow[] = buildRows();

export type CommentSentiment = "up" | "down" | "info" | "warning";

export interface CommentOption {
  id: string;
  label: string;
  sentiment: CommentSentiment;
}

export const commentOptions: CommentOption[] = [
  { id: "demand-good", label: "Market demand is good", sentiment: "up" },
  { id: "demand-weak", label: "Market demand is weak", sentiment: "down" },
  { id: "lack-trades", label: "Lack of proper trades in market", sentiment: "info" },
  { id: "expect-up", label: "Expecting market to go upward", sentiment: "up" },
  { id: "expect-down", label: "Expecting market to go downward", sentiment: "down" },
  { id: "stable-market", label: "Stable Market", sentiment: "info" },
  { id: "rainfall-alert", label: "Rainfall alert", sentiment: "warning" },
  { id: "export-alert", label: "Export alert", sentiment: "warning" },
  { id: "import-alert", label: "Import alert", sentiment: "warning" },
];
