import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import heroImage from "../../assets/images/hero-dashboard.svg";
import { hero } from "../../data/content";
import { sitePaths } from "../../routes/paths";

const Hero = () => (
  <section className="hero" aria-labelledby="hero-title">
    <div className="site-container hero__inner">
      <div className="hero__copy">
        <span className="eyebrow">{hero.eyebrow}</span>
        <h1 id="hero-title">{hero.title}</h1>
        <p className="hero__text">{hero.text}</p>
        <div className="hero__actions">
          <Link to={sitePaths.contact} className="btn-site btn-site--primary">
            {hero.primaryCta} <FiArrowRight aria-hidden />
          </Link>
          <Link to={sitePaths.services} className="btn-site btn-site--ghost">
            {hero.secondaryCta}
          </Link>
        </div>
        <ul className="hero__points">
          <li>
            <FiCheckCircle aria-hidden /> KYC-verified partners
          </li>
          <li>
            <FiCheckCircle aria-hidden /> No hidden commissions
          </li>
        </ul>
      </div>
      <div className="hero__visual">
        <img src={heroImage} alt="FeedXchange dashboard showing live prices, contracts and truck tracking" width={560} height={440} fetchPriority="high" />
      </div>
    </div>
  </section>
);

export default Hero;
