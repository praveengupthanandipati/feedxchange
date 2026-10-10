import { useCallback, useMemo, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import { initialBanners, type Banner, type BannerForm } from "./banners.data";
import { matchesSearch } from "./banners.utils";
import BannerCards from "./components/BannerCards";
import BannerOffcanvas from "./components/BannerOffcanvas";
import BannersHeader from "./components/BannersHeader";
import BannersPagination from "./components/BannersPagination";
import BannersTable from "./components/BannersTable";
import "./Banners.scss";

const PAGE_SIZE = 10;

/** Which banner the panel is open for: a new one, an existing one, or closed. */
type PanelState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; banner: Banner };

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(
    () => banners.filter((banner) => matchesSearch(banner, search)).sort((a, b) => a.priority - b.priority),
    [banners, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = search.trim() ? "No banners match your search." : "No banners yet. Use New to add one.";

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);

  const handleSave = (form: BannerForm) => {
    const values = {
      title: form.title.trim(),
      linkUrl: form.linkUrl.trim(),
      priority: Number(form.priority),
      image: form.image,
      status: form.status,
    };
    // TODO: send the banner (and uploaded image) to the API once the endpoint is available.
    if (panel.mode === "edit") {
      setBanners((prev) => prev.map((banner) => (banner.id === panel.banner.id ? { ...banner, ...values } : banner)));
      setMessage(`"${values.title}" updated.`);
    } else {
      setBanners((prev) => [...prev, { id: `${Date.now()}`, ...values }]);
      setMessage(`"${values.title}" created.`);
    }
    closePanel();
  };

  return (
    <div className="banners">
      <BannersHeader
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onNew={() => {
          setMessage("");
          setPanel({ mode: "create" });
        }}
      />

      {message && (
        <p className="banners__message" role="status">
          <FiCheckCircle aria-hidden /> {message}
        </p>
      )}

      <BannersTable rows={paged} emptyMessage={emptyMessage} onEdit={(banner) => setPanel({ mode: "edit", banner })} onDelete={setDeleting} />
      <BannerCards rows={paged} emptyMessage={emptyMessage} onEdit={(banner) => setPanel({ mode: "edit", banner })} onDelete={setDeleting} />

      <BannersPagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      {panel.mode !== "closed" && (
        <BannerOffcanvas
          // A fresh form each time the panel opens for a different banner.
          key={panel.mode === "edit" ? panel.banner.id : "new"}
          banner={panel.mode === "edit" ? panel.banner : null}
          banners={banners}
          onSave={handleSave}
          onClose={closePanel}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete banner"
        message={deleting ? `Delete "${deleting.title}"? This cannot be undone.` : ""}
        onConfirm={() => {
          // TODO: send the delete to the API once the endpoint is available.
          if (deleting) {
            setBanners((prev) => prev.filter((banner) => banner.id !== deleting.id));
            setMessage(`"${deleting.title}" deleted.`);
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default Banners;
