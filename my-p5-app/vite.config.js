import { defineConfig } from 'vite';

export default defineConfig({
  // './' makes asset URLs relative, so the build works whether it's served at
  // the domain root (Cloudflare/Netlify) or a project sub-path
  // (https://<user>.github.io/<repo>/) without hard-coding the repo name.
  base: './',
});
