import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BriefcaseIcon, SearchIcon, UserIcon, UsersIcon, ZapIcon } from "../../../shared/components/icon";
import { usePermission } from "../../../core/auth/AuthContext";
import {
  useFindPreferenceProfilesQuery,
  useFindPreferenceUsersQuery,
  useGetUserPreferencesQuery,
  usePauseUserMutation,
  useResumeUserMutation,
  useSaveUserPreferencesMutation,
} from "../../../core/store/notificationPreferencesApi";
import { apiErrorMessage } from "../../../core/store/sellerInvoiceApi";
import ProfilePreferencesPanel from "./ProfilePreferencesPanel";
import UserPreferencesPanel from "./UserPreferencesPanel";
import "./Preferences.scss";

type Tab = "business" | "users";

const useDebounced = (value: string, ms = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

const BusinessTab = () => {
  const [params, setParams] = useSearchParams();
  const selected = Number(params.get("profile")) || 0;
  const [search, setSearch] = useState("");
  const query = useDebounced(search);
  const { data: found = [], isFetching } = useFindPreferenceProfilesQuery(query, { refetchOnMountOrArgChange: true });

  // a business user can only reach their own profile: open it straight away
  useEffect(() => {
    if (!selected && !query && found.length === 1) setParams({ profile: String(found[0].profileId) }, { replace: true });
  }, [selected, query, found, setParams]);

  const single = !query && found.length === 1;

  return (
    <div className="pref-layout">
      {!single && (
        <aside className="pref-finder" aria-label="Find a business">
          <label className="pref-search">
            <SearchIcon aria-hidden />
            <input type="search" value={search} placeholder="Find a business" onChange={(e) => setSearch(e.target.value)} aria-label="Find a business" />
          </label>
          <ul className="pref-finder__list">
            {found.map((p) => (
              <li key={p.profileId}>
                <button type="button" className={`pref-finder__item ${p.profileId === selected ? "is-selected" : ""}`} onClick={() => setParams({ profile: String(p.profileId) })}>
                  <span className="pref-avatar" aria-hidden><BriefcaseIcon /></span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.contactCount} {p.contactCount === 1 ? "contact" : "contacts"}</small>
                  </span>
                  {p.dispatchMode === "Auto" && <span className="pref-badge pref-badge--on" title="Automatic notifications are on"><ZapIcon aria-hidden /> Auto</span>}
                </button>
              </li>
            ))}
            {!isFetching && found.length === 0 && <li className="pref-finder__empty">No business matches “{query}”.</li>}
          </ul>
        </aside>
      )}
      <div className="pref-layout__main">
        {selected ? <ProfilePreferencesPanel key={selected} profileId={selected} /> : <div className="pref-state">Pick a business to see who is notified about what.</div>}
      </div>
    </div>
  );
};

const UsersTab = () => {
  const [search, setSearch] = useState("");
  const query = useDebounced(search);
  const [userId, setUserId] = useState(0);
  const { data: users = [], isFetching } = useFindPreferenceUsersQuery(query);
  const { data: prefs, isError, error } = useGetUserPreferencesQuery(userId, { skip: !userId, refetchOnMountOrArgChange: true });
  const [save, { isLoading: saving }] = useSaveUserPreferencesMutation();
  const [pause, { isLoading: pausing }] = usePauseUserMutation();
  const [resume, { isLoading: resuming }] = useResumeUserMutation();

  return (
    <div className="pref-layout">
      <aside className="pref-finder" aria-label="Find a user">
        <label className="pref-search">
          <SearchIcon aria-hidden />
          <input type="search" value={search} placeholder="Find a user" onChange={(e) => setSearch(e.target.value)} aria-label="Find a user" />
        </label>
        <ul className="pref-finder__list">
          {users.map((u) => (
            <li key={u.userId}>
              <button type="button" className={`pref-finder__item ${u.userId === userId ? "is-selected" : ""}`} onClick={() => setUserId(u.userId)}>
                <span className="pref-avatar" aria-hidden>{u.name.slice(0, 1).toUpperCase()}</span>
                <span><strong>{u.name}</strong><small>{u.profileName ?? u.email ?? ""}</small></span>
              </button>
            </li>
          ))}
          {!isFetching && users.length === 0 && <li className="pref-finder__empty">No user matches “{query}”.</li>}
        </ul>
      </aside>
      <div className="pref-layout__main">
        {!userId && <div className="pref-state">Pick a user to see and change what reaches them.</div>}
        {isError && <div className="pref-state pref-state--error" role="alert">{apiErrorMessage(error, "Could not load this user's preferences.")}</div>}
        {userId > 0 && prefs && (
          <UserPreferencesPanel
            key={userId}
            prefs={prefs}
            banner={`You are editing ${prefs.userName}'s notification preferences.`}
            busy={saving || pausing || resuming}
            onSave={(subscriptions) => save({ userId, subscriptions }).unwrap()}
            onPause={(resumeOn, reason) => pause({ userId, resumeOn, reason }).unwrap()}
            onResume={() => resume(userId).unwrap()}
          />
        )}
      </div>
    </div>
  );
};

/** Notification preferences for businesses (who is told about what, per contact) and, for administrators, for system users. */
const NotificationPreferences = () => {
  const canUsers = usePermission("user-notification-preferences.manage");
  const [tab, setTab] = useState<Tab>("business");

  return (
    <div className="pref-page">
      <header className="pref-page__header">
        <div>
          <h1>Notification preferences</h1>
          <p>Decide who is told about each event and how, so people no longer pick recipients after every action.</p>
        </div>
      </header>

      {canUsers && (
        <div className="pref-tabs" role="tablist" aria-label="Whose preferences">
          <button type="button" role="tab" aria-selected={tab === "business"} className={tab === "business" ? "is-active" : ""} onClick={() => setTab("business")}><UsersIcon aria-hidden /> Business contacts</button>
          <button type="button" role="tab" aria-selected={tab === "users"} className={tab === "users" ? "is-active" : ""} onClick={() => setTab("users")}><UserIcon aria-hidden /> System users</button>
        </div>
      )}

      {tab === "business" || !canUsers ? <BusinessTab /> : <UsersTab />}
    </div>
  );
};

export default NotificationPreferences;
