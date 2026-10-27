import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Every icon in the app goes through this wrapper, so they share one look: the Lucide line set, a 2px stroke and a few sizes.
 *
 *   12  the remove "x" on a chip
 *   14  inside a field: its chevron, calendar and clear "x" (with ICON_STROKE_FINE, so they match)
 *   16  dense UI: table cells, chips, badges, inline hints
 *   20  controls: buttons, inputs, menu items
 *   24  page headers, empty states, the phone tab bar
 *   "1em" (the default) follows the surrounding text, which is how the icons were sized before Lucide
 *
 * Import ready-made icons from "shared/components/icon" (TruckIcon, BellIcon, ...) rather than from lucide-react, and
 * add a new one to icons.ts. An icon is decorative (aria-hidden) unless it gets an aria-label or a title.
 */
export type IconSize = 12 | 14 | 16 | 20 | 24 | "1em";

export const ICON_STROKE = 2;

/** The lighter stroke of the small icons inside fields (chevron, calendar, clear "x"). */
export const ICON_STROKE_FINE = 1.5;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** One of the standard sizes; any number or CSS length also works for the rare one-off (an illustration). */
  size?: IconSize | number | string;
  strokeWidth?: number | string;
  /** Tooltip and accessible name, drawn as the SVG's <title>. */
  title?: string;
}

/** Any icon component: ours, or a react-icons glyph still used for brand logos and a few illustrations. */
export type IconComponent = ComponentType<IconProps>;

interface GlyphProps extends IconProps {
  icon: LucideIcon | ComponentType<IconProps & { size?: number | string }>;
}

export const Icon = ({ icon: Glyph, size = "1em", strokeWidth = ICON_STROKE, title, children, ...props }: GlyphProps) => (
  <Glyph
    size={size}
    strokeWidth={strokeWidth}
    aria-hidden={props["aria-label"] || title ? undefined : true}
    focusable="false"
    {...props}
  >
    {title && <title>{title}</title>}
    {children}
  </Glyph>
);

/** Wraps a Lucide glyph (or another icon component) as a ready-made icon with the standard defaults. */
export const createIcon = (glyph: GlyphProps["icon"], name: string): IconComponent => {
  const Component = (props: IconProps) => <Icon icon={glyph} {...props} />;
  Component.displayName = name;
  return Component;
};
