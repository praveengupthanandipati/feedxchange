import { ArrowRightIcon } from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import { company } from "../../data/content";
import { sitePaths } from "../../routes/paths";

interface CtaBannerProps {
  title?: string;
  text?: string;
}

const CtaBanner = ({ title = "Ready to grow your feed business?", text = `Join ${company.name} today and make your next trade your easiest one.` }: CtaBannerProps) => (
  <section className="cta" aria-labelledby="cta-title">
    <div className="site-container">
      <div className="cta__box" data-reveal>
        <div>
          <h2 id="cta-title">{title}</h2>
          {text && <p>{text}</p>}
        </div>
        <div className="cta__actions">
          <Link to={sitePaths.join} className="btn-site btn-site--primary">
            Join with us <ArrowRightIcon aria-hidden />
          </Link>
          <Link to={sitePaths.products} className="btn-site btn-site--ghost">
            Explore products
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default CtaBanner;
