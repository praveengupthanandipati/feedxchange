import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './app/App.tsx'
import { store } from './core/store/store'
import "bootstrap/dist/css/bootstrap.min.css";
// design tokens (CSS custom properties) for the app and the website; after Bootstrap so its --bs-* variables follow the brand
import "./shared/assets/styles/tokens.scss";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
