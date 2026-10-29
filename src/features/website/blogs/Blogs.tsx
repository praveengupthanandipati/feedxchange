import { useMemo } from "react";
import { ArrowRightIcon, UserIcon } from "../../../shared/components/icon";
import { API_URL } from "../../../core/api/api";
import { useGetAllBloggersQuery } from "../../../core/store/bloggersApi";
import PageHero from "../components/sections/PageHero";
import { usePageTitle } from "../hooks/usePageTitle";

const isHttpUrl = (value: string | null | undefined) => /^https?:\/\//i.test(value ?? "");

/** "18 Oct 2026", or "" when the API sends no usable date. */
const formatDate = (value: string | null) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
};

/** Blogs: the active posts from GetAllBloggers (public), in their admin priority order. */
const Blogs = () => {
  usePageTitle("Blogs", "Market notes, price trends and practical guides for feed ingredient buyers and sellers.");
  const { data, isLoading, isError } = useGetAllBloggersQuery();

  const posts = useMemo(() => (data ?? []).filter((post) => post.isActive).sort((a, b) => a.priority - b.priority), [data]);

  const status = isLoading
    ? "Loading blog posts…"
    : isError
      ? "The blog posts could not be loaded. Please refresh the page."
      : posts.length === 0
        ? "No blog posts yet. Check back soon."
        : "";

  return (
    <>
      <PageHero title="Blogs" text="Market insights, nutrition tips and platform news from the FeedXchange team." />
      <section className="section">
        <div className="site-container">
          {status ? (
            <p className="blog-status" role="status">
              {status}
            </p>
          ) : (
            <ul className="card-grid">
              {posts.map((post, index) => {
                const title = post.name?.trim() || "Untitled post";
                const date = formatDate(post.createdAt);
                return (
                  <li key={post.id} className="blog-card" data-reveal data-reveal-delay={(index % 3) * 100}>
                    {/* The post's image; a coloured cover when it has none. */}
                    <div className={`blog-card__cover blog-card__cover--${index % 3}`} aria-hidden>
                      {post.fileName && <img src={`${API_URL}${post.fileName}`} alt="" loading="lazy" decoding="async" />}
                    </div>
                    <div className="blog-card__body">
                      {(date || post.createdByName) && (
                        <p className="blog-card__meta">
                          {date && <time dateTime={post.createdAt ?? undefined}>{date}</time>}
                          {date && post.createdByName && <span aria-hidden>·</span>}
                          {post.createdByName && (
                            <span>
                              <UserIcon aria-hidden /> {post.createdByName}
                            </span>
                          )}
                        </p>
                      )}
                      <h2>{title}</h2>
                      {post.description && <p>{post.description}</p>}
                      {isHttpUrl(post.link_URL) && (
                        <a href={post.link_URL ?? undefined} target="_blank" rel="noopener noreferrer" className="product-card__more">
                          Read more <ArrowRightIcon aria-hidden />
                          <span className="visually-hidden-site"> about {title} (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
};

export default Blogs;
