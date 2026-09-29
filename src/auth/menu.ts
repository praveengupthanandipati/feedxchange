import { matchPath } from "react-router-dom";
import type { AsideNavChild, AsideNavItem, AsideNavSection } from "../components/asidemenu/aside.types";
import { iconFor } from "../components/asidemenu/iconMap";

// Shape of GET /api/Access/menu - the Modules / Pages / PageActions tables as seen by the signed-in user.
export type PageAction = "view" | "create" | "edit" | "delete";

export interface AccessPage {
  pageKey: string;
  title: string;
  routePath: string | null;
  relatedPaths: string[];
  icon: string | null;
  sortOrder: number;
  showInMenu: boolean;
  allowed: boolean;
  actions: Record<string, boolean>;
  children: AccessPage[];
}

export interface AccessModule {
  moduleKey: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  pages: AccessPage[];
}

export interface AccessMenu {
  modules: AccessModule[];
}

const flatten = (pages: AccessPage[]): AccessPage[] => pages.flatMap((page) => [page, ...flatten(page.children)]);

export const allPages = (menu: AccessMenu): AccessPage[] => menu.modules.flatMap((module) => flatten(module.pages));

/** The page a URL belongs to. Fixed paths win over ones with parameters ("/products/new" over "/products/:id"). */
export const findPageForPath = (menu: AccessMenu, pathname: string): AccessPage | null => {
  const matches = allPages(menu).filter(
    (page) => page.routePath && matchPath({ path: page.routePath, end: true }, pathname),
  );
  if (matches.length === 0) return null;
  const params = (path: string) => (path.match(/:/g) ?? []).length;
  matches.sort((a, b) => params(a.routePath!) - params(b.routePath!) || b.routePath!.length - a.routePath!.length);
  return matches[0];
};

/** Whether the user may do `action` on the page with `pageKey` (false when the page is unknown). */
export const canOnPage = (menu: AccessMenu | null, pageKey: string, action: PageAction): boolean => {
  if (!menu) return false;
  const page = allPages(menu).find((p) => p.pageKey === pageKey);
  return !!page && page.allowed && page.actions[action] === true;
};

/** Menu sections for the sidebar: only pages the user may open, groups only when something inside is visible. */
export const toNavSections = (menu: AccessMenu): AsideNavSection[] =>
  menu.modules
    .map((module): AsideNavSection => {
      const items = module.pages
        .filter((page) => page.showInMenu && page.allowed)
        .flatMap((page): AsideNavItem[] => {
          const children: AsideNavChild[] = page.children
            .filter((child) => child.showInMenu && child.allowed && child.routePath)
            .map((child) => ({
              id: child.pageKey,
              label: child.title,
              path: child.routePath!,
              relatedPaths: child.relatedPaths.length > 0 ? child.relatedPaths : undefined,
            }));
          if (!page.routePath && children.length === 0) return [];
          return [
            {
              id: page.pageKey,
              label: page.title,
              icon: iconFor(page.icon),
              path: page.routePath ?? undefined,
              children: children.length > 0 ? children : undefined,
            },
          ];
        });
      return { id: module.moduleKey, title: module.name, items };
    })
    .filter((section) => section.items.length > 0);
