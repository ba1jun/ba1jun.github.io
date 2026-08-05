import { defineConfig, fontProviders } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import icon from "astro-icon";
import { remarkReadingTime } from "./src/scripts/remark-reading-time.mjs";
import undiciRetry from "./src/scripts/undici-retry.ts";
import tailwindcss from "@tailwindcss/vite";
import hqService from "@erfianugrah/astro-image-hq";
// Use no-op passthrough image service in dev to skip Sharp processing.
// Images are served as-is during development; full optimization runs in production builds.
const isDev =
  process.env.NODE_ENV !== "production" && !process.argv.includes("build");

// https://astro.build/config
export default defineConfig({
  site:
    process.env.GITHUB_PAGES === "true"
      ? "https://erfianugrah.github.io"
      : "https://www.erfianugrah.com",
  base: process.env.GITHUB_PAGES === "true" ? "/revista-3" : undefined,

  image: {
    domains: ["erfianugrah.com", "image.erfi.io"],
    service: isDev
      ? { entrypoint: "astro/assets/services/noop" }
      : hqService({
          // Photography profile: HQ encoding + content-aware shadow boost.
          // Falls back to sharp if avifenc unavailable (with a warning).
          // See MEDIA_ENCODER.md for design rationale.
          profile: "photo",
          gpu: { maxMemoryUtilization: 0.5 },
          log: "summary",
        }),
  },

  integrations: [
    icon(),
    sitemap(),
    mdx(), // inherits syntaxHighlight, shikiConfig, remarkPlugins, rehypePlugins from markdown config
    undiciRetry(),
  ],

  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "rose-pine-dawn",
      defaultColor: false,
      themes: {
        light: "rose-pine-dawn",
        dark: "tokyo-night",
      },
      langs: [],
      wrap: true,
    },
    // mdx 6 / astro 6.4: the top-level remarkPlugins/rehypePlugins/gfm options
    // are deprecated. Pass them to unified() and set as markdown.processor —
    // MDX inherits automatically. Keep gfm: false because we apply remark-gfm
    // explicitly below (Astro's built-in adds it with default options first).
    processor: unified({
      remarkPlugins: [remarkGfm, remarkMath, remarkReadingTime],
      rehypePlugins: [rehypeKatex],
      gfm: false,
    }),
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inconsolata",
      cssVariable: "--font-inconsolata",
      display: "swap",
      fallbacks: ["monospace"],
      weights: [200, 400, 700, 900],
      optimizedFallbacks: true,
    },
    {
      provider: fontProviders.fontsource(),
      name: "Overpass Mono",
      cssVariable: "--font-overpass-mono",
      display: "swap",
      fallbacks: ["monospace"],
      weights: [300, 400, 700],
      optimizedFallbacks: true,
    },
  ],

  experimental: {
    clientPrerender: true,
    // responsiveImages: true,
    // directRenderScript: true
  },

  build: {
    concurrency: 4,
    measuring: {
      entryBuilding: true,
      pageGeneration: true,
      bundling: true,
      rendering: true,
      assetProcessing: true,
    },
  },

  security: {
    checkOrigin: false,
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Astro's plugin-scripts inlines small hoisted script chunks into the
      // HTML, but the inlined copy keeps Vite's raw __VITE_PRELOAD__ marker
      // (ReferenceError at runtime) when the chunk wraps a dynamic import in
      // __vitePreload(). This broke the lazy /pagefind/pagefind.js import.
      // Force scripts to always emit as chunks; keep asset inlining at the
      // 4kB default (returning undefined falls through to it).
      assetsInlineLimit: (filePath) =>
        filePath.endsWith(".js") ? false : undefined,
    },
  },
});
