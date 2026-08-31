/* Theme Toggle — Nanook */
(function () {
  var saved = localStorage.getItem('nanook-theme');
  if (saved) document.body.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  var current = document.body.getAttribute('data-theme');
  var next = current === 'tactical' ? 'swiss' : 'tactical';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('nanook-theme', next);
}

/* Mobile Nav — injected at runtime so the 178 pre-rendered HTML pages
   stay untouched. theme.js is loaded on every one of them. */
(function () {
  function initMobileNav() {
    var header = document.querySelector('.site-header');
    if (!header || header.querySelector('.nav-toggle')) return;

    var nav = header.querySelector('.site-nav');
    var right = header.querySelector('.header-right');
    if (!nav || !right) return;

    if (!nav.id) nav.id = 'site-nav';

    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-controls', nav.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';

    function setOpen(open) {
      header.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', function () {
      setOpen(!header.classList.contains('nav-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) setOpen(false);
    });

    right.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();

/* Skip link + current-page nav marker — injected so the 178 pre-rendered
   pages stay untouched. */
(function () {
  function init() {
    /* Skip to content: first focusable element on every page */
    if (!document.querySelector('.skip-link')) {
      var target = document.querySelector(
        '.lonePost, .posts, .documentContainer, .docsContainer, .hero, main'
      );
      if (target) {
        if (!target.id) target.id = 'main-content';
        var skip = document.createElement('a');
        skip.className = 'skip-link';
        skip.href = '#' + target.id;
        skip.textContent = 'Skip to content';
        document.body.insertBefore(skip, document.body.firstChild);
      }
    }

    /* Mark the masthead link for the section the reader is in */
    var path = location.pathname;
    var section = null;
    if (path.indexOf('/blog') === 0) section = '/blog';
    else if (path.indexOf('/docs/api/') === 0) section = '/docs/api/';
    else if (path.indexOf('/docs') === 0) section = '/docs';
    if (section) {
      var links = document.querySelectorAll('.site-nav a');
      var best = null;
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href') || '';
        if (href.indexOf('http') === 0) continue;
        if (section === '/docs/api/' && href.indexOf('/docs/api/') === 0) best = links[i];
        else if (section === '/blog' && href.indexOf('/blog') === 0) best = links[i];
        else if (section === '/docs' && href.indexOf('/docs') === 0 &&
                 href.indexOf('/docs/api/') !== 0 && !best) best = links[i];
      }
      if (best) best.setAttribute('aria-current', 'page');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
