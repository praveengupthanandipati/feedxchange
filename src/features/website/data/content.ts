// Test content for the website. Replace with real copy (or a CMS) before launch.
import {
  type IconComponent,
  ChartNoAxesColumnIcon,
  CreditCardIcon,
  EyeIcon,
  FacebookIcon,
  FileTextIcon,
  InfoIcon,
  InstagramIcon,
  LayoutGridIcon,
  LifeBuoyIcon,
  LinkIcon,
  LinkedinIcon,
  PackageIcon,
  ShieldIcon,
  TrendingUpIcon,
  TruckIcon,
  TwitterIcon,
  UserCheckIcon,
  UsersIcon,
} from "../../../shared/components/icon";
import { productPath, sitePaths } from "../routes/paths";

export interface NavLinkItem {
  label: string;
  to: string;
}

/** A top-level menu entry; `children` turns it into a dropdown (desktop) / accordion (mobile). */
export interface NavItem extends NavLinkItem {
  children?: NavLinkItem[];
}

export interface Product {
  slug: string;
  name: string;
  /** One line for the menu and cards. */
  summary: string;
  description: string;
  specs: { label: string; value: string }[];
}

export const products: Product[] = [
  {
    slug: "distilled-products",
    name: "Distilled Products",
    summary: "High-protein by-products from grain distilleries.",
    description: "Energy- and protein-rich distillery by-products, sourced from audited plants and supplied with moisture and protein test reports for every lot.",
    specs: [
      { label: "Protein", value: "26 – 32%" },
      { label: "Moisture", value: "≤ 10%" },
      { label: "Packing", value: "50 kg bags / loose" },
    ],
  },
  {
    slug: "crude-oil",
    name: "Crude Oil",
    summary: "Crude edible oils for refining and feed blending.",
    description: "Crude rice bran, soybean and cottonseed oils for refiners and feed millers, traded with transparent FFA and moisture specifications.",
    specs: [
      { label: "FFA", value: "As per contract" },
      { label: "Moisture & impurities", value: "≤ 0.5%" },
      { label: "Supply", value: "Tankers" },
    ],
  },
  {
    slug: "doc",
    name: "DOC",
    summary: "De-oiled cakes, the protein backbone of feed.",
    description: "De-oiled cakes from solvent extraction plants across India: a consistent, economical protein source for poultry, cattle and aqua feed.",
    specs: [
      { label: "Protein", value: "28 – 48%" },
      { label: "Oil", value: "≤ 1.5%" },
      { label: "Packing", value: "50 kg bags" },
    ],
  },
  {
    slug: "maize-ddgs",
    name: "Maize DDGS",
    summary: "Distillers dried grains with solubles from maize.",
    description: "Golden-coloured maize DDGS with high digestibility and energy, a cost-effective partial replacement for maize and soybean meal.",
    specs: [
      { label: "Protein", value: "≥ 28%" },
      { label: "Fat", value: "≥ 8%" },
      { label: "Aflatoxin", value: "≤ 20 ppb" },
    ],
  },
  {
    slug: "dorb",
    name: "DORB",
    summary: "De-oiled rice bran for cattle and poultry rations.",
    description: "De-oiled rice bran with steady fibre and protein levels, widely used in cattle feed and as an economical filler in poultry rations.",
    specs: [
      { label: "Protein", value: "14 – 16%" },
      { label: "Fibre", value: "≤ 14%" },
      { label: "Sand & silica", value: "≤ 3%" },
    ],
  },
  {
    slug: "soya-doc",
    name: "Soya DOC",
    summary: "Premium soybean meal with high protein.",
    description: "Hi-pro and standard soybean meal, the most widely used protein ingredient in poultry and aqua feed, with full traceability to the plant.",
    specs: [
      { label: "Protein", value: "46 – 48%" },
      { label: "Urease activity", value: "0.05 – 0.2" },
      { label: "Packing", value: "50 kg bags" },
    ],
  },
];

// ---------- Test catalogue (Products page). Images are a shared placeholder for now. ----------
export interface Nutrient {
  name: string;
  min: string;
  max: string;
}

export interface CatalogueCategory {
  id: string;
  name: string;
  /** Test copy and specs used for every product in this category that has no full entry above. */
  summary: string;
  specs: { label: string; value: string }[];
  /** Test nutrition ranges shown on the product page. */
  nutrition: Nutrient[];
  /** Typical price per MT (₹), used to generate test price history. */
  basePrice: number;
  /** "Nutritional Value and Uses": a bold value with its meaning under it. */
  uses: { value: string; label: string }[];
}

export const catalogueCategories: CatalogueCategory[] = [
  {
    id: "doc",
    name: "DOC",
    summary: "De-oiled cake, a consistent and economical protein source for feed.",
    specs: [
      { label: "Protein", value: "28 – 48%" },
      { label: "Oil", value: "≤ 1.5%" },
      { label: "Packing", value: "50 kg bags" },
    ],
    nutrition: [
      { name: "Protein", min: "44%", max: "48%" },
      { name: "Fat", min: "0.5%", max: "1.5%" },
      { name: "Moisture", min: "10%", max: "12%" },
      { name: "Sand/silica", min: "1%", max: "2%" },
      { name: "Crude Fiber", min: "5%", max: "7%" },
    ],
    basePrice: 38000,
    uses: [
      { value: "10ppb", label: "Aflatoxins" },
      { value: "44 – 48%", label: "Crude protein, the main protein source in poultry and aqua feed" },
      { value: "Poultry, Fish, Prawn & Cattle", label: "Feed plants that use it" },
    ],
  },
  {
    id: "grains",
    name: "Grains",
    summary: "Feed-quality grains, cleaned and graded for poultry and cattle rations.",
    specs: [
      { label: "Moisture", value: "≤ 14%" },
      { label: "Foreign matter", value: "≤ 2%" },
      { label: "Packing", value: "50 kg bags / loose" },
    ],
    nutrition: [
      { name: "Protein", min: "8%", max: "10%" },
      { name: "Fat", min: "3%", max: "4%" },
      { name: "Moisture", min: "12%", max: "14%" },
      { name: "Starch", min: "60%", max: "70%" },
      { name: "Foreign Matter", min: "1%", max: "2%" },
    ],
    basePrice: 24000,
    uses: [
      { value: "20ppb", label: "Aflatoxins" },
      { value: "60 – 70%", label: "Starch, the main energy source in poultry and cattle rations" },
      { value: "Poultry & Cattle", label: "Feed plants that use it" },
    ],
  },
  {
    id: "distilled",
    name: "Distilled Products",
    summary: "High-protein distillery by-products with test reports for every lot.",
    specs: [
      { label: "Protein", value: "26 – 32%" },
      { label: "Moisture", value: "≤ 10%" },
      { label: "Packing", value: "50 kg bags / loose" },
    ],
    nutrition: [
      { name: "Protein", min: "44%", max: "48%" },
      { name: "Fat", min: "3%", max: "4%" },
      { name: "Moisture", min: "10%", max: "12%" },
      { name: "Sand/silica", min: "2%", max: "3%" },
      { name: "Crude Fiber", min: "10%", max: "12%" },
    ],
    basePrice: 35000,
    uses: [
      { value: "10ppb", label: "Aflatoxins" },
      { value: "44 – 48%", label: "Crude protein, a cost-effective partial replacement for soybean meal" },
      { value: "Poultry, Fish & Cattle", label: "Feed plants that use it" },
    ],
  },
  {
    id: "crude-oil",
    name: "Crude Oil",
    summary: "Crude oils for refining and feed blending, with clear FFA specifications.",
    specs: [
      { label: "FFA", value: "As per contract" },
      { label: "Moisture & impurities", value: "≤ 0.5%" },
      { label: "Supply", value: "Tankers" },
    ],
    nutrition: [
      { name: "FFA", min: "5%", max: "10%" },
      { name: "Moisture", min: "0.2%", max: "0.5%" },
      { name: "Impurities", min: "0.1%", max: "0.3%" },
      { name: "Phosphatides", min: "1%", max: "2%" },
    ],
    basePrice: 95000,
    uses: [
      { value: "5 – 10%", label: "Free fatty acids (FFA)" },
      { value: "Energy", label: "Added to feed to raise its energy density" },
      { value: "Refineries & Feed Plants", label: "Who buys it" },
    ],
  },
];

export interface CatalogueItem {
  /** Same slug as an entry in `products` when a full product page exists. */
  slug: string;
  name: string;
  categoryId: CatalogueCategory["id"];
}

export const catalogue: CatalogueItem[] = [
  { slug: "soya-doc", name: "Soya DOC", categoryId: "doc" },
  { slug: "groundnut-doc", name: "Groundnut DOC", categoryId: "doc" },
  { slug: "sunflower-doc", name: "Sunflower DOC", categoryId: "doc" },
  { slug: "mustard-doc", name: "Mustard DOC", categoryId: "doc" },
  { slug: "cottonseed-doc", name: "Cottonseed DOC", categoryId: "doc" },
  { slug: "dorb", name: "DORB", categoryId: "doc" },
  { slug: "maize", name: "Maize", categoryId: "grains" },
  { slug: "broken-rice", name: "Broken Rice", categoryId: "grains" },
  { slug: "bajra", name: "Bajra", categoryId: "grains" },
  { slug: "jowar", name: "Jowar", categoryId: "grains" },
  { slug: "maize-ddgs", name: "Maize DDGS", categoryId: "distilled" },
  { slug: "rice-ddgs", name: "Rice DDGS", categoryId: "distilled" },
  { slug: "crude-rice-bran-oil", name: "Crude Rice Bran Oil", categoryId: "crude-oil" },
  { slug: "crude-soybean-oil", name: "Crude Soybean Oil", categoryId: "crude-oil" },
  { slug: "crude-palm-oil", name: "Crude Palm Oil", categoryId: "crude-oil" },
];

export const categoryOf = (item: CatalogueItem) => catalogueCategories.find((category) => category.id === item.categoryId);

export const productsIn = (categoryId: CatalogueCategory["id"]) => catalogue.filter((item) => item.categoryId === categoryId);

/** Category for any product slug: catalogue items, plus the original category pages that aren't in the catalogue. */
const extraProductCategories: Record<string, CatalogueCategory["id"]> = { "distilled-products": "distilled", "crude-oil": "crude-oil", doc: "doc" };

export const categoryForSlug = (slug: string) => {
  const item = catalogue.find((entry) => entry.slug === slug);
  const id = item?.categoryId ?? extraProductCategories[slug];
  return catalogueCategories.find((category) => category.id === id);
};

export const businessTypes = [
  "Poultry Farm",
  "Fish Farm",
  "Prawn Farm",
  "Cattle Feed Plant",
  "Feed Manufacturer",
  "Trader",
  "Transporter",
  "Referral Aggregator",
  "Other",
];

/** The product shown at /products/:slug: its full entry if there is one, otherwise built from its catalogue category. */
export const findProduct = (slug: string | undefined): Product | undefined => {
  const full = products.find((product) => product.slug === slug);
  if (full) return full;
  const item = catalogue.find((entry) => entry.slug === slug);
  const category = item && categoryOf(item);
  if (!item || !category) return undefined;
  return {
    slug: item.slug,
    name: item.name,
    summary: category.summary,
    description: `${item.name} sourced from verified manufacturers and traded through FeedXchange at transparent, real-time prices. Final specifications and pricing are confirmed when the contract is executed.`,
    specs: category.specs,
  };
};

export const navItems: NavItem[] = [
  { label: "Home", to: sitePaths.home },
  { label: "About", to: sitePaths.about },
  { label: "Products", to: sitePaths.products, children: products.map((product) => ({ label: product.name, to: productPath(product.slug) })) },
  { label: "FAQ's", to: sitePaths.faqs },
  { label: "Blogs", to: sitePaths.blogs },
  { label: "Contact", to: sitePaths.contact },
];

export const company = {
  name: "FeedXchange",
  tagline: "The trusted marketplace for animal feed ingredients.",
  email: "contact@feedxchange.in",
  phone: "+91 98765 43210",
  /** Digits only, with country code, for wa.me links. */
  whatsapp: "919876543210",
  address: "174, 1st floor, Mahatma Gandhi Whole Commercial Complex, Mahendra Nagar, Gollapudi, Vijayawada, Andhra Pradesh - 521225",
  hours: "Mon - Sat from 9am - 6pm",
};

export const whatsappLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hi FeedXchange, I'd like to know more.")}`;

export const hero = {
  eyebrow: "Agri-commerce, simplified",
  title: "Trade feed ingredients with confidence",
  text: "Live prices, verified sellers and tracked deliveries, on one platform.",
};

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "1,200+", label: "Verified businesses" },
  { value: "85K MT", label: "Traded every year" },
  { value: "350+", label: "Partner transporters" },
  { value: "99.2%", label: "On-time settlements" },
];

export const partners = [
  "Raghavendra Seeds",
  "Eswar Industries",
  "Lakshmi Poultry",
  "Elite Agro Foods",
  "SL International",
  "Purnima Feeds",
  "Sri Venkateswara Mills",
  "Coastal Aqua Feeds",
  "Godavari Cattle Feeds",
  "Sai Poultry Farms",
  "Krishna Agro Exports",
  "Andhra Oil Seeds",
  "Jawahar Roadlines",
  "Deccan Protein Foods",
];

export interface Service {
  icon: IconComponent;
  title: string;
  text: string;
}

export const services: Service[] = [
  { icon: ChartNoAxesColumnIcon, title: "Live Market Pricing", text: "Daily prices for maize, DDGS, soybean meal and more, with history and trends to time every purchase." },
  { icon: FileTextIcon, title: "Digital Contracts", text: "Create, sign and track contracts online, with every amendment and approval kept in one audit trail." },
  { icon: TruckIcon, title: "Logistics & Dispatch", text: "Schedule trucks, assign transporters and follow each load from the mill gate to your warehouse." },
  { icon: CreditCardIcon, title: "Secure Payments", text: "Invoices, payment advice and allocations reconciled automatically, so both sides always agree." },
  { icon: ShieldIcon, title: "Verified Partners", text: "Every buyer, seller and transporter is KYC-checked before they can trade on the platform." },
  { icon: PackageIcon, title: "Quality Assurance", text: "Specification checks and lab reports attached to each consignment, before it leaves the seller." },
];

export const reasons = [
  "One platform for buying, selling, logistics and payments",
  "Transparent pricing with no hidden commissions",
  "Dedicated relationship manager for every business",
  "Real-time notifications on every contract and truck",
];

export interface Step {
  title: string;
  text: string;
}

export const steps: Step[] = [
  { title: "Register your business", text: "Sign up in minutes and complete a quick KYC check." },
  { title: "Discover & negotiate", text: "Browse live listings and agree on price, quantity and terms." },
  { title: "Sign the contract", text: "Approve a digital contract that both sides can track." },
  { title: "Dispatch & get paid", text: "Follow each truck and settle payments on delivery." },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "FeedXchange streamlined our entire supply chain. We now source feed ingredients in days instead of weeks.",
    name: "Praveen N.",
    role: "Procurement Head, Elite Agro Foods",
  },
  {
    quote: "Every transaction is transparent and payments are always on time. It is the most trustworthy platform we have used.",
    name: "Kishore R.",
    role: "Director, Lakshmi Poultry Complex",
  },
  {
    quote: "Truck tracking alone saves my team hours every day. Our buyers always know exactly where their load is.",
    name: "Amar B.",
    role: "Owner, Mini Transporter",
  },
  {
    quote: "We buy Maize DDGS every month. Live prices helped us time our purchases and cut feed costs by almost 8%.",
    name: "Suresh K.",
    role: "Purchase Manager, Purnima Feeds",
  },
  {
    quote: "Digital contracts removed the back-and-forth on terms. Disputes have practically disappeared.",
    name: "Lakshmi P.",
    role: "Managing Partner, Sri Venkateswara Mills",
  },
  {
    quote: "As a seller, getting paid on time used to be a struggle. Now invoices and payments match automatically.",
    name: "Ravi T.",
    role: "Director, Raghavendra Seeds",
  },
  {
    quote: "The quality reports attached to every lot give our nutritionists real confidence in each consignment.",
    name: "Dr. Anitha M.",
    role: "Nutritionist, Coastal Aqua Feeds",
  },
  {
    quote: "Finding reliable Soya DOC suppliers was our biggest headache. FeedXchange solved it in a week.",
    name: "Mahesh V.",
    role: "Owner, Sai Poultry Farms",
  },
  {
    quote: "Our relationship manager is always a call away. The support is as good as the platform itself.",
    name: "Kiran M.",
    role: "Procurement Lead, Godavari Cattle Feeds",
  },
  {
    quote: "We onboarded twenty trucks in one afternoon. Assignments and trip updates now take minutes, not hours.",
    name: "Jaganmohan R.",
    role: "Fleet Owner, Jawahar Roadlines",
  },
];

export interface DealingPartner {
  /** Which line-art icon to draw. */
  kind: "poultry" | "fish" | "prawn" | "cattle";
  title: string;
  text: string;
}

export const dealingPartners: DealingPartner[] = [
  {
    kind: "poultry",
    title: "Poultry Farms",
    text: "FeedXchange connects poultry farms to verified feed suppliers for bulk deals on quality ingredients (soy, maize, additives) at competitive rates.",
  },
  {
    kind: "fish",
    title: "Fish Farms",
    text: "FeedXchange links fish farms with trusted suppliers for high-quality feed and nutrition, ensuring healthy stock and better yields.",
  },
  {
    kind: "prawn",
    title: "Prawn Farms",
    text: "Prawn farms benefit from FeedXchange's network of reliable suppliers, getting the best prices and quality for all farming needs.",
  },
  {
    kind: "cattle",
    title: "Cattle Farms",
    text: "Cattle farms can source bulk feed and supplements through FeedXchange, streamlining procurement and improving herd health.",
  },
];

// ---------- About page ----------
export const about = {
  parent: "Sri Sai Raghavendra Trade Services",
  founded: 1996,
  city: "Vijayawada, Andhra Pradesh",
  expertise: ["Deoiled Cakes", "Feed-Quality Grains", "DDGS", "Other essential raw materials"],
};

export interface Clientele {
  kind: DealingPartner["kind"];
  title: string;
}

export const clientele: Clientele[] = [
  { kind: "poultry", title: "Poultry Farmers & Poultry Feed Plants" },
  { kind: "fish", title: "Fish Farmers & Fish Feed Plants" },
  { kind: "prawn", title: "Prawn Feed Plants" },
  { kind: "cattle", title: "Cattle Feed Plants" },
];

/** The three ideas in "Our Legacy: Trust, Transparency, and Direct Access". */
export const pillars: Service[] = [
  { icon: ShieldIcon, title: "Trust", text: "Unwavering commitment to the success of both our buyers and suppliers." },
  { icon: EyeIcon, title: "Transparency", text: "Known across the industry for our transparent nature and fair mediation." },
  { icon: LinkIcon, title: "Direct Access", text: "High-quality raw materials directly from the manufacturers at the best possible prices." },
];

export interface TeamMember {
  name: string;
  /** Only shown when the copy gives one. */
  role?: string;
  /** Short line shown as a tag, e.g. when they joined. */
  tag: string;
  bio: string[];
}

export const team: TeamMember[] = [
  {
    name: "Mithinti VGS Prakash",
    role: "Founder",
    tag: "30+ years in the trade",
    bio: [
      "As the guiding force of Sri Sai Raghavendra Trade Services, Mr. Prakash brings more than three decades of invaluable expertise to the table. He has built a renowned reputation across the industry as a fierce advocate for fair trade and superior quality.",
      "Having witnessed countless crop cycles firsthand, his deep understanding of market dynamics allows him to accurately predict price trends, serving as a trusted advisor who helps our customers take confident action.",
    ],
  },
  {
    name: "Mithinti Mani Kiran",
    tag: "Since 2013",
    bio: [
      "Since entering the business in 2013, Mani Kiran has perfectly bridged our time-honored practices with modern innovation. Armed with a strong corporate background, he has been instrumental in integrating digital solutions into our classic business model.",
      "His strategic vision has successfully driven growth—introducing new product lines and welcoming new customers—while fiercely protecting the foundational values of transparency and trust our business was built upon.",
    ],
  },
  {
    name: "Peram Teja",
    tag: "Since 2018",
    bio: [
      "Bringing four years of valuable corporate experience, Peram Teja joined the organization in 2018. He is the operational anchor of the business, instrumental in managing the seamless execution of our day-to-day transactions.",
      "His expertise ensures that as the business scales and modernizes, our core trading activities, client communications, and daily processes run smoothly and efficiently.",
    ],
  },
];

export const milestones: Step[] = [
  { title: "1996", text: "Sri Sai Raghavendra Trade Services begins as canvassing agents for feed ingredients in Vijayawada." },
  { title: "2013", text: "Mani Kiran joins and starts bringing digital tools into the business." },
  { title: "2018", text: "Peram Teja joins to anchor day-to-day trading operations." },
  { title: "Today", text: "FeedXchange.in takes three decades of trade online." },
];

export const platformFeatures: Service[] = [
  { icon: ChartNoAxesColumnIcon, title: "Digital Transparency", text: "Real-time digital access to the pricing of animal feed ingredients." },
  { icon: TrendingUpIcon, title: "Smart Tracking", text: "Advanced price tracking mechanisms to help you make informed buying decisions." },
  { icon: LayoutGridIcon, title: "Personalized Dashboards", text: "Secure login access for customers to effortlessly view, manage, and track all contracts executed through us." },
  {
    icon: TruckIcon,
    title: "Integrated Logistics",
    text: "Real-time visibility into the vehicles loaded against your contracts, with an ecosystem that seamlessly connects buyers, sellers, and enrolled transporters.",
  },
  {
    icon: UserCheckIcon,
    title: "Verified Trading",
    text: "A secure environment where KYC and bank details are transparently shared between transacting parties to ensure trust and smooth financial settlements.",
  },
];

export const footerColumns: { title: string; links: NavLinkItem[] }[] = [
  {
    title: "Company",
    links: [
      { label: "Home", to: sitePaths.home },
      { label: "About Us", to: sitePaths.about },
      { label: "FAQ's", to: sitePaths.faqs },
      { label: "Blogs", to: sitePaths.blogs },
      { label: "Contact", to: sitePaths.contact },
    ],
  },
  {
    title: "Products",
    links: products.slice(0, 4).map((product) => ({ label: product.name, to: productPath(product.slug) })),
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export interface FaqCategory {
  /** Anchor id, used by the category menu. */
  id: string;
  title: string;
  icon: IconComponent;
  items: Faq[];
}

export const faqCategories: FaqCategory[] = [
  {
    id: "general",
    title: "General Information",
    icon: InfoIcon,
    items: [
      {
        question: "What is FeedXchange.in?",
        answer:
          "FeedXchange.in is India’s first dedicated B2B digital portal designed exclusively for the animal feed ingredient trade. Backed by the legacy of Sri Sai Raghavendra Trade Services, the platform connects buyers and sellers of raw materials (such as Deoiled Cakes, Grains, DDGS, Crude Oil etc) while providing transparent pricing, contract tracking, and integrated logistics.",
      },
      {
        question: "Who can register on the platform?",
        answer:
          "The portal is built to support the entire animal feed raw material procurement ecosystem. This includes Poultry Farms, Fish Farms, Prawn Farms, Cattle Feed Plants, Feed Manufacturers, Enrolled Transporters, and Referral Aggregators.",
      },
      {
        question: "Is there a fee to use the portal?",
        answer:
          "Currently, creating an account and accessing the digital portal is completely free. Should we introduce premium subscription features in the future, all users will be notified well in advance.",
      },
    ],
  },
  {
    id: "contracts",
    title: "Contracts, Pricing & Platform Usage",
    icon: FileTextIcon,
    items: [
      {
        question: "Are the prices shown on the portal final?",
        answer:
          "Because commodity markets are highly volatile, the prices displayed on the portal are indicative and meant for real-time market tracking. Final contract prices are always subject to confirmation at the exact time the deal is locked and executed.",
      },
      {
        question: "Are the prices shown on the portal inclusive of GST and freight?",
        answer:
          "The indicative prices displayed on the portal are generally basic prices (Ex-factory/Ex-warehouse) unless explicitly stated otherwise. Applicable GST and negotiated freight charges will be clearly outlined when the final contract is executed.",
      },
      {
        question: "Can I view my old, completed contracts?",
        answer:
          "Yes! One of the major benefits of FeedXchange.in is your personalized dashboard. You can access a full history of all your past contracts, associated vehicles, and shared KYC documents for your own auditing and record-keeping purposes.",
      },
      {
        question: "What happens if there is a dispute over the quality of the materials?",
        answer:
          "We are committed to fair trade, so it’s a rare case to even occur. If there is a discrepancy in quality or delivery, we step in to actively mediate the dispute between the buyer and the supplier. If poor quality is proven, it will result in a debit to the supplier. Please note that all final financial settlements regarding quality claims are handled directly between the buyer and the supplier.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Fees",
    icon: CreditCardIcon,
    items: [
      {
        question: "Do I make payments for the goods through the FeedXchange portal?",
        answer:
          "No. To maintain absolute transparency, all payments for the physical goods are transferred directly from the Buyer's bank account to the Manufacturer/Supplier's bank account. FeedXchange does not act as a payment gateway for raw materials.",
      },
      {
        question: "How do canvassing fees work?",
        answer:
          "For our services in facilitating the trade, negotiating best prices, and mediating disputes, a standard canvassing/service fee may apply depending on your specific trading agreement with us. If applicable, this fee is billed separately and paid directly to Sri Sai Raghavendra Trade Services.",
      },
    ],
  },
  {
    id: "aggregators",
    title: "Aggregators & Referrals",
    icon: UsersIcon,
    items: [
      {
        question: "What is the Aggregator program?",
        answer:
          "We believe in rewarding those who help our ecosystem grow. Aggregators are provided with a separate login to refer new buyers, sellers, or transporters to the platform. Based on successful onboarding and trading volume, Aggregators can earn referral bonuses and credits.",
      },
      {
        question: "How do I track my successful referrals?",
        answer:
          "Aggregators have a dedicated login dashboard where they can see the status of the users they have referred (e.g., Pending KYC, Verified, Active).",
      },
      {
        question: "When are referral bonuses credited?",
        answer:
          "Referral bonuses or credits are allocated based on our internal policies, typically after the referred user successfully completes their KYC and executes their first verified contract.",
      },
    ],
  },
  {
    id: "support",
    title: "Technical Support",
    icon: LifeBuoyIcon,
    items: [
      {
        question: "What should I do if I face a technical error or the portal is down?",
        answer:
          "If you experience any technical issues, you can reach out to our support team directly. During standard business hours, we also provide offline support for any urgent trade executions while the portal is being restored.",
      },
    ],
  },
];

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  { title: "Maize DDGS prices: what to expect this season", excerpt: "Ethanol output, monsoon crops and export demand are shaping DDGS prices. Here's what buyers should watch.", date: "18 Oct 2026", readTime: "5 min read", category: "Market" },
  { title: "Choosing the right DOC for poultry feed", excerpt: "Soya, groundnut or rapeseed? A practical comparison of protein, cost and digestibility.", date: "09 Oct 2026", readTime: "7 min read", category: "Nutrition" },
  { title: "How digital contracts cut payment delays", excerpt: "Clear terms, shared invoices and one audit trail mean fewer disputes and faster settlement.", date: "27 Sep 2026", readTime: "4 min read", category: "Platform" },
  { title: "Fish farms: feeding for faster growth", excerpt: "Protein-rich ingredients and the right feeding schedule make a measurable difference in aqua yields.", date: "15 Sep 2026", readTime: "6 min read", category: "Aqua" },
  { title: "DORB quality checks every buyer should know", excerpt: "Sand and silica, fibre and protein: the three numbers that tell you if a DORB lot is worth it.", date: "02 Sep 2026", readTime: "5 min read", category: "Quality" },
  { title: "Tracking trucks from mill gate to warehouse", excerpt: "How live tracking and instant notifications keep buyers informed and drivers accountable.", date: "20 Aug 2026", readTime: "3 min read", category: "Logistics" },
];

export const socialLinks: { label: string; icon: IconComponent; href: string }[] = [
  { label: "LinkedIn", icon: LinkedinIcon, href: "https://www.linkedin.com/" },
  { label: "Twitter", icon: TwitterIcon, href: "https://twitter.com/" },
  { label: "Facebook", icon: FacebookIcon, href: "https://www.facebook.com/" },
  { label: "Instagram", icon: InstagramIcon, href: "https://www.instagram.com/" },
];
