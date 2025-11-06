import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()] as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Ensure only one React version is used
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
