import { initUi } from './ui';

initUi();

// Motion (GSAP + Lenis) is only downloaded when it will actually run.
if (document.documentElement.classList.contains('motion-ok')) {
  import('./motion')
    .then((m) => m.initMotion())
    .catch((err) => {
      console.error('[bombina] motion failed to load', err);
      document.documentElement.classList.remove('motion-ok');
    });
}
