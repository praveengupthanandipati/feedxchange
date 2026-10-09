import type { AsideNavChild, AsideNavItem, AsideNavSection } from "./aside.types";
import { localNavSections } from "./aside.data";

type CanFn = (...keys: string[]) => boolean;

/** Keeps only what the user may see: children inherit their parent's keys, empty groups and sections disappear. */
export const filterNavSections = (sections: AsideNavSection[], can: CanFn): AsideNavSection[] =>
  sections
    .map((section) => ({
      ...section,
      items: section.items.flatMap((item): AsideNavItem[] => {
        const itemAllowed = !item.permissions || can(...item.permissions);
        if (!item.children) return itemAllowed ? [item] : [];

        const children = item.children.filter((child: AsideNavChild) => {
          const keys = child.permissions ?? item.permissions;
          return !keys || can(...keys);
        });
        // A group with its own keys needs them; a plain group shows when any child does.
        if (item.permissions ? !itemAllowed : children.length === 0) return [];
        if (children.length === 0 && !item.path) return [];
        return [{ ...item, children: children.length > 0 ? children : undefined }];
      }),
    }))
    .filter((section) => section.items.length > 0);

/** First screen the user can open from the menu (used to land users whose role has no Dashboard). */
export const firstNavPath = (sections: AsideNavSection[]): string | null => {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.path) return item.path;
      if (item.children?.[0]) return item.children[0].path;
    }
  }
  return null;
};

/**
 * Adds menu sections the backend menu doesn't know about yet (Interest of Payments, Company Invoices), in order,
 * right after User Management. A section the menu already has (any of its screens) is left where the backend put it,
 * and the next local section follows it.
 */
export const withLocalSections = (sections: AsideNavSection[]): AsideNavSection[] => {
  const result = [...sections];
  const pathsOf = (section: AsideNavSection) =>
    section.items.flatMap((item) => [item.path, ...(item.children ?? []).map((child) => child.path)]).filter(Boolean);

  const userManagement = result.findIndex(
    (section) => section.id === "user-management" || /user management/i.test(section.title ?? ""),
  );
  let at = userManagement === -1 ? result.length : userManagement + 1;

  for (const local of localNavSections) {
    const localPaths = new Set(pathsOf(local));
    const existing = result.findIndex((section) => pathsOf(section).some((path) => localPaths.has(path)));
    if (existing !== -1) {
      at = existing + 1;
      continue;
    }
    result.splice(at, 0, local);
    at += 1;
  }
  return result;
};
