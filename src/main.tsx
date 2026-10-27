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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
