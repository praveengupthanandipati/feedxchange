import { useRef, type KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import CatalogueCard from "../components/common/CatalogueCard";
import CtaBanner from "../components/sections/CtaBanner";
import PageHero from "../components/sections/PageHero";
import { catalogue, catalogueCategories } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

const ALL = "all";
const tabs = [{ id: ALL, name: "All Products" }, ...catalogueCategories];

/**
 * Product catalogue with category tabs. The chosen tab lives in the URL (?category=doc), so it survives
 * a refresh and the back button returns to the same tab after opening a product.
 */
const Products = () => {
  usePageTitle("Products", "Distilled products, crude oil, DOC, maize DDGS, DORB and soya DOC: quality-tested feed ingredients on FeedXchange.");
  const [params, setParams] = useSearchParams();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeId = tabs.some((tab) => tab.id === params.get("category")) ? (params.get("category") as string) : ALL;
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const items = activeId === ALL ? catalogue : catalogue.filter((item) => item.categoryId === activeId);
  const countFor = (id: string) => (id === ALL ? catalogue.length : catalogue.filter((item) => item.categoryId === id).length);

  const select = (id: string) => setParams(id === ALL ? {} : { category: id }, { replace: true, preventScrollReset: true });

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : step ? (index + step + tabs.length) % tabs.length : -1;
    if (target < 0) return;
    event.preventDefault();
    select(tabs[target].id);
    tabRefs.current[target]?.focus();
  };

  return (
    <>
      <PageHero title="Products" text="Quality-checked feed ingredients from verified mills and processors across India." />

      <section className="section" aria-labelledby="catalogue-title">
        <div className="site-container">
          <div className="catalogue-tabs" role="tablist" aria-label="Product categories">
            {tabs.map((tab, index) => {
              const selected = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls="catalogue-panel"
                  tabIndex={selected ? 0 : -1}
                  className={`catalogue-tabs__tab ${selected ? "is-active" : ""}`}
                  onClick={() => select(tab.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                >
                  {tab.name}
                  <span className="catalogue-tabs__count">{countFor(tab.id)}</span>
                </button>
              );
            })}
          </div>

          <div id="catalogue-panel" role="tabpanel" aria-labelledby={`tab-${activeId}`}>
            <div className="catalogue-head">
              <h2 id="catalogue-title">{activeTab.name}</h2>
              <p>
                {items.length} {items.length === 1 ? "product" : "products"}
              </p>
            </div>
            {/* Keyed by tab so the cards replay their fade-in on every switch. */}
            <ul key={activeId} className="catalogue-grid">
              {items.map((item, index) => (
                <CatalogueCard key={item.slug} item={item} index={index} />
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
};

export default Products;
