import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "../../../shared/components/icon";
import ContactForm from "../components/contact/ContactForm";
import PageHero from "../components/sections/PageHero";
import { company } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

const Contact = () => {
  usePageTitle("Contact Us", "Talk to the FeedXchange team about buying, selling or moving feed ingredients.");

  const details = [
    { icon: MapPinIcon, title: "Visit us", body: company.address },
    { icon: PhoneIcon, title: "Call us", body: company.phone, href: `tel:${company.phone.replace(/\s/g, "")}` },
    { icon: MailIcon, title: "Email us", body: company.email, href: `mailto:${company.email}` },
    { icon: ClockIcon, title: "Working hours", body: company.hours },
  ];

  return (
    <>
      <PageHero title="Contact Us" text="Questions about pricing, onboarding or partnerships? We'd love to hear from you." />
      <section className="section">
        <div className="site-container contact-layout">
          <ul className="contact-details" data-reveal>
            {details.map(({ icon: Icon, title, body, href }) => (
              <li key={title} className="contact-details__item">
                <span className="feature-card__icon">
                  <Icon aria-hidden />
                </span>
                <div>
                  <h3>{title}</h3>
                  {href ? <a href={href}>{body}</a> : <p>{body}</p>}
                </div>
              </li>
            ))}
          </ul>
          <ContactForm />
        </div>
      </section>
    </>
  );
};

export default Contact;
