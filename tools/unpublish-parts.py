#!/usr/bin/env python3
"""Deregister every part with published=false in blog/new/series-state.json (keeps the
files as noindex drafts without twins). Idempotent. Used once on 2026-09-22 to turn the
pre-registered parts 2–9 and 5b back into scheduled drafts."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import series_lib as L

state = L.load()
for p in state["parts"]:
    if not p["published"]:
        L.apply(state, p)
print(L.report(state))
