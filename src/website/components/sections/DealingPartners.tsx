import { dealingPartners } from "../../data/content";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import SectionHead from "../common/SectionHead";
import DealingIcon from "./DealingIcon";

/** "Dealing Partners": the four kinds of farms FeedXchange serves. */
const DealingPartners = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section dealing" aria-labelledby="dealing-title">
      <div className="site-container">
        <SectionHead id="dealing-title" eyebrow="Who we serve" title="Dealing Partners" />
        <ul className="dealing__grid">
          {dealingPartners.map((partner, index) => (
            <li key={partner.kind} className={`dealing-card dealing-card--${partner.kind}`} data-reveal data-reveal-delay={index * 110}>
              <span className="dealing-card__icon">
                {/* An orange dot orbits the badge along a circular motion path (CSS offset-path). */}
                <span className="dealing-card__orbit" aria-hidden />
                <DealingIcon kind={partner.kind} still={reducedMotion} />
              </span>
              <h3>{partner.title}</h3>
              <p>{partner.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DealingPartners;
