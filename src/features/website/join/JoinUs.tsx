import { CheckIcon } from "../../../shared/components/icon";
import ContactForm from "../components/contact/ContactForm";
import SectionHead from "../components/common/SectionHead";
import PageHero from "../components/sections/PageHero";
import { reasons } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

/** Target of every "Join with us" button. */
const JoinUs = () => {
  usePageTitle("Join with us", "Register as a seller, buyer or transporter and start trading feed ingredients on FeedXchange.");

  return (
    <>
      <PageHero title="Join with us" text="Register your business and start trading feed ingredients on FeedXchange." />
      <section className="section">
        <div className="site-container contact-layout">
          <div>
            <SectionHead id="join-title" eyebrow="Why join" title="Grow your business with a trusted network" align="left" />
            <ul className="check-list">
              {reasons.map((reason) => (
                <li key={reason}>
                  <span aria-hidden>
                    <CheckIcon />
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <ContactForm title="Tell us about your business" submitLabel="Request to join" />
        </div>
      </section>
    </>
  );
};

export default JoinUs;
