import { BlogActions, BlogLink, BlogStatusBadge } from "./BlogBits";
import type { BlogListProps } from "./BlogsTable";

/** Phones and tablets: one card per blog instead of the wide table. */
const BlogCards = ({ rows, emptyMessage, onEdit, onDelete }: BlogListProps) => (
  <ul className="blogs__cards">
    {rows.length === 0 && <li className="blogs__cards-empty">{emptyMessage}</li>}
    {rows.map((blog) => (
      <li key={blog.id} className="blogs__card">
        <img className="blogs__card-image" src={blog.image} alt={blog.title} loading="lazy" />
        <div className="blogs__card-body">
          <div className="blogs__card-top">
            <strong>{blog.title}</strong>
            <BlogActions blog={blog} onEdit={onEdit} onDelete={onDelete} />
          </div>
          {blog.description && <p className="blogs__card-description">{blog.description}</p>}
          <p className="blogs__card-link">
            <BlogLink link={blog.link} />
          </p>
          <div className="blogs__card-meta">
            <span>Priority {blog.priority}</span>
            <BlogStatusBadge status={blog.status} />
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default BlogCards;
