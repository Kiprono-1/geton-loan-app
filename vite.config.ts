import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    tailwindcss(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    headers: {
      // Dev-only security headers for testing
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  preview: {
    headers: {
      "Strict-Transport-Security":
        "max-age=63072000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "accelerometer=(), camera=(), geolocation=(self), microphone=(), payment=(self)",
    },
  },
  build: {
    target: "es2020",
    cssMinify: "lightningcss",
    minify: "esbuild",
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      treeshake: {
        moduleSideEffects: (id: string) => id.includes(".css"),
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
  esbuild: {
    legalComments: "none",
    drop: ["debugger"],
  },
});
