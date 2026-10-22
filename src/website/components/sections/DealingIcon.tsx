import type { ReactNode } from "react";
import type { DealingPartner } from "../../data/content";

interface DealingIconProps {
  kind: DealingPartner["kind"];
  /** When true, the motion-path animations are left out (prefers-reduced-motion). */
  still: boolean;
}

/**
 * An element (drawn around 0,0) that travels along `path` forever, via SVG <animateMotion>.
 * When `still`, it simply sits at the path's starting point.
 */
const Mover = ({ path, dur, still, rotate, children }: { path: string; dur: string; still: boolean; rotate?: boolean; children: ReactNode }) => {
  const [, x = "0", y = "0"] = /^M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(path) ?? [];
  return (
    <g className="dealing-icon__accent" transform={still ? `translate(${x} ${y})` : undefined}>
      {children}
      {!still && <animateMotion dur={dur} repeatCount="indefinite" path={path} rotate={rotate ? "auto" : undefined} />}
    </g>
  );
};

/**
 * Line-art icons for the Dealing Partners cards: navy outlines (drawn in when revealed) and an orange
 * element moving along a motion path.
 */
const DealingIcon = ({ kind, still }: DealingIconProps) => (
  <svg className="dealing-icon" viewBox="0 0 64 64" fill="none" aria-hidden>
    {kind === "poultry" && (
      <>
        <path className="draw" d="M16 38c0-9 7-16 16-16 1-6 5-10 10-10 4 0 6 3 6 6l4 2-4 2c0 4-2 6-4 8 4 4 6 8 4 14-2 6-8 10-16 10-10 0-16-6-16-16z" />
        <path className="draw" d="M41 12c0-3 2-4 4-3 1-2 3-1 3 1" />
        <circle cx="44" cy="16" r="1.2" className="fill" />
        <path className="draw accent-stroke" d="M24 38c4-4 10-4 14 0-4 4-10 4-14 0z" />
        <path className="draw" d="M28 54v6m8-6v6m-10 0h4m4 0h4M6 60h52" />
        {/* A grain falls from the beak to the ground. */}
        <Mover path="M52 20 C53 30 52 44 52 58" dur="2.2s" still={still}>
          <ellipse cx="0" cy="0" rx="1.6" ry="2.2" className="accent-fill" />
        </Mover>
      </>
    )}

    {kind === "fish" && (
      <>
        <rect className="draw" x="10" y="18" width="44" height="40" rx="3" />
        <path className="draw" d="M10 26c4-3 7 3 11 0s7 3 11 0 7 3 11 0 7 3 11 0" />
        <path className="draw" d="M16 18V5l9 3.5-9 3.5" />
        <path className="draw" d="M46 36h4m-4 4h4M14 48h4m-4 4h4" />
        {/* A fish swims a wave through the tank. */}
        <Mover path="M16 40 C22 32 30 46 38 38 S46 44 48 40 S36 50 26 46 S14 44 16 40" dur="6s" still={still} rotate>
          <path d="M-6 0c3-4 8-4 11 0-3 4-8 4-11 0zm11 0 4-3v6z" className="accent-stroke" />
        </Mover>
      </>
    )}

    {kind === "prawn" && (
      <>
        <path className="draw" d="M46 20C34 10 16 16 14 32c-2 12 8 20 20 18 6-1 10-6 8-12" />
        <path className="draw" d="M20 22l4 5m4-8 2 6m6-7v6m-18 6 6 2m-6 6 6-1m-2 7 4-4" />
        <path className="draw" d="M34 50l-5 8 7-3m-2-5 5 7" />
        <path className="draw" d="M46 20c5-8 9-10 14-12M46 20c7-2 11-3 16-3" />
        <circle cx="44" cy="24" r="1.4" className="accent-fill" />
        {/* Bubbles rise from the prawn. */}
        <Mover path="M48 26 C52 20 46 16 50 10 S48 4 50 0" dur="2.6s" still={still}>
          <circle r="1.8" className="accent-stroke" />
        </Mover>
        <Mover path="M40 30 C44 24 38 20 42 14 S40 8 42 4" dur="3.4s" still={still}>
          <circle r="1.2" className="accent-stroke" />
        </Mover>
      </>
    )}

    {kind === "cattle" && (
      <>
        <path className="draw" d="M10 30c0-2 2-4 4-4h28l8-6h6v10l-4 4v12c0 2-2 4-4 4H14c-2 0-4-2-4-4z" />
        <path className="draw" d="M50 20l-3-6m9 6 2-6" />
        <path className="draw" d="M16 50v8m6-8v8m16-8v8m6-8v8" />
        <path className="draw" d="M10 32c-4 2-5 8-3 12" />
        <circle cx="53" cy="25" r="1.2" className="fill" />
        <path className="accent-fill" d="M20 30c4-1 7 2 6 5s-5 4-8 2-1-6 2-7zm14 6c3 0 5 2 4 4s-4 3-6 1 0-5 2-5z" />
        {/* A fly loops around the cow's head. */}
        <Mover path="M54 12 C62 12 62 22 54 22 S46 12 54 12" dur="3s" still={still}>
          <circle r="1.6" className="accent-fill" />
          <path d="M-1-1-3-4m4 3 2-3" className="accent-stroke thin" />
        </Mover>
      </>
    )}
  </svg>
);

export default DealingIcon;
