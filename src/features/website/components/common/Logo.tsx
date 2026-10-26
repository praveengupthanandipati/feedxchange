import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import { company } from "../../data/content";
import { sitePaths } from "../../routes/paths";

interface LogoProps {
  /** On dark backgrounds (footer) the navy logo sits on a white pill so it stays readable. */
  inverse?: boolean;
}

/** The FeedXchange wordmark (591 × 96), linking home. */
const Logo = ({ inverse = false }: LogoProps) => (
  <Link to={sitePaths.home} className={`site-logo ${inverse ? "site-logo--inverse" : ""}`}>
    <img src={logo} alt={company.name} width={591} height={96} />
  </Link>
);

export default Logo;
