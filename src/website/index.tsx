import WebsiteRoutes from "./routes/WebsiteRoutes";
import "./styles/styles.scss";

/**
 * Entry point of the public website. App.tsx lazy-loads this file, so the website's code and styles
 * download only when someone opens a /website page, and never weigh down the admin application.
 */
const Website = () => <WebsiteRoutes />;

export default Website;
