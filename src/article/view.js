import { articleBySlug } from '../data/content.js';
import { escapeHtml, escapeUrl, select } from '../utils/dom.js';
import { formatLongDate } from '../utils/format.js';

const BLOCK_RENDERERS = {
  titolo: (block) => `<h2>${escapeHtml(block.testo)}</h2>`,

  paragrafo: (block) => `<p>${escapeHtml(block.testo)}</p>`,

  elenco: (block) =>
    `<ul>${(block.voci || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`,

  citazione: (block) => `
    <blockquote>
      <p>${escapeHtml(block.testo)}</p>
      ${block.fonte ? `<cite>${escapeHtml(block.fonte)}</cite>` : ''}
    </blockquote>`,

  immagine: (block) => `
    <figure>
      <img src="${escapeUrl(block.src)}" alt="${escapeHtml(block.alt || '')}" loading="lazy" />
      ${block.didascalia ? `<figcaption>${escapeHtml(block.didascalia)}</figcaption>` : ''}
    </figure>`,
};

const renderBlock = (block) => {
  const renderer = BLOCK_RENDERERS[block.tipo];
  if (renderer) return renderer(block);
  console.warn(`[IDD] tipo di blocco sconosciuto: "${block.tipo}"`);
  return '';
};

const notFoundMarkup = () => `
  <div class="articolo-vuoto">
    <p class="articolo-occhiello">Articolo non trovato</p>
    <h1 class="articolo-titolo">Questo articolo non esiste (più)</h1>
    <p class="articolo-sommario">
      Forse l'indirizzo è incompleto. Dalla rassegna stampa trovi tutto quello che abbiamo pubblicato.
    </p>
    <a class="btn" href="/#stampa">Vai alla rassegna stampa</a>
  </div>`;

const articleMarkup = (article) => {
  const byline = [article.testata, article.autore, formatLongDate(article.data)].filter(Boolean);

  return `
    <article>
      <header class="articolo-testa">
        <a class="articolo-indietro" href="/#stampa">← Rassegna stampa</a>
        ${article.occhiello ? `<p class="articolo-occhiello">${escapeHtml(article.occhiello)}</p>` : ''}
        <h1 class="articolo-titolo">${escapeHtml(article.titolo)}</h1>
        ${article.estratto ? `<p class="articolo-sommario">${escapeHtml(article.estratto)}</p>` : ''}
        ${byline.length ? `<p class="articolo-firma">${byline.map(escapeHtml).join(' · ')}</p>` : ''}
      </header>

      ${
        article.immagine
          ? `<figure class="articolo-apertura">
               <img src="${escapeUrl(article.immagine)}"
                    alt="${escapeHtml(article.immagineAlt || '')}" />
             </figure>`
          : ''
      }

      <div class="articolo-corpo">${(article.corpo || []).map(renderBlock).join('')}</div>

      <footer class="articolo-coda">
        ${
          article.link
            ? `<a class="articolo-originale" href="${escapeUrl(article.link)}"
                  target="_blank" rel="noopener">
                 Leggi l'originale su ${escapeHtml(article.testata || 'la testata')} ↗
               </a>`
            : ''
        }
        <a class="btn" href="/#stampa">Tutti gli articoli</a>
      </footer>
    </article>`;
};

const applyDocumentMetadata = (article) => {
  document.title = `${article.titolo} — Idee da Diffondere`;
  const description = select('meta[name="description"]');
  if (description) description.content = article.estratto || '';
};

export function renderArticle() {
  const container = select('#articolo');
  const slug = new URLSearchParams(location.search).get('a');
  const article = articleBySlug(slug);

  if (!article) {
    container.innerHTML = notFoundMarkup();
    return;
  }

  applyDocumentMetadata(article);
  container.innerHTML = articleMarkup(article);
}
