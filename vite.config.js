import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const basePath = process.env.BUILD_BASE_PATH
  ? { base: process.env.BUILD_BASE_PATH }
  : {};

// https://vitejs.dev/config/
export default defineConfig({
  ...basePath,
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
