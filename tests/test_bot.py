"""What the bot may write into the data files, and what the validator lets through."""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "bot"))
import update

MARKUP = '"><img src=x onerror=alert(1)>'


class BotTest(unittest.TestCase):
    def setUp(self):
        self.dir = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.dir)
        shutil.copytree(ROOT / "site" / "data", self.dir / "data")
        self.real = (update.DATA, update.url_ok, update.yt_ok)
        update.DATA = self.dir / "data"
        update.url_ok = lambda url: url.startswith("https://real.example/")
        update.yt_ok = lambda video_id: "A title" if video_id == "aaaaaaaaaaa" else None
        self.addCleanup(self.restore)
        self.sets = [update.load(n) for n in ("lore", "esports", "t2", "social", "teams", "metrics")]

    def restore(self):
        update.DATA, update.url_ok, update.yt_ok = self.real

    def merge(self, result):
        update.merge(result, *self.sets)
        return dict(zip(("lore", "esports", "t2", "social", "teams", "metrics"), self.sets))

    def upcoming(self):
        esports = self.sets[1]
        esports["items"].append({"id": "esp-next", "e": esports["eras"][0]["id"], "when": "Soon", "t": "Next Final", "d": "To come", "up": True})
        return esports["items"][-1]


class ResolvedEvents(BotTest):
    def test_viewership_with_an_unverified_link_is_not_kept(self):
        item = self.upcoming()
        self.merge({"resolve": [{"title": "Next Final", "win": "A", "views": {"peak": 1000, "url": "javascript:alert(1)"}}]})
        self.assertNotIn("views", item)

    def test_viewership_keeps_only_its_known_fields(self):
        item = self.upcoming()
        self.merge({"resolve": [{"title": "Next Final", "views": {"peak": 1000, "src": "A site", "url": "https://real.example/v", "onload": MARKUP}}]})
        self.assertEqual(item["views"], {"peak": 1000, "src": "A site", "url": "https://real.example/v"})

    def test_viewership_that_is_not_a_number_is_not_kept(self):
        item = self.upcoming()
        self.merge({"resolve": [{"title": "Next Final", "views": {"peak": MARKUP}}]})
        self.assertNotIn("views", item)

    def test_a_vod_keeps_only_its_id_and_label(self):
        item = self.upcoming()
        self.merge({"resolve": [{"title": "Next Final", "vods": [{"yt": "aaaaaaaaaaa", "label": "Final", "start": MARKUP}]}]})
        self.assertEqual(item["vods"], [{"yt": "aaaaaaaaaaa", "label": "Final"}])


class NewEvents(BotTest):
    def test_viewership_that_is_not_a_number_is_not_kept(self):
        era = self.sets[1]["eras"][0]["id"]
        data = self.merge({"esports": [{"era": era, "when": "Now", "t": "Brand New Final", "d": "It happened", "sources": ["https://real.example/s"], "views": {"peak": MARKUP}}]})
        item = data["esports"]["items"][-1]
        self.assertEqual(item["t"], "Brand New Final")
        self.assertNotIn("views", item)


class Badges(BotTest):
    POST = {"v": "esports", "who": "Someone", "h": "@someone", "m": "SO", "c": "#ff0000", "d": "Now", "x": "Said it", "k": "Hype", "url": "https://real.example/status/1"}
    TEAM = {"id": "new-team", "name": "New Team", "m": "NT", "c": "#00ff00", "region": "NA", "tier": "T2"}

    def test_a_post_with_a_real_badge_is_kept(self):
        self.assertEqual(self.merge({"social": [self.POST]})["social"][-1]["url"], self.POST["url"])

    def test_a_post_whose_colour_is_not_hex_is_dropped(self):
        before = len(self.sets[3])
        self.merge({"social": [{**self.POST, "c": '#fff" onmouseover="alert(1)'}]})
        self.assertEqual(len(self.sets[3]), before)

    def test_a_post_whose_monogram_is_not_letters_is_dropped(self):
        before = len(self.sets[3])
        self.merge({"social": [{**self.POST, "m": MARKUP}]})
        self.assertEqual(len(self.sets[3]), before)

    def test_a_team_with_a_real_badge_is_added(self):
        self.assertEqual(self.merge({"teams": [self.TEAM]})["teams"][-1]["id"], "new-team")

    def test_a_team_whose_badge_is_not_plain_is_dropped(self):
        before = len(self.sets[4])
        self.merge({"teams": [{**self.TEAM, "c": "red;background:url(https://evil.example)"}, {**self.TEAM, "id": "other", "m": MARKUP}]})
        self.assertEqual(len(self.sets[4]), before)


class ViewershipChart(BotTest):
    def test_a_peak_that_is_not_a_number_is_dropped(self):
        before = len(self.sets[5]["viewership"])
        self.merge({"viewership": [{"event": "Fake", "date": "2026-11-01", "peak": MARKUP, "src": "x"}]})
        self.assertEqual(len(self.sets[5]["viewership"]), before)


class Validator(unittest.TestCase):
    def run_on(self, change=None):
        directory = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, directory)
        shutil.copytree(ROOT / "site" / "data", directory / "data")
        if change:
            name, edit = change
            path = directory / "data" / f"{name}.json"
            data = json.loads(path.read_text())
            edit(data)
            path.write_text(json.dumps(data))
        return subprocess.run([sys.executable, str(ROOT / "bot" / "validate.py"), str(directory / "data")], capture_output=True, text=True)

    def test_the_shipped_data_passes(self):
        result = self.run_on()
        self.assertEqual(result.returncode, 0, result.stdout)

    def test_a_colour_that_is_not_hex_fails(self):
        result = self.run_on(("teams", lambda d: d[0].update(c="red;x")))
        self.assertEqual(result.returncode, 1)
        self.assertIn("colour", result.stdout)

    def test_a_monogram_that_is_not_letters_fails(self):
        result = self.run_on(("social", lambda d: d[0].update(m=MARKUP)))
        self.assertEqual(result.returncode, 1)
        self.assertIn("monogram", result.stdout)

    def test_a_link_that_is_not_http_fails(self):
        result = self.run_on(("alumni", lambda d: d["people"][0].update(url="javascript:alert(1)")))
        self.assertEqual(result.returncode, 1)
        self.assertIn("link", result.stdout)

    def test_a_social_handle_that_is_not_plain_fails(self):
        result = self.run_on(("alumni", lambda d: d["people"][0].update(x=MARKUP)))
        self.assertEqual(result.returncode, 1)
        self.assertIn("handle", result.stdout)

    def test_viewership_that_is_not_a_number_fails(self):
        result = self.run_on(("metrics", lambda d: d["viewership"][0].update(peak=MARKUP)))
        self.assertEqual(result.returncode, 1)
        self.assertIn("number", result.stdout)


if __name__ == "__main__":
    unittest.main()
