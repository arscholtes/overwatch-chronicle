#!/usr/bin/env python3
"""
Imports every Overwatch team and tournament from Liquipedia.

Reads page source through Liquipedia's MediaWiki API and writes one record per team
and per tournament to bot/out/liquipedia/. SCHEMA.md describes the records.

Liquipedia's API terms (https://liquipedia.net/api-terms-of-use) set how this talks
to it: the API only, a User-Agent naming the project, one request every two seconds,
and no repeat request for a page that has not changed.
"""
from __future__ import annotations

import json
import re
import time
import urllib.parse

import requests

import update

API = "https://liquipedia.net/overwatch/api.php"
WIKI = "https://liquipedia.net/overwatch/"
OUT = update.OUT / "liquipedia"
SECONDS_BETWEEN_REQUESTS = 2.0
PAGES_PER_REQUEST = 50

SOCIAL = {
    "twitter": ("X", "https://x.com/{}"),
    "twitch": ("Twitch", "https://www.twitch.tv/{}"),
    "youtube": ("YouTube", "https://www.youtube.com/{}"),
    "instagram": ("Instagram", "https://www.instagram.com/{}"),
    "facebook": ("Facebook", "https://www.facebook.com/{}"),
    "discord": ("Discord", "https://discord.gg/{}"),
    "tiktok": ("TikTok", "https://www.tiktok.com/@{}"),
}
HANDLE = re.compile(r"[\w.@/-]+")
WEB_ADDRESS = re.compile(r"https?://[^\s\"'<>|{}\[\]]+")
DATE = re.compile(r"\d{4}(-\d{2}(-\d{2})?)?")
COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)
REGIONS = {
    "na": "North America", "north america": "North America",
    "eu": "Europe", "europe": "Europe",
    "cn": "China", "china": "China",
    "kr": "Korea", "korea": "Korea", "south korea": "Korea",
    "jp": "Japan", "japan": "Japan",
    "tw": "Taiwan", "taiwan": "Taiwan",
    "sa": "South America", "south america": "South America",
    "sea": "Southeast Asia", "southeast asia": "Southeast Asia",
    "me": "Middle East", "middle east": "Middle East",
    "anz": "Oceania", "oce": "Oceania", "oceania": "Oceania",
}


def infobox(text: str, kind: str) -> dict[str, str] | None:
    """
    Reads the fields of a page's infobox.

    :param text: page source
    :param kind: infobox name, "team" or "league"
    :return: field name to value, or None when the page has no such infobox
    """
    text = COMMENT.sub("", text)
    found = re.search(r"\{\{\s*Infobox " + kind + r"\b", text, re.IGNORECASE)
    if not found:
        return None
    fields, parts, depth, i = {}, [""], 0, found.end()
    while i < len(text):
        pair = text[i:i + 2]
        if pair in ("{{", "[["):
            depth += 1
        elif pair in ("}}", "]]"):
            if depth == 0:
                break
            depth -= 1
        if pair in ("{{", "[[", "}}", "]]"):
            parts[-1] += pair
            i += 2
        elif text[i] == "|" and depth == 0:
            parts.append("")
            i += 1
        else:
            parts[-1] += text[i]
            i += 1
    for part in parts:
        name, equals, value = part.partition("=")
        if equals and value.strip():
            fields[name.strip().lower()] = value.strip()
    return fields


def page_id(title: str) -> str:
    """Slug of a page title. Hyphens are kept apart from spaces, because both occur in names that are otherwise the same."""
    return re.sub(r"[^\w-]+", "_", title.lower()).strip("_")


def page_url(title: str) -> str:
    return WIKI + urllib.parse.quote(title.replace(" ", "_"))


def links(fields: dict[str, str], website: str) -> list[dict[str, str]]:
    """
    Builds full links from an infobox's website and social handles.

    :param fields: infobox fields
    :param website: name of the field holding the website address
    :return: label and url pairs; a value that is not a plain address or handle is left out
    """
    found = []
    if WEB_ADDRESS.fullmatch(fields.get(website, "")):
        found.append({"label": "Website", "url": fields[website]})
    for field, (label, pattern) in SOCIAL.items():
        handle = fields.get(field, "")
        if HANDLE.fullmatch(handle):
            found.append({"label": label, "url": pattern.format(handle.removeprefix("@") if field == "tiktok" else handle)})
    return found


def first_date(value: str | None) -> str | None:
    found = DATE.search(value or "")
    return found.group(0) if found else None


def team_date(value: str | None) -> str | None:
    """Date of the Overwatch team where a page also gives the date its organisation was founded."""
    labelled = re.split(r"\{\{\s*overwatch\s*\}\}", value or "", flags=re.IGNORECASE)
    return first_date(labelled[-1])


def whole_number(value: str | None) -> int | None:
    number = (value or "").replace(",", "")
    return round(float(number)) if re.fullmatch(r"\d+(\.\d+)?", number) else None


def region(value: str | None) -> str | None:
    """One spelling for a region Liquipedia's pages write several ways; an unlisted region is kept as written."""
    written = (value or "").strip(" []")
    return REGIONS.get(written.lower(), written)


def present(record: dict) -> dict:
    return {key: value for key, value in record.items() if value not in (None, "", [])}


def team_record(title: str, text: str) -> dict | None:
    """
    Builds a team record from a team page.

    :param title: Liquipedia page title
    :param text: page source
    :return: the record SCHEMA.md describes, or None when the page is not a team page
    """
    fields = infobox(text, "team")
    if fields is None:
        return None
    return present({
        "id": page_id(title),
        "name": fields.get("name", title),
        "liquipedia": page_url(title),
        "region": region(fields.get("region")),
        "location": fields.get("location"),
        "created": team_date(fields.get("created")),
        "disbanded": team_date(fields.get("disbanded")),
        "links": links(fields, "website"),
    })


def competition_record(title: str, text: str) -> dict | None:
    """
    Builds a competition record from a tournament page.

    :param title: Liquipedia page title
    :param text: page source
    :return: the record SCHEMA.md describes, or None when the page is not a tournament page
    """
    fields = infobox(text, "league")
    if fields is None:
        return None
    return present({
        "id": page_id(title),
        "name": fields.get("name", title),
        "liquipedia": page_url(title),
        "series": fields.get("series"),
        "tier": whole_number(fields.get("liquipediatier")),
        "tierType": fields.get("liquipediatiertype", "").capitalize(),
        "start": first_date(fields.get("sdate", fields.get("date"))),
        "end": first_date(fields.get("edate", fields.get("date"))),
        "type": fields.get("type", "").capitalize(),
        "country": fields.get("country"),
        "city": fields.get("city"),
        "prizeUsd": whole_number(fields.get("prizepoolusd")),
        "teams": whole_number(fields.get("team_number")),
        "links": links(fields, "web"),
    })


class Client:
    """Reads page source from Liquipedia's API, within its terms of use."""

    def __init__(self, session, cache, sleep=time.sleep, clock=time.monotonic):
        """
        :param session: object with requests' get(url, params=, headers=, timeout=)
        :param cache: directory holding the source of pages already fetched
        :param sleep: waits a number of seconds
        :param clock: returns the current time in seconds
        """
        self.session, self.cache, self.sleep, self.clock = session, cache, sleep, clock
        self.cache.mkdir(parents=True, exist_ok=True)
        self.last_request = None

    def query(self, params: dict):
        """Yields each page of results for one query, following the API's continuation."""
        more = {}
        while True:
            if self.last_request is not None:
                wait = SECONDS_BETWEEN_REQUESTS - (self.clock() - self.last_request)
                if wait > 0:
                    self.sleep(wait)
            response = self.session.get(API, params={**params, **more, "action": "query", "format": "json", "formatversion": "2"},
                                        headers=update.UA, timeout=60)
            self.last_request = self.clock()
            response.raise_for_status()
            body = response.json()
            if "error" in body:
                raise RuntimeError(f"Liquipedia API: {body['error'].get('code')}: {body['error'].get('info')}")
            yield body
            if "continue" not in body:
                return
            more = body["continue"]

    def category_texts(self, category: str) -> dict[str, str]:
        """
        Fetches the source of every page in a category, reusing unchanged pages from the cache.

        :param category: category title, such as "Category:Teams"
        :return: page title to page source
        """
        listed = {}
        for body in self.query({"generator": "categorymembers", "gcmtitle": category, "gcmtype": "page",
                                "gcmlimit": "500", "prop": "info"}):
            for page in body.get("query", {}).get("pages", []):
                listed.setdefault(page["pageid"], {}).update(page)
        texts, stale = {}, []
        for pageid, page in listed.items():
            kept = self.cache / f"{pageid}.json"
            saved = json.loads(kept.read_text()) if kept.exists() else None
            if saved and saved["revid"] == page["lastrevid"]:
                texts[page["title"]] = saved["text"]
            else:
                stale.append(pageid)
        for start in range(0, len(stale), PAGES_PER_REQUEST):
            batch = stale[start:start + PAGES_PER_REQUEST]
            for body in self.query({"pageids": "|".join(str(pageid) for pageid in batch), "prop": "revisions",
                                    "rvprop": "ids|content", "rvslots": "main"}):
                for page in body["query"]["pages"]:
                    revision = page["revisions"][0]
                    text = revision["slots"]["main"]["content"]
                    (self.cache / f"{page['pageid']}.json").write_text(json.dumps({"revid": revision["revid"], "text": text}))
                    texts[page["title"]] = text
        return texts


def import_category(client: Client, category: str, build, name: str) -> None:
    """Writes one file of records for a category and prints how many pages became records."""
    texts = client.category_texts(category)
    records = [record for title in sorted(texts) if (record := build(title, texts[title]))]
    ids = [record["id"] for record in records]
    repeated = sorted({i for i in ids if ids.count(i) > 1})
    if repeated:
        raise RuntimeError(f"{name}: more than one page maps to the id {repeated[:5]}")
    (OUT / f"{name}.json").write_text(json.dumps(records, indent=1, ensure_ascii=False) + "\n")
    print(f"{name}: {len(records)} records from {len(texts)} pages in {category}")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    client = Client(requests.Session(), OUT / "cache")
    import_category(client, "Category:Teams", team_record, "teams")
    import_category(client, "Category:Tournaments", competition_record, "competitions")


if __name__ == "__main__":
    main()
