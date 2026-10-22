import { partners } from "../../data/content";

const PartnersStrip = () => (
  <section className="partners" aria-label="Trusted by">
    <div className="site-container">
      <p className="partners__title">Trusted by leading feed businesses</p>
      <ul className="partners__list">
        {partners.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  </section>
);

export default PartnersStrip;
