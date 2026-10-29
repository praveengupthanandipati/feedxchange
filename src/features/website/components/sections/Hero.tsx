import type { CSSProperties } from "react";
import { CircleCheckBigIcon } from "../../../../shared/components/icon";
import { heroImage } from "../../assets/images/hero/heroImage";
import { hero } from "../../data/content";
import BannerCarousel from "./BannerCarousel";
import ProductSearch from "./ProductSearch";

/** Home banner: the admin banners sliding behind (or the photo until they load), short headline and the product search. */
const Hero = () => (
  <section className="hero" aria-labelledby="hero-title" style={{ "--hero-bg": `url(${heroImage()})` } as CSSProperties}>
    <BannerCarousel />
    <div className="site-container hero__inner">
      <span className="eyebrow">{hero.eyebrow}</span>
      <h1 id="hero-title">{hero.title}</h1>
      <p className="hero__text">{hero.text}</p>
      <ProductSearch />
      <ul className="hero__points">
        <li>
          <CircleCheckBigIcon aria-hidden /> KYC-verified partners
        </li>
        <li>
          <CircleCheckBigIcon aria-hidden /> No hidden commissions
        </li>
      </ul>
    </div>
  </section>
);

export default Hero;
