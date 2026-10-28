import { resolve } from "node:path";
import { defineConfig } from "vite";

// Two pages: the main site and the demo product pages (full navigation, no router).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        demos: resolve(import.meta.dirname, "demos/index.html"),
      },
    },
  },
});
