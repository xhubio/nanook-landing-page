#!/usr/bin/env python3
"""Build a long-form article page from a Markdown source in blog/new/.

Output: articles/<slug>.html plus the byte-identical twin articles/<slug>/index.html,
in the site's Long Document register (same shell as about.html), with a table of
contents built from the H2s and, per section, a pointer to the series part that
expands it. Run from the repository root:

    python3 tools/build-article.py

Requires pandoc. No cache-bust needed (no CSS/JS change); bump sitemap.xml lastmod
for the article and /articles after a run.
"""
import datetime, html, json, os, re, shutil, subprocess, sys

ARTICLES = [{
    "slug": "agentic-software-development",
    "source": "blog/new/2026-09-17_full-report_agentic-software-development.md",
    "title": "Agentic Software Development: How We Build Software with AI Agents, What Works, and Where It Breaks",
    "meta_title": "Agentic Software Development",
    "kicker": "Article · Field report",
    "author": "Torsten Link", "author_url": "https://cv.xhub.io/de/torsten.link",
    "date": "2026-09-17", "date_human": "17 September 2026",
    "description": "A field report on nine months of building software with an AI coding agent: the setup, the process, the tables, the tests, and at length where it breaks.",
    # report section number -> series part
    "parts": {1: 1, 2: 1, 23: 1, 3: 2, 4: 2, 21: 2, 5: 3, 6: 3, 7: 4, 8: 5, 9: 5, 10: 6, 11: 6, 12: 7, 13: 7, 19: 7, 14: 8, 15: 8, 16: 8, 17: 8, 18: 9, 20: 9, 22: 9},
    "series": {
        1: ("2026-09-22", "agentic-development-overview", "The Agent Writes the Code"),
        2: ("2026-09-29", "agent-toolbox-and-instruction-file", "Fewer Skills, Shorter Rules"),
        3: ("2026-10-06", "directory-layout-requirements-lifecycle", "One Root, Many Repositories"),
        4: ("2026-10-13", "knowledge-base-and-lesson-memory", "What the Next Session Knows"),
        5: ("2026-10-20", "requirements-into-decision-tables", "A Table Cannot Stay Silent"),
        6: ("2026-10-27", "tests-first-red-chain", "Tests First, Then Implement All Plans"),
        7: ("2026-11-03", "plan-pipeline-and-release-cascades", "Working Through 1,200 Plans"),
        8: ("2026-11-10", "where-agentic-development-breaks", "The Agent That Pleases"),
        9: ("2026-11-17", "rules-need-exit-codes", "Rules Need Exit Codes"),
    },
}, {
    "slug": "event-driven-service-with-tables-and-an-agent",
    "source": "blog/new/2026-09-16_guide_event-driven-service.en.md",
    "title": "Guide: Building an Event-Driven Service with Tables and an AI Agent",
    "meta_title": "Guide: An Event-Driven Service with Tables and an Agent",
    "kicker": "Article · Guide",
    "author": "Torsten Link", "author_url": "https://cv.xhub.io/de/torsten.link",
    "date": "2026-09-16", "date_human": "16 September 2026",
    "description": "A step-by-step guide to an event-driven service with decision tables and an AI coding agent: fifteen steps, the traps that cost time, what was not worth it.",
    "parts": {}, "series": {},
}]
SHELL_SOURCE = "about.html"


def pandoc(md):
    return subprocess.run(["pandoc", "-f", "gfm", "-t", "html5", "--wrap=none", "--syntax-highlighting=none"],
                          input=md, capture_output=True, text=True, check=True).stdout


def shell_parts():
    src = open(SHELL_SOURCE, encoding="utf-8").read()
    head = src[: src.index("</head>")]
    prefix = src[src.index("<body"): src.index('<main class="long-doc"')]
    suffix = src[src.index("</main>") + len("</main>"):]
    return head, prefix, suffix


def build_head(head, a, url):
    head = re.sub(r"<title>.*?</title>", f"<title>{html.escape(a['meta_title'])} · Nanook</title>", head, count=1)
    for attr in ("name=\"description\"", "property=\"og:description\""):
        head = re.sub(r'(<meta ' + attr + r' content=")[^"]*(")', lambda m: m.group(1) + html.escape(a["description"], quote=True) + m.group(2), head, count=1)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + html.escape(a["meta_title"], quote=True) + " · Nanook" + m.group(2), head, count=1)
    head = head.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="article" />')
    head = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), head, count=1)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), head, count=1)
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": a["title"], "datePublished": a["date"],
          "author": {"@type": "Person", "name": a["author"], "url": a["author_url"]},
          "publisher": {"@type": "Organization", "name": "Nanook", "url": "https://nanook.xhub.io"},
          "description": a["description"], "image": "https://nanook.xhub.io/img/social-card.png", "url": url}
    return head + '  <script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + "\n</script>\n"


def transform(fragment, a):
    """Drop the h1, the Contents section, the italic intro (returned as lede) and the
    trailing Related note; wrap tables; add series pointers after numbered H2s."""
    fragment = re.sub(r"<h1[^>]*>.*?</h1>\s*", "", fragment, count=1, flags=re.S)
    m = re.match(r"\s*<p><em>(.*?)</em></p>", fragment, re.S)
    lede = m.group(1).strip() if m else ""
    if m:
        fragment = fragment[m.end():]
    fragment = re.sub(r'<h2 id="contents">Contents</h2>\s*<ol[^>]*>.*?</ol>', "", fragment, count=1, flags=re.S)
    fragment = re.sub(r"<hr />\s*", "", fragment)
    fragment = re.sub(r"<p><em>Related: .*?</em></p>\s*$", "", fragment, flags=re.S)
    fragment = fragment.replace("<table>", '<div class="table-scroll"><table>').replace("</table>", "</table></div>")
    def hint(m):
        n = int(m.group(2)); p = a["parts"].get(n)
        if not p:
            return m.group(0)
        d, slug, short = a["series"][p]; y, mo, dd = d.split("-")
        return m.group(0) + f'\n<p class="provenance"><em>Expanded in <a href="/blog/{y}/{mo}/{dd}/{slug}">part {p} of the series, {short}</a>.</em></p>'
    if a["parts"]:
        fragment = re.sub(r'(<h2 id="(\d+)-[^"]*">.*?</h2>)', hint, fragment)
    return fragment.strip(), lede


def toc(fragment):
    """Numbered list when the H2s are numbered from 1 (the report); otherwise a plain
    list that keeps the headings' own numbering (the guide counts from 0)."""
    items = re.findall(r'<h2 id="([^"]*)">(.*?)</h2>', fragment)
    numbered = bool(items) and items[0][1].startswith("1. ") and all(re.match(r"\d+\. ", t) for _, t in items)
    if numbered:
        return '<nav class="article-toc" aria-label="Contents"><ol>' + "".join(
            f'<li><a href="#{i}">{re.sub(r"^\d+\. ", "", t)}</a></li>' for i, t in items) + "</ol></nav>"
    return '<nav class="article-toc" aria-label="Contents"><ul>' + "".join(
        f'<li><a href="#{i}">{t}</a></li>' for i, t in items) + "</ul></nav>"


def main():
    if not os.path.exists(SHELL_SOURCE):
        sys.exit("run this from the repository root")
    head_t, prefix, suffix = shell_parts()
    today = datetime.date.today().isoformat()
    for a in ARTICLES:
        url = f"https://nanook.xhub.io/articles/{a['slug']}"
        md = open(a["source"], encoding="utf-8").read()
        raw = pandoc(md)
        words = len(re.sub(r"<[^>]+>", " ", re.sub(r'<h2 id="contents">.*?</ol>', "", raw, flags=re.S)).split())
        fragment, lede = transform(raw, a)
        minutes = round(words / 230)
        series_intro = '' if not a["parts"] else ('<p>This report is also published as a nine-part series on the blog, one part a week from '
                        '22 September 2026; each section below names the part that expands it. The series starts with '
                        '<a href="/blog/2026/09/22/agentic-development-overview">part 1, the two settings and the numbers</a>.</p>')
        main_html = f"""<main class="long-doc article" id="main-content">
    <article>
      <header class="long-doc-head">
        <p class="api-kicker">{a['kicker']}</p>
        <h1>{html.escape(a['title'])}</h1>
        <p class="provenance"><a href="{a['author_url']}">{a['author']}</a> · {a['date_human']} · about {round(words, -2):,} words, {minutes} minutes</p>
      </header>
      <p class="lede">{lede}</p>
      {series_intro}
      {toc(fragment)}
{fragment}
      <!-- built by tools/build-article.py from {a['source']} on {today}; edit the Markdown, then rebuild -->
    </article>
  </main>"""
        page = build_head(head_t, a, url) + "</head>\n\n" + prefix + main_html + suffix
        out = f"articles/{a['slug']}.html"
        os.makedirs(f"articles/{a['slug']}", exist_ok=True)
        open(out, "w", encoding="utf-8").write(page)
        shutil.copyfile(out, f"articles/{a['slug']}/index.html")
        print("written", out, "| words", words, "| minutes", minutes)


if __name__ == "__main__":
    main()
