/* Theme Toggle — Nanook
   Themes are "light" (default) and "dark". Until 2026-09-02 they were
   called "swiss" and "tactical"; a stored value in the old vocabulary is
   migrated on first visit so nobody lands on an unstyled page. */
(function () {
  var saved = localStorage.getItem('nanook-theme');
  if (saved === 'tactical') saved = 'dark';
  else if (saved === 'swiss') saved = 'light';
  if (saved === 'light' || saved === 'dark') {
    document.body.setAttribute('data-theme', saved);
    localStorage.setItem('nanook-theme', saved);
  }
})();

function toggleTheme() {
  var current = document.body.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('nanook-theme', next);
  syncThemeToggle();
}

/* The baked button says "Toggle theme" and nothing about its state; a
   pressed state named "Dark theme" tells a screen reader both. Set here so
   the pre-rendered pages stay untouched. */
function syncThemeToggle() {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  btn.setAttribute('aria-label', 'Dark theme');
  btn.setAttribute('aria-pressed',
    document.body.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
}
syncThemeToggle();

/* Mobile Nav — injected at runtime so the pre-rendered HTML pages
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

/* Skip link + current-page nav marker — injected so the pre-rendered
   pages stay untouched. */
(function () {
  function init() {
    /* Skip to content: first focusable element on every page */
    if (!document.querySelector('.skip-link')) {
      var target = document.querySelector(
        'main, .lonePost, .posts, .documentContainer, .docsContainer, .hero'
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

    /* Mark the bar link for the section the reader is in */
    var path = location.pathname;
    var section = null;
    if (path.indexOf('/blog') === 0) section = '/blog';
    else if (path.indexOf('/articles') === 0) section = '/articles';
    else if (path.indexOf('/support') === 0) section = '/support';
    else if (path.indexOf('/docs/api') === 0) section = '/docs/api';
    else if (path.indexOf('/docs') === 0) section = '/docs';
    if (section) {
      var links = document.querySelectorAll('.site-nav a');
      var best = null;
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href') || '';
        if (href.indexOf('http') === 0) continue;
        if (section === '/docs/api' && href.indexOf('/docs/api') === 0) best = links[i];
        else if (section === '/blog' && href.indexOf('/blog') === 0) best = links[i];
        else if (section === '/articles' && href.indexOf('/articles') === 0) best = links[i];
        else if (section === '/support' && href.indexOf('/support') === 0) best = links[i];
        else if (section === '/docs' && href.indexOf('/docs') === 0 &&
                 href.indexOf('/docs/api') !== 0 && !best) best = links[i];
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

/* Markdown for agents: "Copy as Markdown" / "View as Markdown" under the
   title of every docs page that has a .md twin (tools/build-llms.py writes
   them; the 1.x API pages have none). Injected so the pre-rendered pages
   stay untouched. */
(function () {
  function init() {
    var path = location.pathname.replace(/\/(index\.html)?$/, '').replace(/\.html$/, '');
    if (path.indexOf('/docs/') !== 0) return;
    if (path.indexOf('/docs/api/') === 0 && path.indexOf('/docs/api/v3/') !== 0) return;
    var head = document.querySelector('.docsContainer .postHeader, article > .long-doc-head');
    if (!head || document.querySelector('.md-actions')) return;
    var md = path + '.md';

    var bar = document.createElement('p');
    bar.className = 'md-actions';

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'Copy as Markdown';
    copy.addEventListener('click', function () {
      fetch(md).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      }).then(function (text) {
        return navigator.clipboard.writeText(text);
      }).then(function () {
        copy.textContent = 'Copied';
      }, function () {
        copy.textContent = 'Copy failed: open the Markdown instead';
      }).then(function () {
        setTimeout(function () { copy.textContent = 'Copy as Markdown'; }, 2500);
      });
    });

    var view = document.createElement('a');
    view.href = md;
    view.textContent = 'View as Markdown';

    bar.appendChild(copy);
    bar.appendChild(document.createTextNode(' · '));
    bar.appendChild(view);
    head.parentNode.insertBefore(bar, head.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* agents.md: a button in the bar that copies a prompt pointing a coding
   agent at /agents.md (the guide comes from nanook-table/docs/agents.md).
   Injected so the pre-rendered pages stay untouched. Without a clipboard
   the button opens the guide instead. */
(function () {
  var PROMPT = 'Read https://nanook.xhub.io/agents.md and follow it to add Nanook test cases ' +
    'and test data for <the form or API to test> to this project.';

  function init() {
    var header = document.querySelector('.site-header');
    if (!header || header.querySelector('.agents-btn')) return;
    var anchor = header.querySelector('.header-cta') || header.querySelector('.gh-link');
    if (!anchor) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'agents-btn';
    btn.title = 'Copy a prompt that points your AI agent at /agents.md';
    btn.innerHTML = '<span class="agents-btn-label" aria-live="polite">agents.md</span>' +
      '<svg class="agents-btn-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" ' +
      'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/>' +
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var label = btn.querySelector('.agents-btn-label');
    var timer;

    btn.addEventListener('click', function () {
      if (!navigator.clipboard) {
        location.href = '/agents.md';
        return;
      }
      navigator.clipboard.writeText(PROMPT).then(function () {
        btn.classList.add('copied');
        label.textContent = 'copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('copied');
          label.textContent = 'agents.md';
        }, 1600);
      }, function () {
        location.href = '/agents.md';
      });
    });

    anchor.parentNode.insertBefore(btn, anchor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
