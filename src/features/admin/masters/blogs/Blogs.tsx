import { useCallback, useMemo, useState } from "react";
import { CircleCheckBigIcon } from "../../../../shared/components/icon";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import { initialBlogs, type Blog, type BlogForm } from "./blogs.data";
import { matchesSearch } from "./blogs.utils";
import BlogCards from "./components/BlogCards";
import BlogOffcanvas from "./components/BlogOffcanvas";
import BlogsFilters from "./components/BlogsFilters";
import BlogsHeader from "./components/BlogsHeader";
import BlogsPagination from "./components/BlogsPagination";
import BlogsTable from "./components/BlogsTable";
import "./Blogs.scss";

const PAGE_SIZE = 10;

/** Which blog the panel is open for: a new one, an existing one, or closed. */
type PanelState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; blog: Blog };

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [deleting, setDeleting] = useState<Blog | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(
    () => blogs.filter((blog) => matchesSearch(blog, search) && (!status || blog.status === status)).sort((a, b) => a.priority - b.priority),
    [blogs, search, status],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = search.trim() || status ? "No blogs match the current filters." : "No blogs yet. Use New to add one.";

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);

  const openPanel = (next: PanelState) => {
    setMessage("");
    setPanel(next);
  };

  const handleSave = (form: BlogForm) => {
    const values = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image,
      link: form.link.trim(),
      priority: Number(form.priority),
      status: form.status,
    };
    // TODO: send the blog (and uploaded image) to the API once the endpoint is available.
    if (panel.mode === "edit") {
      setBlogs((prev) => prev.map((blog) => (blog.id === panel.blog.id ? { ...blog, ...values } : blog)));
      setMessage(`"${values.title}" updated.`);
    } else {
      setBlogs((prev) => [...prev, { id: `${Date.now()}`, ...values }]);
      setMessage(`"${values.title}" created.`);
    }
    closePanel();
  };

  return (
    <div className="blogs">
      <BlogsHeader filtersVisible={filtersVisible} onToggleFilters={() => setFiltersVisible((prev) => !prev)} onNew={() => openPanel({ mode: "create" })} />

      {filtersVisible && (
        <BlogsFilters
          search={search}
          status={status}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      )}

      {message && (
        <p className="blogs__message" role="status">
          <CircleCheckBigIcon aria-hidden /> {message}
        </p>
      )}

      <BlogsTable rows={paged} emptyMessage={emptyMessage} onEdit={(blog) => openPanel({ mode: "edit", blog })} onDelete={setDeleting} />
      <BlogCards rows={paged} emptyMessage={emptyMessage} onEdit={(blog) => openPanel({ mode: "edit", blog })} onDelete={setDeleting} />

      <BlogsPagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      {panel.mode !== "closed" && (
        <BlogOffcanvas
          // A fresh form each time the panel opens for a different blog.
          key={panel.mode === "edit" ? panel.blog.id : "new"}
          blog={panel.mode === "edit" ? panel.blog : null}
          blogs={blogs}
          onSave={handleSave}
          onClose={closePanel}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete blog"
        message={deleting ? `Delete "${deleting.title}"? This cannot be undone.` : ""}
        onConfirm={() => {
          // TODO: send the delete to the API once the endpoint is available.
          if (deleting) {
            setBlogs((prev) => prev.filter((blog) => blog.id !== deleting.id));
            setMessage(`"${deleting.title}" deleted.`);
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default Blogs;
