import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  noExternal: ['@network-tool/shared'],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
