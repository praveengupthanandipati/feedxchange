// Terms and Conditions copy, kept word for word as supplied.
import type { PolicySection } from "./legal";

export const termsUpdated = "05-April-2026";

export const termsSections: PolicySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    intro: [
      'Welcome to FeedXchange.in (hereinafter referred to as the "Portal"), an exclusive digital platform owned and operated by Sri Sai Raghavendra Trade Services, based in Vijayawada, Andhra Pradesh (hereinafter referred to as "We", "Us", "Our", or the "Company"). We have been serving as trusted Canvassing Agents for Animal Feed Ingredients since 1996.',
      'By accessing, registering, or using this Portal, you (the "User", "Client", "Buyer", "Seller", "Transporter", or "Aggregator") agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our Portal.',
    ],
  },
  {
    id: "services-and-access",
    title: "Nature of Services and Portal Access",
    intro: ["FeedXchange.in is a B2B digital portal designed to provide transparent access to information regarding animal feed ingredients, logistics, and trade facilitation."],
    points: [
      {
        label: "Access Levels",
        text: "The Portal offers tiered access based on user roles:",
        points: [
          { label: "Guests", text: "Unregistered users with limited access to general information and indicative pricing." },
          { label: "Buyers & Sellers", text: "Full access including personalized dashboards, contract tracking, logistics tracking, and historical data." },
          { label: "Transporters", text: "Dedicated dashboards to view loading requirements, negotiate freight, and manage truck assignments." },
          { label: "Aggregators", text: "Separate login access to track referrals and bonus credits." },
        ],
      },
      {
        label: "Fees",
        text: "Currently, access to the registered features of the Portal is provided free of charge. However, the Company reserves the right to introduce subscription fees or access charges for the Portal or specific premium features in the future. Users will be notified in advance of any such changes.",
      },
    ],
  },
  {
    id: "role-of-company",
    title: "Role of the Company (Canvassing Agents)",
    intro: ["The User acknowledges that Sri Sai Raghavendra Trade Services acts strictly as Canvassing Agents/Facilitators."],
    points: [
      { text: "We facilitate the procurement of high-quality raw materials directly from manufacturers/suppliers." },
      { text: "The final contract of sale and purchase is executed directly between the Buyer and the Manufacturer/Seller." },
      { text: "The Company does not take ownership of the goods at any point during the transaction." },
    ],
  },
  {
    id: "payments",
    title: "Payments, Financial Transactions, and Fees",
    points: [
      {
        label: "Payment for Goods",
        text: "All financial transactions and payments for the supply of physical goods are to be made directly to the respective Manufacturer/Supplier's bank account. FeedXchange.in does not act as a payment gateway for the purchase of goods, nor do we collect funds on behalf of the suppliers for the materials procured.",
      },
      {
        label: "Canvassing Fees",
        text: "Depending on the specific trade practices and the individual agreement between the Company and the User, a canvassing or service fee may be applicable for our facilitation and mediation services. If applicable, these fees will be mutually agreed upon prior to contract execution, billed separately, and payable directly to Us.",
      },
      {
        label: "Portal Access",
        text: "Any applicable canvassing fees are distinct from the use of the digital Portal. The standard terms of your trade agreement remain in effect regardless of whether access to the Portal itself is currently provided free of charge or becomes subject to a subscription model in the future.",
      },
    ],
  },
  {
    id: "logistics",
    title: "Logistics and Enrolled Transporters",
    intro: ["To streamline operations, the Portal allows the integration of registered Transporters."],
    points: [
      {
        label: "Vehicle Assignment",
        text: "Upon execution of a contract, the involved parties (Buyer, Seller, or the Company acting as a broker) may choose to arrange transportation offline or utilize the Portal to broadcast loading requirements to enrolled Transporters.",
      },
      {
        label: "Transporter Dashboard",
        text: "Transporters are provided with a dedicated interface to access active requirements, negotiate or bargain on freight values, and arrange trucks accordingly. This functionality permits the transacting parties, including the facilitating broker, to directly assign logistical vehicles against the specific executed contracts.",
      },
      {
        label: "Limitation of Transport Liability",
        text: "The Company acts solely as a technological bridge connecting trade parties with Transporters. We do not assume liability for transit delays, accidents, loss of goods, or freight disputes. The final agreement regarding freight charges and transit liability exists strictly between the Transporter and the party assigning/paying for the freight.",
      },
    ],
  },
  {
    id: "aggregators",
    title: "Aggregators and Referral Program",
    intro: ['To encourage platform growth, we offer a referral program for designated "Aggregators."'],
    points: [
      { label: "Aggregator Access", text: "Aggregators are provided with a separate login and dashboard to track the users they have successfully onboarded to the Portal." },
      { label: "Incentives", text: "Aggregators may be eligible for referral bonuses or credits for bringing new, verified users to FeedXchange.in." },
      {
        label: "Program Policies",
        text: "The issuance of referral bonuses or credits is subject to the Company’s internal policies, which may require the referred user to successfully register, clear KYC checks, or execute a certain volume of contracts. The Company reserves the right to modify, suspend, or terminate the referral program and its payout structures at our sole discretion.",
      },
    ],
  },
  {
    id: "disputes",
    title: "Dispute Resolution and Mediation",
    intro: [
      "We are committed to maintaining a thriving and transparent marketplace. In the event of a dispute regarding the quality of goods supplied or delivery discrepancies:",
    ],
    points: [
      { text: "Sri Sai Raghavendra Trade Services will step in to mediate the dispute between the Buyer and the Supplier to help facilitate a fair resolution." },
      {
        label: "Limitation of Liability",
        text: "The Company does not bear any financial liability, penalties, or charges for poor quality, adulteration, or transit losses. Any proven claims, quality debits, or financial settlements are strictly the responsibility of the Supplier and will be settled directly between the Buyer and the Supplier.",
      },
    ],
  },
  {
    id: "accounts-kyc",
    title: "User Account, KYC, and Data Transparency",
    points: [
      { label: "Account Creation", text: "To access full features, Users must register and provide accurate, up-to-date business information." },
      {
        label: "KYC Collection",
        text: "To ensure a secure and trusted trading environment, the Company collects and stores scanned copies of Know Your Customer (KYC) documents (such as GST, PAN, etc.) from registered Buyers, Sellers, and Transporters.",
      },
      {
        label: "Mutual Data Sharing",
        text: "By executing a contract through us and utilizing this Portal, you explicitly consent to our transparency policy. Once a contract is finalized, the Buyer will have access to view the Seller’s KYC documents on the Portal, and conversely, the Seller will be able to view the Buyer’s KYC documents. This applies only to the specific parties involved in a confirmed contract.",
      },
    ],
  },
  {
    id: "pricing-contracts",
    title: "Pricing and Contracts",
    points: [
      {
        label: "Price Information",
        text: "The prices displayed on the Portal are meant for informational and tracking purposes. Due to market volatility, final contract prices are subject to confirmation at the time of locking the deal.",
      },
      {
        label: "Digital Contracts",
        text: "The digital representation of your contracts on the Portal is for your convenience and tracking. In case of any discrepancy between the physical/signed contract and the digital portal data, the physical/signed contract terms shall prevail.",
      },
    ],
  },
  {
    id: "usage-restrictions",
    title: "Platform Usage and Restrictions",
    intro: ["Users agree to use the Portal solely for their internal business purposes. You shall not:"],
    points: [
      { text: "Reproduce, scrape, or distribute the pricing data or mechanisms from the Portal for commercial competition." },
      { text: "Attempt to gain unauthorized access to other Users' accounts or Company systems." },
      { text: "Misuse the KYC documents of counterparties for any purpose outside the scope of the executed contract." },
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property and Trademarks",
    intro: [
      'The name "FeedXchange" (and "feedxchange.in"), along with the website design, the price tracking mechanisms, logos, and all original content, are the exclusive intellectual property of Sri Sai Raghavendra Trade Services. We have formally applied for trademark registration for the name "feedxchange.in". Unauthorized use, reproduction, scraping, or distribution of our intellectual property or pending/registered trademarks is strictly prohibited and may result in legal action.',
    ],
  },
  {
    id: "modifications",
    title: "Modifications to the Terms",
    intro: [
      "We reserve the right to update or modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the Portal. Continued use of the Portal signifies your acceptance of the revised terms.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law and Jurisdiction",
    intro: [
      "These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with the use of this Portal or our services shall be subject to the exclusive jurisdiction of the competent courts in Vijayawada, Andhra Pradesh.",
    ],
  },
];
