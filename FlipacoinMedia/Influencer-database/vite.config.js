import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages, set base: '/<REPO_NAME>/' then rebuild.
  // base: '/influencer-management/',
})
