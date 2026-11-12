#!/usr/bin/env python3
"""Sanity-checks the data files so a bad bot run can't break the site."""
import json, re, sys
from pathlib import Path
D = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "site" / "data"
err = []
def j(n): return json.loads((D / f"{n}.json").read_text())
def number(v): return isinstance(v, (int, float)) and not isinstance(v, bool)
def badge(where, e, monogram=True):
    if not re.fullmatch(r"#[0-9a-fA-F]{3,8}", str(e.get("c", ""))): err.append(f"{where}: colour is not hex: {e.get('c')!r}")
    if monogram and not re.fullmatch(r"[A-Za-z0-9]{1,4}", str(e.get("m", ""))): err.append(f"{where}: monogram is not 1-4 letters or digits: {e.get('m')!r}")
def links(where, node):
    """Every link anywhere in a file must be http or https."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("url", "buyMeACoffee") and v and not re.match(r"https?://", str(v)): err.append(f"{where}: link is not http(s): {v!r}")
            links(where, v)
    elif isinstance(node, list):
        for v in node: links(where, v)
for name in ("lore", "esports", "t2", "social", "teams", "metrics", "site", "alumni", "triumvirate"):
    links(name, j(name))
for tab in ("lore", "esports", "t2"):
    d = j(tab); eras = {e["id"] for e in d["eras"]}; ids = set()
    for e in d["eras"]: badge(f"{tab} era {e.get('id')}", e, monogram=False)
    for it in d["items"]:
        for k in ("id", "e", "when", "t", "d"):
            if not it.get(k): err.append(f"{tab}: item missing {k}: {it.get('t')}")
        if it.get("e") not in eras: err.append(f"{tab}: bad era {it.get('e')} on {it.get('t')}")
        for k in ("peak", "avg", "hours"):
            if k in it.get("views", {}) and not number(it["views"][k]): err.append(f"{tab}: views.{k} is not a number on {it['t']}")
        if it.get("id") in ids: err.append(f"{tab}: duplicate id {it['id']}")
        ids.add(it.get("id"))
        for v in it.get("vods", []):
            if not re.fullmatch(r"[A-Za-z0-9_-]{11}", v.get("yt", "")): err.append(f"{tab}: bad yt id on {it['t']}")
            if "start" in v and not number(v["start"]): err.append(f"{tab}: vod start is not a number on {it['t']}")
        c = it.get("community")
        if c and (c.get("mood") not in {"hype","celebration","mixed","backlash"} or not c.get("summary")): err.append(f"{tab}: bad community on {it['t']}")
for s in j("social"):
    if s.get("v") not in ("esports", "t2"): err.append(f"social: bad view on {s.get('id')}")
    badge(f"social {s.get('id')}", s)
for t in j("teams"):
    if not t.get("name") or not t.get("id"): err.append("teams: missing name/id")
    badge(f"teams {t.get('id')}", t)
for p in j("triumvirate")["people"]: badge(f"triumvirate {p.get('name')}", p)
for v in j("metrics")["viewership"]:
    if not number(v.get("peak")): err.append(f"metrics: viewership peak is not a number on {v.get('event')}")
ids = set()
for p in j("alumni")["people"]:
    for k in ("x", "twitch", "youtube", "instagram", "tiktok"):
        if k in p and not re.fullmatch(r"@?[A-Za-z0-9_.-]{1,40}", str(p[k])): err.append(f"alumni: {k} handle is not plain on {p.get('name')}")
    if "stints" in p:
        if not p.get("id") or p["id"] in ids: err.append(f"alumni: missing or repeated id on {p.get('name')}")
        ids.add(p.get("id"))
        for s in p["stints"]:
            if not s.get("team") or not re.match(r"\d{4}", str(s.get("from", ""))): err.append(f"alumni: stint needs a team and a start on {p.get('name')}")
j("site"); j("meta")
if err:
    print("\n".join(err)); sys.exit(1)
print("data OK")
