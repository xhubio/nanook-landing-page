#!/usr/bin/env python3
"""Publish one part of the agentic-development series on its release day.

    python3 tools/publish-part.py <slug>

Sets published=true in blog/new/series-state.json and registers the part everywhere
(robots index, twin, sidebar in every blog page, blog index teaser, feeds, sitemap,
llms.txt, the series table in part 1, the Previous/Next navigation, the article
pointers, the series-plan status). Idempotent. Commit and push afterwards.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import series_lib as L

if len(sys.argv) != 2:
    sys.exit(__doc__)
state = L.load()
try:
    p = L.by_slug(state, sys.argv[1])
except StopIteration:
    sys.exit("unknown slug; known: " + ", ".join(q["slug"] for q in state["parts"]))
if p["prev"] and not L.by_key(state, p["prev"])["published"]:
    sys.exit(f"part {p['prev']} is not published yet; publish in order")
p["published"] = True; L.save(state)
L.apply(state, p)
print(L.report(state))
print("published", L.url(p), "— now commit and push")
