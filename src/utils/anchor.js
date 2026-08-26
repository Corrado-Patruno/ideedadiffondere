export function jumpToCurrentAnchor() {
  const id = location.hash.slice(1);
  const target = id && id !== 'top' ? document.getElementById(id) : null;
  if (!target) return;

  const root = document.documentElement;
  const previousBehaviour = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  target.scrollIntoView();
  requestAnimationFrame(() => {
    root.style.scrollBehavior = previousBehaviour;
  });
}
