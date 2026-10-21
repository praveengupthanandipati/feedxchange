import { stats } from "../../data/content";

const StatsBand = () => (
  <section className="section section--dark stats-band" aria-label="FeedXchange in numbers">
    <div className="site-container">
      <dl className="stats-band__grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stats-band__item">
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default StatsBand;
