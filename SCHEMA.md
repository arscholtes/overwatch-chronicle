# Schema

Two stores. The site's facts live in JSON files in this repo; what members add lives in a Supabase
Postgres database. Neither copies the other.

## `site/data/*.json` (owner: this repo)

Read by the page (`site/assets/app.js`) and written by hand, by `bot/update.py` and by
`tools/timeless_people.py`. `bot/validate.py` checks them in every workflow.

| File | Holds |
| --- | --- |
| `lore.json`, `esports.json`, `t2.json` | Eras and timeline items, with VODs, viewership and community summaries |
| `teams.json` | Every team: badge, region, tier, titles, X handle |
| `alumni.json` | Every person who was at Timeless: `id`, role, stints, placements, public handles. The roster's owner |
| `social.json` | Notable posts |
| `metrics.json` | Viewership and player counts |
| `triumvirate.json` | The three founders' chapters |
| `site.json` | Owner link, donation link, and `backend`: the Supabase project's address and public key |
| `meta.json` | When the data last changed |

## Members database (owner: `supabase/migrations/`)

Applied with `supabase db push`. Only the page reads it, through Supabase's API, and every table has
row-level security. No other app reads these tables.

| Table | Columns | Used for | Who can read | Who can write |
| --- | --- | --- | --- | --- |
| `member` | `user_id` → `auth.users`, `roster_id` (an `id` in `alumni.json`), `owner`, `created_at` | Ties an invited account to one roster entry | Members | The project owner, through `add_member()` in the SQL editor |
| `profile` | `roster_id`, `bio` (≤ 1200), `hidden`, `updated_at` | What a member adds to their own spotlight, or their choice to hide it | The member whose `roster_id` it is | That member |
| `profile_public` (view) | `roster_id`, `hidden`, `bio` (empty when hidden), `updated_at` | What the page shows of every profile | Everyone | Nobody |
| `thread` | `id`, `created_at` | A conversation | Its members | `start_thread()` only |
| `thread_member` | `thread_id`, `user_id` | Who is in a conversation | Its members | `start_thread()` only |
| `message` | `id`, `thread_id`, `sender`, `body` (1–4000), `sent_at` | What members write to each other | The conversation's members | A member of the conversation, as themselves, unless either side has blocked the other |
| `block` | `blocker`, `blocked` | A member refusing messages from another | The blocker | The blocker |
| `report` | `id`, `message_id`, `reporter`, `reason`, `created_at` | A message flagged for the owners | Members with `owner` | A member who can read that message |

Facts the database does not hold: names, roles, handles and stints stay in `alumni.json`. `profile.hidden`
keeps a person off the page; taking them out of `alumni.json` is still a change to this repo.

Email addresses live only in Supabase's own `auth.users`. No table here copies them.
