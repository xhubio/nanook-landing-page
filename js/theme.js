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
