import { Route, Routes } from "react-router-dom";
import WebsiteLayout from "../layout/WebsiteLayout";
import About from "../pages/About";
import Blogs from "../pages/Blogs";
import Contact from "../pages/Contact";
import Faqs from "../pages/Faqs";
import Home from "../pages/Home";
import JoinUs from "../pages/JoinUs";
import NotFound from "../pages/NotFound";
import ProductDetail from "../pages/ProductDetail";
import Products from "../pages/Products";

/**
 * Every website route. Mounted by App.tsx at "/website/*", so the paths here are relative:
 *   /website                  → Home (index page)
 *   /website/about            → About
 *   /website/products         → All products
 *   /website/products/:slug   → One product (e.g. /website/products/maize-ddgs)
 *   /website/faqs             → FAQ's
 *   /website/blogs            → Blogs
 *   /website/contact          → Contact
 *   /website/join             → Join with us
 *   /website/anything-else    → 404
 */
const WebsiteRoutes = () => (
  <Routes>
    <Route element={<WebsiteLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:slug" element={<ProductDetail />} />
      <Route path="faqs" element={<Faqs />} />
      <Route path="blogs" element={<Blogs />} />
      <Route path="contact" element={<Contact />} />
      <Route path="join" element={<JoinUs />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default WebsiteRoutes;
