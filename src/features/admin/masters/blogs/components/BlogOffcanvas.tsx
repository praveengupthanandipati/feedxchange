import { useEffect, useMemo, useRef, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import { EMPTY_FORM, MAX_DESCRIPTION_WORDS, STATUS_OPTIONS, type Blog, type BlogForm, type BlogStatus } from "../blogs.data";
import { countWords, priorityOptions, toForm, validateBlog, type FormErrors } from "../blogs.utils";
import BlogImageField from "./BlogImageField";

interface BlogOffcanvasProps {
  /** The blog being edited, or null to create a new one. */
  blog: Blog | null;
  blogs: Blog[];
  onSave: (form: BlogForm) => void;
  onClose: () => void;
}

type FieldKey = keyof FormErrors;

/** Create / Edit panel sliding in from the right: half the viewport from tablets up, full width on phones. */
const BlogOffcanvas = ({ blog, blogs, onSave, onClose }: BlogOffcanvasProps) => {
  const [form, setForm] = useState<BlogForm>(blog ? toForm(blog) : EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = blog !== null;
  const words = countWords(form.description);
  const priorities = useMemo(() => priorityOptions(blogs.length), [blogs.length]);

  useEffect(() => {
    titleRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    // Stop the page behind from scrolling while the panel is open (iOS Safari included).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const set = <K extends keyof BlogForm>(key: K, value: BlogForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateBlog(form, blogs, blog?.id ?? null);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      // Take the user to the first problem, which may be scrolled out of view on phones.
      const first = (Object.keys(found) as FieldKey[]).find((key) => found[key]);
      if (first) document.getElementById(`blog-${first}`)?.focus();
      return;
    }
    onSave(form);
  };

  const describedBy = (key: FieldKey, extra?: string) => [errors[key] ? `blog-${key}-error` : "", extra ?? ""].filter(Boolean).join(" ") || undefined;

  const error = (key: FieldKey) =>
    errors[key] && (
      <small id={`blog-${key}-error`} className="blog-panel__error">
        {errors[key]}
      </small>
    );

  return createPortal(
    <>
      <div className="blog-panel__backdrop" onClick={onClose} aria-hidden />
      <aside className="blog-panel" role="dialog" aria-modal="true" aria-labelledby="blog-panel-title">
        <header className="blog-panel__header">
          <h2 id="blog-panel-title">{isEdit ? "Edit Blog" : "Create Blog"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <XIcon aria-hidden />
          </button>
        </header>

        <form className="blog-panel__body" onSubmit={handleSubmit} noValidate>
          <div className="blog-panel__field">
            <label htmlFor="blog-title" className="blog-panel__label">
              Blog Title <span className="blog-panel__required" aria-hidden>*</span>
            </label>
            <input
              ref={titleRef}
              id="blog-title"
              type="text"
              autoComplete="off"
              className={`blog-panel__input ${errors.title ? "is-invalid" : ""}`}
              placeholder="Enter blog title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy("title")}
              aria-required
            />
            {error("title")}
          </div>

          <div className="blog-panel__field">
            <label htmlFor="blog-description" className="blog-panel__label">
              Description (max {MAX_DESCRIPTION_WORDS} words)
            </label>
            <textarea
              id="blog-description"
              rows={3}
              className={`blog-panel__input blog-panel__textarea ${errors.description ? "is-invalid" : ""}`}
              placeholder="Enter description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={describedBy("description", "blog-description-count")}
            />
            <small id="blog-description-count" className={`blog-panel__hint ${words > MAX_DESCRIPTION_WORDS ? "is-over" : ""}`} aria-live="polite">
              {words} / {MAX_DESCRIPTION_WORDS} words
            </small>
            {error("description")}
          </div>

          <BlogImageField
            image={form.image}
            fileName={form.fileName}
            error={errors.image}
            onChange={(image, fileName) => {
              setForm((prev) => ({ ...prev, image, fileName }));
              setErrors((prev) => ({ ...prev, image: undefined }));
            }}
          />

          <div className="blog-panel__field">
            <label htmlFor="blog-link" className="blog-panel__label">
              Blog Link
            </label>
            <input
              id="blog-link"
              type="url"
              inputMode="url"
              autoComplete="off"
              className={`blog-panel__input ${errors.link ? "is-invalid" : ""}`}
              placeholder="Enter blog link"
              value={form.link}
              onChange={(event) => set("link", event.target.value)}
              aria-invalid={Boolean(errors.link)}
              aria-describedby={describedBy("link")}
            />
            {error("link")}
          </div>

          <div className="blog-panel__row">
            <div className="blog-panel__field">
              <span className="blog-panel__label">
                Priority <span className="blog-panel__required" aria-hidden>*</span>
              </span>
              <SearchableSelect options={priorities} value={form.priority} onChange={(priority) => set("priority", priority)} placeholder="Select priority" ariaLabel="Priority" />
              {error("priority")}
            </div>
            <div className="blog-panel__field">
              <span className="blog-panel__label">Status</span>
              <SearchableSelect options={STATUS_OPTIONS} value={form.status} onChange={(status) => set("status", (status || "Active") as BlogStatus)} placeholder="Select status" ariaLabel="Status" />
            </div>
          </div>

          <div className="blog-panel__actions">
            <button type="button" className="blogs__btn blogs__btn--warning" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="blogs__btn blogs__btn--navy">
              {isEdit ? "Update Blog" : "Create Blog"}
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  );
};

export default BlogOffcanvas;
