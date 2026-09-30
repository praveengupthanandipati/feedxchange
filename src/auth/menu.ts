import { matchPath } from "react-router-dom";
import type { AsideNavChild, AsideNavItem, AsideNavSection } from "../components/asidemenu/aside.types";
import { iconFor } from "../components/asidemenu/iconMap";

// Shape of GET /api/Access/menu - the Modules / Pages / PageActions tables as seen by the signed-in user.
export type PageAction = "view" | "create" | "edit" | "delete";

/** SubModule = dropdown with its own route, Page = menu item, Screen = not in the menu (detail / new / edit). */
export type PageType = "SubModule" | "Page" | "Screen";

export interface AccessPage {
  pageKey: string;
  title: string;
  /** Absent on an API that has not been updated: then it is worked out from showInMenu and the children. */
  pageType?: PageType;
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

const isVisible = (page: AccessPage) => page.showInMenu && page.allowed && typeOf(page) !== "Screen";

const typeOf = (page: AccessPage): PageType =>
  page.pageType ?? (!page.showInMenu ? "Screen" : page.children.some((child) => child.showInMenu) ? "SubModule" : "Page");

/**
 * Menu sections for the sidebar: Module (plain text heading) -> Sub Module (dropdown with icon and route)
 * -> Page (item; the sidebar draws one common bullet for every page). Only what the user may open is kept.
 */
export const toNavSections = (menu: AccessMenu): AsideNavSection[] =>
  menu.modules
    .map((module): AsideNavSection => {
      const items = module.pages.filter(isVisible).flatMap((page): AsideNavItem[] => {
        const children: AsideNavChild[] = page.children
          .filter((child) => isVisible(child) && child.routePath)
          .map((child) => ({
            id: child.pageKey,
            label: child.title,
            path: child.routePath!,
            relatedPaths: child.relatedPaths.length > 0 ? child.relatedPaths : undefined,
          }));
        // a Sub Module normally has its own route (its overview page); if it has none, it opens its first page
        const path = page.routePath ?? children[0]?.path;
        if (!path && children.length === 0) return [];
        return [
          {
            id: page.pageKey,
            label: page.title,
            icon: iconFor(page.icon),
            path,
            children: children.length > 0 ? children : undefined,
          },
        ];
      });
      return { id: module.moduleKey, title: module.name, items };
    })
    .filter((section) => section.items.length > 0);
