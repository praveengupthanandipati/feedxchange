import { FiStar } from "react-icons/fi";
import { testimonials } from "../../data/content";
import SectionHead from "../common/SectionHead";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

const Testimonials = () => (
  <section className="section" aria-labelledby="testimonials-title">
    <div className="site-container">
      <SectionHead id="testimonials-title" eyebrow="Testimonials" title="Businesses that trade better with us" />
      <ul className="card-grid card-grid--3">
        {testimonials.map((item) => (
          <li key={item.name} className="quote-card">
            <div className="quote-card__stars" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }, (_, index) => (
                <FiStar key={index} aria-hidden />
              ))}
            </div>
            <blockquote>“{item.quote}”</blockquote>
            <div className="quote-card__author">
              <span aria-hidden>{initials(item.name)}</span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.role}</small>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Testimonials;
