export const select = (selector, scope = document) => scope.querySelector(selector);

export const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);

const SAFE_URL_SCHEME = /^(?:https?:|mailto:|[#/](?!\/))/i;

export const escapeUrl = (value) => {
  const url = String(value ?? '').trim();
  return SAFE_URL_SCHEME.test(url) ? escapeHtml(url) : '#';
};
