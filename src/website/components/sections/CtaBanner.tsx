import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { company } from "../../data/content";
import { sitePaths } from "../../routes/paths";

const CtaBanner = () => (
  <section className="cta" aria-labelledby="cta-title">
    <div className="site-container">
      <div className="cta__box">
        <div>
          <h2 id="cta-title">Ready to grow your feed business?</h2>
          <p>Join {company.name} today and make your next trade your easiest one.</p>
        </div>
        <div className="cta__actions">
          <Link to={sitePaths.contact} className="btn-site btn-site--primary">
            Talk to our team <FiArrowRight aria-hidden />
          </Link>
          <Link to={sitePaths.login} className="btn-site btn-site--ghost">
            Login
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default CtaBanner;
