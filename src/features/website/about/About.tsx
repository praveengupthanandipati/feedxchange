import { AwardIcon, MapPinIcon } from "../../../shared/components/icon";
import aboutImage from "../assets/images/about-network.svg";
import SectionHead from "../components/common/SectionHead";
import CtaBanner from "../components/sections/CtaBanner";
import DealingIcon from "../components/sections/DealingIcon";
import PageHero from "../components/sections/PageHero";
import { about, clientele, milestones, pillars, platformFeatures, team } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** "Mithinti VGS Prakash" → "MP". */
const initials = (name: string) => {
  const words = name.split(" ");
  return `${words[0][0]}${words[words.length - 1][0]}`;
};

const About = () => {
  usePageTitle("About Us", "Who we are: a trusted marketplace connecting feed ingredient sellers, buyers and transporters across India.");
  const reducedMotion = useReducedMotion();
  const [founder, ...members] = team;

  return (
    <>
      <PageHero title="About Us" text="Welcome to FeedXchange.in, an initiative by Sri Sai Raghavendra Trade Services." />

      {/* ---------- Who we are ---------- */}
      <section className="section" aria-labelledby="story-title">
        <div className="site-container split about-intro">
          <div className="split__copy" data-reveal>
            <SectionHead id="story-title" eyebrow="Who we are" title="Bridging Tradition and Technology in the Animal Feed Industry" align="left" />
            <div className="prose-site">
              <p>
                Welcome to <strong>FeedXchange.in</strong>, an initiative by <strong>{about.parent}</strong>.
              </p>
              <p>
                Based out of {about.city}, we have been a trusted cornerstone in the animal feed industry since {about.founded}. For nearly three decades, we have proudly
                served as leading Canvassing Agents, facilitating the trade of premium Animal Feed Ingredients. Our core expertise lies in sourcing and supplying all
                varieties of Deoiled Cakes, Feed-Quality Grains, DDGS, and other essential raw materials.
              </p>
            </div>

            <p className="about-intro__label">Our core expertise</p>
            <ul className="about-chips">
              {about.expertise.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="split__visual about-intro__visual" data-reveal data-reveal-delay="120">
            <img src={aboutImage} alt="The FeedXchange partner network" width={520} height={420} loading="lazy" />
            <div className="about-badge about-badge--year">
              <span>Since</span>
              <strong>{about.founded}</strong>
            </div>
            <div className="about-badge about-badge--place">
              <MapPinIcon aria-hidden />
              <span>{about.city}</span>
            </div>
          </div>
        </div>

        <div className="site-container">
          <dl className="about-facts" data-reveal>
            <div>
              <dt>Established</dt>
              <dd>{about.founded}</dd>
            </div>
            <div>
              <dt>Years of trusted trade</dt>
              <dd>3 decades</dd>
            </div>
            <div>
              <dt>Feed sectors served</dt>
              <dd>4</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ---------- Clientele ---------- */}
      <section className="section dealing" aria-labelledby="clientele-title">
        <div className="site-container">
          <SectionHead
            id="clientele-title"
            eyebrow="Our clientele"
            title="A thriving, robust clientele"
            text="Over the years, we have built a thriving, robust clientele spanning across the sector, including:"
          />
          <ul className="dealing__grid">
            {clientele.map((client, index) => (
              <li key={client.kind} className={`dealing-card dealing-card--${client.kind} about-client`} data-reveal data-reveal-delay={index * 110}>
                <span className="dealing-card__icon">
                  <span className="dealing-card__orbit" aria-hidden />
                  <DealingIcon kind={client.kind} still={reducedMotion} />
                </span>
                <h3>{client.title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Legacy ---------- */}
      <section className="section section--dark about-legacy" aria-labelledby="legacy-title">
        <div className="site-container split">
          <div data-reveal>
            <span className="eyebrow">Our legacy</span>
            <h2 id="legacy-title">Our Legacy: Trust, Transparency, and Direct Access</h2>
            <p className="about-legacy__text">
              Since our inception, our philosophy has been simple: empower our clients by helping them procure high-quality raw materials directly from the manufacturers
              at the best possible prices. We are known across the industry for our transparent nature, fair mediation, and unwavering commitment to the success of both
              our buyers and suppliers.
            </p>
            <blockquote className="about-legacy__quote">
              <p>We don&rsquo;t just broker deals; we build long-lasting partnerships.</p>
            </blockquote>
          </div>

          <ul className="about-pillars">
            {pillars.map(({ icon: Icon, title, text }, index) => (
              <li key={title} data-reveal data-reveal-delay={index * 110}>
                <span className="about-pillars__icon">
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
      </section>

      {/* ---------- Team ---------- */}
      <section className="section" aria-labelledby="team-title">
        <div className="site-container">
          <SectionHead
            id="team-title"
            eyebrow="Meet the team"
            title="Meet the Team Behind the Trade"
            text={`The enduring success of ${about.parent} and the vision for FeedXchange are driven by our dedicated leadership:`}
          />

          <article className="team-card team-card--featured" data-reveal>
            <div className="team-card__avatar" aria-hidden>
              {initials(founder.name)}
              <span className="team-card__award">
                <AwardIcon />
              </span>
            </div>
            <div className="team-card__body">
              <span className="team-card__tag">{founder.tag}</span>
              <h3>{founder.name}</h3>
              {founder.role && <p className="team-card__role">{founder.role}</p>}
              {founder.bio.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>

          <div className="team-grid">
            {members.map((member, index) => (
              <article key={member.name} className="team-card" data-reveal data-reveal-delay={index * 110}>
                <div className="team-card__head">
                  <div className="team-card__avatar" aria-hidden>
                    {initials(member.name)}
                  </div>
                  <div>
                    <h3>{member.name}</h3>
                    {member.role && <p className="team-card__role">{member.role}</p>}
                    <span className="team-card__tag">{member.tag}</span>
                  </div>
                </div>
                {member.bio.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FeedXchange ---------- */}
      <section className="section section--alt" aria-labelledby="evolution-title">
        <div className="site-container about-evolution">
          <div data-reveal>
            <SectionHead id="evolution-title" eyebrow="The next evolution" title="The Next Evolution: FeedXchange.in" align="left" />
            <div className="prose-site">
              <p>
                As an extension of our decades of offline service, we recognized the need to bring the animal feed market into the digital age. This vision led to the
                creation of FeedXchange.in&mdash;to our knowledge, the first-of-its-kind portal in India dedicated specifically to the animal feed ingredient trade.
              </p>
              <p>FeedXchange is designed to eliminate the guesswork and friction of traditional procurement. Through our platform, we offer:</p>
            </div>

            <ol className="about-timeline" aria-label="Our journey">
              {milestones.map((milestone) => (
                <li key={milestone.title}>
                  <strong>{milestone.title}</strong>
                  <p>{milestone.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <ul className="about-features" aria-label="What the platform offers">
            {platformFeatures.map(({ icon: Icon, title, text }, index) => (
              <li key={title} data-reveal data-reveal-delay={index * 90}>
                <span className="feature-card__icon">
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
      </section>

      {/* ---------- Mission ---------- */}
      <section className="section about-mission" aria-labelledby="mission-title">
        <div className="site-container" data-reveal>
          <span className="eyebrow" id="mission-title">
            Our Mission
          </span>
          <h2>
            Whether you are a manufacturer looking to expand your reach, a farmer seeking reliable raw materials, or a transporter moving the goods that feed the nation,
            our mission is to make your operations <em>smoother, faster, and more profitable.</em>
          </h2>
          <p>
            At Sri Sai Raghavendra Trade Services, we are proud of where we came from, and through FeedXchange.in, we are excited about where the industry is going.
          </p>
        </div>
      </section>

      <CtaBanner title="Partner with us today and experience the future of the animal feed trade." text="" />
    </>
  );
};

export default About;
