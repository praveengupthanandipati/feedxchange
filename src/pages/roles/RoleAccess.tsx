import { useEffect, useMemo, useState } from "react";
import {
  useGetRoleAccessTreeQuery,
  useGetRolesQuery,
  useSaveRoleAccessMutation,
} from "../../store/roleAccessApi";
import type { RoleAccessNode, RoleAccessTree } from "../../store/roleAccessApi";
import "./RoleAccess.scss";

const ACTIONS = ["view", "create", "edit", "delete"] as const;
const tick = (key: string, action: string) => `${key}|${action}`;

/** The node and every page inside it. */
const nodesOf = (node: RoleAccessNode): RoleAccessNode[] => [node, ...node.children.flatMap(nodesOf)];

/** All ticks a node can carry (derived actions have no permission of their own and are never ticked). */
const tickableOf = (node: RoleAccessNode) =>
  nodesOf(node).flatMap((n) => n.actions.filter((a) => !a.derived).map((a) => tick(n.key, a.action)));

const initialTicks = (tree: RoleAccessTree): Set<string> => {
  const set = new Set<string>();
  tree.modules
    .flatMap((m) => m.items)
    .flatMap(nodesOf)
    .forEach((n) => n.actions.forEach((a) => a.granted && !a.derived && set.add(tick(n.key, a.action))));
  return set;
};

const errorMessage = (error: unknown): string => {
  const e = error as { data?: { message?: string; detail?: string; title?: string } };
  return e?.data?.message || e?.data?.detail || e?.data?.title || "Could not save the access.";
};

/** Assign pages to a role: Module -> Sub Module -> Page, with view / create / edit / delete per page. */
const RoleAccess = () => {
  const { data: roles = [], isSuccess: rolesLoaded, isError: rolesFailed } = useGetRolesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [roleId, setRoleId] = useState<number | null>(null);
  const { data: tree, isFetching, isError } = useGetRoleAccessTreeQuery(roleId ?? 0, { skip: roleId === null, refetchOnMountOrArgChange: true });
  const [save, { isLoading: saving }] = useSaveRoleAccessMutation();

  const [ticks, setTicks] = useState<Set<string>>(new Set());
  const [others, setOthers] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!tree) return;
    setTicks(initialTicks(tree));
    setOthers(new Set(tree.otherPermissions.filter((p) => p.granted).map((p) => p.id)));
  }, [tree]);

  const dirty = useMemo(() => {
    if (!tree) return false;
    const start = initialTicks(tree);
    const startOthers = tree.otherPermissions.filter((p) => p.granted).map((p) => p.id);
    return (
      start.size !== ticks.size ||
      [...start].some((t) => !ticks.has(t)) ||
      startOthers.length !== others.size ||
      startOthers.some((id) => !others.has(id))
    );
  }, [tree, ticks, others]);

  /** create / edit / delete that share one permission are one right; any of them needs view. */
  const toggle = (node: RoleAccessNode, action: string, on: boolean) => {
    setMessage(null);
    setTicks((previous) => {
      const next = new Set(previous);
      const target = node.actions.find((a) => a.action === action);
      const same = node.actions.filter((a) => !a.derived && (a.action === action || (target?.permissionKey && a.permissionKey === target.permissionKey)));
      same.forEach((a) => (on ? next.add(tick(node.key, a.action)) : next.delete(tick(node.key, a.action))));
      if (on && action !== "view" && node.actions.some((a) => a.action === "view" && !a.derived)) next.add(tick(node.key, "view"));
      if (!on && action === "view") node.actions.forEach((a) => next.delete(tick(node.key, a.action)));
      return next;
    });
  };

  const toggleAll = (node: RoleAccessNode, on: boolean) => {
    setMessage(null);
    setTicks((previous) => {
      const next = new Set(previous);
      tickableOf(node).forEach((t) => (on ? next.add(t) : next.delete(t)));
      return next;
    });
  };

  const summary = (node: RoleAccessNode): "all" | "some" | "none" => {
    const all = tickableOf(node);
    const on = all.filter((t) => ticks.has(t)).length;
    return on === 0 ? "none" : on === all.length ? "all" : "some";
  };

  const onSave = async () => {
    if (roleId === null) return;
    setMessage(null);
    try {
      await save({
        roleId,
        actions: [...ticks].map((t) => {
          const [key, action] = t.split("|");
          return { key, action };
        }),
        otherPermissionIds: [...others],
      }).unwrap();
      setMessage({ kind: "ok", text: "Saved. People with this role get the change straight away." });
    } catch (error) {
      setMessage({ kind: "error", text: errorMessage(error) });
    }
  };

  const renderNode = (node: RoleAccessNode, depth: number) => {
    const isSub = node.nodeType === "SubModule";
    const state = summary(node);
    return (
      <div key={node.key}>
        <div className={`role-access__row role-access__row--${isSub ? "sub" : "page"}`}>
          <div className="role-access__name" style={{ paddingLeft: `${depth * 1.25}rem` }}>
            {isSub && (
              <input
                type="checkbox"
                aria-label={`Select everything in ${node.title}`}
                checked={state === "all"}
                ref={(el) => {
                  if (el) el.indeterminate = state === "some";
                }}
                onChange={(e) => toggleAll(node, e.target.checked)}
              />
            )}
            <span>{node.title}</span>
          </div>
          {ACTIONS.map((action) => {
            const a = node.actions.find((x) => x.action === action);
            return (
              <div key={action} className="role-access__cell">
                {a && (
                  <input
                    type="checkbox"
                    aria-label={`${node.title} ${action}`}
                    disabled={a.derived}
                    checked={a.derived ? a.granted : ticks.has(tick(node.key, action))}
                    onChange={(e) => toggle(node, action, e.target.checked)}
                    title={a.derived ? "Available when any page inside is" : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="role-access">
      <div className="role-access__header">
        <h1>Assign Menu Item to Role</h1>
        <div className="role-access__controls">
          <select
            aria-label="Role"
            value={roleId ?? ""}
            onChange={(e) => {
              setRoleId(e.target.value ? Number(e.target.value) : null);
              setMessage(null);
            }}
          >
            <option value="">Select a role…</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
                {role.profileTypeName ? ` (${role.profileTypeName})` : ""}
              </option>
            ))}
          </select>
          <button type="button" className="role-access__save" disabled={!dirty || saving || isFetching} onClick={onSave}>
            {saving ? "Saving…" : "Save access"}
          </button>
        </div>
      </div>

      {message && <p className={`role-access__message role-access__message--${message.kind}`}>{message.text}</p>}
      {rolesFailed && (
        <p className="role-access__message role-access__message--error">
          Could not load the roles you can manage. Make sure the API is running its latest version and try again.
        </p>
      )}
      {rolesLoaded && roles.length === 0 && <p className="role-access__hint">There are no roles below yours to manage.</p>}
      {roleId === null && roles.length > 0 && <p className="role-access__hint">Choose one of the roles below yours to see and change the pages it can open.</p>}
      {isError && <p className="role-access__message role-access__message--error">Could not load this role.</p>}

      {tree && (
        <>
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

          {tree.otherPermissions.length > 0 && (
            <section className="role-access__others">
              <h2 className="role-access__module">Other permissions</h2>
              {tree.otherPermissions.map((p) => (
                <label key={p.id} className="role-access__other">
                  <input
                    type="checkbox"
                    checked={others.has(p.id)}
                    onChange={(e) => {
                      setMessage(null);
                      setOthers((previous) => {
                        const next = new Set(previous);
                        if (e.target.checked) next.add(p.id);
                        else next.delete(p.id);
                        return next;
                      });
                    }}
                  />
                  <span>{p.name}</span>
                  <code>{p.key}</code>
                </label>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default RoleAccess;
