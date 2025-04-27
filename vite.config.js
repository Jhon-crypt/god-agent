import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Disable type checking during build
    typescript: {
      transpileOnly: true,
      noEmit: false
    }
  }
}); 