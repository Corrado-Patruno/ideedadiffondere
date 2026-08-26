import master from './master.json';
import articles from './articoli.json';

const OWN_PUBLISHER = 'Idee da Diffondere';

const yearOf = (isoDate) => String(isoDate ?? '').slice(0, 4);

const toPressEntry = (article) => ({
  publisher: article.testata || OWN_PUBLISHER,
  year: yearOf(article.data),
  title: article.titolo,
  excerpt: article.estratto,
  image: article.immagine,
  href: `/articolo.html?a=${encodeURIComponent(article.slug)}`,
  isInternal: true,
});

const toExternalPressEntry = (mention) => ({
  publisher: mention.testata,
  year: String(mention.anno),
  title: mention.titolo,
  excerpt: mention.estratto,
  image: mention.immagine,
  href: mention.link,
  isInternal: false,
});

export const tickerWords = master.ticker;

export const teamMembers = master.team.map((member) => ({
  name: member.nome,
  role: member.ruolo,
  photo: member.immagine,
  linkedin: member.linkedin,
}));

export const events = master.eventi.map((event) => ({
  title: event.titolo,
  description: event.descrizione,
  date: event.data,
  link: event.link,
  isComingSoon: Boolean(event.comingSoon),
}));

export const contacts = {
  email: master.contatti.email,
  instagram: master.contatti.instagram,
};

export const articleBySlug = (slug) => articles.find((article) => article.slug === slug);

// Anno decrescente; a parità di anno vale l'ordine di questo elenco (sort stabile).
export const pressEntries = [
  ...master.stampa.map(toExternalPressEntry),
  ...articles.map(toPressEntry),
].sort((a, b) => Number(b.year) - Number(a.year));
