import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export const baseConfig = defineConfig({
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
    sourcemap: true,
  },
});
