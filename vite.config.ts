import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5175,
      strictPort: true
    },
    // Add base path for GitHub Pages deployment - update 'ecommerce' to match your repository name
    base: mode === 'production' ? '/' : '/',
    // Environment variables
    define: {
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      // Optimize for deployment
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom']
          }
        }
      }
    },
    // Add Node.js compatibility
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    },
    // CSS configuration to prevent crypto hash issues
    css: {
      devSourcemap: true
    }
  }
})
