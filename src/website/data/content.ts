// Test content for the website. Replace with real copy (or a CMS) before launch.
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiCreditCard,
  FiFacebook,
  FiFileText,
  FiInstagram,
  FiLinkedin,
  FiPackage,
  FiShield,
  FiTruck,
  FiTwitter,
  FiUsers,
} from "react-icons/fi";
import { sitePaths } from "../routes/paths";

export interface NavLinkItem {
  label: string;
  to: string;
}

export const navLinks: NavLinkItem[] = [
  { label: "Home", to: sitePaths.home },
  { label: "About", to: sitePaths.about },
  { label: "Services", to: sitePaths.services },
  { label: "Contact", to: sitePaths.contact },
];

export const company = {
  name: "FeedXchange",
  tagline: "The trusted marketplace for animal feed ingredients.",
  email: "hello@feedxchange.example",
  phone: "+91 98765 43210",
  address: "Plot 42, Agri Business Park, Vijayawada, Andhra Pradesh 520010",
  hours: "Mon – Sat, 9:00 AM – 6:00 PM IST",
};

export const hero = {
  eyebrow: "Agri-commerce, simplified",
  title: "Trade feed ingredients with confidence, from contract to delivery.",
  text: "FeedXchange connects mills, traders and transporters on one secure platform: live prices, digital contracts, tracked dispatches and on-time payments.",
  primaryCta: "Get Started",
  secondaryCta: "Explore Services",
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

export const partners = ["Raghavendra Seeds", "Eswar Industries", "Lakshmi Poultry", "Elite Agro Foods", "SL International", "Purnima Feeds"];

export interface Service {
  icon: IconType;
  title: string;
  text: string;
}

export const services: Service[] = [
  { icon: FiBarChart2, title: "Live Market Pricing", text: "Daily prices for maize, DDGS, soybean meal and more, with history and trends to time every purchase." },
  { icon: FiFileText, title: "Digital Contracts", text: "Create, sign and track contracts online, with every amendment and approval kept in one audit trail." },
  { icon: FiTruck, title: "Logistics & Dispatch", text: "Schedule trucks, assign transporters and follow each load from the mill gate to your warehouse." },
  { icon: FiCreditCard, title: "Secure Payments", text: "Invoices, payment advice and allocations reconciled automatically, so both sides always agree." },
  { icon: FiShield, title: "Verified Partners", text: "Every buyer, seller and transporter is KYC-checked before they can trade on the platform." },
  { icon: FiPackage, title: "Quality Assurance", text: "Specification checks and lab reports attached to each consignment, before it leaves the seller." },
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
];

export const values: Service[] = [
  { icon: FiShield, title: "Trust", text: "We verify every partner and keep every transaction transparent." },
  { icon: FiUsers, title: "Partnership", text: "We grow when farmers, mills and traders grow with us." },
  { icon: FiBarChart2, title: "Efficiency", text: "We remove paperwork so trade moves at the speed of business." },
];

export const footerColumns: { title: string; links: NavLinkItem[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", to: sitePaths.about },
      { label: "Services", to: sitePaths.services },
      { label: "Contact", to: sitePaths.contact },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Market Pricing", to: sitePaths.services },
      { label: "Digital Contracts", to: sitePaths.services },
      { label: "Logistics", to: sitePaths.services },
    ],
  },
];

export const socialLinks: { label: string; icon: IconType; href: string }[] = [
  { label: "LinkedIn", icon: FiLinkedin, href: "https://www.linkedin.com/" },
  { label: "Twitter", icon: FiTwitter, href: "https://twitter.com/" },
  { label: "Facebook", icon: FiFacebook, href: "https://www.facebook.com/" },
  { label: "Instagram", icon: FiInstagram, href: "https://www.instagram.com/" },
];
