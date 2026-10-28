import { ArrowRightIcon, CheckIcon } from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import aboutImage from "../../assets/images/about-network.svg";
import { reasons } from "../../data/content";
import { sitePaths } from "../../routes/paths";
import SectionHead from "../common/SectionHead";

const WhyChooseUs = () => (
  <section className="section" aria-labelledby="why-title">
    <div className="site-container split">
      <div className="split__visual" data-reveal>
        <img src={aboutImage} alt="FeedXchange connects mills, traders, transporters and warehouses" width={520} height={420} loading="lazy" />
      </div>
      <div className="split__copy" data-reveal data-reveal-delay="120">
        <SectionHead
          id="why-title"
          eyebrow="Why FeedXchange"
          title="A single network for the entire feed supply chain"
          text="We bring buyers, sellers and transporters together, so every trade is faster, safer and fully visible."
          align="left"
        />
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
        <Link to={sitePaths.about} className="btn-site btn-site--dark">
          Learn more about us <ArrowRightIcon aria-hidden />
        </Link>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
