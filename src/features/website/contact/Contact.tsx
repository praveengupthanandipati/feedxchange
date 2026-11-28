import { AtSignIcon, MapPinIcon } from "../../../shared/components/icon";
import { FaWhatsapp } from "react-icons/fa";
import ContactForm from "../components/contact/ContactForm";
import PageHero from "../components/sections/PageHero";
import { company, whatsappLink } from "../data/content";
import { useSeo } from "../seo/useSeo";

const Contact = () => {
  useSeo({
    title: "Contact Us: Vijayawada, Andhra Pradesh",
    description:
      "Call +91 8499083999, WhatsApp or email contact@feedxchange.in to buy, sell or transport feed ingredients. Office in Gollapudi, Vijayawada; Mon-Sat 9am-6pm.",
    keywords: ["feedXchange contact", "feed ingredient supplier Vijayawada", "feed raw material dealer Andhra Pradesh"],
    pageType: "ContactPage",
    breadcrumbs: [],
  });

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
                  <AtSignIcon aria-hidden />
                </span>
                <h3>Email</h3>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>

              <li className="contact-panel__item">
                <span className="contact-panel__icon">
                  <FaWhatsapp aria-hidden />
                </span>
                <h3>WhatsApp</h3>
                <p>{company.hours}</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">{company.phone}</a>
              </li>

              <li className="contact-panel__item contact-panel__item--wide">
                <span className="contact-panel__icon">
                  <MapPinIcon aria-hidden />
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
