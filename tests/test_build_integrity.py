"""Validate the static distribution from any working directory."""
import json
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        self.urls.extend(value for key, value in attrs if key in {"src", "href"} and value)


class BuildIntegrity(unittest.TestCase):
    def read_json(self, path):
        return json.loads((ROOT / path).read_text(encoding="utf-8"))

    def check_file(self, path):
        self.assertTrue(path.resolve().is_relative_to(ROOT), f"Outside project: {path}")
        self.assertTrue(path.is_file(), f"Missing file: {path}")

    def test_json(self):
        paths = [*ROOT.glob("src/*.json"), *ROOT.glob("modules/*/*.json"),
                 "docs/strategy-v2/08_REQUIREMENTS_REGISTER.json", "manifest.webmanifest"]
        for path in paths:
            with self.subTest(path=path):
                self.read_json(path)

    def test_subjects_and_kits(self):
        subjects = self.read_json("src/subjects.json")
        ids = [subject["id"] for subject in subjects] + ["pe"]
        self.assertGreater(len(subjects), 0)
        self.assertEqual(len(ids), len(set(ids)), "Duplicate discipline id")
        self.check_file(ROOT / "docs/08-physical-education.md")
        for subject in subjects:
            with self.subTest(subject=subject["id"]):
                folder = subject["folder"]
                readme = Path("modules", folder, "README.md")
                self.check_file(ROOT / readme)
                with ZipFile(ROOT / "exports" / f"{folder}.zip") as kit:
                    self.assertEqual(kit.read(readme.as_posix()), (ROOT / readme).read_bytes())

    def test_static_distribution(self):
        shell = self.read_json("assets/public-files.json")
        self.assertTrue({"index.html", "assets/catalog.js", "manifest.webmanifest",
                         "kanygin.html"}.issubset(shell))
        self.check_file(ROOT / "sw.js")
        for item in shell:
            self.check_file(ROOT / item)
        manifest = self.read_json("manifest.webmanifest")
        urls = [manifest["start_url"], *(icon["src"] for icon in manifest["icons"])]
        for name in ("index.html", "kanygin.html"):
            parser = Links()
            parser.feed((ROOT / name).read_text(encoding="utf-8"))
            urls.extend(parser.urls)
        for url in urls:
            parts = urlsplit(url)
            if parts.path and not (parts.scheme or parts.netloc):
                with self.subTest(url=url):
                    path = ROOT / unquote(parts.path)
                    self.check_file(path)
                    self.assertIn(path.relative_to(ROOT).as_posix(), shell)


if __name__ == "__main__":
    unittest.main(verbosity=2)
