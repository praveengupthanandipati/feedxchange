import type { ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const AccordionSection = ({ title, isOpen, onToggle, children }: AccordionSectionProps) => (
  <section className={`new-contract__section accordion-section ${isOpen ? "is-open" : ""}`}>
    <button
      type="button"
      className="accordion-section__header"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <h2 className="new-contract__section-title">{title}</h2>
      <FiChevronDown className="accordion-section__chevron" aria-hidden />
    </button>

    {isOpen && <div className="accordion-section__body">{children}</div>}
  </section>
);

export default AccordionSection;
