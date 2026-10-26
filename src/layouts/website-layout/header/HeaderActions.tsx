import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ADMIN_LOGIN } from "../../../core/routes/adminPaths";
import { whatsappLink } from "../../../features/website/data/content";
import { sitePaths } from "../../../features/website/routes/paths";

/** "Join with us" button. Hidden on small phones, where it lives in the off-canvas menu instead. */
export const JoinButton = ({ className = "" }: { className?: string }) => (
  <Link to={sitePaths.join} className={`btn-site btn-site--primary site-join ${className}`}>
    Join with us <FiArrowRight aria-hidden />
  </Link>
);

/** "Login" link to the signed-in application (/admin/login). Hidden on small phones, where it lives in the off-canvas menu instead. */
export const LoginLink = ({ className = "" }: { className?: string }) => (
  <Link to={ADMIN_LOGIN} className={`site-login ${className}`}>
    <FiLogIn aria-hidden /> Login
  </Link>
);

/** Round WhatsApp chat button, opens WhatsApp (app on phones, web on desktops) in a new tab. */
export const WhatsAppButton = ({ className = "" }: { className?: string }) => (
  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`site-whatsapp ${className}`} aria-label="Chat with us on WhatsApp" title="Chat on WhatsApp">
    <FaWhatsapp aria-hidden />
  </a>
);
