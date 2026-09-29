const VIEW_SUFFIX = ".view";
const MANAGE_SUFFIX = ".manage";

/**
 * Mirrors the API rule: holding any of `required` is enough, and "x.manage" also satisfies "x.view".
 * `held === null` means the backend sent no permission list, so nothing is hidden (legacy behaviour).
 * An empty `required` list means "any signed-in user".
 */
export const hasAnyPermission = (held: ReadonlySet<string> | null, required: readonly string[]): boolean => {
  if (held === null || required.length === 0) return true;
  return required.some(
    (key) =>
      held.has(key) ||
      (key.endsWith(VIEW_SUFFIX) && held.has(key.slice(0, -VIEW_SUFFIX.length) + MANAGE_SUFFIX)),
  );
};
