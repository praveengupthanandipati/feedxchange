import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { ADMIN_LOGIN } from "../../core/routes/adminPaths";
import { isTauri } from "../../shared/notifications/desktopNotify";

const Home = lazy(() => import("./home/Home"));
const About = lazy(() => import("./about/About"));
const Products = lazy(() => import("./products/Products"));
const ProductDetail = lazy(() => import("./products/ProductDetail"));
const Faqs = lazy(() => import("./faqs/Faqs"));
const Blogs = lazy(() => import("./blogs/Blogs"));
const Contact = lazy(() => import("./contact/Contact"));
const JoinUs = lazy(() => import("./join/JoinUs"));
const NotFound = lazy(() => import("./not-found/NotFound"));

/**
 * The public website's routes, mounted at the root of the domain inside the website layout:
 *   /  /about  /products  /products/:slug  /faqs  /blogs  /contact  /join   (anything else: 404)
 */
export const websiteRoutes = (
  <>
    {/* the installed desktop app (Tauri) opens at sign-in, not the public home page */}
    <Route index element={isTauri() ? <Navigate to={ADMIN_LOGIN} replace /> : <Home />} />
    <Route path="about" element={<About />} />
    <Route path="products" element={<Products />} />
    <Route path="products/:slug" element={<ProductDetail />} />
    <Route path="faqs" element={<Faqs />} />
    <Route path="blogs" element={<Blogs />} />
    <Route path="contact" element={<Contact />} />
    <Route path="join" element={<JoinUs />} />
    <Route path="*" element={<NotFound />} />
  </>
);
