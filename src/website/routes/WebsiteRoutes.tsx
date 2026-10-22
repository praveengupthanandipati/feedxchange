import { Route, Routes } from "react-router-dom";
import WebsiteLayout from "../layout/WebsiteLayout";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import Services from "../pages/Services";

/**
 * Every website route. Mounted by App.tsx at "/website/*", so the paths here are relative:
 *   /website            → Home (index page)
 *   /website/about      → About
 *   /website/services   → Services
 *   /website/contact    → Contact
 *   /website/anything   → 404
 */
const WebsiteRoutes = () => (
  <Routes>
    <Route element={<WebsiteLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="services" element={<Services />} />
      <Route path="contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default WebsiteRoutes;
