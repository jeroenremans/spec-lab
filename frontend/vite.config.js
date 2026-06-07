import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          mermaid: ["mermaid"],
          easymde: ["easymde"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3301",
    },
  },
});
