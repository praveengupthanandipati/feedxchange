import { FiMail, FiMapPin } from "react-icons/fi";
import LegalPage from "../components/legal/LegalPage";
import { privacyContact, privacySections, privacyUpdated } from "../data/privacy";
import { usePageTitle } from "../hooks/usePageTitle";

const Privacy = () => {
  usePageTitle("Privacy Policy");

  return (
    <LegalPage
      title="Privacy Policy"
      updated={privacyUpdated}
      sections={privacySections}
      badge="Your data, protected"
      extras={{
        "contact-us": (
          <address className="legal-contact">
            <strong>{privacyContact.name}</strong>
            <span>
              <FiMapPin aria-hidden /> {privacyContact.address}
            </span>
            <span>
              <FiMail aria-hidden /> Email: <a href={`mailto:${privacyContact.email}`}>{privacyContact.email}</a>
            </span>
          </address>
        ),
      }}
    />
  );
};

export default Privacy;
