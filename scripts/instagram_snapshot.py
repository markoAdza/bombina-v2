#!/usr/bin/env python3
"""
Instagram snapshot for the home-page feed.

    npm run instagram          (= python scripts/instagram_snapshot.py)
    python scripts/instagram_snapshot.py --headed     # watch the browser
    python scripts/instagram_snapshot.py --count 12   # more posts

Opens the public @bombinabistro profile in Playwright's Chromium (the same headless
browser setup as the web-design screenshot script), and reads what any visitor sees:

  - profile header: name, verified badge, avatar, posts / followers / following
  - the newest posts: link, type (image / carousel / reel), caption, date

Like and comment counts: Instagram hides them from logged-out visitors, so they
usually come back as null. If you want them on the site, type them into
src/data/instagram.json ("likes": 123, "comments": 4). The hover overlay shows them
whenever they are present. A re-run keeps numbers you typed for posts still in the feed.

It writes:
  src/data/instagram.json             profile + posts (read by src/data/instagram.ts)
  src/assets/instagram-feed/*.jpg     avatar + post images (Astro optimises them)
  .asset-cache/instagram/profile.png  screenshot of the profile, to check the numbers

The numbers are a snapshot. Re-run this script and rebuild the site to refresh them.
If Instagram shows a login wall instead of the profile, the script stops without
touching the existing data. Update src/data/instagram.json by hand in that case.

Needs:  pip install playwright && python -m playwright install chromium
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PwTimeout
except ImportError:
    sys.exit("playwright is not installed: pip install playwright && python -m playwright install chromium")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data" / "instagram.json"
IMG_DIR = ROOT / "src" / "assets" / "instagram-feed"
CACHE = ROOT / ".asset-cache" / "instagram"

POST_HREF = re.compile(r"/(p|reel|tv)/([A-Za-z0-9_-]+)/?")


def parse_count(raw: str) -> int:
    """'1,234' → 1234 · '18K' → 18000 · '1.2M' → 1200000."""
    s = raw.strip().replace(",", "").replace(" ", "")
    mult = 1
    if s[-1:] in "KkMm":
        mult = 1_000 if s[-1] in "Kk" else 1_000_000
        s = s[:-1]
    return round(float(s) * mult)


def meta(page, prop: str) -> str:
    el = page.query_selector(f'meta[property="{prop}"], meta[name="{prop}"]')
    return html.unescape(el.get_attribute("content") or "") if el else ""


def dismiss_dialogs(page) -> None:
    """Cookie banner + the 'log in to see more' modal: close them if they appear."""
    for label in ("Decline optional cookies", "Allow all cookies", "Only allow essential cookies"):
        btn = page.get_by_role("button", name=label)
        if btn.count():
            try:
                btn.first.click(timeout=2000)
                page.wait_for_timeout(600)
                break
            except PwTimeout:
                pass
    close = page.locator('svg[aria-label="Close"]')  # "Sign up to see more" modal
    if close.count():
        try:
            close.first.click(timeout=2000)
            page.wait_for_timeout(500)
        except PwTimeout:
            pass


def best_src(img) -> str:
    """Largest candidate from srcset, falling back to src."""
    srcset = img.get_attribute("srcset") or ""
    best, best_w = img.get_attribute("src") or "", 0
    for part in srcset.split(","):
        bits = part.strip().split(" ")
        if len(bits) == 2 and bits[1].endswith("w"):
            w = int(bits[1][:-1])
            if w > best_w:
                best, best_w = bits[0], w
    return best


def download(context, url: str, dest_stem: Path) -> str:
    res = context.request.get(url)
    if not res.ok:
        raise RuntimeError(f"{res.status} for {url[:80]}…")
    ctype = res.headers.get("content-type", "image/jpeg")
    ext = {"image/webp": ".webp", "image/png": ".png"}.get(ctype.split(";")[0], ".jpg")
    for old in dest_stem.parent.glob(dest_stem.name + ".*"):
        old.unlink()
    path = dest_stem.with_suffix(ext)
    path.write_bytes(res.body())
    return path.name


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--username", default="bombinabistro")
    ap.add_argument("--count", type=int, default=8)
    ap.add_argument("--headed", action="store_true", help="show the browser window")
    args = ap.parse_args()

    profile_url = f"https://www.instagram.com/{args.username}/"
    CACHE.mkdir(parents=True, exist_ok=True)
    previous = {}  # hand-entered likes/comments survive a refresh
    if DATA.exists():
        previous = {p["shortcode"]: p for p in json.loads(DATA.read_text(encoding="utf-8")).get("posts", [])}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=not args.headed)
        context = browser.new_context(viewport={"width": 1280, "height": 1000}, locale="en-US")
        page = context.new_page()

        print(f"[1/4] Opening {profile_url}")
        page.goto(profile_url, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(3500)
        dismiss_dialogs(page)
        page.screenshot(path=str(CACHE / "profile.png"))

        # --- profile header -------------------------------------------------
        desc = meta(page, "og:description")  # "1,234 Followers, 56 Following, 78 Posts - See Instagram photos and videos from Name (@user)"
        m = re.search(r"([\d.,]+[KkMm]?) Followers, ([\d.,]+[KkMm]?) Following, ([\d.,]+[KkMm]?) Posts", desc)
        if not m:
            browser.close()
            sys.exit(
                "Could not read the profile numbers (Instagram probably showed a login wall).\n"
                f"Check {CACHE / 'profile.png'}. Existing data was left untouched."
            )
        followers, following, posts = (parse_count(x) for x in m.groups())
        # the visible header is fresher than the cached meta tag: prefer it when present
        try:
            head = page.inner_text("header", timeout=3000)
        except PwTimeout:
            head = ""
        for key in ("followers", "following", "posts"):
            hm = re.search(rf"([\d.,]+[KkMm]?)\s+{key}\b", head, re.I)
            if hm:
                value = parse_count(hm.group(1))
                followers, following, posts = (
                    value if key == "followers" else followers,
                    value if key == "following" else following,
                    value if key == "posts" else posts,
                )
        title = meta(page, "og:title")  # "Bistro Bombina (@bombinabistro) • Instagram photos and videos"
        full_name = re.sub(r"\s*\(@[^)]+\).*$", "", title).strip() or args.username
        verified = page.locator('header svg[aria-label="Verified"]').count() > 0
        avatar_url = meta(page, "og:image")
        print(f"      {full_name}: {posts} posts · {followers} followers · {following} following · verified={verified}")

        # --- grid -------------------------------------------------------------
        print("[2/4] Reading the post grid")
        page.mouse.wheel(0, 900)
        page.wait_for_timeout(2000)
        dismiss_dialogs(page)
        tiles, seen = [], set()
        for a in page.query_selector_all("main a[href]"):
            href = a.get_attribute("href") or ""
            hm = POST_HREF.search(href)
            if not hm or hm.group(2) in seen:
                continue
            img = a.query_selector("img")
            if not img:
                continue
            seen.add(hm.group(2))
            labels = " ".join((s.get_attribute("aria-label") or "") for s in a.query_selector_all("svg")).lower()
            kind = "reel" if hm.group(1) in ("reel", "tv") or "clip" in labels or "reel" in labels or "video" in labels else (
                "carousel" if "carousel" in labels else "image"
            )
            tiles.append({"shortcode": hm.group(2), "kind": kind, "img": best_src(img), "alt": img.get_attribute("alt") or ""})
            if len(tiles) >= args.count:
                break
        if not tiles:
            browser.close()
            sys.exit(f"No posts found on the profile page. Check {CACHE / 'profile.png'}. Existing data was left untouched.")
        print(f"      {len(tiles)} posts")

        # --- each post: likes, comments, caption ---------------------------------
        print("[3/4] Reading likes, comments and captions")
        feed = []
        for t in tiles:
            url = f"https://www.instagram.com/p/{t['shortcode']}/"
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(1500)
            d = meta(page, "og:description")  # '123 likes, 4 comments - user on November 5, 2026: "caption"'
            likes = comments = None
            lm = re.search(r"([\d.,]+[KkMm]?) likes?", d)
            cm = re.search(r"([\d.,]+[KkMm]?) comments?", d)
            if lm:
                likes = parse_count(lm.group(1))
            if cm:
                comments = parse_count(cm.group(1))
            # og:title is always 'Name on Instagram: "caption"'; og:description varies by post
            cap = re.search(r'on Instagram:\s*"(.*?)"?\s*$', meta(page, "og:title"), re.S)
            caption = cap.group(1).strip() if cap else ""
            prev = previous.get(t["shortcode"], {})
            if likes is None:
                likes = prev.get("likes")
            if comments is None:
                comments = prev.get("comments")
            date_m = re.search(r" on ([A-Z][a-z]+ \d{1,2}, \d{4})", d)
            taken = datetime.strptime(date_m.group(1), "%B %d, %Y").date().isoformat() if date_m else None
            img_url = t["img"] or meta(page, "og:image")
            feed.append({
                "shortcode": t["shortcode"],
                "url": f"https://www.instagram.com/{'reel' if t['kind'] == 'reel' else 'p'}/{t['shortcode']}/",
                "type": t["kind"],
                "likes": likes,
                "comments": comments,
                "caption": caption,
                "date": taken,
                "_img": img_url,
            })
            print(f"      {t['shortcode']:<12} {t['kind']:<8} likes={likes} comments={comments}")

        # --- download + write ---------------------------------------------------
        print("[4/4] Downloading images")
        IMG_DIR.mkdir(parents=True, exist_ok=True)
        keep = set()
        avatar_file = download(context, avatar_url, IMG_DIR / "avatar") if avatar_url else None
        if avatar_file:
            keep.add(avatar_file)
        for post in feed:
            post["image"] = download(context, post.pop("_img"), IMG_DIR / post["shortcode"])
            keep.add(post["image"])
        for old in IMG_DIR.iterdir():  # drop images of posts no longer in the feed
            if old.name not in keep:
                old.unlink()
        browser.close()

    data = {
        "capturedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "profile": {
            "username": args.username,
            "fullName": full_name,
            "verified": verified,
            "avatar": avatar_file,
            "posts": posts,
            "followers": followers,
            "following": following,
            "url": profile_url,
        },
        "posts": feed,
    }
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK {DATA.relative_to(ROOT)} · {len(feed)} posts · images in {IMG_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
