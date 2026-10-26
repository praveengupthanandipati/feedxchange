import { Link, Outlet, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export interface WizardStepDef {
  path: string;
  label: string;
}

interface WizardLayoutProps {
  title: string;
  backTo: string;
  backLabel: string;
  steps: WizardStepDef[];
  /** Once true, every step becomes clickable — before that, only the first step is reachable. */
  unlocked: boolean;
  lockedMessage: string;
}

// Shared shell for multi-step "wizard" forms (Business Owners, Transporters,
// …): a back link, a step strip that locks everything after step 1 until
// `unlocked` flips true, and an <Outlet/> for the active step's page.
const WizardLayout = ({ title, backTo, backLabel, steps, unlocked, lockedMessage }: WizardLayoutProps) => {
  const location = useLocation();

  return (
    <div className="new-business">
      <div className="new-business__topbar">
        <div className="new-business__topbar-left">
          <h1>{title}</h1>
        </div>
        <Link to={backTo} className="new-business__back">
          <FiArrowLeft aria-hidden /> {backLabel}
        </Link>
      </div>

      <nav className="new-business__steps" aria-label={`${title} steps`}>
        {steps.map((step, index) => {
          const locked = index > 0 && !unlocked;
          const active = location.pathname === step.path;
          const content = (
            <>
              <span className="new-business__step-index">{index + 1}</span>
              {step.label}
            </>
          );

          return locked ? (
            <span
              key={step.path}
              className="new-business__step new-business__step--locked"
              title={lockedMessage}
            >
              {content}
            </span>
          ) : (
            <Link
              key={step.path}
              to={step.path}
              className={`new-business__step${active ? " new-business__step--active" : ""}`}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
};

export default WizardLayout;
