import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePermission } from "../../../core/auth/AuthContext";
import {
  useAddTemplateVersionMutation,
  useApproveTemplateVersionMutation,
  useCreateTemplateMutation,
  useGetTemplateQuery,
  useListTemplatesQuery,
  useRenderTemplateSampleMutation,
  useUpdateTemplateMutation,
} from "../../../core/store/notificationTemplatesApi";
import type { RenderSampleResult, TemplateAdminItem, TemplateVersion } from "../../../core/store/notificationTemplatesApi";
import { useGetNotificationChannelsQuery, useGetNotificationEventsQuery } from "../../../core/store/notificationsApi";
import { formatApiDateTime } from "../../../shared/utils/apiDateTime";
import "../../../shared/notifications/Notifications.scss";

const ROLES = ["", "BUYER", "SELLER", "TRANSPORTER", "DRIVER", "ADMIN", "SCHEDULE_INITIATOR"];
const PROVIDER_STATUSES = ["", "Pending", "Approved", "Rejected"];

const errorText = (e: unknown): string => {
  const err = e as { data?: { message?: string; title?: string } | string };
  return typeof err?.data === "string" ? err.data : (err?.data?.message ?? err?.data?.title ?? "Something went wrong. Please try again.");
};

/** Sample values for the variables a template mentions, so the preview shows something readable straight away. */
const sampleFor = (...texts: (string | null | undefined)[]): Record<string, string> => {
  const out: Record<string, string> = {};
  texts.forEach((t) => (t ?? "").replace(/\{\{\s*([A-Za-z0-9_]+)/g, (_m, name: string) => { out[name] = out[name] ?? `<${name}>`; return ""; }));
  return out;
};

const versionTone = (s: string) => (s === "Approved" ? "ok" : s === "Draft" ? "wait" : "");

const VersionBadge = ({ status }: { status: string }) => <span className={`fx-status ${versionTone(status) ? `fx-status--${versionTone(status)}` : ""}`}>{status}</span>;

// -------------------------------------------------------------------------------------------------------------------------------------

const TemplateEditor = ({ templateId, onClose }: { templateId: number; onClose: () => void }) => {
  const canManage = usePermission("notification-templates.manage");
  const { data: t, isLoading } = useGetTemplateQuery(templateId);
  const [updateTemplate, { isLoading: savingMeta }] = useUpdateTemplateMutation();
  const [addVersion, { isLoading: savingVersion }] = useAddTemplateVersionMutation();
  const [approve, { isLoading: approving }] = useApproveTemplateVersionMutation();
  const [render, { isLoading: rendering }] = useRenderTemplateSampleMutation();

  const [meta, setMeta] = useState({ templateName: "", recipientRole: "", variantCode: "", isDefault: false, isActive: true, displayOrder: 10 });
  const [form, setForm] = useState({ subject: "", body: "", html: "", providerTemplateName: "", providerTemplateId: "", providerApprovalStatus: "", dltTemplateId: "" });
  const [variables, setVariables] = useState("{}");
  const [preview, setPreview] = useState<RenderSampleResult | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const loadVersion = (v: TemplateVersion) => {
    setForm({
      subject: v.subjectTemplate ?? "", body: v.bodyTemplate, html: v.htmlBodyTemplate ?? "", providerTemplateName: v.providerTemplateName ?? "",
      providerTemplateId: v.providerTemplateId ?? "", providerApprovalStatus: v.providerApprovalStatus ?? "", dltTemplateId: v.dltTemplateId ?? "",
    });
    setVariables(JSON.stringify(sampleFor(v.subjectTemplate, v.bodyTemplate, v.htmlBodyTemplate), null, 2));
    setPreview(null);
  };

  // Start from the newest version (the one that is, or will be, in use) the first time the template loads.
  const [initialised, setInitialised] = useState(false);
  useEffect(() => {
    if (!t || initialised) return;
    setMeta({ templateName: t.templateName, recipientRole: t.recipientRole ?? "", variantCode: t.variantCode ?? "", isDefault: t.isDefault, isActive: t.isActive, displayOrder: t.displayOrder });
    const start = t.versions.find((v) => v.status === "Draft") ?? t.versions[0];
    if (start) loadVersion(start);
    setInitialised(true);
  }, [t, initialised]);

  const isEmailish = t?.channelCode === "EMAIL";
  const hasSubject = t?.channelCode === "EMAIL" || t?.channelCode === "APP";
  const isProviderRegistered = t?.channelCode === "WHATSAPP" || t?.channelCode === "SMS";

  const doPreview = async () => {
    setMessage(null);
    let vars: Record<string, string> = {};
    try { vars = JSON.parse(variables) as Record<string, string>; } catch { return setMessage({ text: "The sample values are not valid JSON.", error: true }); }
    // Variables added while editing get a placeholder value automatically, so the preview never shows blanks for them.
    vars = { ...sampleFor(form.subject, form.body, form.html), ...vars };
    setVariables(JSON.stringify(vars, null, 2));
    try {
      setPreview(await render({ subject: form.subject || null, body: form.body, html: form.html || null, variables: vars }).unwrap());
    } catch (e) { setMessage({ text: errorText(e), error: true }); }
  };

  const saveMeta = async () => {
    setMessage(null);
    try {
      await updateTemplate({ id: templateId, body: { ...meta, recipientRole: meta.recipientRole || null, variantCode: meta.variantCode || null } }).unwrap();
      setMessage({ text: "Template details saved." });
    } catch (e) { setMessage({ text: errorText(e), error: true }); }
  };

  const saveVersion = async () => {
    setMessage(null);
    try {
      await addVersion({ id: templateId, body: {
        subject: form.subject || null, body: form.body, html: form.html || null, providerTemplateName: form.providerTemplateName || null,
        providerTemplateId: form.providerTemplateId || null, providerApprovalStatus: form.providerApprovalStatus || null, dltTemplateId: form.dltTemplateId || null,
      } }).unwrap();
      setMessage({ text: "Saved as a new Draft version. Approve it to start using it." });
    } catch (e) { setMessage({ text: errorText(e), error: true }); }
  };

  const approveVersion = async (v: TemplateVersion) => {
    setMessage(null);
    try {
      await approve({ templateId, versionId: v.templateVersionId }).unwrap();
      setMessage({ text: `Version ${v.versionNumber} is now in use. The previous version was retired.` });
    } catch (e) { setMessage({ text: errorText(e), error: true }); }
  };

  return createPortal(
    <div className="fx-modal__backdrop" onClick={onClose}>
      <div className="fx-modal__box" style={{ maxWidth: "70rem" }} role="dialog" aria-modal="true" aria-label="Template" onClick={(e) => e.stopPropagation()}>
        <div className="fx-modal__header">
          <h2>{t ? `${t.templateName} - ${t.channelCode}` : "Template"}</h2>
          <button type="button" className="fx-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="fx-modal__body">
          {isLoading || !t ? "Loading…" : (
            <>
              <p className="small text-secondary">{t.templateCode} · event {t.eventName} · {t.approvedVersionNumber ? `version ${t.approvedVersionNumber} in use` : <strong className="text-danger">no approved version: this template cannot be used yet</strong>}</p>

              <div className="row g-2 mb-3">
                <div className="col-md-4"><label className="form-label small fw-semibold">Name</label><input className="form-control form-control-sm" value={meta.templateName} disabled={!canManage} onChange={(e) => setMeta({ ...meta, templateName: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label small fw-semibold">For role</label>
                  <select className="form-select form-select-sm" value={meta.recipientRole} disabled={!canManage} onChange={(e) => setMeta({ ...meta, recipientRole: e.target.value })}>{ROLES.map((r) => <option key={r} value={r}>{r || "Any role"}</option>)}</select></div>
                <div className="col-md-3"><label className="form-label small fw-semibold">Variant</label><input className="form-control form-control-sm" value={meta.variantCode} disabled={!canManage} onChange={(e) => setMeta({ ...meta, variantCode: e.target.value })} placeholder="e.g. WITH_QUALITY" /></div>
                <div className="col-md-2"><label className="form-label small fw-semibold">Order</label><input type="number" className="form-control form-control-sm" value={meta.displayOrder} disabled={!canManage} onChange={(e) => setMeta({ ...meta, displayOrder: Number(e.target.value) })} /></div>
                <div className="col-12 d-flex flex-wrap gap-3 align-items-center">
                  <label className="mb-0"><input type="checkbox" className="form-check-input me-1" checked={meta.isDefault} disabled={!canManage} onChange={(e) => setMeta({ ...meta, isDefault: e.target.checked })} />Default for its event, role and channel</label>
                  <label className="mb-0"><input type="checkbox" className="form-check-input me-1" checked={meta.isActive} disabled={!canManage} onChange={(e) => setMeta({ ...meta, isActive: e.target.checked })} />Active (offered to users)</label>
                  {canManage && <button type="button" className="btn btn-outline-secondary btn-sm" disabled={savingMeta} onClick={() => void saveMeta()}>Save details</button>}
                </div>
              </div>

              <h3 className="h6">Versions</h3>
              <table className="table table-sm mb-3">
                <thead><tr><th>Version</th><th>Status</th><th>Created</th><th>Approved</th><th></th></tr></thead>
                <tbody>
                  {t.versions.map((v) => (
                    <tr key={v.templateVersionId}>
                      <td>v{v.versionNumber}</td><td><VersionBadge status={v.status} /></td><td>{formatApiDateTime(v.createdAt)}</td><td>{formatApiDateTime(v.approvedAt)}</td>
                      <td className="text-end">
                        <button type="button" className="btn btn-link btn-sm p-0 me-3" onClick={() => loadVersion(v)}>Load into editor</button>
                        {canManage && v.status === "Draft" && <button type="button" className="btn btn-primary btn-sm" disabled={approving} onClick={() => void approveVersion(v)}>Approve</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="h6">Wording <span className="text-secondary fw-normal small">- use {"{{ Name }}"} for values; an approved version is never edited, so changes are saved as a new version.</span></h3>
              <div className="row g-3">
                <div className="col-lg-7">
                  {hasSubject && <><label className="form-label small fw-semibold">{isEmailish ? "Subject" : "Title"}</label><input className="form-control form-control-sm mb-2" value={form.subject} disabled={!canManage} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></>}
                  <label className="form-label small fw-semibold">{isEmailish ? "Plain-text body" : "Message"}</label>
                  <textarea className="form-control mb-2" rows={isEmailish ? 5 : 10} value={form.body} disabled={!canManage} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ fontFamily: "monospace", fontSize: "0.85rem" }} />
                  {isEmailish && <><label className="form-label small fw-semibold">HTML body</label>
                    <textarea className="form-control mb-2" rows={10} value={form.html} disabled={!canManage} onChange={(e) => setForm({ ...form, html: e.target.value })} style={{ fontFamily: "monospace", fontSize: "0.8rem" }} /></>}
                  {isProviderRegistered && (
                    <div className="row g-2">
                      <div className="col-md-6"><label className="form-label small fw-semibold">Provider template name</label><input className="form-control form-control-sm" value={form.providerTemplateName} disabled={!canManage} onChange={(e) => setForm({ ...form, providerTemplateName: e.target.value })} /></div>
                      <div className="col-md-6"><label className="form-label small fw-semibold">Provider template id</label><input className="form-control form-control-sm" value={form.providerTemplateId} disabled={!canManage} onChange={(e) => setForm({ ...form, providerTemplateId: e.target.value })} /></div>
                      <div className="col-md-6"><label className="form-label small fw-semibold">Provider approval</label>
                        <select className="form-select form-select-sm" value={form.providerApprovalStatus} disabled={!canManage} onChange={(e) => setForm({ ...form, providerApprovalStatus: e.target.value })}>{PROVIDER_STATUSES.map((s) => <option key={s} value={s}>{s || "Not applicable"}</option>)}</select></div>
                      <div className="col-md-6"><label className="form-label small fw-semibold">DLT template id (SMS, India)</label><input className="form-control form-control-sm" value={form.dltTemplateId} disabled={!canManage} onChange={(e) => setForm({ ...form, dltTemplateId: e.target.value })} /></div>
                    </div>
                  )}
                </div>
                <div className="col-lg-5">
                  <label className="form-label small fw-semibold">Sample values (JSON)</label>
                  <textarea className="form-control mb-2" rows={8} value={variables} onChange={(e) => setVariables(e.target.value)} style={{ fontFamily: "monospace", fontSize: "0.8rem" }} />
                  <button type="button" className="btn btn-outline-primary btn-sm mb-2" disabled={rendering} onClick={() => void doPreview()}>{rendering ? "Rendering…" : "Preview"}</button>
                  {preview && (preview.error
                    ? <div className="alert alert-danger py-2 small">{preview.error}</div>
                    : <div className="fx-notify__preview">
                        {preview.subject && <div className="small"><strong>{preview.subject}</strong></div>}
                        <pre>{preview.body}</pre>
                        {preview.html && <iframe title="Email preview" sandbox="" srcDoc={preview.html} style={{ width: "100%", height: "22rem", border: "1px solid var(--fx-gray-90-line)", background: "var(--fx-white)" }} />}
                      </div>)}
                </div>
              </div>

              {message && <div className={`alert ${message.error ? "alert-danger" : "alert-success"} py-2 mt-3 mb-0`}>{message.text}</div>}
            </>
          )}
        </div>
        <div className="fx-modal__footer">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          {canManage && <button type="button" className="btn btn-primary" disabled={savingVersion || !t} onClick={() => void saveVersion()}>{savingVersion ? "Saving…" : "Save as new version (Draft)"}</button>}
        </div>
      </div>
    </div>,
    document.body,
  );
};

// -------------------------------------------------------------------------------------------------------------------------------------

const NewTemplateModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) => {
  const { data: events = [] } = useGetNotificationEventsQuery();
  const { data: channels = [] } = useGetNotificationChannelsQuery();
  const [create, { isLoading }] = useCreateTemplateMutation();
  const [f, setF] = useState({ templateCode: "", templateName: "", eventCode: "", channelCode: "EMAIL", recipientRole: "", variantCode: "", isDefault: false, subject: "", body: "", html: "" });
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      const created = await create({ ...f, recipientRole: f.recipientRole || null, variantCode: f.variantCode || null, subject: f.subject || null, html: f.html || null }).unwrap();
      onCreated(created.templateId);
    } catch (e) { setError(errorText(e)); }
  };

  return createPortal(
    <div className="fx-modal__backdrop" onClick={onClose}>
      <div className="fx-modal__box fx-modal__box--narrow" style={{ maxWidth: "40rem" }} role="dialog" aria-modal="true" aria-label="New template" onClick={(e) => e.stopPropagation()}>
        <div className="fx-modal__header"><h2>New template</h2><button type="button" className="fx-modal__close" onClick={onClose} aria-label="Close">×</button></div>
        <div className="fx-modal__body">
          <div className="row g-2">
            <div className="col-md-6"><label className="form-label small fw-semibold">Code</label><input className="form-control form-control-sm" value={f.templateCode} onChange={(e) => setF({ ...f, templateCode: e.target.value })} placeholder="e.g. TRUCK_ADDED_SELLER_EMAIL_2" /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Name</label><input className="form-control form-control-sm" value={f.templateName} onChange={(e) => setF({ ...f, templateName: e.target.value })} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Event</label>
              <select className="form-select form-select-sm" value={f.eventCode} onChange={(e) => setF({ ...f, eventCode: e.target.value })}><option value="">Choose…</option>{events.map((ev) => <option key={ev.eventCode} value={ev.eventCode}>{ev.eventName}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Channel</label>
              <select className="form-select form-select-sm" value={f.channelCode} onChange={(e) => setF({ ...f, channelCode: e.target.value })}>{channels.map((c) => <option key={c.channelCode} value={c.channelCode}>{c.channelName}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">For role</label>
              <select className="form-select form-select-sm" value={f.recipientRole} onChange={(e) => setF({ ...f, recipientRole: e.target.value })}>{ROLES.map((r) => <option key={r} value={r}>{r || "Any role"}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Variant (optional)</label><input className="form-control form-control-sm" value={f.variantCode} onChange={(e) => setF({ ...f, variantCode: e.target.value })} /></div>
            {(f.channelCode === "EMAIL" || f.channelCode === "APP") && <div className="col-12"><label className="form-label small fw-semibold">{f.channelCode === "EMAIL" ? "Subject" : "Title"}</label><input className="form-control form-control-sm" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>}
            <div className="col-12"><label className="form-label small fw-semibold">Message</label><textarea className="form-control" rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} style={{ fontFamily: "monospace", fontSize: "0.85rem" }} /></div>
            {f.channelCode === "EMAIL" && <div className="col-12"><label className="form-label small fw-semibold">HTML body (optional)</label><textarea className="form-control" rows={5} value={f.html} onChange={(e) => setF({ ...f, html: e.target.value })} style={{ fontFamily: "monospace", fontSize: "0.8rem" }} /></div>}
            <div className="col-12"><label className="mb-0"><input type="checkbox" className="form-check-input me-1" checked={f.isDefault} onChange={(e) => setF({ ...f, isDefault: e.target.checked })} />Default for its event, role and channel</label></div>
          </div>
          <p className="small text-secondary mt-2 mb-0">It is saved as a Draft; approve it in the editor to start using it.</p>
          {error && <div className="alert alert-danger py-2 mt-2 mb-0">{error}</div>}
        </div>
        <div className="fx-modal__footer">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={isLoading || !f.templateCode || !f.templateName || !f.eventCode || !f.body} onClick={() => void submit()}>{isLoading ? "Creating…" : "Create"}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// -------------------------------------------------------------------------------------------------------------------------------------

/** Notification templates: every message's wording per event, role and channel. Edit, preview with sample values, and approve versions. */
const TemplateAdmin = () => {
  const canManage = usePermission("notification-templates.manage");
  const { data: events = [] } = useGetNotificationEventsQuery();
  const { data: channels = [] } = useGetNotificationChannelsQuery();
  const [eventCode, setEventCode] = useState("");
  const [channelCode, setChannelCode] = useState("");
  const [search, setSearch] = useState("");
  const query = useMemo(() => ({ eventCode, channelCode, search }), [eventCode, channelCode, search]);
  const { data: templates = [], isFetching } = useListTemplatesQuery(query);
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const roleLabel = (t: TemplateAdminItem) => (t.recipientRole ?? "Any").replace("_", " ").toLowerCase();

  return (
    <div className="container-fluid py-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">Notification templates</h1>
        {canManage && <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>New template</button>}
      </div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <select className="form-select form-select-sm w-auto" value={eventCode} onChange={(e) => setEventCode(e.target.value)} aria-label="Event"><option value="">All events</option>{events.map((e) => <option key={e.eventCode} value={e.eventCode}>{e.eventName}</option>)}</select>
        <select className="form-select form-select-sm w-auto" value={channelCode} onChange={(e) => setChannelCode(e.target.value)} aria-label="Channel"><option value="">All channels</option>{channels.map((c) => <option key={c.channelCode} value={c.channelCode}>{c.channelName}</option>)}</select>
        <input className="form-control form-control-sm w-auto" placeholder="Search name or code" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead><tr><th>Template</th><th>Event</th><th>Role</th><th>Channel</th><th>Version in use</th><th>Flags</th><th></th></tr></thead>
          <tbody>
            {isFetching && templates.length === 0 && <tr><td colSpan={7} className="text-secondary">Loading…</td></tr>}
            {!isFetching && templates.length === 0 && <tr><td colSpan={7} className="text-secondary">No templates match.</td></tr>}
            {templates.map((t) => (
              <tr key={t.templateId} className={t.isActive ? "" : "text-secondary"}>
                <td>{t.templateName}<div className="small text-secondary">{t.templateCode}</div></td>
                <td>{t.eventName}{t.variantCode && <div className="small text-secondary">{t.variantCode}</div>}</td>
                <td className="text-capitalize">{roleLabel(t)}</td>
                <td>{t.channelCode}</td>
                <td>
                  {t.approvedVersionNumber ? `v${t.approvedVersionNumber}` : <span className="text-danger">none approved</span>}
                  {t.latestVersionStatus === "Draft" && <span className="ms-1"><VersionBadge status="Draft" /></span>}
                </td>
                <td>{t.isDefault && <span className="badge text-bg-secondary me-1">Default</span>}{!t.isActive && <span className="badge text-bg-light">Inactive</span>}</td>
                <td className="text-end"><button type="button" className="btn btn-link btn-sm p-0" onClick={() => setEditing(t.templateId)}>{canManage ? "Edit" : "View"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing !== null && <TemplateEditor key={editing} templateId={editing} onClose={() => setEditing(null)} />}
      {creating && <NewTemplateModal onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setEditing(id); }} />}
    </div>
  );
};

export default TemplateAdmin;
