import { useEffect, useMemo, useState } from "react";
import {
  useGetManageableUsersQuery,
  useGetUserAccessTreeQuery,
  useSaveUserAccessMutation,
} from "../../store/userAccessApi";
import type { UserAccessNode, UserAccessTree } from "../../store/userAccessApi";
import "./RoleAccess.scss";
import "./UserAccess.scss";

const ACTIONS = ["view", "create", "edit", "delete"] as const;
const key = (node: string, action: string) => `${node}|${action}`;

const nodesOf = (node: UserAccessNode): UserAccessNode[] => [node, ...node.children.flatMap(nodesOf)];

/** What the tree says today: an override per "page|action" (true = allow, false = deny). Overrides that equal the role are not kept. */
const initialOverrides = (tree: UserAccessTree): Map<string, boolean> => {
  const map = new Map<string, boolean>();
  tree.modules
    .flatMap((m) => m.items)
    .flatMap(nodesOf)
    .forEach((n) => n.actions.forEach((a) => a.override !== null && map.set(key(n.key, a.action), a.override)));
  return map;
};

const errorMessage = (error: unknown): string => {
  const e = error as { data?: { message?: string; detail?: string; title?: string } };
  return e?.data?.message || e?.data?.detail || e?.data?.title || "Could not save.";
};

/**
 * A parent's overrides for one user under them. Each box shows what the user gets: it starts as the role's value; changing it
 * makes an override (highlighted), changing it back removes the override.
 */
const UserAccess = () => {
  const { data: users = [], isSuccess: usersLoaded, isError: usersFailed } = useGetManageableUsersQuery(undefined, { refetchOnMountOrArgChange: true });
  const [userId, setUserId] = useState<number | null>(null);
  const { data: tree, isFetching, isError, error } = useGetUserAccessTreeQuery(userId ?? 0, { skip: userId === null, refetchOnMountOrArgChange: true });
  const [save, { isLoading: saving }] = useSaveUserAccessMutation();

  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map());
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (tree) setOverrides(initialOverrides(tree));
  }, [tree]);

  const roleValue = useMemo(() => {
    const map = new Map<string, boolean>();
    tree?.modules
      .flatMap((m) => m.items)
      .flatMap(nodesOf)
      .forEach((n) => n.actions.forEach((a) => map.set(key(n.key, a.action), a.roleGranted)));
    return map;
  }, [tree]);

  const dirty = useMemo(() => {
    if (!tree) return false;
    const start = initialOverrides(tree);
    return start.size !== overrides.size || [...start].some(([k, v]) => overrides.get(k) !== v);
  }, [tree, overrides]);

  const effective = (node: UserAccessNode, action: string): boolean => {
    const a = node.actions.find((x) => x.action === action)!;
    if (a.derived) return a.effective; // follows the pages inside (as loaded)
    const o = overrides.get(key(node.key, action));
    return o ?? a.roleGranted;
  };

  /** Set what the user gets for one action. Same as the role = no override. Denying view denies the rest; allowing anything allows view. */
  const setValue = (node: UserAccessNode, action: string, value: boolean) => {
    setMessage(null);
    setOverrides((previous) => {
      const next = new Map(previous);
      const apply = (act: string, v: boolean) => {
        const k = key(node.key, act);
        if ((roleValue.get(k) ?? false) === v) next.delete(k);
        else next.set(k, v);
      };
      apply(action, value);
      const has = (act: string) => node.actions.some((a) => a.action === act && !a.derived);
      if (value && action !== "view" && has("view")) apply("view", true);
      if (!value && action === "view") node.actions.filter((a) => a.action !== "view" && !a.derived).forEach((a) => apply(a.action, false));
      return next;
    });
  };

  const onSave = async () => {
    if (userId === null) return;
    setMessage(null);
    try {
      await save({
        userId,
        overrides: [...overrides].map(([k, allow]) => {
          const [nodeKey, action] = k.split("|");
          return { key: nodeKey, action, allow };
        }),
      }).unwrap();
      setMessage({ kind: "ok", text: "Saved. The user gets the change straight away." });
    } catch (e) {
      setMessage({ kind: "error", text: errorMessage(e) });
    }
  };

  const renderNode = (node: UserAccessNode, depth: number) => (
    <div key={node.key}>
      <div className={`role-access__row role-access__row--${node.nodeType === "SubModule" ? "sub" : "page"}`}>
        <div className="role-access__name" style={{ paddingLeft: `${depth * 1.25}rem` }}>
          <span>{node.title}</span>
        </div>
        {ACTIONS.map((action) => {
          const a = node.actions.find((x) => x.action === action);
          if (!a) return <div key={action} className="role-access__cell" />;
          const overridden = !a.derived && overrides.has(key(node.key, action));
          return (
            <div key={action} className={`role-access__cell ${overridden ? "user-access__overridden" : ""}`}>
              <input
                type="checkbox"
                aria-label={`${node.title} ${action}`}
                disabled={a.derived}
                checked={effective(node, action)}
                onChange={(e) => setValue(node, action, e.target.checked)}
                title={
                  a.derived
                    ? "Available when any page inside is"
                    : overridden
                      ? `Overridden (role: ${a.roleGranted ? "yes" : "no"})`
                      : `Follows the role (${a.roleGranted ? "yes" : "no"})`
                }
              />
            </div>
          );
        })}
      </div>
      {node.children.map((child) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="role-access">
      <div className="role-access__header">
        <h1>Assign Menu Item to User</h1>
        <div className="role-access__controls">
          <select
            aria-label="User"
            value={userId ?? ""}
            onChange={(e) => {
              setUserId(e.target.value ? Number(e.target.value) : null);
              setMessage(null);
            }}
          >
            <option value="">Select a user…</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {user.roleName}
              </option>
            ))}
          </select>
          <button type="button" className="role-access__save" disabled={!dirty || saving || isFetching} onClick={onSave}>
            {saving ? "Saving…" : "Save overrides"}
          </button>
        </div>
      </div>

      {message && <p className={`role-access__message role-access__message--${message.kind}`}>{message.text}</p>}
      {usersFailed && (
        <p className="role-access__message role-access__message--error">
          Could not load the users you can manage. Make sure the API is running its latest version and try again.
        </p>
      )}
      {usersLoaded && users.length === 0 && <p className="role-access__hint">There are no users below you to manage.</p>}
      {userId === null && (
        <p className="role-access__hint">
          Choose a user under you. Ticks start as the user&apos;s role gives them; change one to allow or deny it for this user only.
        </p>
      )}
      {isError && <p className="role-access__message role-access__message--error">{errorMessage(error)}</p>}

      {tree && (
        <>
          <p className="user-access__legend">
            {tree.userName} · {tree.roleName} — <span className="user-access__swatch" /> highlighted boxes are overrides
          </p>
          <div className="role-access__table">
            <div className="role-access__row role-access__row--head">
              <div className="role-access__name">Page</div>
              {ACTIONS.map((a) => (
                <div key={a} className="role-access__cell">
                  {a}
                </div>
              ))}
            </div>
            {tree.modules.map((module) => (
              <section key={module.moduleKey}>
                <h2 className="role-access__module">{module.name}</h2>
                {module.items.map((node) => renderNode(node, 0))}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserAccess;
