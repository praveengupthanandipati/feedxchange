import LegalPage from "../components/legal/LegalPage";
import { termsSections, termsUpdated } from "../data/terms";
import { usePageTitle } from "../hooks/usePageTitle";

const Terms = () => {
  usePageTitle("Terms and Conditions");

  return <LegalPage title="Terms and Conditions" updated={termsUpdated} sections={termsSections} badge="Fair & transparent trade" />;
};

export default Terms;
