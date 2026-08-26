import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

function renderBlockingArticleScript() {
  return {
    name: 'idd-blocking-render',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.filename.endsWith('articolo.html')) return html;
      return html.replace(
        /<script type="module"(?![^>]*\bblocking=)([^>]*?src="[^"]+\.js")/,
        '<script type="module" blocking="render"$1'
      );
    },
  };
}

export default defineConfig({
  plugins: [renderBlockingArticleScript()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        articolo: fileURLToPath(new URL('./articolo.html', import.meta.url)),
      },
    },
  },
});
