import LegalPage from "../components/legal/LegalPage";
import { termsSections, termsUpdated } from "../data/terms";
import { useSeo } from "../seo/useSeo";

const Terms = () => {
  useSeo({
    title: "Terms and Conditions",
    description: "The terms that govern registering, buying, selling and transporting animal feed ingredients on feedXchange, India's B2B feed ingredient marketplace.",
    breadcrumbs: [],
  });

  return <LegalPage title="Terms and Conditions" updated={termsUpdated} sections={termsSections} badge="Fair & transparent trade" />;
};

export default Terms;
