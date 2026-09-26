(function () {
  var root = document.documentElement;

  try {
    var storedTheme = localStorage.getItem('idd-theme');
    if (storedTheme === 'dark' || (!storedTheme && matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.dataset.theme = 'dark';
    }
  } catch (e) {}

  var skipIntro = false;
  var isReload = false;
  try {
    var navigationEntry = performance.getEntriesByType('navigation')[0];
    var navigationType = navigationEntry && navigationEntry.type;
    isReload = navigationType === 'reload';

    if (isReload) {
      // Ricarica = intro da capo: il browser non deve ripristinare la
      // posizione, e l'ancora nell'URL non deve far saltare l'apertura.
      history.scrollRestoration = 'manual';
      if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    }

    var hasAnchor = location.hash && location.hash !== '#top';
    var isBackForward = navigationType === 'back_forward';
    // Dopo una ricarica il referrer resta quello di prima: va ignorato.
    var comesFromArticle =
      document.referrer &&
      new URL(document.referrer).origin === location.origin &&
      new URL(document.referrer).pathname.indexOf('/articolo') === 0;
    skipIntro = !isReload && !!(hasAnchor || isBackForward || comesFromArticle);
  } catch (e) {}

  root.classList.add('pre-css', skipIntro ? 'no-intro' : 'is-loading');

  try {
    if (
      matchMedia('(pointer: fine)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      root.classList.add('has-cursor-trail');
    }
  } catch (e) {}

  addEventListener('load', function () {
    root.classList.remove('pre-css');
    if (!document.querySelector('.cursor-trail')) {
      root.classList.remove('has-cursor-trail');
    }
    if (isReload) {
      // Il browser ripristina comunque lo scroll intorno al load: lo
      // forziamo a 0 anche subito dopo, per vincere quella corsa.
      scrollTo(0, 0);
      requestAnimationFrame(function () {
        scrollTo(0, 0);
        history.scrollRestoration = 'auto';
      });
    }
  });
})();
