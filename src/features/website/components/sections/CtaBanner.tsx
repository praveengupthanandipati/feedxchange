import { useId } from "react";
import { ArrowRightIcon } from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import { company } from "../../data/content";
import { sitePaths } from "../../routes/paths";

interface CtaBannerProps {
  title?: string;
  text?: string;
  /** One button instead of "Join with us" + "Explore products". */
  action?: { label: string; to: string };
}

const CtaBanner = ({ title = "Ready to grow your feed business?", text = `Join ${company.name} today and make your next trade your easiest one.`, action }: CtaBannerProps) => {
  const titleId = useId();
  return (
    <section className="cta" aria-labelledby={titleId}>
      <div className="site-container">
        <div className="cta__box" data-reveal>
          <div>
            <h2 id={titleId}>{title}</h2>
            {text && <p>{text}</p>}
          </div>
          <div className="cta__actions">
            {action ? (
              <Link to={action.to} className="btn-site btn-site--primary">
                {action.label} <ArrowRightIcon aria-hidden />
              </Link>
            ) : (
              <>
                <Link to={sitePaths.join} className="btn-site btn-site--primary">
                  Join with us <ArrowRightIcon aria-hidden />
                </Link>
                <Link to={sitePaths.products} className="btn-site btn-site--ghost">
                  Explore products
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
