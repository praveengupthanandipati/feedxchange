import { FiAtSign, FiMapPin, FiPhone } from "react-icons/fi";
import ContactForm from "../components/contact/ContactForm";
import PageHero from "../components/sections/PageHero";
import { company } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

const Contact = () => {
  usePageTitle("Contact Us");

  return (
    <>
      <PageHero title="Contact Us" text="Questions about pricing, onboarding or partnerships? We'd love to hear from you." />
      <section className="section">
        <div className="site-container contact-layout">
          {/* ---------- Contact details panel ---------- */}
          <div className="contact-panel" data-reveal>
            <div className="contact-panel__head">
              <h2>We&rsquo;d love to hear from you.</h2>
              <p>Our friendly team is always here to chat</p>
            </div>

            <ul className="contact-panel__grid">
              <li className="contact-panel__item">
                <span className="contact-panel__icon">
                  <FiAtSign aria-hidden />
                </span>
                <h3>Email</h3>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>

              <li className="contact-panel__item">
                <span className="contact-panel__icon">
                  <FiPhone aria-hidden />
                </span>
                <h3>Phone</h3>
                <p>{company.hours}</p>
                <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>
              </li>

              <li className="contact-panel__item contact-panel__item--wide">
                <span className="contact-panel__icon">
                  <FiMapPin aria-hidden />
                </span>
                <h3>Office</h3>
                <address>{company.address}</address>
              </li>
            </ul>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
};

export default Contact;
