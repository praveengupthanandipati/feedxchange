// Privacy Policy copy, kept word for word as supplied.

import type { PolicySection } from "./legal";

export const privacyUpdated = "05-April-2026";

export const privacySections: PolicySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    intro: [
      'Welcome to FeedXchange.in (the "Portal"), owned and operated by Sri Sai Raghavendra Trade Services, based in Vijayawada, Andhra Pradesh ("We", "Us", "Our", or the "Company"). We respect your privacy and are committed to protecting your personal and business data.',
      "This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Portal or use our services as a Buyer, Seller, Transporter, or Aggregator. By registering on or using the Portal, you consent to the data practices described in this policy.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    intro: ["To facilitate a transparent and secure B2B trading environment, we collect the following types of information:"],
    points: [
      {
        label: "Business & Personal Information",
        text: "When you register, we collect your name, company name, email address, phone number, and physical address.",
      },
      {
        label: "KYC Documents",
        text: "To ensure the legitimacy of the trades on our platform, we collect scanned copies of Know Your Customer (KYC) documents, which may include GST registration certificates, PAN cards, Aadhar cards (if applicable for sole proprietorships), and relevant transport or commercial licenses.",
      },
      {
        label: "Transaction Data",
        text: "We record details of the contracts executed through our facilitation, including commodities traded, pricing, quantities, and transporter assignments.",
      },
      {
        label: "Financial Information",
        text: "We collect bank account details primarily to facilitate smooth, direct financial transactions between the transacting parties. Specifically, once a contract is executed, a Seller's banking details are made available to the Buyer to easily process the payment for goods, and a Buyer's banking details are made available to the Seller to quickly process any necessary refunds (e.g., for excess amounts received). Additionally, we may use these details for billing our canvassing fees, processing freight charges, or remitting referral bonuses to Aggregators.",
      },
      {
        label: "Technical & Usage Data",
        text: "We automatically collect standard technical data, such as IP addresses, browser types, login times, and device information to ensure portal stability and security.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    intro: ["We use the collected information for the following business purposes:"],
    points: [
      { text: "To create, verify, and manage your user account." },
      { text: "To facilitate and track B2B contracts for animal feed ingredients." },
      { text: "To allow Transporters to view logistical requirements, bid on freight, and arrange vehicles." },
      { text: "To track referrals and allocate bonuses to Aggregators." },
      { text: "To mediate disputes regarding quality or delivery." },
      { text: "To communicate with you regarding updates, market conditions, and account security." },
    ],
  },
  {
    id: "kyc-sharing",
    title: "Unique Data Sharing Practice (Explicit Consent for KYC Sharing)",
    intro: [
      "FeedXchange.in operates on a model of absolute transparency between transacting parties. By using this Portal and executing a contract, you explicitly acknowledge and agree to the following data-sharing practice:",
    ],
    points: [
      {
        label: "Mutual Disclosure",
        text: "Once a contract is officially executed between a Buyer and a Seller, the Portal will automatically allow the Buyer to view the Seller’s KYC documents, and the Seller to view the Buyer’s KYC documents.",
      },
      {
        label: "Scope of Sharing",
        text: "This access is strictly limited to the specific parties involved in the confirmed contract. We do not broadcast your KYC documents publicly or to users with whom you have no active contracts.",
      },
      {
        label: "Transporters",
        text: "Relevant contact and logistical data will be shared with enrolled Transporters solely for the purpose of fulfilling the dispatch requirements of an executed contract.",
      },
    ],
  },
  {
    id: "third-party-disclosure",
    title: "Third-Party Disclosure",
    intro: [
      "Aside from the transacting parties mentioned above, we do not sell, trade, or rent your personal or business information to outside parties. We may only disclose information:",
    ],
    points: [
      { text: "To comply with legal obligations, regulatory requirements, or court orders." },
      { text: "To enforce our Terms and Conditions." },
      { text: "To protect the rights, property, or safety of our Company, our users, or others." },
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    intro: [
      "We implement industry-standard security measures, including encryption and secure server hosting, to protect your sensitive data and KYC documents from unauthorized access, alteration, disclosure, or destruction. However, no digital transmission or storage is 100% secure, and we cannot guarantee absolute security. You are responsible for keeping your login credentials confidential.",
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    intro: [
      "We retain your personal, business, and transactional data for as long as your account is active, or as needed to provide you with our services, resolve disputes, and comply with our legal and tax obligations under Indian law.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and Tracking Technologies",
    intro: [
      'The Portal may use "cookies" and similar tracking technologies to enhance user experience, remember your preferences, and analyze site traffic. You can instruct your browser to refuse all cookies, but this may limit your ability to use some features of the Portal.',
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    intro: ["Subject to applicable laws, you have the right to:"],
    points: [
      { text: "Access and review the personal and business information we hold about you." },
      { text: "Request corrections to any inaccurate or incomplete data." },
      { text: "Request the deletion of your account (subject to our legal data retention requirements)." },
    ],
  },
  {
    id: "changes",
    title: "Changes to This Privacy Policy",
    intro: [
      'We reserve the right to update this Privacy Policy at any time. We will notify you of any significant changes by posting the new policy on the Portal and updating the "Last Updated" date. Continued use of the Portal after modifications indicates your acceptance of the revised policy.',
    ],
  },
  {
    id: "contact-us",
    title: "Contact Us",
    intro: ["If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact us at:"],
  },
];

/** Postal block under "Contact Us", as written in the policy. */
export const privacyContact = {
  name: "Sri Sai Raghavendra Trade Services",
  address: "174, 1st floor, Mahatma Gandhi Wholesale Commercial Complex, Mahendra Nagar, Gollapudi, Vijayawada - 521225",
  email: "contact@feedxchange.in",
};
