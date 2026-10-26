import type { MouseEvent } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiCheck, FiCheckCircle, FiShare2 } from "react-icons/fi";
import { useParams } from "react-router-dom";
import placeholderImage from "../assets/images/product-placeholder.svg";
import CatalogueCard from "../components/common/CatalogueCard";
import SectionHead from "../components/common/SectionHead";
import EnquiryForm from "../components/products/EnquiryForm";
import PriceHistory from "../components/products/PriceHistory";
import PageHero from "../components/sections/PageHero";
import { catalogue, categoryForSlug, findProduct } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";
import { sitePaths } from "../routes/paths";
import NotFound from "./NotFound";

const highlights = ["Sourced from KYC-verified sellers", "Specification sheet with every lot", "Transport and tracking available"];

const ProductDetail = () => {
  const { slug } = useParams();
  const product = findProduct(slug);
  usePageTitle(product?.name ?? "Product not found");

  if (!product) return <NotFound />;
  const category = categoryForSlug(product.slug);

  // Same category first, topped up from the rest of the catalogue: always 5 (one full row on laptops).
  const rest = catalogue.filter((item) => item.slug !== product.slug);
  const others = [...rest.filter((item) => item.categoryId === category?.id), ...rest.filter((item) => item.categoryId !== category?.id)].slice(0, 5);

  const shareText = `${product.name} on FeedXchange: ${window.location.href}`;
  // Phones get the native share sheet; everything else opens WhatsApp with the link filled in.
  const share = (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof navigator.share !== "function") return;
    event.preventDefault();
    navigator.share({ title: product.name, url: window.location.href }).catch(() => undefined);
  };

  return (
    <>
      <PageHero title={product.name} text={product.summary} parent={{ label: "Products", to: sitePaths.products }} />

      <section className="section pd">
        <div className="site-container pd__layout">
          <div className="pd__main">
            {/* ---------- Product ---------- */}
            <article className="pd-card pd-product" aria-labelledby="pd-name" data-reveal>
              <div className="pd-product__image">
                <img src={placeholderImage} alt={product.name} width={320} height={240} />
                {category && <span className="catalogue-card__tag">{category.name}</span>}
              </div>

              <div className="pd-product__info">
                <div className="pd-product__top">
                  <h2 id="pd-name">{product.name}</h2>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="pd-share" onClick={share}>
                    <FaWhatsapp aria-hidden className="pd-share__wa" />
                    Share
                    <FiShare2 aria-hidden className="pd-share__icon" />
                  </a>
                </div>
                <p className="pd-product__text">{product.description}</p>
                <ul className="check-list">
                  {highlights.map((line) => (
                    <li key={line}>
                      <span aria-hidden>
                        <FiCheck />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* ---------- Price history ---------- */}
            {category && <PriceHistory seed={product.slug} basePrice={category.basePrice} />}

            {/* ---------- Nutrition ---------- */}
            {category && (
              <section className="pd-card" aria-labelledby="pd-nutrition" data-reveal>
                <div className="pd-card__head">
                  <h2 id="pd-nutrition">Nutritions</h2>
                  <p>Typical range per lot</p>
                </div>
                <ul className="nutrient-grid">
                  {category.nutrition.map((nutrient) => (
                    <li key={nutrient.name} className="nutrient">
                      <h3>{nutrient.name}</h3>
                      <dl>
                        <div>
                          <dt>Min</dt>
                          <dd>{nutrient.min}</dd>
                        </div>
                        <div>
                          <dt>Max</dt>
                          <dd>{nutrient.max}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ---------- Nutritional value and uses ---------- */}
            {category && (
              <section className="pd-card" aria-labelledby="pd-uses" data-reveal>
                <div className="pd-card__head">
                  <h2 id="pd-uses">Nutritional Value and Uses</h2>
                </div>
                <ul className="uses-list">
                  {category.uses.map((use) => (
                    <li key={use.label}>
                      <FiCheckCircle aria-hidden />
                      <div>
                        <strong>{use.value}:</strong>
                        <span>{use.label}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ---------- Enquiry (sticky on laptops) ---------- */}
          <aside className="pd__aside" aria-label="Send an enquiry" data-reveal data-reveal-delay="120">
            <EnquiryForm key={product.slug} productName={product.name} />
          </aside>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="more-title">
        <div className="site-container">
          <SectionHead id="more-title" eyebrow="Explore more" title="Other products" />
          <ul className="catalogue-grid">
            {others.map((item, index) => (
              <CatalogueCard key={item.slug} item={item} index={index} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
