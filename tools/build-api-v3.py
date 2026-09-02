#!/usr/bin/env python3
"""Build the Nanook 3.x API reference pages from the repository's Markdown.

Source: docs/api/{model,data-generator,file-processor,processor,logger}.md in
github.com/xhubio/nanook-table (branch master). Output: docs/api/v3/<slug>.html
plus the byte-identical twin docs/api/v3/<slug>/index.html, in the site's
Long Document register (same shell as about.html).

Run from the repository root:

    python3 tools/build-api-v3.py            # fetch from GitHub, write pages
    python3 tools/build-api-v3.py --from DIR # use local api-*.md / <name>.md files

Requires pandoc. After a run: tools/cache-bust.sh is NOT needed (no CSS/JS
change), but sitemap.xml lastmod for the five pages should be bumped.
"""
import argparse
import datetime
import html
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request

REPO = "xhubio/nanook-table"
BRANCH = "master"
PAGES = [
    # slug, upstream file, title shown on the site
    ("model", "model", "Model"),
    ("data-generator", "data-generator", "Data generator"),
    ("file-processor", "file-processor", "File processor"),
    ("processor", "processor", "Processor"),
    ("logger", "logger", "Logger"),
]
OUT_DIR = "docs/api/v3"
SHELL_SOURCE = "about.html"

# Deviations between the upstream docs and the published 3.0.1 package that
# were verified by hand on 2026-09-02. Keep this list in sync with reality;
# drop entries once upstream fixes them.
DEVIATIONS = [
    "the import path in the samples is <code>nanook-table</code>; the published package is "
    "<code>@xhubio/nanook-table</code>",
    "<code>tables</code> is a required constructor option of <code>TestcaseProcessor</code> since "
    "2.1.4; the samples assign it after construction",
]


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": "nanook-landing-page build-api-v3"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    return data if binary else data.decode("utf-8")


def upstream_commit():
    try:
        data = json.loads(fetch(f"https://api.github.com/repos/{REPO}/commits/{BRANCH}"))
        return data["sha"][:12], data["commit"]["committer"]["date"][:10]
    except Exception:  # noqa: BLE001 — offline or rate-limited: fall back to the branch name
        return BRANCH, None


def markdown_to_html(md):
    for flags in (["--syntax-highlighting=none"], ["--no-highlight"]):
        try:
            return subprocess.run(
                ["pandoc", "-f", "gfm", "-t", "html5", *flags],
                input=md, capture_output=True, text=True, check=True,
            ).stdout
        except subprocess.CalledProcessError:
            continue
    sys.exit("pandoc failed — is it installed?")


def rewrite(fragment):
    """Adapt pandoc's fragment to the site: drop the h1 (the page renders its own),
    point cross-file links at the site pages, make tables scroll instead of overflow."""
    fragment = re.sub(r"<h1[^>]*>.*?</h1>\s*", "", fragment, count=1, flags=re.S)
    fragment = re.sub(r'href="(?:\./)?([a-z-]+)\.md(#[^"]*)?"', r'href="/docs/api/v3/\1\2"', fragment)
    # links into other docs folders (guide, tutorials, …) point at the repository
    fragment = re.sub(r'href="\.\./([a-zA-Z0-9_./-]+\.md)(#[^"]*)?"',
                      lambda m: f'href="https://github.com/{REPO}/blob/{BRANCH}/docs/{m.group(1)}{m.group(2) or ""}"', fragment)
    fragment = fragment.replace("<table>", '<div class="table-scroll"><table>').replace("</table>", "</table></div>")
    return fragment


def shell_parts():
    """Head + chrome from about.html so the generated pages inherit the current
    stylesheet hash, header, footer, cookie banner and scripts."""
    src = open(SHELL_SOURCE, encoding="utf-8").read()
    head_end = src.index("</head>")
    head = src[: head_end]
    body_open = src.index("<body")
    main_start = src.index('<main class="long-doc"')
    main_end = src.index("</main>") + len("</main>")
    prefix = src[body_open:main_start]          # <body …> + flash guard + header
    suffix = src[main_end:]                     # footer, cookie banner, scripts
    return head, prefix, suffix


def build_head(head_template, title, description, slug):
    head = head_template
    head = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)} · Nanook</title>", head, count=1)
    head = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + html.escape(description, quote=True) + m.group(2), head, count=1)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + html.escape(title, quote=True) + " · Nanook" + m.group(2), head, count=1)
    head = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + f"https://nanook.xhub.io/docs/api/v3/{slug}" + m.group(2), head, count=1)
    head = re.sub(r'(<meta property="og:description" content=")[^"]*(")', lambda m: m.group(1) + html.escape(description, quote=True) + m.group(2), head, count=1)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m.group(1) + f"https://nanook.xhub.io/docs/api/v3/{slug}" + m.group(2), head, count=1)
    return head


def page_html(head_template, prefix, suffix, slug, title, description, fragment, sha, sha_date, today):
    nav = "".join(
        f'<li><a href="/docs/api/v3/{s}"{" aria-current=\"page\"" if s == slug else ""}>{t}</a></li>'
        for s, _, t in PAGES
    )
    source_url = f"https://github.com/{REPO}/blob/{BRANCH}/docs/api/{slug}.md"
    commit_note = f"commit <code>{sha}</code>" + (f" of {sha_date}" if sha_date else "")
    deviations = "".join(f"<li>{d}</li>" for d in DEVIATIONS)
    main = f"""<main class="long-doc api-v3" id="main-content">
    <article>
      <header class="long-doc-head">
        <p class="api-kicker">API reference · Nanook 3.x</p>
        <h1>{html.escape(title)}</h1>
      </header>
      <nav class="api-nav" aria-label="Modules of the 3.x API reference"><ul>{nav}</ul></nav>
      <p class="provenance">Generated on {today} from <a href="{source_url}">docs/api/{slug}.md</a> in the
        repository ({commit_note}) by <code>tools/build-api-v3.py</code>. The text is the repository's, not
        edited here. Known deviations from the published package 3.0.1:</p>
      <ul class="provenance">{deviations}</ul>
{fragment}
    </article>
  </main>"""
    return build_head(head_template, title, description, slug) + "</head>\n\n" + prefix + main + suffix


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="local_dir", help="directory with <name>.md or api-<name>.md files instead of GitHub")
    args = ap.parse_args()
    if not os.path.exists(SHELL_SOURCE):
        sys.exit("run this from the repository root")
    head_template, prefix, suffix = shell_parts()
    sha, sha_date = ("local", None) if args.local_dir else upstream_commit()
    today = datetime.date.today().isoformat()
    os.makedirs(OUT_DIR, exist_ok=True)
    written = []
    for slug, name, title in PAGES:
        if args.local_dir:
            cand = [os.path.join(args.local_dir, f"{name}.md"), os.path.join(args.local_dir, f"api-{name}.md")]
            path = next((c for c in cand if os.path.exists(c)), None)
            if not path:
                sys.exit(f"missing {name}.md in {args.local_dir}")
            md = open(path, encoding="utf-8").read()
        else:
            md = fetch(f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/docs/api/{name}.md")
        first_para = re.search(r"^(?!#)(\S[^\n]+)$", md, re.M)
        description = re.sub(r"[`*]", "", first_para.group(1)).strip() if first_para else f"Nanook 3.x API reference: {title}"
        if len(description) > 160:
            description = description[:157].rsplit(" ", 1)[0] + "…"
        fragment = rewrite(markdown_to_html(md))
        page = page_html(head_template, prefix, suffix, slug, title, description, fragment, sha, sha_date, today)
        out = os.path.join(OUT_DIR, f"{slug}.html")
        open(out, "w", encoding="utf-8").write(page)
        os.makedirs(os.path.join(OUT_DIR, slug), exist_ok=True)
        shutil.copyfile(out, os.path.join(OUT_DIR, slug, "index.html"))
        written.append(out)
    print("written:", ", ".join(written))
    print("source commit:", sha, sha_date or "")


if __name__ == "__main__":
    main()
