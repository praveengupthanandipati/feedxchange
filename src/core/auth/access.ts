const VIEW_SUFFIX = ".view";
const MANAGE_SUFFIX = ".manage";

/**
 * Mirrors the API rule: holding any of `required` is enough, and "x.manage" also satisfies "x.view".
 * `held === null` means the backend sent no permission list, so nothing is hidden (legacy behaviour).
 * An empty `required` list means "any signed-in user".
 */
export const hasAnyPermission = (held: ReadonlySet<string> | null, required: readonly string[]): boolean => {
  if (held === null || required.length === 0) return true;
  // Keys are compared ignoring case: the database holds some as "DASHBOARD" and the screens ask for "dashboard".
  const has = (key: string) => lowered(held).has(key.toLowerCase());
  return required.some(
    (key) => has(key) || (key.endsWith(VIEW_SUFFIX) && has(key.slice(0, -VIEW_SUFFIX.length) + MANAGE_SUFFIX)),
  );
};

const loweredCache = new WeakMap<ReadonlySet<string>, Set<string>>();
const lowered = (held: ReadonlySet<string>): Set<string> => {
  let result = loweredCache.get(held);
  if (!result) {
    result = new Set([...held].map((key) => key.toLowerCase()));
    loweredCache.set(held, result);
  }
  return result;
};
