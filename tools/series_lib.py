"""Shared helpers for the staggered release of the agentic-development series.

State: blog/new/series-state.json (one entry per part, `published` flag). The two entry
points are tools/publish-part.py <slug> and tools/unpublish-parts.py. Everything here is
idempotent: registering twice changes nothing, removing twice changes nothing.
"""
import datetime, glob, json, os, re, shutil, subprocess, filecmp

STATE = "blog/new/series-state.json"
PLAN = "blog/new/2026-09-17_series-plan_agentic-software-development.md"
MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def load():
    return json.load(open(STATE, encoding="utf-8"))


def save(state):
    json.dump(state, open(STATE, "w", encoding="utf-8"), indent=1, ensure_ascii=False)


def by_key(state, key):
    return next(p for p in state["parts"] if p["key"] == key)


def by_slug(state, slug):
    return next(p for p in state["parts"] if p["slug"] == slug)


def url(p):
    y, m, d = p["date"].split("-")
    return f"/blog/{y}/{m}/{d}/{p['slug']}"


def path(p):
    return url(p).lstrip("/") + ".html"


def human(p):
    y, m, d = p["date"].split("-")
    return f"{MONTHS[int(m)]} {int(d)}, {y}"


def human_long(p):
    y, m, d = p["date"].split("-")
    return f"{int(d)} {MONTHS[int(m)]} {y}"


def rfc(p):
    return datetime.date.fromisoformat(p["date"]).strftime("%a, %d %b %Y 06:00:00 GMT")


def read(f):
    return open(f, encoding="utf-8").read()


def write(f, s):
    open(f, "w", encoding="utf-8").write(s)


# ---------- sidebar (every blog page) ----------
LI_RE = re.compile(r'\s*<li class="navListItem(?: navListItemActive)?"><a class="navItem"\s*href="(/blog/(\d{4})/(\d\d)/(\d\d)/[^"]+)">.*?</a></li>', re.S)


def blog_pages():
    return sorted(f for f in glob.glob("blog/**/*.html", recursive=True) if '<ul class="">' in read(f))


def sidebar_li(p, active=False):
    cls = "navListItem navListItemActive" if active else "navListItem"
    return f'\n                    <li class="{cls}"><a class="navItem" href="{url(p)}"><samp class="nav-date">{p["date"][:7]}</samp> {p["label"]}</a></li>'


def sidebar_remove(s, p):
    return re.sub(r'\s*<li class="navListItem(?: navListItemActive)?"><a class="navItem"\s*href="' + re.escape(url(p)) + r'">.*?</a></li>', "", s, flags=re.S)


def sidebar_add(s, p, active):
    s = sidebar_remove(s, p)
    a = s.index('<ul class="">'); b = s.index("</ul>", a)
    block = s[a + len('<ul class="">'):b]
    items = list(LI_RE.finditer(block))
    pos = len(block.rstrip())
    for m in items:
        if "".join(m.group(2, 3, 4)) < p["date"].replace("-", ""):
            pos = m.start(); break
    block = block[:pos] + sidebar_li(p, active) + block[pos:]
    return s[:a + len('<ul class="">')] + block + s[b:]


# ---------- blog index teaser ----------
def teaser_html(p):
    return f'''            <div class="post">
              <header class="postHeader">
                <h2 class="postHeaderTitle"><a href="{url(p)}">{p['title']}</a></h2>
                <p class="post-meta">{human(p)}</p>
                <div class="authorBlock">
                  <p class="post-authorName"><a href="https://cv.xhub.io/de/torsten.link" target="_blank"
                      rel="noreferrer noopener">Torsten Link</a></p>
                </div>
              </header>
              <article class="post-content">
                <div><span>
                    <p>{p['desc']}</p>
                  </span></div>
              </article>
            </div>
'''


TEASER_RE = re.compile(r'            <div class="post">\n              <header class="postHeader">\n                <h2 class="postHeaderTitle"><a href="(/blog/(\d{4})/(\d\d)/(\d\d)/[^"]+)">.*?\n            </div>\n', re.S)


def teaser_remove(s, p):
    return re.sub(r'            <div class="post">\n              <header class="postHeader">\n                <h2 class="postHeaderTitle"><a href="' + re.escape(url(p)) + r'">.*?\n            </div>\n', "", s, count=1, flags=re.S)


def teaser_add(s, p):
    s = teaser_remove(s, p)
    a = s.index('          <div class="posts">\n') + len('          <div class="posts">\n')
    pos = None
    for m in TEASER_RE.finditer(s, a):
        if "".join(m.group(2, 3, 4)) < p["date"].replace("-", ""):
            pos = m.start(); break
    if pos is None:
        pos = s.index("          </div>", a)
    return s[:pos] + teaser_html(p) + s[pos:]


# ---------- feeds ----------
def feed_item(p):
    return f'''        <item>
            <title><![CDATA[{p['title_plain']}]]></title>
            <link>https://nanook.xhub.io{url(p)}</link>
            <guid>https://nanook.xhub.io{url(p)}</guid>
            <pubDate>{rfc(p)}</pubDate>
            <description><![CDATA[<p>{p['desc']}</p> ]]></description>
        </item>
'''


def atom_entry(p):
    return f'''    <entry>
        <title type="html"><![CDATA[{p['title_plain']}]]></title>
        <id>https://nanook.xhub.io{url(p)}</id>
        <link href="https://nanook.xhub.io{url(p)}"/>
        <updated>{p['date']}T06:00:00.000Z</updated>
        <summary type="html"><![CDATA[<p>{p['desc']}</p> ]]></summary>
        <author>
            <name>Torsten Link</name>
        </author>
    </entry>
'''


def _feed_remove(s, p, tag):
    return re.sub(r'\s*<' + tag + r'>(?:(?!</' + tag + r'>).)*?' + re.escape(url(p)) + r'.*?</' + tag + r'>\n?', "\n" if tag == "item" else "\n", s, count=1, flags=re.S)


def _feed_add(s, p, tag, block, link_re):
    s = _feed_remove(s, p, tag)
    pos = None
    for m in re.finditer(r'<' + tag + r'>.*?' + link_re + r'.*?</' + tag + r'>', s, re.S):
        if m.group(1).replace("-", "") < p["date"].replace("-", ""):
            pos = s.rfind("\n", 0, m.start()) + 1; break
    if pos is None:
        end = s.rfind("</channel>") if tag == "item" else s.rfind("</feed>")
        pos = s.rfind("\n", 0, end) + 1
    return s[:pos] + block + s[pos:]


def feed_set(p, add):
    f = read("blog/feed.xml"); a = read("blog/atom.xml")
    if add:
        f = _feed_add(f, p, "item", feed_item(p), r'<link>https://nanook\.xhub\.io/blog/(\d{4}/\d\d/\d\d)/')
        a = _feed_add(a, p, "entry", atom_entry(p), r'<id>https://nanook\.xhub\.io/blog/(\d{4}/\d\d/\d\d)/')
    else:
        f = _feed_remove(f, p, "item"); a = _feed_remove(a, p, "entry")
    f = re.sub(r"\n{3,}", "\n\n", f); a = re.sub(r"\n{3,}", "\n\n", a)
    f = re.sub(r"\n\s*\n(\s*<item>)", r"\n\1", f); a = re.sub(r"\n\s*\n(\s*<entry>)", r"\n\1", a)
    latest = max(re.findall(r"<pubDate>([^<]+)</pubDate>", f), key=lambda x: datetime.datetime.strptime(x, "%a, %d %b %Y %H:%M:%S GMT"))
    f = re.sub(r"<lastBuildDate>[^<]*</lastBuildDate>", f"<lastBuildDate>{latest}</lastBuildDate>", f, count=1)
    latest_a = max(re.findall(r"<updated>([^<]+)</updated>", a)[1:])
    a = re.sub(r"<updated>[^<]*</updated>", f"<updated>{latest_a}</updated>", a, count=1)
    write("blog/feed.xml", f); write("blog/atom.xml", a)


# ---------- sitemap, llms ----------
def sitemap_set(p, add):
    s = read("sitemap.xml")
    s = re.sub(r"<url><loc>https://nanook\.xhub\.io" + re.escape(url(p)) + r"</loc>[^\n]*\n", "", s)
    if add:
        first = re.search(r"<url><loc>https://nanook\.xhub\.io/blog/20[^\n]*\n", s)
        s = s[:first.start()] + f'<url><loc>https://nanook.xhub.io{url(p)}</loc><lastmod>{p["date"]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n' + s[first.start():]
    dates = re.findall(r"/blog/(\d{4})/(\d\d)/(\d\d)/[^<]*</loc><lastmod>", s)
    latest = max("-".join(d) for d in dates)
    s = re.sub(r"(<url><loc>https://nanook\.xhub\.io/blog</loc><lastmod>)[^<]+", lambda m: m.group(1) + latest, s, count=1)
    write("sitemap.xml", s)


def llms_set(state, p, add):
    s = read("llms.txt")
    s = re.sub(r"- \[[^\]]*\]\(https://nanook\.xhub\.io" + re.escape(url(p)) + r"\)[^\n]*\n", "", s)
    if add:
        n = "Companion to part 5: the event-driven service in full" if p["key"] == "5b" else f"Part {p['key']} of the series on agentic software development"
        line = f"- [{p['title_plain']}](https://nanook.xhub.io{url(p)}): {n} ({p['date']})\n"
        # after the last registered series line, else after the part-1 line
        anchor = None
        for q in state["parts"]:
            if q["published"] and q["key"] != p["key"] and q["date"] < p["date"]:
                m = re.search(r"- \[[^\]]*\]\(https://nanook\.xhub\.io" + re.escape(url(q)) + r"\)[^\n]*\n", s)
                if m: anchor = m.end()
        if anchor is None:
            m = re.search(r"- \[The Agent Writes the Code[^\n]*\n", s); anchor = m.end()
        s = s[:anchor] + line + s[anchor:]
    write("llms.txt", s)


# ---------- part-1 table, navigation, robots, twins ----------
def part1_table(state):
    p1 = by_key(state, "1"); f = path(p1); s = read(f)
    for p in state["parts"]:
        if p["key"] in ("1", "5b"): continue
        k = p["key"]
        s = re.sub(r"<tr><td>" + k + r"</td><td><a href=\"[^\"]*\">(.*?)</a></td>", lambda m: f"<tr><td>{k}</td><td>{m.group(1)}</td>", s, count=1, flags=re.S)
        if p["published"]:
            s = re.sub(r"<tr><td>" + k + r"</td><td>(?!<a )(.*?)</td>", lambda m: f'<tr><td>{k}</td><td><a href="{url(p)}">{m.group(1)}</a></td>', s, count=1, flags=re.S)
    write(f, s)


def link(p):
    return f'<a href="{url(p)}">{p["short"]}</a>'


def bottom_nav(state, p):
    prev = by_key(state, p["prev"]) if p["prev"] else None
    nxt = by_key(state, p["next"]) if p["next"] else None
    parts = []
    if prev:
        parts.append(f"Previous: {link(prev)}." if prev["published"] else f"Previous: {prev['short']}.")
    if nxt:
        parts.append(f"Next: {link(nxt)}." if nxt["published"] else f"Next: {nxt['short']}, on the blog from {human_long(nxt)}.")
    else:
        p1 = by_key(state, "1"); parts.append(f'This is the last part; the series starts at <a href="{url(p1)}">{p1["short"]}</a>.')
    return '<p class="series-nav"><em>' + " ".join(parts) + "</em></p>"


def set_nav(state, p):
    f = path(p)
    if not os.path.exists(f): return
    s = read(f)
    if p["key"] == "5b":  # the companion note at the top links its host only once the host is published
        p5 = by_key(state, "5")
        s = re.sub(r'A companion to (?:<a href="[^"]*">)?part 5 of the series on agentic software development(?:</a>)?(?:, A Table Cannot Stay Silent, on the blog from 20 October 2026)?:',
                   ('A companion to <a href="' + url(p5) + '">part 5 of the series on agentic software development</a>:') if p5["published"] else 'A companion to part 5 of the series on agentic software development, A Table Cannot Stay Silent, on the blog from 20 October 2026:', s, count=1)
    navs = list(re.finditer(r'<p class="series-nav"><em>(?:Previous:|Next:|This was the last part).*?</em></p>', s, re.S))
    if navs:
        m = navs[-1]; s = s[:m.start()] + bottom_nav(state, p) + s[m.end():]
        write(f, s)


BACKLINK_5B = '<p>The service these findings come from is written up in full, with its workbook, its red chain and its gates, in <a href="{u}">A Service in Eleven Days, with an AI Agent and Tables That Contradict</a>.</p>'


def set_backlink_5b(state):
    p5b = by_key(state, "5b"); p5 = by_key(state, "5"); f = path(p5); s = read(f)
    s = re.sub(r"<p>The service these findings come from is written up in full[^\n]*</p>\n\n                  ", "", s)
    if p5b["published"]:
        m = re.search(r'<p class="series-nav"><em>Previous:', s)
        s = s[:m.start()] + BACKLINK_5B.format(u=url(p5b)) + "\n\n                  " + s[m.start():]
    write(f, s)


def set_robots(p):
    f = path(p); s = read(f)
    s = re.sub(r'<meta name="robots" content="[^"]*" />', '<meta name="robots" content="' + ("index, follow" if p["published"] else "noindex, nofollow") + '" />', s, count=1)
    write(f, s)


def set_twin(p):
    f = path(p); d = f[:-5]
    if p["published"]:
        os.makedirs(d, exist_ok=True); shutil.copyfile(f, d + "/index.html")
    elif os.path.isdir(d):
        shutil.rmtree(d)


def sync_twins():
    for f in glob.glob("**/*.html", recursive=True):
        d = f[:-5]
        if os.path.isdir(d) and os.path.exists(d + "/index.html") and not f.endswith("index.html"):
            shutil.copyfile(f, d + "/index.html")
    bad = [os.path.dirname(i) for i in glob.glob("**/index.html", recursive=True) if os.path.dirname(i) and os.path.exists(os.path.dirname(i) + ".html") and not filecmp.cmp(i, os.path.dirname(i) + ".html", shallow=False)]
    assert not bad, bad


def plan_status(p):
    s = read(PLAN)
    hdr = re.search(r"(## Part " + re.escape(p["key"]) + r" — [^\n]*\n)", s)
    if not hdr: return
    st = (f"**Status:** published {p['date']} as `{url(p)}` (PRD `prds/{p['date']}_blog-{p['slug']}.md`)."
          if p["published"] else
          f"**Status:** scheduled {p['date']} as `{url(p)}`, unpublished draft; publish with `tools/publish-part.py {p['slug']}` (PRD `prds/{p['date']}_blog-{p['slug']}.md`).")
    s = re.sub(r"(## Part " + re.escape(p["key"]) + r" — [^\n]*\n\n)\*\*Status:\*\*[^\n]*\n", lambda m: m.group(1) + st + "\n", s, count=1)
    write(PLAN, s)


def rebuild_articles():
    subprocess.run(["python3", "tools/build-article.py"], check=True, capture_output=True)


def apply(state, p):
    """Register or deregister one part according to p['published']."""
    reg = p["published"]
    set_robots(p)
    for f in blog_pages():
        s = read(f)
        s2 = sidebar_add(s, p, active=(f == path(p))) if reg else sidebar_remove(s, p)
        if s2 != s: write(f, s2)
    s = read("blog/index.html"); write("blog/index.html", teaser_add(s, p) if reg else teaser_remove(s, p))
    feed_set(p, reg); sitemap_set(p, reg); llms_set(state, p, reg)
    part1_table(state)
    set_nav(state, p)
    if p["prev"]: set_nav(state, by_key(state, p["prev"]))
    if p["key"] == "5b" or p["key"] == "5": set_backlink_5b(state)
    plan_status(p)
    rebuild_articles()
    set_twin(p)
    sync_twins()


def report(state):
    pages = blog_pages(); out = []
    for p in state["parts"]:
        n = sum(url(p) in read(f) for f in pages)
        out.append(f"{p['key']:>2} {'pub' if p['published'] else 'draft'} sidebar {n}/{len(pages)} teaser {url(p) in read('blog/index.html')} feed {url(p) in read('blog/feed.xml')} sitemap {url(p) in read('sitemap.xml')} twin {os.path.isdir(path(p)[:-5])}")
    return "\n".join(out)
