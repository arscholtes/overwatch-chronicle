# Overwatch Chronicle

A fan archive of Overwatch lore, esports, tier 2 (including Timeless), teams, community reactions and the numbers. A bot updates it every week.

Built by [Alex "Th3MFG" Scholtes](https://github.com/arscholtes).

## What's in it
- **Lore / Esports / Tier 2**: timelines grouped by era. Each event can have:
  - **Watch**: a pop-up YouTube player with the VOD (several VODs per event if there are more)
  - **Community**: a pop-up summary of how people reacted (mood, summary, linked posts and coverage)
  - links to sources and posts, plus viewership (peak / average / hours watched)
- **Teams**: every relevant team, with Liquipedia and X links
- **Timeless**: everyone who was ever at Timeless, Timeless Ethereal or Timeless Obsidian, each with their own spotlight: stints, placements while on the roster, and their public socials. `python3 tools/timeless_people.py` rebuilds it from Liquipedia (about three minutes; it keeps handles, never legal names or birth dates)
- **Numbers**: event viewership, monthly Steam players, weekly Steam snapshots, and all-platform estimates (clearly labelled)

All data is in `site/data/*.json`. The page (`site/index.html`, `site/assets/`) only reads it.

## One-time setup (about 10 minutes)
1. **Create the repo.** On GitHub, create an empty repo named `overwatch-chronicle` under `arscholtes`, then push this folder to it:
   ```bash
   cd overwatch-chronicle
   git init && git add . && git commit -m "Overwatch Chronicle"
   git branch -M main
   git remote add origin https://github.com/arscholtes/overwatch-chronicle.git
   git push -u origin main
   ```
2. **Turn on Pages.** Repo → Settings → Pages → Source: **GitHub Actions**. The deploy workflow then publishes on every push to `main`. Your site will be at `https://arscholtes.github.io/overwatch-chronicle/`.
3. **Add your Claude API key.** Repo → Settings → Secrets and variables → Actions → **New repository secret**:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com
   Never paste the key into code or chat.
4. **Let the bot open PRs.** Settings → Actions → General → Workflow permissions: choose **Read and write**, and tick **Allow GitHub Actions to create and approve pull requests**.
5. **(Optional) Pick the model.** Settings → Secrets and variables → Actions → **Variables** → `CLAUDE_MODEL` (default `claude-sonnet-5-5`).
6. **Run the bot once now.** Actions → *Weekly update bot* → **Run workflow**. Set `backfill` higher (e.g. 15) to research community reactions for more old events in one go.

## How the weekly bot works
Every Monday it:
1. Samples Overwatch's live Steam player count from the Steam Web API.
2. Asks Claude, with web search, what's new since the last run: lore beats, OWCS/World Cup/EWC results, FACEIT and tier 2, Timeless, big posts, VODs, viewership and team changes. It also fills in results for events marked "upcoming".
3. Researches community reactions (X, Reddit, press) for `BACKFILL_COUNT` older events that don't have them yet. Over a few weeks that covers the whole timeline.
4. Checks everything: YouTube IDs against YouTube's oEmbed, links over HTTP, and entries without a real source are dropped. Then it runs `bot/validate.py`.
5. Opens a pull request with a summary. **You review and merge it**, and the site redeploys.

Cost: one run usually takes about 20–60 searches, roughly **$0.20–$1** on your Anthropic account.

X blocks bots from reading posts, so the bot keeps only well-formed X status URLs it found in search results. Spot-check those in the PR.

## Your settings
`site/data/site.json`:
```json
{ "owner": {"name": "Alex \"Th3MFG\" Scholtes", "url": "https://github.com/arscholtes"},
  "buyMeACoffee": "https://buymeacoffee.com/YOUR-PAGE" }
```
The **Buy me a coffee** button appears in the footer once `buyMeACoffee` is set.

## Run locally
```bash
cd site && python3 -m http.server 8000   # then open http://localhost:8000
DRY_RUN=1 python3 bot/update.py          # Steam sample + validation only, no API calls
node --test tests/*.mjs                       # the page writes hostile data as text
python3 -m unittest discover -s tests    # what the bot may write, and what the validator rejects (needs bot/requirements.txt)
```

## Notes on the numbers
- **Steam** counts are measured. Most PC players launch through Battle.net and consoles aren't counted, so Steam is only part of the player base.
- **All-platform** figures are third-party estimates; Blizzard doesn't publish player counts. The estimate shown under the latest Steam snapshot scales it by the ratio implied by those third-party models, and it's labelled as an estimate.

Overwatch and its characters belong to Blizzard Entertainment. All artwork here is original. Videos are embedded from YouTube, and posts link to their original sources.
