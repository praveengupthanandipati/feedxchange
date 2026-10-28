import { MailIcon, MapPinIcon } from "../../../shared/components/icon";
import LegalPage from "../components/legal/LegalPage";
import { privacyContact, privacySections, privacyUpdated } from "../data/privacy";
import { usePageTitle } from "../hooks/usePageTitle";

const Privacy = () => {
  usePageTitle("Privacy Policy", "How FeedXchange collects, uses and protects the information you share when you trade on the platform.");

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
              <MapPinIcon aria-hidden /> {privacyContact.address}
            </span>
            <span>
              <MailIcon aria-hidden /> Email: <a href={`mailto:${privacyContact.email}`}>{privacyContact.email}</a>
            </span>
          </address>
        ),
      }}
    />
  );
};

export default Privacy;
