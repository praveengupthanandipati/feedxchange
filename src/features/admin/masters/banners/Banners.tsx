import { useCallback, useMemo, useState } from "react";
import { CircleCheckBigIcon } from "../../../../shared/components/icon";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import { useAuth } from "../../../../core/auth/AuthContext";
import {
  useAddBannerMutation,
  useDeleteBannerMutation,
  useGetBannersQuery,
  useUpdateBannerMutation,
} from "../../../../core/store/bannersApi";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";
import type { Banner, BannerForm } from "./banners.data";
import { matchesSearch, toBanner } from "./banners.utils";
import BannerCards from "./components/BannerCards";
import BannerOffcanvas from "./components/BannerOffcanvas";
import BannersHeader from "./components/BannersHeader";
import BannersPagination from "./components/BannersPagination";
import BannersTable from "./components/BannersTable";
import "./Banners.scss";

const PAGE_SIZE = 10;

/** Which banner the panel is open for: a new one, an existing one, or closed. */
type PanelState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; banner: Banner };

type Notice = { kind: "success" | "error"; text: string } | null;

const Banners = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const { userId } = useAuth();
  const { data, isLoading, isError } = useGetBannersQuery();
  const [addBanner] = useAddBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const banners = useMemo(() => (data ?? []).map(toBanner), [data]);

  const filtered = useMemo(
    () => banners.filter((banner) => matchesSearch(banner, search)).sort((a, b) => a.priority - b.priority),
    [banners, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = isLoading
    ? "Loading banners…"
    : isError
      ? "The banners could not be loaded. Please refresh the page."
      : search.trim()
        ? "No banners match your search."
        : "No banners yet. Use New to add one.";

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);
  const actionBy = Number(userId) || 0;

  const handleSave = async (form: BannerForm): Promise<string | null> => {
    const values = {
      title: form.title.trim(),
      linkUrl: form.linkUrl.trim(),
      priority: Number(form.priority),
      isActive: form.status === "Active",
    };
    try {
      if (panel.mode === "edit") {
        await updateBanner({ id: panel.banner.id, ...values, updatedBy: actionBy, image: form.file }).unwrap();
      } else {
        if (!form.file) return "Choose a banner image.";
        await addBanner({ ...values, actionPerfomedBy: actionBy, image: form.file }).unwrap();
      }
    } catch (error) {
      return apiErrorMessage(error, "The banner could not be saved. Please try again.");
    }
    setNotice({ kind: "success", text: `"${values.title}" ${panel.mode === "edit" ? "updated" : "created"}.` });
    closePanel();
    return null;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteBanner({ bannerId: deleting.id, userId: actionBy }).unwrap();
      setNotice({ kind: "success", text: `"${deleting.title}" deleted.` });
    } catch (error) {
      setNotice({ kind: "error", text: apiErrorMessage(error, "The banner could not be deleted. Please try again.") });
    }
    setDeleting(null);
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
          setNotice(null);
          setPanel({ mode: "create" });
        }}
      />

      {notice && (
        <p
          className={`banners__message ${notice.kind === "error" ? "banners__message--error" : ""}`}
          role={notice.kind === "error" ? "alert" : "status"}
        >
          {notice.kind === "success" && <CircleCheckBigIcon aria-hidden />} {notice.text}
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
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        confirmDisabled={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default Banners;
