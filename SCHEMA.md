# Data schema

The site has no database. Its data is the JSON files in `site/data/`, which the page
reads directly. The weekly bot (`bot/update.py`) and the Liquipedia importer
(`bot/liquipedia.py`) are the only programs that write them, and `bot/validate.py`
checks them before every deploy.

No other app reads these files. This repo owns every fact in them except the ones
imported from Liquipedia, which Liquipedia owns (see below).

Files the page reads only ever gain fields. Nothing is renamed or dropped.

## Hand-written and bot-maintained files

| File | Holds | Shape |
|---|---|---|
| `lore.json` | The story timeline | `eras[]` (`id`, `n`, `name`, `c`, `sub`) and `items[]` (`id`, `e` era id, `when`, `t` title, `d` text, `tags[]`, `ic` icon, `src`, `community`) |
| `esports.json` | Tier 1 timeline and winner tables | `eras[]`, `items[]` as in lore plus `win`, `score[]`, `vods[]` (`yt`, `label`, `start`), `views` (`peak`, `avg`, `hours`), `up`; `cups[]` (`h` heading, `list[]` of `[year, winner]`) |
| `t2.json` | Tier 2 timeline | `eras[]`, `items[]` as in esports plus `tl`, `links[]` (`label`, `url`) |
| `social.json` | Notable posts | list of `id`, `v` (`esports` or `t2`), `who`, `h` handle, `m` monogram, `c` colour, `d`, `x`, `k`, `url`, `exact`, `n`, `hot` |
| `teams.json` | One record per team | list of `id`, `name`, `m` monogram, `c` colour, `region`, `status`, `tier`, `blurb`, `overview`, `titles[]`, `aliases[]`, `x` (X profile link), `featured` |
| `alumni.json` | Where Timeless people went | `note`, `people[]` (`name`, `role`, `era`, `now`, `tier`, `hi`, `url`, `star`, `teams[]`) |
| `triumvirate.json` | The founders | `intro`, `people[]` (`id`, `name`, `handle`, `role`, `c`, `m`, `summary`, `chapters[]` of `when`/`t`/`d`, `links[]`), `sources[]` |
| `metrics.json` | Player counts and viewership | `note`, `steamMonthly[]`, `steamPeak`, `steamSamples[]`, `allPlatform`, `viewership[]` (`event`, `date`, `peak`, `src`, `approx`) |
| `site.json` | Owner and repo links | `owner` (`name`, `url`), `buyMeACoffee`, `repo` |
| `meta.json` | Run stamps | `lastUpdated`, `lastBotRun` |

A `community` object is `mood` (`hype`, `celebration`, `mixed` or `backlash`), `summary`
and quoted posts. Colours are hex. Every link is `http` or `https`.

## Imported from Liquipedia

Liquipedia owns these facts. The importer reads them through Liquipedia's API and
writes its output to `bot/out/liquipedia/`, which is not committed. Each record
carries the link to the Liquipedia page it came from. Liquipedia's text is licensed
[CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), so files built from
it carry that licence and the site credits Liquipedia as the source.

To correct an imported fact, correct it on Liquipedia and re-run the importer. Do not
edit the imported value here.

### Team record (`bot/out/liquipedia/teams.json`)

| Field | Meaning |
|---|---|
| `id` | Slug of the Liquipedia page title |
| `name` | Team name from its infobox |
| `liquipedia` | Link to the team's Liquipedia page |
| `region` | Region as Liquipedia gives it |
| `location` | Country |
| `created` | Date the Overwatch team was formed, `YYYY-MM-DD` |
| `disbanded` | Date it disbanded, absent while active |
| `links[]` | Social and web links: `label` (`X`, `Twitch`, `YouTube`, `Instagram`, `Facebook`, `Discord`, `TikTok`, `Website`) and `url` |

### Competition record (`bot/out/liquipedia/competitions.json`)

| Field | Meaning |
|---|---|
| `id` | Slug of the Liquipedia page title |
| `name` | Tournament name from its infobox |
| `liquipedia` | Link to the tournament's Liquipedia page |
| `series` | The series it belongs to, such as Overwatch Contenders |
| `tier` | Liquipedia's tier number, 1 being the highest |
| `tierType` | Liquipedia's tier type where it sets one, such as Qualifier |
| `start`, `end` | Dates, `YYYY-MM-DD` |
| `type` | `Online` or `Offline` |
| `country`, `city` | Where it was held, or the region for online play |
| `prizeUsd` | Prize pool in US dollars, a whole number |
| `teams` | Number of teams |
| `links[]` | As for a team |

Winners and placements are not imported. Liquipedia's page source does not hold them
in a readable form: older pages name teams by template shortcut, newer pages fill
placements in from the bracket when the page is drawn.

### Planned, not yet built

Merging these records into the files the page reads: `teams.json` gains a `links[]`
field and a `liquipedia` field beside the existing `x`, and a new `competitions.json`
appears in `site/data/`.
