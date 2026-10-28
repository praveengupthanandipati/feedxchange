import { ArrowRightIcon, ClockIcon } from "../../../shared/components/icon";
import PageHero from "../components/sections/PageHero";
import { blogPosts } from "../data/content";
import { usePageTitle } from "../hooks/usePageTitle";

const Blogs = () => {
  usePageTitle("Blogs", "Market notes, price trends and practical guides for feed ingredient buyers and sellers.");

  return (
    <>
      <PageHero title="Blogs" text="Market insights, nutrition tips and platform news from the FeedXchange team." />
      <section className="section">
        <div className="site-container">
          <ul className="card-grid">
            {blogPosts.map((post, index) => (
              <li key={post.title} className="blog-card" data-reveal data-reveal-delay={(index % 3) * 100}>
                {/* Coloured cover until real blog images are uploaded. */}
                <div className={`blog-card__cover blog-card__cover--${index % 3}`} aria-hidden>
                  <span>{post.category}</span>
                </div>
                <div className="blog-card__body">
                  <p className="blog-card__meta">
                    <time>{post.date}</time>
                    <span aria-hidden>·</span>
                    <span>
                      <ClockIcon aria-hidden /> {post.readTime}
                    </span>
                  </p>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  {/* TODO: link to the full post once blog detail pages exist. */}
                  <span className="product-card__more">
                    Read more <ArrowRightIcon aria-hidden />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Blogs;
