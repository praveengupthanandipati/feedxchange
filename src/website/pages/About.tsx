import aboutImage from "../assets/images/about-network.svg";
import SectionHead from "../components/common/SectionHead";
import CtaBanner from "../components/sections/CtaBanner";
import PageHero from "../components/sections/PageHero";
import StatsBand from "../components/sections/StatsBand";
import { company, values } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

const About = () => {
  usePageTitle("About Us");

  return (
    <>
      <PageHero title="About Us" text={`${company.name} is building the digital backbone of India's animal feed trade.`} />

      <section className="section" aria-labelledby="story-title">
        <div className="site-container split">
          <div className="split__copy" data-reveal>
            <SectionHead id="story-title" eyebrow="Our story" title="Born in the market, built for the market" align="left" />
            <div className="prose-site">
              <p>
                {company.name} started in 2021 when a group of feed traders in Andhra Pradesh grew tired of phone calls, paper contracts and missed payments. We set out to
                build the platform we wished we had.
              </p>
              <p>
                Today, more than a thousand mills, traders and transporters use {company.name} to agree prices, sign contracts, move trucks and settle payments, all in
                one place.
              </p>
            </div>
          </div>
          <div className="split__visual" data-reveal data-reveal-delay="120">
            <img src={aboutImage} alt="The FeedXchange partner network" width={520} height={420} loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="values-title">
        <div className="site-container">
          <SectionHead id="values-title" eyebrow="Our values" title="What guides every decision we make" />
          <ul className="card-grid card-grid--3">
            {values.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="feature-card" data-reveal data-reveal-delay={index * 100}>
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

      <StatsBand />
      <CtaBanner />
    </>
  );
};

export default About;
