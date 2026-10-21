import { Link } from "react-router-dom";
import logoMark from "../../assets/images/logo-mark.svg";
import { company } from "../../data/content";
import { sitePaths } from "../../routes/paths";

interface LogoProps {
  /** Light text for dark backgrounds (footer). */
  inverse?: boolean;
}

const Logo = ({ inverse = false }: LogoProps) => (
  <Link to={sitePaths.home} className={`site-logo ${inverse ? "site-logo--inverse" : ""}`} aria-label={`${company.name} home`}>
    <img src={logoMark} alt="" width={40} height={40} />
    <span>
      Feed<strong>Xchange</strong>
    </span>
  </Link>
);

export default Logo;
