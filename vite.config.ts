import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    },
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"]
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    open: false
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-hook-form",
      "@hookform/resolvers/zod",
      "zod",
      "react-query"
    ]
  },
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
