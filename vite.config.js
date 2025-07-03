import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base:'/chataffy/superadmin/',
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
