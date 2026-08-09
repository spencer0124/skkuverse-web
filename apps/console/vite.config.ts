import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Root-absolute, for the same reason apps/webview is: this app routes by path,
  // and a relative base resolves asset URLs against the current path, so a deep
  // link asks for a file the build never wrote. Cloudflare Pages answers that
  // with index.html at HTTP 200 and the module script dies on the MIME check —
  // a blank page with every status code green.
  base: '/',
});
