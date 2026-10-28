/* site.js — проявление блоков при прокрутке. Без зависимостей. */
(function () {
  var root = document.documentElement;
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isStatic = navigator.webdriver || /[?&]static\b/.test(location.search);
  function showAll() { items.forEach(function (el) { el.classList.add('is-in'); }); }
  /* нижняя панель появляется, когда кнопки главного экрана ушли с экрана */
  var acts = document.querySelector('.hero__actions');
  if (isStatic || !acts || !('IntersectionObserver' in window)) root.classList.add('dock-on');
  else new IntersectionObserver(function (e) {
    root.classList.toggle('dock-on', !e[0].isIntersecting && e[0].boundingClientRect.top < 0);
  }).observe(acts);
  if (isStatic) { root.classList.add('static'); showAll(); return; }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
  /* если вкладку открыли сразу внизу (по якорю) — показать то, что уже на экране */
  window.addEventListener('load', function () {
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  });
})();
