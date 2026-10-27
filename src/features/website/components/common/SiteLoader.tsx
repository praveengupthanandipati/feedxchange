import logo from "../../assets/images/logo.svg";

/**
 * Full-screen website loader: logo inside a spinning gradient ring, with three bouncing grains.
 * Self-styled (inline <style>) because it shows before the website's stylesheet has downloaded; its colours are the theme
 * tokens (loaded with the app's first stylesheet), with the Light values as fallbacks;
 * App.tsx uses it while the website code loads, and the layout shows it until the first page's
 * images and fonts are ready.
 */
const SiteLoader = ({ leaving = false }: { leaving?: boolean }) => (
  <div className={`fx-loader ${leaving ? "fx-loader--leaving" : ""}`} role="status" aria-live="polite" aria-label="Loading FeedXchange">
    <style>{CSS}</style>
    <div className="fx-loader__ring">
      <img src={logo} alt="" width={150} height={24} />
    </div>
    <div className="fx-loader__grains" aria-hidden>
      <span />
      <span />
      <span />
    </div>
    <p className="fx-loader__text">Loading…</p>
  </div>
);

const CSS = `
.fx-loader {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px;
  background: radial-gradient(80% 60% at 50% 40%, var(--fx-white, #ffffff) 0%, var(--fx-slate-96, #eef4fb) 60%, var(--fx-amber-95, #fff6e6) 100%);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  transition: opacity .45s ease, visibility 0s linear .45s;
}
.fx-loader--leaving { opacity: 0; visibility: hidden; pointer-events: none; }
.fx-loader__ring {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 196px; height: 196px; border-radius: 50%;
  background: var(--fx-white, #fff); box-shadow: 0 24px 50px -24px rgba(var(--fx-blue-11-rgb, 7, 26, 51), .35);
}
.fx-loader__ring::before {
  content: ""; position: absolute; inset: -6px; border-radius: 50%;
  background: conic-gradient(from 0deg, var(--fx-amber-55, #f5a524), var(--fx-blue-31, #1b4a85), var(--fx-teal-38, #22a06b), var(--fx-amber-55, #f5a524));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));
  animation: fx-loader-spin 1.1s linear infinite;
}
.fx-loader__ring img { width: 150px; height: auto; animation: fx-loader-breathe 1.6s ease-in-out infinite; }
.fx-loader__grains { display: flex; gap: 8px; }
.fx-loader__grains span {
  width: 9px; height: 12px; border-radius: 50%; background: var(--fx-amber-55, #f5a524);
  animation: fx-loader-bounce .9s ease-in-out infinite;
}
.fx-loader__grains span:nth-child(2) { background: var(--fx-blue-31, #1b4a85); animation-delay: .15s; }
.fx-loader__grains span:nth-child(3) { background: var(--fx-teal-38, #22a06b); animation-delay: .3s; }
.fx-loader__text { margin: 0; color: var(--fx-slate-35-fg, #46546a); font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }
@keyframes fx-loader-spin { to { transform: rotate(360deg); } }
@keyframes fx-loader-breathe { 50% { transform: scale(.94); opacity: .85; } }
@keyframes fx-loader-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@media (prefers-reduced-motion: reduce) {
  .fx-loader, .fx-loader__ring::before, .fx-loader__ring img, .fx-loader__grains span { animation: none; transition: none; }
}
`;

export default SiteLoader;
