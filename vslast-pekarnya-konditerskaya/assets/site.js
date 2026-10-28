/* site.js — проявление при прокрутке, панель «Позвонить», счётчики. Без зависимостей.
   Надёжность: элементы прячутся только под классом html.rv, который ставит этот скрипт
   после успешной настройки. Без JS, при ошибке, в reduced-motion и в headless всё видно сразу.
   Запасной таймер: если наблюдатель не ответил за 2,5 с — показать всё. */
(function () {
  var root = document.documentElement;
  var all = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var qs = location.search;
  var isStatic = (navigator.webdriver && !/[?&]motion\b/.test(qs)) || /[?&]static\b/.test(qs);
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;
  var items = all('[data-reveal]');
  var STAG = '.services > li, .facts > li, .steps > li, .gallery > figure, .prices__row, .contacts__item';
  var ok = false;

  function showAll() {
    root.classList.remove('rv');
    items.forEach(function (el) { el.classList.add('is-in'); });
  }
  /* счётчик: от 0 до настоящего числа из разметки; итог — ровно исходный текст */
  function count(el) {
    var txt = el.getAttribute('data-to');
    var to = parseFloat(String(txt).replace(',', '.'));
    if (!txt || !isFinite(to)) return;
    var dec = (txt.split(/[.,]/)[1] || '').length, t0 = 0;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 700), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = p < 1 ? v.toFixed(dec).replace('.', ',') : txt;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function prepCounters() {
    all('.facts__item--rating').forEach(function (li) {
      var n = li.querySelector('.facts__num');
      if (n) { n.setAttribute('data-to', n.textContent.trim()); n.classList.add('count'); }
      [].slice.call(li.childNodes).forEach(function (node) {
        if (node.nodeType !== 3 || !/\d+\s+(оцен|отзыв)/.test(node.nodeValue)) return;
        var box = document.createElement('span');
        node.nodeValue.split(/(\d+)(?=\s+(?:оцен|отзыв))/).forEach(function (part, i) {
          if (i % 2) {
            var s = document.createElement('span');
            s.className = 'count'; s.setAttribute('data-to', part); s.textContent = part;
            s.style.minWidth = part.length + 'ch';
            box.appendChild(s);
          } else box.appendChild(document.createTextNode(i ? part.replace(/^\s+/, ' ') : part));
        });
        li.replaceChild(box, node);
      });
    });
  }

  try {
    /* нижняя панель: появляется, когда кнопки главного экрана ушли вверх */
    var acts = document.querySelector('.hero__actions');
    if (isStatic || !acts || !hasIO) root.classList.add('dock-on');
    else {
      root.classList.add('dock-js');
      new IntersectionObserver(function (e) {
        root.classList.toggle('dock-on', !e[0].isIntersecting && e[0].boundingClientRect.top < 0);
      }).observe(acts);
    }
    if (isStatic) { root.classList.add('static'); showAll(); return; }
    if (reduce || !hasIO) { showAll(); return; }

    prepCounters();
    /* пункты списков появляются по очереди */
    items.forEach(function (el) {
      var kids = all(STAG, el);
      if (kids.length) el.classList.add('rv-list');
      kids.forEach(function (k, i) {
        k.classList.add('rv-kid');
        k.style.setProperty('--d', Math.min(i, 7) * 70 + 'ms');
      });
    });
    var io = new IntersectionObserver(function (entries) {
      ok = true;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        all('.count', e.target).forEach(count);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    root.classList.add('rv');
    setTimeout(function () { if (!ok) showAll(); }, 2500);
  } catch (err) {
    showAll();
    root.classList.add('dock-on');
  }
})();
