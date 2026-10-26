import { useState } from "react";
import { PlusIcon } from "../../../shared/components/icon";
import CtaBanner from "../components/sections/CtaBanner";
import PageHero from "../components/sections/PageHero";
import { faqs } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

/** Accordion: one answer open at a time, with the same smooth height animation as the mobile menu. */
const Faqs = () => {
  usePageTitle("FAQ's", "Answers to common questions about trading, payments, quality checks and deliveries on FeedXchange.");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <PageHero title="FAQ's" text="Quick answers about trading, quality, logistics and payments on FeedXchange." />
      <section className="section">
        <div className="site-container">
          <ul className="faq-list">
            {faqs.map((faq, index) => {
              const open = openIndex === index;
              return (
                <li key={faq.question} className={`faq-item ${open ? "is-open" : ""}`} data-reveal data-reveal-delay={index * 60}>
                  <h2>
                    <button type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`} onClick={() => setOpenIndex(open ? null : index)}>
                      {faq.question}
                      <PlusIcon aria-hidden />
                    </button>
                  </h2>
                  <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} className="faq-item__answer">
                    <div>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <CtaBanner />
    </>
  );
};

export default Faqs;
