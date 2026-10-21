#!/usr/bin/env python3
"""Read-only source checks for Vento's company pages; standard library only.

Usage: python3 scripts/check_site.py . [PAGE.html ...]
Checks static HTML/CSS references; does not execute JS or fetch external URLs.
"""
from __future__ import annotations

import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


DEFAULT_PAGES = ["index.html"] + [f"{name}/index.html" for name in (
    "business", "private-ai", "safety", "autonomy", "cyber", "lab", "vision"
)] + ["404.html"]
SITE_HOSTS = {"ventosystems.com", "www.ventosystems.com"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
             "link", "meta", "param", "source", "track", "wbr"}


class Page(HTMLParser):
    def __init__(self, path: Path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.tags = Counter()
        self.ids = {}
        self.duplicate_ids = []
        self.refs = []
        self.idrefs = []
        self.labels = set()
        self.controls = []
        self.stack = []
        self.title = []
        self.meta = {}
        self.lang = ""
        self.images_without_alt = []
        self.feed(path.read_text(encoding="utf-8"))
        self.close()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        line = self.getpos()[0]
        self.tags[tag] += 1
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.append((element_id, line))
            self.ids[element_id] = tag
        if tag == "html":
            self.lang = attrs.get("lang", "")
        if tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key:
                self.meta.setdefault(key, []).append(attrs.get("content", ""))
        if tag == "label" and attrs.get("for"):
            self.labels.add(attrs["for"])
            self.idrefs.append(("label for", attrs["for"], line))
        if tag in {"input", "select", "textarea"}:
            input_type = attrs.get("type", "text").lower()
            if input_type not in {"hidden", "submit", "button", "reset", "image"}:
                named = ("label" in self.stack or bool(attrs.get("aria-label"))
                         or bool(attrs.get("aria-labelledby")))
                self.controls.append((element_id, named, line, tag))
        for attr in ("aria-controls", "aria-labelledby", "aria-describedby", "headers"):
            for target in (attrs.get(attr) or "").split():
                self.idrefs.append((attr, target, line))
        if tag == "img" and "alt" not in attrs:
            self.images_without_alt.append(line)
        for attr in ("href", "src", "poster", "action"):
            if attr in attrs:
                self.refs.append((attrs[attr] or "", line, f"{tag}[{attr}]"))
        srcset = attrs.get("srcset", "")
        if srcset and "data:" not in srcset:
            for candidate in srcset.split(","):
                if candidate.strip():
                    self.refs.append((candidate.strip().split()[0], line, f"{tag}[srcset]"))
        if tag not in VOID_TAGS:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            reverse_index = self.stack[::-1].index(tag)
            del self.stack[len(self.stack) - reverse_index - 1:]

    def handle_data(self, data):
        if "title" in self.stack:
            self.title.append(data)


def run(root: Path, names: list[str]) -> int:
    root = root.resolve()
    errors = []
    cache = {}
    external = set()
    css_seen = set()
    checked_refs = 0

    def issue(path, line, message):
        errors.append(f"{path.relative_to(root)}:{line}: {message}")

    def parse(path):
        if path not in cache:
            cache[path] = Page(path)
        return cache[path]

    def check_ref(source, ref, line, kind):
        nonlocal checked_refs
        checked_refs += 1
        if not ref:
            issue(source, line, f"Empty {kind}")
            return
        url = urlsplit(ref)
        if url.scheme in {"mailto", "tel", "data", "blob"}:
            return
        if url.scheme == "javascript":
            issue(source, line, f"JavaScript URL in {kind}")
            return
        if url.netloc and url.hostname not in SITE_HOSTS:
            external.add(ref)
            return
        if url.scheme and url.scheme not in {"http", "https"}:
            external.add(ref)
            return
        path_string = unquote(url.path)
        if not path_string:
            target = source
        elif path_string.startswith("/"):
            target = (root / path_string.lstrip("/")).resolve()
        else:
            target = (source.parent / path_string).resolve()
        if not target.is_relative_to(root):
            issue(source, line, f"Reference escapes site root: {ref}")
            return
        if target.is_dir():
            target = target / "index.html"
        elif not target.exists() and not target.suffix:
            target = target / "index.html"
        if not target.is_file():
            issue(source, line, f"Missing target for {kind}: {ref}")
            return
        fragment = unquote(url.fragment)
        if fragment and target.suffix.lower() in {".html", ".htm"}:
            if fragment not in parse(target).ids:
                issue(source, line, f"Missing fragment for {kind}: {ref}")
        if target.suffix.lower() == ".css":
            check_css(target)

    def check_css(path):
        if path in css_seen:
            return
        css_seen.add(path)
        text = path.read_text(encoding="utf-8")
        for match in re.finditer(r"url\(\s*(['\"]?)(.*?)\1\s*\)", text):
            check_ref(path, match.group(2), text.count("\n", 0, match.start()) + 1, "CSS url")

    title_pages = {}
    page_count = 0
    for name in names:
        path = (root / name).resolve()
        if not path.is_file():
            issue(path, 1, "Required page is missing")
            continue
        page = parse(path)
        page_count += 1
        for tag in ("html", "head", "body", "title", "h1", "main"):
            if page.tags[tag] != 1:
                issue(path, 1, f"Expected one <{tag}>, found {page.tags[tag]}")
        if not page.lang.strip():
            issue(path, 1, "Missing document language")
        title = " ".join("".join(page.title).split())
        if not title:
            issue(path, 1, "Empty page title")
        elif title in title_pages:
            issue(path, 1, f"Title duplicates {title_pages[title]}")
        title_pages[title] = name
        descriptions = page.meta.get("description", [])
        if len(descriptions) != 1 or not descriptions[0].strip():
            issue(path, 1, "Expected one nonempty meta description")
        if not page.meta.get("viewport"):
            issue(path, 1, "Missing responsive viewport meta")
        for element_id, line in page.duplicate_ids:
            issue(path, line, f"Duplicate id: {element_id}")
        for attr, target, line in page.idrefs:
            if target not in page.ids:
                issue(path, line, f"{attr} references missing id: {target}")
        for element_id, named, line, tag in page.controls:
            if not named and element_id not in page.labels:
                issue(path, line, f"Unlabelled {tag}: {element_id or '(no id)'}")
        for line in page.images_without_alt:
            issue(path, line, "Image missing alt attribute")
        for ref, line, kind in page.refs:
            check_ref(path, ref, line, kind)

    if errors:
        print("FAIL: " + str(len(errors)) + " source validation issue(s)")
        print("\n".join(errors))
    else:
        print(f"PASS: {page_count} site pages, {checked_refs} references, {len(css_seen)} CSS files")
    print(f"External URLs observed but not fetched: {len(external)}")
    print("Checks cover static structure, labels, local targets, fragments and CSS assets; browser behavior and claims require separate review.")
    return 1 if errors else 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Usage: validate_vento.py PATH_TO_SITE [PAGE.html ...]")
    sys.exit(run(Path(sys.argv[1]), sys.argv[2:] or DEFAULT_PAGES))
