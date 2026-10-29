import type { MouseEvent } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { CheckIcon, CircleCheckBigIcon, Share2Icon } from "../../../shared/components/icon";
import { useParams } from "react-router-dom";
import placeholderImage from "../assets/images/product-placeholder.svg";
import CatalogueCard from "../components/common/CatalogueCard";
import SectionHead from "../components/common/SectionHead";
import EnquiryForm from "../components/products/EnquiryForm";
import PriceHistory from "../components/products/PriceHistory";
import PageHero from "../components/sections/PageHero";
import { useCatalogue } from "../hooks/useCatalogue";
import { usePageTitle } from "../hooks/usePageTitle";
import { sitePaths } from "../routes/paths";
import NotFound from "../not-found/NotFound";

const highlights = ["Sourced from KYC-verified sellers", "Specification sheet with every lot", "Transport and tracking available"];

const ProductDetail = () => {
  const { slug } = useParams();
  const { products: catalogue, findBySlug, isLoading } = useCatalogue();
  const product = findBySlug(slug);
  usePageTitle(product?.name ?? (isLoading ? "Products" : "Product not found"), product?.description);

  if (isLoading) return <PageHero title="Loading product…" text="One moment, fetching the latest details." parent={{ label: "Products", to: sitePaths.products }} />;
  if (!product) return <NotFound />;
  const summary = `${product.categoryName} from verified manufacturers, at transparent, real-time prices.`;
  const description =
    product.description ||
    `${product.name} sourced from verified manufacturers and traded through FeedXchange at transparent, real-time prices. Final specifications and pricing are confirmed when the contract is executed.`;
  // The chart works in ₹ per MT; the catalogue price is usually per kg.
  const pricePerMt = /kg/i.test(product.weightClause) ? product.price * 1000 : product.price;

  // Same category first, topped up from the rest of the catalogue: always 5 (one full row on laptops).
  const rest = catalogue.filter((item) => item.id !== product.id);
  const others = [...rest.filter((item) => item.categoryId === product.categoryId), ...rest.filter((item) => item.categoryId !== product.categoryId)].slice(0, 5);

  const shareText = `${product.name} on FeedXchange: ${window.location.href}`;
  // Phones get the native share sheet; everything else opens WhatsApp with the link filled in.
  const share = (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof navigator.share !== "function") return;
    event.preventDefault();
    navigator.share({ title: product.name, url: window.location.href }).catch(() => undefined);
  };

  return (
    <>
      <PageHero title={product.name} text={summary} parent={{ label: "Products", to: sitePaths.products }} />

      <section className="section pd">
        <div className="site-container pd__layout">
          <div className="pd__main">
            {/* ---------- Product ---------- */}
            <article className="pd-card pd-product" aria-labelledby="pd-name" data-reveal>
              <div className="pd-product__image">
                <img src={product.image ?? placeholderImage} alt={product.name} width={320} height={240} />
                <span className="catalogue-card__tag">{product.categoryName}</span>
              </div>

              <div className="pd-product__info">
                <div className="pd-product__top">
                  <h2 id="pd-name">{product.name}</h2>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="pd-share" onClick={share}>
                    <FaWhatsapp aria-hidden className="pd-share__wa" />
                    Share
                    <Share2Icon aria-hidden className="pd-share__icon" />
                  </a>
                </div>
                <p className="pd-product__text">{description}</p>
                <ul className="check-list">
                  {highlights.map((line) => (
                    <li key={line}>
                      <span aria-hidden>
                        <CheckIcon />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* ---------- Price history ---------- */}
            {pricePerMt > 0 && <PriceHistory seed={product.slug} basePrice={pricePerMt} />}

            {/* ---------- Nutrition ---------- */}
            {product.nutrition.length > 0 && (
              <section className="pd-card" aria-labelledby="pd-nutrition" data-reveal>
                <div className="pd-card__head">
                  <h2 id="pd-nutrition">Nutritions</h2>
                  <p>Typical range per lot</p>
                </div>
                <ul className="nutrient-grid">
                  {product.nutrition.map((nutrient) => (
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
            {product.uses.length > 0 && (
              <section className="pd-card" aria-labelledby="pd-uses" data-reveal>
                <div className="pd-card__head">
                  <h2 id="pd-uses">Nutritional Value and Uses</h2>
                </div>
                <ul className="uses-list">
                  {product.uses.map((use) => (
                    <li key={use.label}>
                      <CircleCheckBigIcon aria-hidden />
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
              <CatalogueCard key={item.id} item={item} index={index} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
