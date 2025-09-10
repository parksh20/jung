import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // If you use GitHub Pages, set base to '/REPO_NAME/'
  // base: '/your-repo-name/'
})
