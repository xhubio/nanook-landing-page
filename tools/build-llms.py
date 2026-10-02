#!/usr/bin/env python3
"""Markdown for agents: write a .md next to every docs page (served at <page-url>.md) and
concatenate them into /llms-full.txt, in the order of /llms.txt. Idempotent; standard library
only. Run from the repository root after any change to a docs page.

Covered: docs/**/*.html that have an <article>, without twins and without the 1.x API
(docs/api/* except docs/api/v3/*). /llms.txt itself stays hand-maintained.

Needs .nojekyll at the root: with Jekyll, docs/x.md would be rendered to docs/x.html and
collide with the real page."""
import glob, html, re
from html.parser import HTMLParser

SITE = "https://nanook.xhub.io"
SKIP_TAGS = {"script", "style", "svg", "nav", "button", "source", "noscript"}
VOID = {"br", "img", "source", "input", "hr", "meta", "link", "wbr"}


def absolute(url):
    if url.startswith("/"):
        return SITE + url
    return url


class MD(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []          # finished blocks
        self.buf = []          # current inline text
        self.skip = 0          # depth inside skipped elements
        self.pre = False
        self.lists = []        # stack of "ul"/"ol" counters
        self.links = []        # stack of hrefs
        self.table = None      # list of rows, each a list of cells
        self.cell = None
        self.heading = None

    # -- helpers
    def flush(self, prefix=""):
        text = "".join(self.buf)
        self.buf = []
        text = re.sub(r"[ \t\r\n]+", " ", text).strip()
        if text:
            self.out.append(prefix + text)

    def emit(self, s):
        if self.cell is not None:
            self.cell.append(s)
        else:
            self.buf.append(s)

    # -- parser callbacks
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.skip:
            if tag not in VOID:
                self.skip += 1
            return
        cls = a.get("class", "") or ""
        if tag in SKIP_TAGS or "hash-link" in cls or (tag == "a" and a.get("aria-hidden") == "true") \
                or "docs-prevnext" in cls or "docs-support" in cls or tag == "h1":
            if tag not in VOID:
                self.skip = 1
            return
        if self.pre:
            return
        if tag in ("h2", "h3", "h4", "h5", "h6"):
            self.flush(); self.heading = tag
        elif tag in ("p", "div", "section", "header", "article", "blockquote"):
            if self.lists:
                self.emit(" ")  # a paragraph inside a list item stays in the item
            else:
                self.flush()
        elif tag in ("ul", "ol"):
            self.flush(); self.lists.append(0 if tag == "ol" else None)
        elif tag == "li":
            self.flush()
        elif tag == "br":
            self.emit(" ")
        elif tag == "hr":
            self.flush(); self.out.append("---")
        elif tag == "pre":
            self.flush(); self.pre = True; self.prebuf = []
            self.prelang = (a.get("class") or "").split(" ")[0] if (a.get("class") or "") not in ("", "hljs") else ""
        elif tag == "code":
            self.emit("`")
        elif tag in ("strong", "b"):
            self.emit("**")
        elif tag in ("em", "i"):
            self.emit("*")
        elif tag == "a":
            self.links.append(a.get("href"))
            self.emit("[")
        elif tag == "img":
            self.emit(f'![{a.get("alt", "")}]({absolute(a.get("src", ""))})')
        elif tag == "table":
            self.flush(); self.table = []
        elif tag == "tr" and self.table is not None:
            self.table.append([])
        elif tag in ("td", "th") and self.table is not None:
            self.cell = []

    def handle_startendtag(self, tag, attrs):
        if self.skip:
            return  # <path ... /> inside a skipped <svg>: no depth change
        self.handle_starttag(tag, attrs)
        if tag not in VOID and not self.skip:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.skip:
            self.skip -= 1
            return
        if self.pre:
            if tag == "pre":
                code = "".join(self.prebuf).rstrip("\n")
                self.out.append(f"```{self.prelang}\n{code}\n```")
                self.pre = False
            return
        if tag in ("h2", "h3", "h4", "h5", "h6"):
            self.flush("#" * int(tag[1]) + " "); self.heading = None
        elif tag in ("p", "div", "section", "header", "article", "blockquote"):
            if self.lists:
                self.emit(" ")
            else:
                self.flush("> " if tag == "blockquote" else "")
        elif tag == "li":
            depth = max(len(self.lists) - 1, 0)
            kind = self.lists[-1] if self.lists else None
            if kind is None:
                bullet = "- "
            else:
                self.lists[-1] += 1
                bullet = f"{self.lists[-1]}. "
            self.flush("  " * depth + bullet)
        elif tag in ("ul", "ol"):
            self.flush()
            if self.lists:
                self.lists.pop()
        elif tag == "code":
            self.emit("`")
        elif tag in ("strong", "b"):
            self.emit("**")
        elif tag in ("em", "i"):
            self.emit("*")
        elif tag == "a":
            href = self.links.pop() if self.links else None
            self.emit(f"]({absolute(href)})" if href else "]")
        elif tag in ("td", "th") and self.cell is not None:
            text = re.sub(r"\s+", " ", "".join(self.cell)).strip().replace("|", "\\|")
            self.table[-1].append(text); self.cell = None
        elif tag == "table" and self.table is not None:
            rows = [r for r in self.table if r]
            if rows:
                w = max(len(r) for r in rows)
                rows = [r + [""] * (w - len(r)) for r in rows]
                lines = ["| " + " | ".join(rows[0]) + " |", "|" + "---|" * w]
                lines += ["| " + " | ".join(r) + " |" for r in rows[1:]]
                self.out.append("\n".join(lines))
            self.table = None

    def handle_data(self, data):
        if self.skip:
            return
        if self.pre:
            self.prebuf.append(data)
        else:
            self.emit(data)


def convert(f):
    s = open(f, encoding="utf-8").read()
    m = re.search(r"<article>(.*)</article>", s, re.S)
    if not m:
        return None
    title = re.search(r"<h1[^>]*>(.*?)</h1>", s, re.S).group(1)
    title = html.unescape(re.sub(r"<[^>]+>", "", title)).strip()
    url = SITE + "/" + f[:-5]
    p = MD(); p.feed(m.group(1)); p.flush()
    body = "\n\n".join(b for b in p.out if b.strip())
    body = re.sub(r"\[\s*\]\([^)]*\)", "", body)           # empty links (image-only wrappers stripped)
    body = re.sub(r"(?<!`)``(?!`)", "", body)               # empty inline code, not a fence
    item = r"(?:[ ]*(?:-|\d+\.) )"
    while True:                                             # list items: one line each, no gap
        body2 = re.sub(r"(^" + item + r"[^\n]*)\n\n(?=" + item + ")", r"\1\n", body, flags=re.M)
        if body2 == body:
            break
        body = body2
    return title, url, f"# {title}\n\nSource: {url}\n\n{body}\n\n---\nIndex of all docs: {SITE}/llms.txt\n"


def pages():
    for f in sorted(glob.glob("docs/**/*.html", recursive=True)):
        if f.endswith("/index.html") or (f.startswith("docs/api/") and not f.startswith("docs/api/v3/")):
            continue
        yield f


def write_if_changed(f, s):
    try:
        if open(f, encoding="utf-8").read() == s:
            return False
    except FileNotFoundError:
        pass
    open(f, "w", encoding="utf-8").write(s)
    return True


docs = {}
changed = 0
for f in pages():
    r = convert(f)
    if r is None:
        continue
    title, url, md = r
    docs[url] = md
    changed += write_if_changed(f[:-5] + ".md", md)

# llms-full.txt: the order of llms.txt first, then whatever llms.txt does not list
index = open("llms.txt", encoding="utf-8").read()
order = [u for u in re.findall(r"\]\((" + re.escape(SITE) + r"/docs/[^)\s#]+)\)", index) if u in docs]
order = list(dict.fromkeys(order)) + sorted(u for u in docs if u not in order)
head = index.split("\n## ", 1)[0].strip()
full = (head + f"\n\nThis file is the whole documentation of {SITE} in one Markdown file, generated from the "
        f"docs pages by tools/build-llms.py. The index is {SITE}/llms.txt.\n\n"
        + "\n\n".join(docs[u].replace(f"\n---\nIndex of all docs: {SITE}/llms.txt\n", "") for u in order))
changed += write_if_changed("llms-full.txt", full.rstrip() + "\n")
print(f"llms: {len(docs)} docs pages, {changed} file(s) written")
