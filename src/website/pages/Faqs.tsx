import { useEffect, useState, type MouseEvent } from "react";
import { FiArrowRight, FiMessageCircle, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import CtaBanner from "../components/sections/CtaBanner";
import PageHero from "../components/sections/PageHero";
import { faqCategories } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { sitePaths } from "../routes/paths";

const totalQuestions = faqCategories.reduce((sum, category) => sum + category.items.length, 0);

/**
 * FAQs grouped by category. A category menu (sticky sidebar on laptops, scrolling chips on phones)
 * jumps to each group and highlights the one in view. Each group is an accordion.
 */
const Faqs = () => {
  usePageTitle("FAQ's");
  // Keyed "categoryId-index"; the first question starts open.
  const [openKey, setOpenKey] = useState<string | null>(`${faqCategories[0].id}-0`);
  const [activeId, setActiveId] = useState(faqCategories[0].id);
  const reducedMotion = useReducedMotion();

  // Scroll spy: the category nearest the top of the screen is marked active in the menu.
  useEffect(() => {
    const groups = faqCategories.map((category) => document.getElementById(`faq-${category.id}`)).filter((el): el is HTMLElement => el !== null);
    if (!groups.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id.replace("faq-", ""));
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    groups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, []);

  // Scroll in place rather than changing the URL hash, which the router owns.
  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActiveId(id);
    document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <PageHero title="Frequently Asked Questions (FAQ)" text="Everything you need to know about FeedXchange.in, organised by topic." />

      <section className="section">
        <div className="site-container faq-layout">
          <aside className="faq-nav" aria-label="FAQ categories">
            <p className="faq-nav__title">
              Browse by topic <span>{totalQuestions} questions</span>
            </p>
            <ul>
              {faqCategories.map(({ id, title, icon: Icon, items }) => (
                <li key={id}>
                  <a href={`#faq-${id}`} className={activeId === id ? "is-active" : undefined} aria-current={activeId === id ? "true" : undefined} onClick={(event) => goTo(event, id)}>
                    <Icon aria-hidden />
                    <span className="faq-nav__label">{title}</span>
                    <span className="faq-nav__count">{items.length}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="faq-help">
              <FiMessageCircle aria-hidden />
              <h2>Still have questions?</h2>
              <p>Our team is happy to help with anything not covered here.</p>
              <Link to={sitePaths.contact} className="faq-help__link">
                Contact us <FiArrowRight aria-hidden />
              </Link>
            </div>
          </aside>

          <div className="faq-groups">
            {faqCategories.map(({ id, title, icon: Icon, items }, categoryIndex) => (
              <section key={id} id={`faq-${id}`} className="faq-group" aria-labelledby={`faq-${id}-title`}>
                <header className="faq-group__head" data-reveal>
                  <span className="faq-group__icon">
                    <Icon aria-hidden />
                  </span>
                  <div>
                    <span className="faq-group__number">{String(categoryIndex + 1).padStart(2, "0")}</span>
                    <h2 id={`faq-${id}-title`}>{title}</h2>
                  </div>
                </header>

                <ul className="faq-list">
                  {items.map((faq, index) => {
                    const key = `${id}-${index}`;
                    const open = openKey === key;
                    return (
                      <li key={faq.question} className={`faq-item ${open ? "is-open" : ""}`} data-reveal data-reveal-delay={index * 60}>
                        <h3>
                          <button type="button" aria-expanded={open} aria-controls={`faq-answer-${key}`} id={`faq-question-${key}`} onClick={() => setOpenKey(open ? null : key)}>
                            {faq.question}
                            <FiPlus aria-hidden />
                          </button>
                        </h3>
                        <div id={`faq-answer-${key}`} role="region" aria-labelledby={`faq-question-${key}`} className="faq-item__answer">
                          <div>
                            <p>{faq.answer}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner />
    </>
  );
};

export default Faqs;
