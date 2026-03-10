import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/axios-adapter.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  noExternal: ['@network-tool/shared'],
});
