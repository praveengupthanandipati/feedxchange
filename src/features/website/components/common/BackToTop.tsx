import { useEffect, useState } from "react";
import { ArrowUpIcon } from "../../../../shared/components/icon";

const SHOW_AFTER = 480;
const RING = 2 * Math.PI * 22; // circumference of the progress ring (r = 22)

/**
 * Round "back to top" button, bottom right. Appears after scrolling down, gently pulses (scale), and
 * its ring fills to show how far down the page you are.
 */
const BackToTop = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(window.scrollY > SHOW_AFTER);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    // Throttle to one update per animation frame.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <svg className="back-to-top__ring" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="22" />
        <circle cx="24" cy="24" r="22" className="back-to-top__progress" style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - progress) }} />
      </svg>
      <ArrowUpIcon aria-hidden className="back-to-top__icon" />
    </button>
  );
};

export default BackToTop;
