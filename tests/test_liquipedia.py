"""What the Liquipedia importer reads from page source, and how it treats Liquipedia's API."""
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "bot"))
import liquipedia

FIXTURES = ROOT / "tests" / "fixtures" / "liquipedia"


def source(name):
    return (FIXTURES / f"{name}.wikitext").read_text()


def urls(record):
    return {link["label"]: link["url"] for link in record["links"]}


class TeamRecordTest(unittest.TestCase):
    def test_a_disbanded_team_keeps_its_dates_region_and_page_link(self):
        team = liquipedia.team_record("Rogue", source("team-rogue"))
        self.assertEqual(team["id"], "rogue")
        self.assertEqual(team["name"], "Rogue")
        self.assertEqual(team["liquipedia"], "https://liquipedia.net/overwatch/Rogue")
        self.assertEqual(team["region"], "na")
        self.assertEqual(team["location"], "United States")
        self.assertEqual(team["created"], "2016-05-03")
        self.assertEqual(team["disbanded"], "2017-10-08")

    def test_social_handles_become_full_links(self):
        self.assertEqual(urls(liquipedia.team_record("Rogue", source("team-rogue"))), {
            "Website": "http://www.rogue.gg/",
            "X": "https://x.com/Rogue",
            "YouTube": "https://www.youtube.com/RogueGG",
            "Instagram": "https://www.instagram.com/rogue.gg",
            "Facebook": "https://www.facebook.com/goingroguegg",
        })

    def test_templates_inside_a_field_do_not_cut_the_infobox_short(self):
        team = liquipedia.team_record("San Francisco Shock", source("team-shock"))
        self.assertEqual(team["liquipedia"], "https://liquipedia.net/overwatch/San_Francisco_Shock")
        self.assertEqual(team["created"], "2017-07-12")
        links = urls(team)
        self.assertEqual(links["Twitch"], "https://www.twitch.tv/SFShock")
        self.assertEqual(links["YouTube"], "https://www.youtube.com/@sanfranciscoshock")
        self.assertEqual(links["Discord"], "https://discord.gg/sfshock")
        self.assertEqual(links["TikTok"], "https://www.tiktok.com/@sfshock")

    def test_an_active_team_has_no_disbanded_date_and_empty_fields_are_left_out(self):
        text = source("team-timeless").replace("|disbanded=2025-05-02\n", "")
        team = liquipedia.team_record("Timeless", text)
        self.assertNotIn("disbanded", team)
        self.assertEqual(set(urls(team)), {"X", "Twitch", "Discord"})

    def test_a_handle_that_is_not_a_plain_handle_is_dropped(self):
        text = source("team-timeless").replace("twitter=Timeless_OW", 'twitter="><img src=x onerror=alert(1)>')
        text = text.replace("|region=na", "|region=na\n|website=javascript:alert(1)")
        self.assertEqual(set(urls(liquipedia.team_record("Timeless", text))), {"Twitch", "Discord"})

    def test_two_teams_whose_names_differ_only_by_a_hyphen_get_different_ids(self):
        spaced = liquipedia.team_record("Alter Ego", source("team-alter-ego-anz"))
        hyphenated = liquipedia.team_record("Alter-Ego", source("team-alter-ego-cn"))
        self.assertEqual((spaced["id"], hyphenated["id"]), ("alter_ego", "alter-ego"))

    def test_a_team_disbanded_on_an_unknown_day_keeps_the_year(self):
        team = liquipedia.team_record("Alter Ego", source("team-alter-ego-anz"))
        self.assertEqual((team["created"], team["disbanded"]), ("2016-08-21", "2018"))

    def test_a_page_without_a_team_infobox_gives_no_record(self):
        self.assertIsNone(liquipedia.team_record("Some page", source("disambiguation")))


class CompetitionRecordTest(unittest.TestCase):
    def test_a_contenders_season_keeps_its_series_tier_dates_and_prize(self):
        title = "Overwatch Contenders/2019/Season 1/North America West"
        event = liquipedia.competition_record(title, source("league-contenders-2019-naw"))
        self.assertEqual(event["id"], "overwatch_contenders_2019_season_1_north_america_west")
        self.assertEqual(event["name"], "Overwatch Contenders 2019 Season 1: North America West")
        self.assertEqual(event["liquipedia"], "https://liquipedia.net/overwatch/Overwatch_Contenders/2019/Season_1/North_America_West")
        self.assertEqual(event["series"], "Overwatch Contenders")
        self.assertEqual(event["tier"], 2)
        self.assertEqual((event["start"], event["end"]), ("2019-03-06", "2019-05-01"))
        self.assertEqual(event["type"], "Online")
        self.assertEqual(event["country"], "North America")
        self.assertEqual(event["prizeUsd"], 200000)
        self.assertEqual(event["teams"], 8)
        self.assertEqual(urls(event)["Twitch"], "https://www.twitch.tv/overwatchcontenders")

    def test_an_offline_final_keeps_where_it_was_held(self):
        event = liquipedia.competition_record("Overwatch Champions Series/2024/World Finals", source("league-owcs-2024-world-finals"))
        self.assertEqual(event["tier"], 1)
        self.assertEqual((event["type"], event["country"], event["city"]), ("Offline", "Sweden", "Stockholm"))
        self.assertEqual(event["prizeUsd"], 500000)

    def test_type_is_written_one_way_whatever_the_page_uses(self):
        event = liquipedia.competition_record("Overwatch World Cup/2019", source("league-world-cup-2019"))
        self.assertEqual(event["type"], "Offline")
        self.assertEqual(event["prizeUsd"], 90000)

    def test_a_field_the_page_does_not_set_is_left_out(self):
        event = liquipedia.competition_record("Overwatch League/2018", source("league-owl-2018"))
        self.assertEqual(event["name"], "Overwatch League - Inaugural Season")
        self.assertNotIn("prizeUsd", event)
        self.assertNotIn("tierType", event)

    def test_a_page_without_a_league_infobox_gives_no_record(self):
        self.assertIsNone(liquipedia.competition_record("Some page", source("disambiguation")))


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def raise_for_status(self):
        pass

    def json(self):
        return self.body


class FakeLiquipedia:
    """Answers the two requests the importer makes and records each one."""

    def __init__(self, pages, error=None):
        self.pages = pages
        self.error = error
        self.requests = []
        self.times = []
        self.now = 100.0

    def clock(self):
        return self.now

    def sleep(self, seconds):
        self.now += seconds

    def get(self, url, params, headers, timeout):
        self.requests.append((url, params, headers))
        self.times.append(self.now)
        if self.error:
            return FakeResponse({"error": self.error})
        if "generator" in params:
            listed = [{"pageid": p["pageid"], "title": p["title"], "lastrevid": p["revid"]} for p in self.pages]
            return FakeResponse({"query": {"pages": listed}})
        wanted = {int(i) for i in params["pageids"].split("|")}
        found = [{"pageid": p["pageid"], "title": p["title"],
                  "revisions": [{"revid": p["revid"], "slots": {"main": {"content": p["text"]}}}]}
                 for p in self.pages if p["pageid"] in wanted]
        return FakeResponse({"query": {"pages": found}})

    def content_requests(self):
        return [params for _, params, _ in self.requests if "pageids" in params]


class ClientTest(unittest.TestCase):
    def setUp(self):
        self.cache = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.cache)
        self.pages = [{"pageid": n, "title": f"Team {n}", "revid": 1000 + n, "text": f"text {n}"} for n in range(1, 121)]

    def client(self, site):
        return liquipedia.Client(site, self.cache, sleep=site.sleep, clock=site.clock)

    def test_page_source_is_fetched_fifty_pages_to_a_request(self):
        site = FakeLiquipedia(self.pages)
        texts = self.client(site).category_texts("Category:Teams")
        self.assertEqual(len(texts), 120)
        self.assertEqual(texts["Team 7"], "text 7")
        self.assertEqual([len(p["pageids"].split("|")) for p in site.content_requests()], [50, 50, 20])

    def test_requests_are_at_least_two_seconds_apart(self):
        site = FakeLiquipedia(self.pages)
        self.client(site).category_texts("Category:Teams")
        gaps = [later - earlier for earlier, later in zip(site.times, site.times[1:])]
        self.assertTrue(gaps)
        self.assertGreaterEqual(min(gaps), 2.0)

    def test_every_request_names_the_project_and_asks_the_api_only(self):
        site = FakeLiquipedia(self.pages)
        self.client(site).category_texts("Category:Teams")
        for url, _, headers in site.requests:
            self.assertEqual(url, "https://liquipedia.net/overwatch/api.php")
            self.assertIn("github.com/arscholtes/overwatch-chronicle", headers["User-Agent"])

    def test_a_second_run_fetches_only_pages_that_changed(self):
        self.client(FakeLiquipedia(self.pages)).category_texts("Category:Teams")
        self.pages[4].update(revid=9999, text="edited")
        site = FakeLiquipedia(self.pages)
        texts = self.client(site).category_texts("Category:Teams")
        self.assertEqual([p["pageids"] for p in site.content_requests()], ["5"])
        self.assertEqual(texts["Team 5"], "edited")
        self.assertEqual(texts["Team 6"], "text 6")

    def test_an_api_error_stops_the_run(self):
        site = FakeLiquipedia(self.pages, error={"code": "ratelimited", "info": "slow down"})
        with self.assertRaisesRegex(RuntimeError, "ratelimited"):
            self.client(site).category_texts("Category:Teams")


if __name__ == "__main__":
    unittest.main()
