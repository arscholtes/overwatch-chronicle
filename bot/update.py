#!/usr/bin/env python3
"""
Overwatch Chronicle weekly update bot.

What it does each run:
  1. Samples Overwatch's live Steam player count (Steam Web API, no key needed).
  2. Asks Claude (with web search) for anything new since the last run: lore beats,
     esports results, tier 2 results, notable posts, VODs, viewership numbers, team changes.
  3. Backfills "community" summaries (what people said on X/Reddit/press) for a few
     older events that don't have one yet.
  4. Verifies every YouTube ID (oEmbed) and every link (HTTP check), drops anything
     that doesn't check out, de-duplicates, and writes the JSON data files.
  5. Writes bot/out/summary.md, which the GitHub workflow uses as the PR description.

Environment:
  ANTHROPIC_API_KEY   required
  CLAUDE_MODEL        optional, default "claude-sonnet-5-5"
  WEB_SEARCH_TOOL     optional, default "web_search_20250305"
  BACKFILL_COUNT      optional, default 6  (older events to research community talk for)
  DRY_RUN=1           optional, don't call Claude; only sample Steam and validate
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
import urllib.parse
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "site" / "data"
OUT = ROOT / "bot" / "out"
OUT.mkdir(parents=True, exist_ok=True)

STEAM_APPID = 2357570  # Overwatch on Steam
UA = {"User-Agent": "OverwatchChronicleBot/1.0 (+https://github.com/arscholtes/overwatch-chronicle)"}
TODAY = dt.date.today().isoformat()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-5-5")
SEARCH_TOOL = os.environ.get("WEB_SEARCH_TOOL", "web_search_20250305")
BACKFILL = int(os.environ.get("BACKFILL_COUNT", "6"))
DRY = os.environ.get("DRY_RUN") == "1"

ICONS = ["factory","omnic","tower","shield","hammer","pyramid","strike","sun","split","tower2","radiation","dragon","hat","clock",
         "wings","spider","scope","canal","megaphone","blast","gavel","mask","visor","fist","gorilla","moon","mech","skull","eiffel",
         "globe","fox","crown","talon","mountain","tiger","fang","ice","trophy","cup2","arena","broadcast","city","hex","fall","rocket","seal"]
MOODS = {"hype", "celebration", "mixed", "backlash"}
log: list[str] = []


def load(name):
    return json.loads((DATA / f"{name}.json").read_text())


def save(name, obj):
    (DATA / f"{name}.json").write_text(json.dumps(obj, indent=1, ensure_ascii=False) + "\n")


def slug(s: str) -> str:
    s = re.sub(r"[^\w\s-]", "", s.lower()).strip()
    return re.sub(r"[\s_]+", "-", s)[:60]


# ---------------------------------------------------------------- verification
def url_ok(url: str) -> bool:
    if not url or not url.startswith(("https://", "http://")):
        return False
    host = urllib.parse.urlparse(url).netloc.lower()
    # X/Twitter and a few sites block bots; accept well-formed status/profile URLs without fetching.
    if host.endswith(("x.com", "twitter.com")):
        return bool(re.match(r"https?://(www\.)?(x|twitter)\.com/[A-Za-z0-9_]{1,15}(/status/\d+|/highlights)?/?(\?.*)?$", url))
    if host.endswith(("reddit.com", "kryix.org")):
        return True
    try:
        r = requests.head(url, headers=UA, timeout=12, allow_redirects=True)
        if r.status_code in (403, 405, 429) or r.status_code >= 500:
            r = requests.get(url, headers=UA, timeout=15, allow_redirects=True, stream=True)
        return r.status_code < 400
    except requests.RequestException:
        return False


def yt_ok(video_id: str) -> str | None:
    """Returns the video title if the YouTube ID exists and is embeddable."""
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id or ""):
        return None
    try:
        r = requests.get("https://www.youtube.com/oembed",
                         params={"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"},
                         headers=UA, timeout=12)
        return r.json().get("title") if r.ok else None
    except (requests.RequestException, ValueError):
        return None


# ---------------------------------------------------------------- steam
def sample_steam(metrics):
    try:
        r = requests.get("https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/",
                         params={"appid": STEAM_APPID}, headers=UA, timeout=15)
        ccu = r.json()["response"]["player_count"]
    except Exception as e:  # noqa: BLE001
        log.append(f"- Steam sample failed: {e}")
        return
    samples = metrics.setdefault("steamSamples", [])
    samples = [s for s in samples if s["date"] != TODAY]
    samples.append({"date": TODAY, "ccu": ccu, "utc": dt.datetime.utcnow().strftime("%H:%M")})
    metrics["steamSamples"] = samples[-104:]  # keep two years of weekly snapshots
    if ccu > metrics.get("steamPeak", {}).get("value", 0):
        metrics["steamPeak"] = {"value": ccu, "date": TODAY, "src": "Steam Web API (bot sample)"}
    log.append(f"- Steam snapshot: **{ccu:,}** concurrent players")


# ---------------------------------------------------------------- claude
def ask_claude(prompt: str, max_searches: int = 25) -> dict:
    import anthropic  # imported lazily so DRY_RUN works without the package
    client = anthropic.Anthropic()
    msgs = [{"role": "user", "content": prompt}]
    tools = [{"type": SEARCH_TOOL, "name": "web_search", "max_uses": max_searches}]
    text = ""
    for _ in range(6):  # allow pause_turn continuations for long research
        resp = client.messages.create(model=MODEL, max_tokens=16000, tools=tools, messages=msgs)
        text += "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
        if resp.stop_reason != "pause_turn":
            break
        msgs = msgs + [{"role": "assistant", "content": resp.content}]
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.S) or re.search(r"(\{.*\})", text, re.S)
    if not m:
        raise ValueError("Claude did not return JSON")
    return json.loads(m.group(1))


RULES = """
Rules (follow exactly):
- Only include facts you found in sources during THIS search. Every entry needs at least one real source URL you actually saw.
- Never invent YouTube IDs, post URLs, scores, view counts or quotes. If unsure, leave the field out.
- Write descriptions in your own words. Quotes must be under 15 words, at most one per source.
- X/Twitter post URLs must be the exact status URL you saw in results (x.com/<handle>/status/<id>).
- Keep it neutral and factual, including about controversies. Label secondhand claims as secondhand.
- Respond with ONE ```json fenced block and nothing else after it.
"""


def build_new_prompt(lore, esp, t2, social, teams, meta):
    since = meta.get("lastBotRun") or meta.get("lastUpdated")
    known = {
        "lore": [i["t"] for i in lore["items"][-12:]],
        "esports": [f'{i["when"]}: {i["t"]}' for i in esp["items"][-14:]],
        "tier2": [f'{i["when"]}: {i["t"]}' for i in t2["items"][-12:]],
        "posts": [s.get("url", "") for s in social][-30:],
        "teams": [t["name"] for t in teams],
        "upcoming": [i["t"] for i in esp["items"] + t2["items"] if i.get("up")],
    }
    return f"""You maintain "Overwatch Chronicle", a fan archive site about Overwatch lore and esports.
Today is {TODAY}. The last update was {since}. Research what happened in Overwatch since then (search the web, including x.com, liquipedia.net, owtv.gg, esports.gg, blizzard.com, YouTube).

Already on the site (don't repeat): {json.dumps(known, ensure_ascii=False)}

Find:
1. Lore/story beats (new seasons, cinematics, comics, short stories, heroes).
2. Tier 1 esports results (OWCS stages and internationals, World Cup, EWC): winners, scores, dates, venues.
3. Tier 2 results (FACEIT League, promotion/relegation, Calling All Heroes) and anything about the org Timeless (@Timeless_OW).
4. For each result: the official YouTube VOD (prefer the @ow_esports channel full broadcast or grand final) and any viewership (peak, average, hours) with a source.
5. For each new event: a community summary — how fans, players, teams and casters reacted on X/Reddit, with links to specific high-engagement posts.
6. 2–6 notable posts from big accounts (@OW_Esports, @PlayOverwatch, team accounts, players) with exact status URLs.
7. Hour Zero / Kaizen / Timeless alumni: any roster moves, titles or big moments for these players (in Overwatch or other games): {', '.join(p['name'] for p in json.loads((DATA/'alumni.json').read_text())['people'])}. Return them in "alumni".
8. Write an "overview" (4–6 sentences, sourced) for these teams that don't have one yet, returned in "teams" with the same id: {[t['id'] for t in teams if not t.get('overview')][:6]}.
9. Team changes (new partner teams, disbandments, rebrands), plus any org (tier 1 or tier 2) that has now competed for a year or more and is not listed yet. If an "upcoming" item now has a result, report it in "resolve".

Return JSON:
{{
 "lore": [{{"era":"talon","when":"Mon D, YYYY","t":"Title","d":"2–4 sentences","tags":["..."],"ic":"one of {ICONS}","src":"Live game","links":[{{"label":"...","url":"..."}}],"sources":["url"],"community":{{"mood":"hype|celebration|mixed|backlash","summary":"...","voices":[{{"who":"@handle or outlet","gist":"...","url":"..."}}]}}}}],
 "esports": [{{"era":"owcs|wc|owl|early","when":"...","t":"...","d":"...","win":"Team","score":["Winner","4–2","Loser"],"tags":[],"ic":"trophy","vods":[{{"yt":"11-char id","label":"Grand Final"}}],"views":{{"peak":0,"avg":0,"hours":0,"src":"...","url":"..."}},"sources":["url"],"community":{{...}}}}],
 "t2": [{{"era":"partner","tl":false, "...same fields..."}}],
 "social": [{{"v":"esports|t2","who":"Name","h":"@handle","m":"2-4 letter monogram","c":"#hex","d":"Mon D, YYYY","x":"what the post said/did (own words)","n":"views if shown","k":"short label","url":"exact status url"}}],
 "teams": [{{"id":"slug","name":"...","m":"MONO","c":"#hex","region":"...","status":"years active, e.g. 2024–now","tier":"T1|T2|National|Legacy","overview":"4–6 sentence overview of the org's whole story","aliases":["other names"],"blurb":"...","titles":[],"x":"handle"}}],
 "alumni": [{{"name":"exact name from the list","now":"current team","tier":"T1|T2|Other game|FA|Staff","hi":"updated one-line highlight","url":"source url"}}],
 "resolve": [{{"title":"exact upcoming item title","win":"...","score":["","",""],"d":"updated description","vods":[],"views":{{}}}}],
 "viewership": [{{"event":"...","date":"YYYY-MM-DD","peak":0,"src":"..."}}],
 "notes": "1–3 sentences on what you found and anything you were unsure about"
}}
Use empty arrays where nothing new was found.
{RULES}"""


def build_backfill_prompt(events):
    lst = [{"id": e["id"], "when": e["when"], "title": e["t"], "desc": e["d"]} for e in events]
    return f"""You maintain "Overwatch Chronicle", a fan archive that tells the story of Overwatch through what the community said at the time.
For EACH event below, research how people reacted: X/Twitter posts from teams, players, casters, journalists and fans (prefer high-engagement posts), Reddit (r/Competitiveoverwatch, r/Overwatch) threads, and press coverage of the reaction.

Events: {json.dumps(lst, ensure_ascii=False)}

Return JSON:
{{"community": {{"<event id>": {{"mood":"hype|celebration|mixed|backlash","summary":"3–5 sentences: the main reactions, the dominant feeling, any debate or memes, how it shaped what came next","voices":[{{"who":"@handle / outlet / subreddit","gist":"what they said, in your words","url":"exact link"}}]}}}}, "notes":"..."}}
Include 2–6 voices per event. Skip an event entirely if you can't find real reactions.
{RULES}"""


# ---------------------------------------------------------------- merging
def clean_item(raw, tab):
    it = {k: raw[k] for k in ("when", "t", "d", "tags", "win", "score", "src", "tl", "up") if raw.get(k) not in (None, "", [])}
    it["e"] = raw.get("era")
    it["ic"] = raw.get("ic") if raw.get("ic") in ICONS else "hex"
    prefix = {"lore": "lore", "esports": "esp", "t2": "t2"}[tab]
    it["id"] = f'{prefix}-{slug(raw.get("t", "event"))}'
    it["bot"] = TODAY
    vods = []
    for v in raw.get("vods") or []:
        title = yt_ok(v.get("yt", ""))
        if title:
            vods.append({"yt": v["yt"], "label": v.get("label") or title[:60]})
        else:
            log.append(f'  - dropped VOD `{v.get("yt")}` (not found on YouTube)')
    if vods:
        it["vods"] = vods
    links = [l for l in (raw.get("links") or []) if url_ok(l.get("url", ""))]
    srcs = [u for u in (raw.get("sources") or []) if url_ok(u)]
    if not srcs and not links:
        return None  # no verifiable source: don't publish
    if not links and srcs:
        links = [{"label": "Source", "url": srcs[0]}]
    it["links"] = links[:4]
    v = raw.get("views") or {}
    if any(v.get(k) for k in ("peak", "avg", "hours")) and (not v.get("url") or url_ok(v["url"])):
        it["views"] = {k: v[k] for k in ("peak", "avg", "hours", "src", "url", "approx") if v.get(k)}
    c = clean_community(raw.get("community"))
    if c:
        it["community"] = c
    return it


def clean_community(c):
    if not c or not c.get("summary"):
        return None
    voices = [v for v in (c.get("voices") or []) if v.get("who") and v.get("gist") and (not v.get("url") or url_ok(v["url"]))]
    return {"mood": c.get("mood") if c.get("mood") in MOODS else "mixed", "summary": c["summary"].strip(),
            "voices": voices[:8], "updated": TODAY}


def known_titles(*datasets):
    return {slug(i["t"]) for d in datasets for i in d["items"]}


def merge(result, lore, esp, t2, social, teams, metrics):
    seen = known_titles(lore, esp, t2)
    added = {"lore": 0, "esports": 0, "t2": 0}
    for tab, D in (("lore", lore), ("esports", esp), ("t2", t2)):
        valid_eras = {e["id"] for e in D["eras"]}
        for raw in result.get(tab) or []:
            if slug(raw.get("t", "")) in seen or raw.get("era") not in valid_eras:
                continue
            it = clean_item(raw, tab)
            if it:
                D["items"].append(it)
                seen.add(slug(it["t"]))
                added[tab] += 1
                log.append(f'- **{tab}** + {it["when"]} · {it["t"]}' + (" · 🎬" if it.get("vods") else "") + (" · 💬" if it.get("community") else ""))
    # resolve upcoming items
    for r in result.get("resolve") or []:
        for D in (esp, t2):
            for it in D["items"]:
                if it.get("up") and it["t"].lower() == (r.get("title") or "").lower():
                    it.pop("up", None)
                    for k in ("win", "score", "d"):
                        if r.get(k):
                            it[k] = r[k]
                    vods = [v for v in (r.get("vods") or []) if yt_ok(v.get("yt", ""))]
                    if vods:
                        it["vods"] = vods
                    if (r.get("views") or {}).get("peak"):
                        it["views"] = r["views"]
                    it["bot"] = TODAY
                    log.append(f'- resolved upcoming: **{it["t"]}** → {it.get("win","?")}')
    # social
    have = {s.get("url") for s in social}
    for s in result.get("social") or []:
        if s.get("url") in have or not url_ok(s.get("url", "")) or s.get("v") not in ("esports", "t2"):
            continue
        s["id"] = f"post-{len(social)+1}"
        s["exact"] = "/status/" in s["url"]
        s["bot"] = TODAY
        social.append({k: s[k] for k in ("id","v","who","h","m","c","d","x","n","k","url","exact","bot") if s.get(k) not in (None, "")})
        log.append(f'- post: {s.get("who")} · {s.get("d")}')
    # teams
    tids = {t["id"] for t in teams}
    for t in result.get("teams") or []:
        tid = t.get("id") or slug(t.get("name", ""))
        if not tid or not t.get("name"):
            continue
        if tid in tids:
            cur = next(x for x in teams if x["id"] == tid)
            for k in ("status", "tier", "blurb", "overview", "x"):
                if t.get(k):
                    cur[k] = t[k]
            for title in t.get("titles") or []:
                if title not in cur.setdefault("titles", []):
                    cur["titles"].append(title)
        else:
            t["id"] = tid
            teams.append({k: t[k] for k in ("id","name","m","c","region","status","tier","blurb","overview","aliases","titles","x") if t.get(k) not in (None, "")})
            log.append(f'- team added: {t["name"]}')
    # alumni updates
    alum = json.loads((DATA / "alumni.json").read_text())
    for a in result.get("alumni") or []:
        cur = next((p for p in alum["people"] if p["name"].lower() == (a.get("name") or "").lower()), None)
        if cur and a.get("url") and url_ok(a["url"]):
            for k in ("now", "tier", "hi", "url"):
                if a.get(k):
                    cur[k] = a[k]
            log.append(f'- alumni: {cur["name"]} → {cur["now"]}')
    (DATA / "alumni.json").write_text(json.dumps(alum, indent=1, ensure_ascii=False) + "\n")
    # viewership chart
    vk = {v["event"] for v in metrics["viewership"]}
    for v in result.get("viewership") or []:
        if v.get("event") and v.get("peak") and v["event"] not in vk:
            metrics["viewership"].append({k: v[k] for k in ("event","date","peak","src","approx") if v.get(k)})
    metrics["viewership"].sort(key=lambda x: x.get("date", ""))
    return added


def backfill(lore, esp, t2):
    pool = [i for D in (esp, t2, lore) for i in D["items"] if not i.get("community") and not i.get("up")]
    # Prefer esports and tier 2 first, most recent first: those have the richest online reaction.
    pool = pool[::-1][:BACKFILL]
    if not pool:
        return
    res = ask_claude(build_backfill_prompt(pool), max_searches=8 * len(pool))
    n = 0
    for it in pool:
        c = clean_community((res.get("community") or {}).get(it["id"]))
        if c and c["voices"]:
            it["community"] = c
            n += 1
            log.append(f'- 💬 community backfilled: {it["t"]} ({len(c["voices"])} voices)')
    if res.get("notes"):
        log.append(f"\n> Backfill notes: {res['notes']}")
    log.append(f"- backfilled {n}/{len(pool)} events")


# ---------------------------------------------------------------- main
def main():
    lore, esp, t2 = load("lore"), load("esports"), load("t2")
    social, teams, metrics, meta = load("social"), load("teams"), load("metrics"), load("meta")
    log.append(f"## Overwatch Chronicle weekly update · {TODAY}\n")
    sample_steam(metrics)

    if not DRY:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            sys.exit("ANTHROPIC_API_KEY is not set (add it as a repository secret).")
        try:
            result = ask_claude(build_new_prompt(lore, esp, t2, social, teams, meta))
            added = merge(result, lore, esp, t2, social, teams, metrics)
            log.append(f"\nNew: {added['lore']} lore · {added['esports']} esports · {added['t2']} tier 2")
            if result.get("notes"):
                log.append(f"\n> Research notes: {result['notes']}")
        except Exception as e:  # noqa: BLE001
            log.append(f"- ⚠️ new-events research failed: {e}")
        try:
            backfill(lore, esp, t2)
        except Exception as e:  # noqa: BLE001
            log.append(f"- ⚠️ community backfill failed: {e}")

    meta["lastBotRun"] = TODAY
    meta["lastUpdated"] = TODAY
    for name, obj in (("lore", lore), ("esports", esp), ("t2", t2), ("social", social), ("teams", teams), ("metrics", metrics), ("meta", meta)):
        save(name, obj)
    log.append("\nEverything above was verified automatically: YouTube IDs via oEmbed, links via HTTP. "
               "X posts can't be fetched by bots, so check those by hand. Read the diff before merging.")
    (OUT / "summary.md").write_text("\n".join(log) + "\n")
    print("\n".join(log))


if __name__ == "__main__":
    main()
