import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths work both locally and on GitHub Pages project sites.
  base: './',
  plugins: [react()],
});
