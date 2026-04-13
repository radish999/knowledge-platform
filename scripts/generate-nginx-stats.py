#!/usr/bin/env python3

import gzip
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit

LOG_DIR = os.environ.get("NGINX_LOG_DIR", "/var/log/nginx")
OUTPUT_PATH = os.environ.get(
    "NGINX_STATS_OUTPUT",
    "/usr/share/nginx/knowledge-platform/analytics/nginx-stats.json",
)
SITE_TIMEZONE = timezone(timedelta(hours=8))

LOG_PATTERN = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<timestamp>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<target>\S+) (?P<protocol>[^"]*)" '
    r'(?P<status>\d{3}) (?P<size>\S+) "(?P<referer>[^"]*)" "(?P<ua>[^"]*)"'
)

STATIC_SUFFIXES = (
    ".css",
    ".js",
    ".mjs",
    ".map",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
    ".woff",
    ".woff2",
    ".ttf",
    ".txt",
    ".xml",
    ".json",
)


def iter_log_files():
    if not os.path.isdir(LOG_DIR):
        return []

    files = []
    for name in sorted(os.listdir(LOG_DIR)):
        if not name.startswith("access.log"):
            continue
        path = os.path.join(LOG_DIR, name)
        if os.path.isfile(path):
            files.append(path)
    return files


def open_log(path):
    if path.endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="ignore")
    return open(path, "r", encoding="utf-8", errors="ignore")


def normalize_path(target):
    split = urlsplit(target)
    path = split.path or "/"
    if not path.startswith("/"):
        path = "/" + path

    last_segment = path.rsplit("/", 1)[-1]
    if "." in last_segment and path != "/":
        return ""

    if path.startswith("/assets/"):
        return ""
    if path in ("/vite.svg", "/favicon.ico", "/robots.txt", "/analytics/nginx-stats.json"):
        return ""
    if path.endswith(STATIC_SUFFIXES):
        return ""

    return path


def collect():
    daily_ips = defaultdict(set)
    daily_views = Counter()
    top_pages = Counter()

    for log_path in iter_log_files():
        with open_log(log_path) as handle:
            for line in handle:
                match = LOG_PATTERN.match(line)
                if not match:
                    continue

                status = int(match.group("status"))
                if status >= 400:
                    continue

                method = match.group("method")
                if method not in {"GET", "HEAD"}:
                    continue

                page_path = normalize_path(match.group("target"))
                if not page_path:
                    continue

                timestamp = datetime.strptime(
                    match.group("timestamp"), "%d/%b/%Y:%H:%M:%S %z"
                ).astimezone(SITE_TIMEZONE)
                date_key = timestamp.strftime("%Y-%m-%d")
                ip = match.group("ip")

                daily_ips[date_key].add(ip)
                daily_views[date_key] += 1
                top_pages[page_path] += 1

    today = datetime.now(SITE_TIMEZONE).date()
    last_7_days = []
    total_page_views = 0
    total_unique_visitors = 0

    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        key = day.isoformat()
        page_views = daily_views.get(key, 0)
        unique_visitors = len(daily_ips.get(key, set()))
        total_page_views += page_views
        total_unique_visitors += unique_visitors
        last_7_days.append(
            {
                "date": key,
                "pageViews": page_views,
                "uniqueVisitors": unique_visitors,
            }
        )

    today_key = today.isoformat()
    yesterday_key = (today - timedelta(days=1)).isoformat()

    payload = {
        "generatedAt": datetime.now(SITE_TIMEZONE).isoformat(),
        "totalPageViews": total_page_views,
        "totalUniqueVisitors": total_unique_visitors,
        "today": {
            "date": today_key,
            "pageViews": daily_views.get(today_key, 0),
            "uniqueVisitors": len(daily_ips.get(today_key, set())),
        },
        "yesterday": {
            "date": yesterday_key,
            "pageViews": daily_views.get(yesterday_key, 0),
            "uniqueVisitors": len(daily_ips.get(yesterday_key, set())),
        },
        "last7Days": last_7_days,
        "topPages": [
            {"path": path, "views": views}
            for path, views in top_pages.most_common(5)
        ],
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    collect()
