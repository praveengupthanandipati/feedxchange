import CtaBanner from "../components/sections/CtaBanner";
import HowItWorks from "../components/sections/HowItWorks";
import PageHero from "../components/sections/PageHero";
import ServicesGrid from "../components/sections/ServicesGrid";
import { usePageTitle } from "../hooks/usePageTitle";

const Services = () => {
  usePageTitle("Services");

  return (
    <>
      <PageHero title="Services" text="One connected platform for pricing, contracts, logistics and payments." />
      <ServicesGrid />
      <HowItWorks />
      <CtaBanner />
    </>
  );
};

export default Services;
