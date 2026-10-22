import { steps } from "../../data/content";
import SectionHead from "../common/SectionHead";

const HowItWorks = () => (
  <section className="section section--alt" aria-labelledby="steps-title">
    <div className="site-container">
      <SectionHead id="steps-title" eyebrow="How it works" title="From sign-up to settlement in four steps" />
      <ol className="steps">
        {steps.map((step, index) => (
          <li key={step.title} className="steps__item">
            <span className="steps__number" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default HowItWorks;
