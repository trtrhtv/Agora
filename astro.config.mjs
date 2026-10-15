import { defineConfig } from 'astro/config';
import remarkAgora from './src/plugins/remark-agora.mjs';

export default defineConfig({
  output: 'static',
  markdown: { remarkPlugins: [remarkAgora] },
});
