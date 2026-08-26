export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () => matchMedia('(pointer: fine)').matches;

export function scrollToTop() {
  const instant = prefersReducedMotion();
  window.scrollTo({ top: 0, behavior: instant ? 'instant' : 'smooth' });
  return instant;
}
