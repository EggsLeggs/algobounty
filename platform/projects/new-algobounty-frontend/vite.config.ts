import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure absolute path resolution
const srcPath = path.resolve(__dirname, "src");

export default defineConfig({
  plugins: [react(), tailwindcss()] as PluginOption[],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: srcPath,
      },
      // Ensure only one React version is used
      {
        find: "react",
        replacement: path.resolve(__dirname, "./node_modules/react"),
      },
      {
        find: "react-dom",
        replacement: path.resolve(__dirname, "./node_modules/react-dom"),
      },
    ],
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
