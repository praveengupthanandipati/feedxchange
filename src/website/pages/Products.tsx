import ProductCard from "../components/common/ProductCard";
import CtaBanner from "../components/sections/CtaBanner";
import PageHero from "../components/sections/PageHero";
import { products } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

const Products = () => {
  usePageTitle("Products");

  return (
    <>
      <PageHero title="Products" text="Quality-checked feed ingredients from verified mills and processors across India." />
      <section className="section">
        <div className="site-container">
          <ul className="card-grid">
            {products.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </ul>
        </div>
      </section>
      <CtaBanner />
    </>
  );
};

export default Products;
