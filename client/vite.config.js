import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Pass all responses through as-is (including 503 offline-mode responses)
        // Without this, Vite rewrites non-2xx upstream errors to 500
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            // Server completely unreachable — return clean JSON instead of crashing
            if (res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Server offline', offlineMode: true }));
            }
          });
        },
      },
    },
  },
});
