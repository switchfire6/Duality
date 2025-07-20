import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/Duality/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
