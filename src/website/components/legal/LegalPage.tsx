import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { FiCalendar, FiChevronDown, FiShield } from "react-icons/fi";
import type { PolicyPoint, PolicySection } from "../../data/legal";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import PageHero from "../sections/PageHero";

const number = (index: number) => String(index + 1).padStart(2, "0");

const Points = ({ points, nested = false }: { points: PolicyPoint[]; nested?: boolean }) => (
  <ul className={`legal-points ${nested ? "legal-points--nested" : ""}`}>
    {points.map((point) => (
      <li key={`${point.label ?? ""}${point.text ?? ""}`}>
        {point.label && <strong>{point.label}: </strong>}
        {point.text}
        {point.points && <Points points={point.points} nested />}
      </li>
    ))}
  </ul>
);

interface LegalPageProps {
  title: string;
  updated: string;
  sections: PolicySection[];
  /** Short reassurance shown beside the date, e.g. "Your data, protected". */
  badge: string;
  /** Extra content placed at the end of a section, keyed by section id. */
  extras?: Record<string, ReactNode>;
}

/**
 * Legal document page (Privacy Policy, Terms and Conditions): numbered sections with a contents menu
 * (sticky sidebar on laptops, a fold-out list on phones) that highlights the section being read.
 */
const LegalPage = ({ title, updated, sections, badge, extras = {} }: LegalPageProps) => {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const [tocOpen, setTocOpen] = useState(false);

  // Scroll spy: the section nearest the top of the screen is marked in the menu.
  useEffect(() => {
    const elements = sections.map((section) => document.getElementById(section.id)).filter((el): el is HTMLElement => el !== null);
    if (!elements.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Scroll in place rather than changing the URL hash, which the router owns.
  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActiveId(id);
    setTocOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <PageHero title={title} text={`Last Updated: ${updated}`} />

      <section className="section legal">
        <div className="site-container legal__layout">
          {/* ---------- Contents ---------- */}
          <nav className="legal-toc" aria-label={`${title} sections`}>
            <button type="button" className="legal-toc__toggle" aria-expanded={tocOpen} aria-controls="legal-toc-list" onClick={() => setTocOpen((prev) => !prev)}>
              On this page
              <FiChevronDown aria-hidden />
            </button>
            <div id="legal-toc-list" className={`legal-toc__panel ${tocOpen ? "is-open" : ""}`}>
              <ol>
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={activeId === section.id ? "is-active" : undefined}
                      aria-current={activeId === section.id ? "true" : undefined}
                      onClick={(event) => goTo(event, section.id)}
                    >
                      <span>{number(index)}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          {/* ---------- Document ---------- */}
          <article className="legal-doc">
            <header className="legal-doc__meta">
              <span className="legal-doc__badge">
                <FiShield aria-hidden /> {badge}
              </span>
              <span className="legal-doc__date">
                <FiCalendar aria-hidden /> Last Updated: <time>{updated}</time>
              </span>
            </header>

            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="legal-section" aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`}>
                  <span className="legal-section__number">{number(index)}</span>
                  {section.title}
                </h2>
                {section.intro?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.points && <Points points={section.points} />}
                {extras[section.id]}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
};

export default LegalPage;
