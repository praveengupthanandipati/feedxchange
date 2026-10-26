import { useState, type SubmitEvent } from "react";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, SendIcon } from "../../../shared/components/icon";
import { Link } from "react-router-dom";
import { company, footerColumns, socialLinks } from "../../../features/website/data/content";
import Logo from "../../../features/website/components/common/Logo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

  const subscribe = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) return setStatus("error");
    // TODO: send to the newsletter API once it is available.
    setStatus("done");
    setEmail("");
  };

  return (
    <footer className="site-footer">
      <div className="site-container site-footer__grid">
        <div className="site-footer__brand">
          <Logo inverse />
          <p>{company.tagline} Built for mills, traders and transporters across India.</p>
          <ul className="site-footer__social" aria-label="Social media">
            {socialLinks.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <Icon aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="site-footer__col">
            <h3>{column.title}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="site-footer__col site-footer__contact">
          <h3>Get in touch</h3>
          <ul>
            <li>
              <MapPinIcon aria-hidden /> <span>{company.address}</span>
            </li>
            <li>
              <PhoneIcon aria-hidden /> <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>
            </li>
            <li>
              <MailIcon aria-hidden /> <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li>
              <ClockIcon aria-hidden /> <span>{company.hours}</span>
            </li>
          </ul>
        </div>

        <form className="site-footer__newsletter" onSubmit={subscribe} noValidate>
          <h3>Market updates</h3>
          <p>Weekly feed-ingredient prices, straight to your inbox.</p>
          <div className="site-footer__subscribe">
            <label htmlFor="footer-email" className="visually-hidden-site">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setStatus("idle");
              }}
              aria-invalid={status === "error"}
              aria-describedby="footer-email-status"
            />
            <button type="submit" aria-label="Subscribe">
              <SendIcon aria-hidden />
            </button>
          </div>
          <small id="footer-email-status" className={`site-footer__status is-${status}`} aria-live="polite">
            {status === "error" && "Enter a valid email address."}
            {status === "done" && "Thanks! You're subscribed."}
          </small>
        </form>
      </div>

      <div className="site-footer__bottom">
        <div className="site-container site-footer__bottom-inner">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <ul>
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="#terms">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
