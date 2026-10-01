#!/usr/bin/env python3
"""Support close: append the xhub.io support paragraph as the last paragraph of every
published blog post (robots "index"), then re-copy the twins. Idempotent. Unpublished
series drafts are left alone; tools/publish-part.py adds the paragraph when a part goes
live. Articles get it from tools/build-article.py. Run from the repository root."""
import glob, re, sys
sys.path.insert(0, "tools")
import series_lib as sl

changed = 0
for f in sorted(glob.glob("blog/2*/**/*.html", recursive=True)):
    if f.endswith("/index.html"):
        continue  # twins are re-copied below
    s = sl.read(f)
    if 'class="postHeaderTitle"' not in s or re.search(r'<meta name="robots" content="noindex', s):
        continue
    s2 = sl.support_close(s)
    if s2 != s:
        sl.write(f, s2); changed += 1
sl.sync_twins()
print(f"support close: {changed} post(s) updated")
