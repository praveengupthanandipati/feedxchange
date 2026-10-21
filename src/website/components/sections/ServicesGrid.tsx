import { services } from "../../data/content";
import SectionHead from "../common/SectionHead";

interface ServicesGridProps {
  /** Show only the first few, e.g. on the home page. */
  limit?: number;
}

const ServicesGrid = ({ limit }: ServicesGridProps) => (
  <section className="section section--alt" aria-labelledby="services-title">
    <div className="site-container">
      <SectionHead id="services-title" eyebrow="What we do" title="Everything you need to trade feed ingredients" text="From the first price check to the final payment, every step runs on one connected platform." />
      <ul className="card-grid">
        {services.slice(0, limit).map(({ icon: Icon, title, text }) => (
          <li key={title} className="feature-card">
            <span className="feature-card__icon">
              <Icon aria-hidden />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ServicesGrid;
