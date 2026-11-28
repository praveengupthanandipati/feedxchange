import CtaBanner from "../components/sections/CtaBanner";
import DealingPartners from "../components/sections/DealingPartners";
import Hero from "../components/sections/Hero";
import HowItWorks from "../components/sections/HowItWorks";
import PartnersStrip from "../components/sections/PartnersStrip";
import PopularCategories from "../components/sections/PopularCategories";
import ServicesGrid from "../components/sections/ServicesGrid";
import StatsBand from "../components/sections/StatsBand";
import Testimonials from "../components/sections/Testimonials";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import { whatsappLink } from "../data/content";
import { useSeo } from "../seo/useSeo";
import { useCatalogue } from "../hooks/useCatalogue";
import { sitePaths } from "../routes/paths";

/** Website index page. */
const Home = () => {
  // the home page's product sections come from the catalogue: keep the prerendered copy up until it is in
  const { isLoading: catalogueLoading } = useCatalogue();
  useSeo({
    ready: !catalogueLoading,
    title: "B2B Animal Feed Ingredients Marketplace India",
    fullTitle: "FeedXchange | B2B Animal Feed Ingredients Marketplace India",
    description:
      "Buy and sell animal feed ingredients online in India: de-oiled cakes, soybean meal, DDGS, rice bran (DORB) and maize. Live prices, verified sellers, tracked trucks.",
    keywords: ["buy feed ingredients online", "feed raw material suppliers India", "live feed ingredient prices", "maize DDGS", "soya DOC"],
  });

  return (
    <>
      <Hero />
      <PartnersStrip />
      <PopularCategories />
      <CtaBanner title="Find best matching raw material prices for your animal feed" text="" action={{ label: "WhatsApp on 92475 98399", to: whatsappLink }} />
      <ServicesGrid />
      <DealingPartners />
      <WhyChooseUs />
      <StatsBand />
      <HowItWorks />
      <Testimonials />
      <CtaBanner title="Join Hands with FeedXchange – Your Trusted Partner in Animal Feed & Livestock Trade Success" text="" action={{ label: "Let's work together", to: sitePaths.join }} />
    </>
  );
};

export default Home;
