import { FaWhatsapp } from "react-icons/fa";
import { ArrowRightIcon, CheckIcon } from "../../../shared/components/icon";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/common/ProductCard";
import SectionHead from "../components/common/SectionHead";
import PageHero from "../components/sections/PageHero";
import { products, whatsappLink } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";
import { sitePaths } from "../routes/paths";
import NotFound from "../not-found/NotFound";

const ProductDetail = () => {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug);
  usePageTitle(product?.name ?? "Product not found", product?.description);

  if (!product) return <NotFound />;
  const others = products.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <>
      <PageHero title={product.name} text={product.summary} parent={{ label: "Products", to: sitePaths.products }} />

      <section className="section">
        <div className="site-container product-detail">
          <div className="prose-site" data-reveal>
            <p>{product.description}</p>
            <ul className="check-list">
              <li>
                <span aria-hidden>
                  <CheckIcon />
                </span>
                Sourced from KYC-verified sellers
              </li>
              <li>
                <span aria-hidden>
                  <CheckIcon />
                </span>
                Specification sheet with every lot
              </li>
              <li>
                <span aria-hidden>
                  <CheckIcon />
                </span>
                Transport and tracking available
              </li>
            </ul>
          </div>

          <aside className="spec-card" aria-labelledby="spec-title" data-reveal data-reveal-delay="120">
            <h2 id="spec-title">Typical specifications</h2>
            <dl>
              {product.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
            <Link to={sitePaths.join} className="btn-site btn-site--primary btn-site--block">
              Request a quote <ArrowRightIcon aria-hidden />
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-site btn-site--outline btn-site--block">
              <FaWhatsapp aria-hidden /> Ask on WhatsApp
            </a>
          </aside>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="more-title">
        <div className="site-container">
          <SectionHead id="more-title" eyebrow="Explore more" title="Other products" />
          <ul className="card-grid">
            {others.map((item, index) => (
              <ProductCard key={item.slug} product={item} index={index} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
