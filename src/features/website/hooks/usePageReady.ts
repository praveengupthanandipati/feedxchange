import { useEffect, useState } from "react";

/** Never keep visitors waiting longer than this, even on a slow connection. */
const MAX_WAIT = 4000;
/** Keep the loader up at least this long so it doesn't just flash. */
const MIN_SHOW = 450;

const loadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

/**
 * False until the given images and the web fonts have loaded (and at least MIN_SHOW ms have passed),
 * or until MAX_WAIT ms, whichever comes first. A failed image counts as done, so the site always opens.
 * Runs once per mount: the website layout stays mounted while moving between its pages.
 */
export const usePageReady = (images: string[]) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && setReady(true);
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const minDelay = new Promise((resolve) => window.setTimeout(resolve, MIN_SHOW));
    const maxTimer = window.setTimeout(done, MAX_WAIT);

    Promise.all([fonts, minDelay, ...images.map(loadImage)]).then(done);

    return () => {
      cancelled = true;
      window.clearTimeout(maxTimer);
    };
    // The image list is fixed for the layout's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
};
