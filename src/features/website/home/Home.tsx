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
import { usePageTitle } from "../hooks/usePageTitle";
import { sitePaths } from "../routes/paths";

/** Website index page. */
const Home = () => {
  usePageTitle("Feed Ingredient Trading Platform", "Trade feed ingredients with confidence: live prices, verified sellers and tracked deliveries on one platform.");

  return (
    <>
      <Hero />
      <PartnersStrip />
      <PopularCategories />
      <CtaBanner title="Find best matching raw material prices for your animal feed" text="" action={{ label: "Send an Enquiry", to: sitePaths.contact }} />
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
