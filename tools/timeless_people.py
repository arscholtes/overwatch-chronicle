#!/usr/bin/env python3
"""
Rebuilds the Timeless people in site/data/alumni.json from Liquipedia's roster tables.

Reads the Timeless, Timeless Ethereal and Timeless Obsidian pages and each person's own page through
Liquipedia's API, at the pace its terms ask for (one rendered page per 30 seconds), so a full run takes
about three minutes. Pass a directory to keep the downloaded pages between runs.

Kept: handle, roles, dates, next team, country, heroes, public social handles and placements.
Left out on purpose: legal names, birth dates, Discord and FACEIT ids.

  python3 tools/timeless_people.py [cache-dir]
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
import time
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

ALUMNI = Path(__file__).resolve().parent.parent / "site" / "data" / "alumni.json"
API = "https://liquipedia.net/overwatch/api.php"
AGENT = "OverwatchChronicle/1.0 (fan archive research)"
TEAMS = {"Timeless": "Timeless", "Timeless_Ethereal": "Timeless Ethereal", "Timeless_Obsidian": "Timeless Obsidian"}
STAFF = re.compile(r"Coach|Manager|Owner|Analyst|Content Creator|Staff")
DATE = re.compile(r"\d{4}-\d\d-(\d\d|\?\?)")
HANDLE = re.compile(r"@?[A-Za-z0-9_.-]{1,40}")
SOCIALS = ("twitter", "twitch", "youtube", "instagram", "tiktok")
# The 2026 roster has no Liquipedia page; these names are the ones on the site's own timeline entry.
RETURN_2026 = {"team": "Timeless x Missing", "from": "2026", "names": ["sniper", "sawhill", "wsps", "peace", "zzz", "NenWhy", "scuffed"],
               "result": {"date": "2026-09-06", "place": "1st", "event": "Calling All Heroes 2026"}}


def fetch(cache: Path, name: str, params: dict, pause: int) -> dict:
    path = cache / f"{name}.json"
    if not path.exists():
        url = API + "?" + urllib.parse.urlencode({**params, "format": "json", "formatversion": 2, "redirects": 1})
        body = subprocess.run(["curl", "-sf", "--compressed", "-H", f"User-Agent: {AGENT}", url], capture_output=True, text=True, check=True).stdout
        path.write_text(body)
        time.sleep(pause)
    return json.loads(path.read_text())


class Tables(HTMLParser):
    """Collects each top-level table's rows as (text, wiki links) cells, under its two nearest headings."""

    def __init__(self):
        super().__init__()
        self.tables, self.headings = [], []
        self.table = self.row = self.cell = self.heading = self.links = None
        self.depth = 0
        self.skipping = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("h2", "h3", "h4"):
            self.heading = []
        if tag == "table":
            self.depth += 1
            if self.depth == 1:
                self.table = {"head": self.headings[-2:], "rows": []}
        if self.table is None or self.depth != 1:
            return
        if tag == "tr":
            self.row = []
        if tag in ("td", "th") and self.row is not None:
            self.cell, self.links = [], []
        href = attrs.get("href", "")
        if tag == "a" and self.cell is not None and href.startswith("/overwatch/") and "redlink" not in href and ":" not in href:
            self.links.append(urllib.parse.unquote(href[len("/overwatch/"):]))
        if tag == "sup":
            self.skipping = True

    def handle_endtag(self, tag):
        if tag in ("h2", "h3", "h4") and self.heading is not None:
            self.headings.append("".join(self.heading).replace("[edit]", "").strip())
            self.heading = None
        if tag == "sup":
            self.skipping = False
        if self.table is not None and self.depth == 1:
            if tag in ("td", "th") and self.cell is not None and self.row is not None:
                self.row.append((re.sub(r"\s+", " ", "".join(self.cell)).strip(), self.links))
                self.cell = None
            if tag == "tr" and self.row:
                self.table["rows"].append(self.row)
                self.row = None
        if tag == "table":
            if self.depth == 1 and self.table:
                self.tables.append(self.table)
                self.table = None
            self.depth -= 1

    def handle_data(self, data):
        if self.heading is not None:
            self.heading.append(data)
        if self.cell is not None and not self.skipping:
            self.cell.append(data)


def read_team(cache: Path, page: str, team: str):
    """A team page's stints and placements."""
    parser = Tables()
    parser.feed(fetch(cache, f"team-{page}", {"action": "parse", "page": page, "prop": "text"}, 31)["parse"]["text"])
    stints, results = [], []
    for table in parser.tables:
        if not table["rows"]:
            continue
        header = [c[0] for c in table["rows"][0]]
        for row in table["rows"][1:]:
            cells = [c for c in row if c[0]]
            texts = [c[0] for c in cells]
            if "Join Date" in header and "ID" in header:
                dates = [i for i, t in enumerate(texts) if DATE.match(t)]
                if not dates:
                    continue
                left = len(dates) > 1
                stints.append({
                    "handle": texts[0], "page": cells[0][1][0] if cells[0][1] else None, "team": team,
                    "role": re.sub(r"\s*\(.*\)$", "", texts[dates[0] - 1]) if not STAFF.search(texts[dates[0] - 1]) else re.sub(r"^.*\((.*)\)$", r"\1", texts[dates[0] - 1]),
                    "staff": bool(STAFF.search(texts[dates[0] - 1])),
                    "from": texts[dates[0]][:10], "to": texts[dates[1]][:10] if left else None,
                    "next": texts[dates[1] + 1] if left and len(texts) > dates[1] + 1 else None,
                })
            elif header[:2] == ["Date", "Place"] and len(texts) > 3 and DATE.match(texts[0]):
                results.append({"date": texts[0], "place": texts[1], "event": texts[3], "team": team})
    return stints, results


def read_profiles(cache: Path, pages: list[str]) -> dict:
    """Each person's infobox fields, by the page name their roster row links to."""
    profiles = {}
    for start in range(0, len(pages), 45):
        chunk = pages[start:start + 45]
        data = fetch(cache, f"people-{start}", {"action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main", "titles": "|".join(chunk)}, 3)["query"]
        back = {}
        for kind in ("redirects", "normalized"):
            for hop in data.get(kind, []):
                back[hop["to"]] = hop["from"]
        for page in data["pages"]:
            if page.get("missing"):
                continue
            asked = page["title"]
            while asked in back:
                asked = back[asked]
            box = re.search(r"\{\{Infobox[^\n]*\n(.*?)\n\}\}", page["revisions"][0]["slots"]["main"]["content"], re.S)
            fields = dict(m.groups() for m in re.finditer(r"^\|(\w+)=(.*\S)", box.group(1), re.M)) if box else {}
            profiles[asked.replace(" ", "_")] = fields
    return profiles


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def build(stints, results, profiles, people):
    by_name = {p["name"].lower(): p for p in people}
    grouped = {}
    for s in stints:
        grouped.setdefault(s["handle"].lower(), []).append(s)
    for name in RETURN_2026["names"]:
        grouped.setdefault(name.lower(), []).append({"handle": name, "page": None, "team": RETURN_2026["team"], "role": None, "staff": False, "from": RETURN_2026["from"], "to": None, "next": None})
    for key, rows in grouped.items():
        rows.sort(key=lambda s: s["from"])
        profile = next((profiles[r["page"]] for r in rows if r["page"] in profiles), {})
        handle = profile.get("id") or rows[0]["handle"]
        person = by_name.get(key)
        if person is None:
            person = {"name": handle, "teams": ["timeless"]}
            people.append(person)
        roles = list(dict.fromkeys(r["role"] for r in rows if r["role"]))
        for r in rows:
            r["role"] = r["role"] or (roles[0] if roles else None)
        if "timeless" not in person["teams"]:
            person["teams"].append("timeless")
        person["id"] = slug(person["name"])
        person.setdefault("role", " · ".join(roles[:2]))
        person["staff"] = all(r["staff"] for r in rows)
        person["stints"] = [{k: r[k] for k in ("team", "role", "from", "to", "next") if r[k]} for r in rows]
        earned = [{k: res[k] for k in ("date", "place", "event")} for res in results
                  if any(r["team"] == res["team"] and r["role"] != "Content Creator" and r["from"] <= res["date"] <= (r["to"] or "9999") for r in rows)]
        if key in {n.lower() for n in RETURN_2026["names"]}:
            earned.append(RETURN_2026["result"])
        if earned:
            person["results"] = sorted(earned, key=lambda r: r["date"], reverse=True)
        if profile:
            page = next(r["page"] for r in rows if r["page"] in profiles)
            person["wiki"] = "https://liquipedia.net/overwatch/" + urllib.parse.quote(page)
            person.setdefault("url", person["wiki"])
            for field in ("country", "status"):
                if profile.get(field):
                    person[field] = profile[field]
            heroes = [profile[k] for k in ("hero", "hero2", "hero3") if profile.get(k)]
            if heroes:
                person["heroes"] = heroes
            for field in SOCIALS:
                value = profile.get(field, "")
                if HANDLE.fullmatch(value):
                    person["x" if field == "twitter" else field] = value if field == "youtube" else value.lstrip("@")
            if "now" not in person:
                person["now"] = profile["team"] if profile.get("status") == "Active" and profile.get("team") else {"Active": "Free agent"}.get(profile.get("status"), profile.get("status", ""))
    people.sort(key=lambda p: (not p.get("star"), not p.get("hi"), p.get("staff", False), p["stints"][0]["from"] if p.get("stints") else "", p["name"].lower()))


def main():
    cache = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.mkdtemp())
    cache.mkdir(parents=True, exist_ok=True)
    stints, results = [], []
    for page, team in TEAMS.items():
        s, r = read_team(cache, page, team)
        stints += s
        results += r
    profiles = read_profiles(cache, sorted({s["page"] for s in stints if s["page"]}))
    alumni = json.loads(ALUMNI.read_text())
    build(stints, results, profiles, alumni["people"])
    alumni["roster"] = {"label": "Liquipedia: Timeless", "url": "https://liquipedia.net/overwatch/Timeless", "read": time.strftime("%Y-%m-%d")}
    ALUMNI.write_text(json.dumps(alumni, indent=1, ensure_ascii=False) + "\n")
    print(f"{len(alumni['people'])} people, {len(stints)} stints, {len(profiles)} profiles")


if __name__ == "__main__":
    main()
