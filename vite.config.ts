
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,  // Evitar problemas de porta
    hmr: {
      protocol: 'ws',
      host: '0.0.0.0',
      port: 8080,
      clientPort: 443,
      timeout: 120000,  // Aumentar o timeout para 2 minutos
      overlay: true,    // Mostrar erros na tela
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
