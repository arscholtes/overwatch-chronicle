#!/usr/bin/env python3
"""Sanity-checks the data files so a bad bot run can't break the site."""
import json, re, sys
from pathlib import Path
D = Path(__file__).resolve().parent.parent / "site" / "data"
err = []
def j(n): return json.loads((D / f"{n}.json").read_text())
for tab in ("lore", "esports", "t2"):
    d = j(tab); eras = {e["id"] for e in d["eras"]}; ids = set()
    for it in d["items"]:
        for k in ("id", "e", "when", "t", "d"):
            if not it.get(k): err.append(f"{tab}: item missing {k}: {it.get('t')}")
        if it.get("e") not in eras: err.append(f"{tab}: bad era {it.get('e')} on {it.get('t')}")
        if it.get("id") in ids: err.append(f"{tab}: duplicate id {it['id']}")
        ids.add(it.get("id"))
        for v in it.get("vods", []):
            if not re.fullmatch(r"[A-Za-z0-9_-]{11}", v.get("yt", "")): err.append(f"{tab}: bad yt id on {it['t']}")
        c = it.get("community")
        if c and (c.get("mood") not in {"hype","celebration","mixed","backlash"} or not c.get("summary")): err.append(f"{tab}: bad community on {it['t']}")
for s in j("social"):
    if s.get("v") not in ("esports", "t2"): err.append(f"social: bad view on {s.get('id')}")
for t in j("teams"):
    if not t.get("name") or not t.get("id"): err.append("teams: missing name/id")
j("metrics"); j("site"); j("meta")
if err:
    print("\n".join(err)); sys.exit(1)
print("data OK")
