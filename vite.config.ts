import { resolve } from "node:path";
import { defineConfig } from "vite";

// Two pages: the main site and the demo product pages (full navigation, no router).
export default defineConfig({
  build: {
    // Never inline fonts as base64: the font packages split each face into many
    // small unicode-range files, and inlined they all land in the render-blocking
    // CSS (126 KB, mostly Korean glyphs of Bagel Fat One) instead of loading only
    // when a page actually uses those characters.
    assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined),
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        demos: resolve(import.meta.dirname, "demos/index.html"),
      },
    },
  },
});
