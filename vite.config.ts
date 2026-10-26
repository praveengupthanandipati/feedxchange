import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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
    plugins: [react()],
    build: {
      rolldownOptions: {
        output: {
          // console.* calls and debugger statements stay in development and are removed from production files, so nothing
          // the code logs (contract data, API responses) reaches the browser console of a real user
          minify: { compress: { dropConsole: true, dropDebugger: true } },
        },
      },
    },
  }
})
