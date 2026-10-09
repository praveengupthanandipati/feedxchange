import { useId, useState, type ReactNode } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface DetailSectionProps {
  title: string;
  /** Optional line of context under the title. */
  subtitle?: ReactNode;
  /** Extra header buttons, shown before the Hide/Show toggle. */
  actions?: ReactNode;
  children: ReactNode;
}

/** White card with a title and a Hide/Show toggle for its body. */
const DetailSection = ({ title, subtitle, actions, children }: DetailSectionProps) => {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  return (
    <section className="dispatch-section">
      <header className="dispatch-section__header">
        <div className="dispatch-section__titles">
          <h2>{title}</h2>
          {subtitle && <div className="dispatch-section__subtitle">{subtitle}</div>}
        </div>
        <div className="dispatch-section__header-actions">
          {open && actions}
          <button
            type="button"
            className="dispatch-section__toggle"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls={bodyId}
          >
            {open ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </header>
      {open && (
        <div id={bodyId} className="dispatch-section__body">
          {children}
        </div>
      )}
    </section>
  );
};

export default DetailSection;
