import {
  ChartNoAxesColumnIcon,
  LogInIcon,
  MapIcon,
  ShieldIcon,
  UserIcon,
} from "../../../shared/components/icon";
import { Link } from "react-router-dom";
import SignupForm from "../components/join/SignupForm";
import PageHero from "../components/sections/PageHero";
import { usePageTitle } from "../hooks/usePageTitle";
import { sitePaths } from "../routes/paths";

const benefits = [
  { icon: UserIcon, title: "Multi-Role Account", text: "Switch seamlessly between Buyer, Supplier, Transporter, or Promoter modes in a single account." },
  {
    icon: ChartNoAxesColumnIcon,
    title: "Business Growth Tools",
    text: "Buyers get wholesale deals, Suppliers expand reach, Transporters find loads, Promoters earn commissions.",
  },
  { icon: ShieldIcon, title: "Secure Transactions", text: "KYC-verified partners and direct, transparent payments ensure safe B2B transactions." },
  { icon: MapIcon, title: "Real-Time Tracking", text: "Track orders, payments, and logistics from any device, anytime." },
  { icon: LogInIcon, title: "Quick Start", text: "Simple registration with auto-role switching and minimal paperwork." },
];

/** Target of every "Join with us" button: why join, beside the signup form. */
const JoinUs = () => {
  usePageTitle("Join with us", "Register as a seller, buyer or transporter and start trading feed ingredients on FeedXchange.");

  return (
    <>
      <PageHero title="Join with us" text="Register your business and start trading feed ingredients on FeedXchange." />
      <section className="section join">
        <div className="site-container join__layout">
          <div className="join__intro" data-reveal>
            <h2 className="join__title">
              <span>Join Feedxchange &ndash; One Account,</span> Endless Business Opportunities
            </h2>
            <p className="join__help">
              Have questions? Visit our <Link to={sitePaths.faqs}>Help Center</Link> or reach out to our <Link to={sitePaths.contact}>Support Team</Link>
            </p>

            <ul className="join-benefits">
              {benefits.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className="join-benefits__icon">
                    <Icon aria-hidden />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="join__form" data-reveal data-reveal-delay="120">
            <SignupForm />
          </div>
        </div>
      </section>
    </>
  );
};

export default JoinUs;
