import CtaBanner from "../components/sections/CtaBanner";
import Hero from "../components/sections/Hero";
import HowItWorks from "../components/sections/HowItWorks";
import PartnersStrip from "../components/sections/PartnersStrip";
import ServicesGrid from "../components/sections/ServicesGrid";
import StatsBand from "../components/sections/StatsBand";
import Testimonials from "../components/sections/Testimonials";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import { usePageTitle } from "../hooks/usePageTitle";

/** Website index page. */
const Home = () => {
  usePageTitle("Feed Ingredient Trading Platform");

  return (
    <>
      <Hero />
      <PartnersStrip />
      <ServicesGrid />
      <WhyChooseUs />
      <StatsBand />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </>
  );
};

export default Home;
