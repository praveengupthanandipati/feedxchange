import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './app/App.tsx'
import { startTheme } from './shared/theme/theme'
import { startModalFocus } from './shared/a11y/modalFocus'
import { store } from './core/store/store'
import "./shared/assets/fonts";
// Bootstrap's CSS, only the parts in use (shared/assets/styles/bootstrap.scss)
import "./shared/assets/styles/bootstrap.scss";
// design tokens (CSS custom properties) for the app and the website; after Bootstrap so its --bs-* variables follow the brand
import "./shared/assets/styles/tokens.scss";

startTheme()
startModalFocus()

// A prerendered website page (scripts/prerender.mjs) is already in #root and readable. Rendering into #root would wipe it at once and
// show loading screens while the page's code downloads, so the app starts in a hidden twin and takes over only when the page has
// rendered (useSeo calls window.__fxShowApp). The admin app and pages that were not prerendered start in #root as before.
// The twin is invisible but laid out (not display:none), over the static copy and inert, so its text gets its web fonts and
// final layout before it is shown: the switch is then pixel for pixel and moves nothing (no layout shift).
const host = document.getElementById('root')!
const win = window as Window & { __fxPrerendered?: boolean; __fxShowApp?: () => void }
let container = host
if (host.firstElementChild && !location.pathname.startsWith('/admin')) {
  win.__fxPrerendered = true
  container = document.createElement('div')
  container.dataset.fxTwin = ''
  container.style.cssText = 'position:absolute;top:0;left:0;right:0;visibility:hidden;pointer-events:none'
  container.setAttribute('inert', '')
  container.setAttribute('aria-hidden', 'true')
  host.after(container)
  let shown = false
  const show = () => {
    if (shown) return
    shown = true
    host.remove()
    container.id = 'root'
    container.removeAttribute('style')
    container.removeAttribute('inert')
    container.removeAttribute('aria-hidden')
    delete container.dataset.fxTwin
  }
  // after the page's own render, once the fonts its text needs are in
  win.__fxShowApp = () => void document.fonts.ready.then(() => window.setTimeout(show, 0))
  // never leave visitors on the static copy if something goes wrong
  window.setTimeout(show, 10000)
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
