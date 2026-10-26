import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** True when the visitor has asked their OS for less motion. Updates live if they change it. */
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia?.(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia?.(QUERY);
    if (!media) return;
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
};
