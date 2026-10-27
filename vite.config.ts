import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Preloads the two font files every page uses first (Inter 400 for text, Poppins 600 for headings), so text is drawn in
 * the right typeface sooner. Their names carry a content hash, so the links are written after the bundle is known.
 */
const preloadFonts = (): Plugin => ({
  name: 'fx-preload-fonts',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(_html, context) {
      const files = Object.keys(context.bundle ?? {})
      const wanted = [/inter-latin-400-normal-[\w-]+\.woff2$/, /poppins-latin-600-normal-[\w-]+\.woff2$/]
      return wanted
        .map((pattern) => files.find((file) => pattern.test(file)))
        .filter((file): file is string => Boolean(file))
        .map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
          injectTo: 'head-prepend' as const,
        }))
    },
  },
})

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // A build must say which API it talks to (.env.local, .env.desktop or the environment): without it the app used to fall
  // back to the QA server silently, so a production build could ship pointing at QA.
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), '')
    if (!env.VITE_API_URL) {
      throw new Error(
        'VITE_API_URL is not set. Set it in .env.local / .env.<mode> or the environment, e.g. VITE_API_URL=https://api.feedxchange.in',
      )
    }
  }

  return {
    plugins: [react(), preloadFonts()],
    css: {
      preprocessorOptions: {
        // Bootstrap's Sass still uses @import and the old global functions; their deprecation notices are Bootstrap's to fix
        scss: { quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'] },
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // console.* calls and debugger statements stay in development and are removed from production files, so nothing
          // the code logs (contract data, API responses) reaches the browser console of a real user
          minify: { compress: { dropConsole: true, dropDebugger: true } },
          // Libraries in their own long-lived files: an app release then re-downloads only the app's own code. Each group
          // still loads only when a screen needs it (the website never loads the chart or live-notification libraries).
          codeSplitting: {
            groups: [
              { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/, priority: 30 },
              { name: 'vendor-redux', test: /node_modules[\\/](@reduxjs|react-redux|redux|immer|reselect|redux-thunk)[\\/]/, priority: 25 },
              { name: 'vendor-charts', test: /node_modules[\\/](recharts|d3-[\w-]+|victory-vendor|internmap|decimal\.js-light|es-toolkit|eventemitter3)[\\/]/, priority: 20 },
              { name: 'vendor-signalr', test: /node_modules[\\/]@microsoft[\\/]signalr[\\/]/, priority: 20 },
              { name: 'vendor-swiper', test: /node_modules[\\/]swiper[\\/]/, priority: 20 },
              { name: 'vendor-icons', test: /node_modules[\\/](lucide-react|react-icons)[\\/]/, priority: 15 },
            ],
          },
        },
      },
    },
  }
})
