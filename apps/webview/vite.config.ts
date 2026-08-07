import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],

  // Root-absolute, not './'. A relative base emits `./assets/index-<hash>.js`,
  // which the browser resolves against the current path — so under BrowserRouter
  // a load of /bus/hssc/info asks for /bus/hssc/assets/index-<hash>.js. That file
  // does not exist, Cloudflare Pages answers it with index.html at HTTP 200 and
  // Content-Type text/html, and the module script is then rejected on the MIME
  // check. The result is a blank page while every status code is 200, which no
  // HTTP-level check can see. Relative was correct while HashRouter kept the
  // browser's path at '/' for every route.
  base: '/',
});
