import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: './app/backend/server.ts',  // Entry point for your server
    },
  },
  server: {
    port: 3000,  // Port for the Vite dev server
    hmr: true,   // Enable hot module replacement
  },
});
