#!/usr/bin/env python3
"""Docs chrome: register a docs page in the sidebar of every docs page that carries the docs
sidebar (Quickstart / Tutorials / Guides / Modules; the API pages have their own and are left
alone), and wire it into the Previous/Next chain. Idempotent; re-copies the twins at the end.
Run from the repository root.

Add a page by appending to PAGES. "after" is the href of the sidebar item the new one follows,
or None for the first item of the group. "prev"/"next" are the neighbours in reading order;
their Next/Previous buttons are pointed at the new page."""
import glob, re, sys
sys.path.insert(0, "tools")
import series_lib as sl

PAGES = [
    {"href": "/docs/guide/use-with-ai", "label": "Use with AI agents", "group": "Guides", "after": None,
     "prev": ("/docs/tutorials/createFilterProcessor", "Create filter processor"),
     "next": ("/docs/guide/generalOverview", "Nanook Table Overview")},
]

GROUP_RE = r'(<h3 class="navGroupCategoryTitle collapsible">{}<span class="arrow">.*?</h3>\s*<ul class="hide">)'


def li(page, active):
    cls = "navListItem navListItemActive" if active else "navListItem"
    return f'\n                    <li class="{cls}"><a class="navItem" href="{page["href"]}">{page["label"]}</a></li>'


def sidebar(s, page, own):
    if f'href="{page["href"]}"' in s.split('<div class="navGroups">', 1)[-1].split("</section>", 1)[0]:
        return s
    if page["after"] is None:
        m = re.search(GROUP_RE.format(re.escape(page["group"])), s, re.S)
        assert m, f'group {page["group"]} not found'
        pos = m.end()
    else:
        m = re.search(r'<li class="navListItem(?: navListItemActive)?"><a class="navItem"\s*href="'
                      + re.escape(page["after"]) + r'">.*?</a>\s*</li>', s, re.S)
        assert m, f'{page["after"]} not found'
        pos = m.end()
    return s[:pos] + li(page, own) + s[pos:]


def button(s, which, href, label):
    """Point the Previous ("prev") or Next ("next") button of a page at href."""
    arrow = '<span class="arrow-prev">← </span><span>{}</span>' if which == "prev" else '<span>{}</span><span class="arrow-next"> →</span>'
    new = f'<a class="docs-{which} button" href="{href}">' + arrow.format(label) + "</a>"
    return re.sub(r'<a class="docs-' + which + r' button"\s+href="[^"]*">.*?</a>', lambda _: new, s, count=1, flags=re.S)


def path(href):
    return href.lstrip("/") + ".html"


changed = set()
for page in PAGES:
    for f in sorted(glob.glob("docs/**/*.html", recursive=True)):
        if f.endswith("/index.html"):
            continue  # twins are re-copied below
        s = sl.read(f)
        if 'navGroupCategoryTitle collapsible">Guides' not in s:
            continue
        s2 = sidebar(s, page, f == path(page["href"]))
        if s2 != s:
            sl.write(f, s2); changed.add(f)
    for nb, which in ((page["prev"], "next"), (page["next"], "prev")):
        f = path(nb[0])
        s = sl.read(f)
        s2 = button(s, which, page["href"], page["label"])
        if s2 != s:
            sl.write(f, s2); changed.add(f)
sl.sync_twins()
print(f"docs chrome: {len(changed)} page(s) updated")
