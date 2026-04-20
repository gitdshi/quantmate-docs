#!/usr/bin/env python3

from __future__ import annotations

import csv
import functools
import re
import ssl
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, urljoin, urlparse
from urllib.request import Request, urlopen

try:
    from bs4 import BeautifulSoup
except ImportError as exc:
    raise SystemExit("beautifulsoup4 is required to sync the Tushare catalog") from exc


ROOT_URL = "https://tushare.pro/document/2"
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; QuantMate Tushare catalog sync/1.0)"
}
FETCH_TIMEOUT_SECONDS = 12
FETCH_RETRIES = 4
LEAF_FETCH_WORKERS = 4
SCRIPT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = SCRIPT_ROOT / "reference" / "tushare_api_full.csv"
FIELDNAMES = ["数据大类", "数据子类", "数据项", "接口名称", "描述", "限量", "权限"]
PREFERRED_CATEGORY_ORDER = [
    "股票数据",
    "指数数据",
    "ETF专题",
    "公募基金",
    "期货数据",
    "现货数据",
    "期权数据",
    "债券专题",
    "外汇数据",
    "港股数据",
    "美股数据",
    "行业经济",
    "宏观经济",
    "大模型语料",
    "资讯数据",
    "财富管理",
    "数据索引",
    "社区捐助",
]
CATEGORY_ALIASES = {
    "指数专题": "指数数据",
}
INFO_LINE_PREFIXES = {
    "description": "描述：",
    "limit": "限量：",
    "permission": "权限：",
    "points": "积分：",
}
LIMIT_FRAGMENT_RE = re.compile(r"((?:每次|单次)[^，。；]*|(?:最多|最大)[^，。；]*|覆盖全市场[^，。；]*)")
STOP_LINE_PREFIXES = ("输入参数", "输出参数", "接口示例", "请求参数", "积分获取办法", "权限列表")


@dataclass(frozen=True)
class SidebarLink:
    doc_id: int
    url: str
    path: tuple[str, ...]


@dataclass(frozen=True)
class ExistingRow:
    category: str
    sub_category: str
    item: str
    api_name: str
    description: str
    limit: str
    permission: str


@dataclass(frozen=True)
class GeneratedRow:
    category: str
    sub_category: str
    item: str
    api_name: str
    description: str
    limit: str
    permission: str
    crawl_index: int


@dataclass(frozen=True)
class FetchAttempt:
    link: SidebarLink
    metadata: tuple[str, str, str, str] | None
    error: str | None = None


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", str(value or "")).replace("\ufeff", "").strip()


def parse_doc_id(href: str | None) -> int | None:
    if not href:
        return None
    query = parse_qs(urlparse(href).query)
    raw_doc_id = query.get("doc_id", [None])[0]
    if raw_doc_id is None:
        return None
    try:
        return int(raw_doc_id)
    except ValueError:
        return None


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


@functools.lru_cache(maxsize=None)
def fetch_html(url: str) -> str:
    request = Request(url, headers=REQUEST_HEADERS)
    insecure_context = ssl.create_default_context()
    insecure_context.check_hostname = False
    insecure_context.verify_mode = ssl.CERT_NONE

    last_error: Exception | None = None
    for attempt in range(1, FETCH_RETRIES + 1):
        try:
            with urlopen(request, timeout=FETCH_TIMEOUT_SECONDS, context=insecure_context) as response:
                return response.read().decode("utf-8", "ignore")
        except Exception as exc:
            last_error = exc
            if attempt >= FETCH_RETRIES:
                break
            time.sleep(min(4, attempt))

    if last_error is None:
        raise RuntimeError(f"failed to fetch {url}")
    raise RuntimeError(f"failed to fetch {url}: {last_error}") from last_error


def parse_html(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")


def load_existing_rows(path: Path) -> list[ExistingRow]:
    if not path.exists():
        return []

    rows: list[ExistingRow] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for raw_row in reader:
            category = normalize_text(raw_row.get("数据大类"))
            sub_category = normalize_text(raw_row.get("数据子类"))
            item = normalize_text(raw_row.get("数据项"))
            api_name = normalize_text(raw_row.get("接口名称") or raw_row.get("接口"))
            if not category or not item or not api_name:
                continue
            rows.append(
                ExistingRow(
                    category=category,
                    sub_category=sub_category,
                    item=item,
                    api_name=api_name,
                    description=normalize_text(raw_row.get("描述")),
                    limit=normalize_text(raw_row.get("限量")),
                    permission=normalize_text(raw_row.get("权限")),
                )
            )
    return rows


def build_existing_api_index(rows: Iterable[ExistingRow]) -> dict[str, list[ExistingRow]]:
    indexed: dict[str, list[ExistingRow]] = {}
    for row in rows:
        indexed.setdefault(row.api_name, []).append(row)
    return indexed


def top_level_categories(root_soup: BeautifulSoup) -> list[SidebarLink]:
    items: list[SidebarLink] = []
    tree_root = root_soup.select_one("#jstree > ul")
    if tree_root is None:
        return items

    for li in tree_root.find_all("li", recursive=False):
        anchor = li.find("a", recursive=False)
        doc_id = parse_doc_id(anchor.get("href") if anchor else None)
        label = normalize_text(anchor.get_text(" ", strip=True) if anchor else "")
        if not doc_id or not label:
            continue
        items.append(
            SidebarLink(
                doc_id=doc_id,
                url=urljoin(ROOT_URL, anchor["href"]),
                path=(label,),
            )
        )
    return items


def sidebar_links(page_soup: BeautifulSoup) -> list[SidebarLink]:
    links: list[SidebarLink] = []
    seen_doc_ids: set[int] = set()
    tree = page_soup.select_one("nav.sidebar #jstree")
    if tree is None:
        return links

    for anchor in tree.select('li > a[href*="/document/2?doc_id="]'):
        doc_id = parse_doc_id(anchor.get("href"))
        if not doc_id or doc_id in seen_doc_ids:
            continue

        current_li = anchor.find_parent("li")
        if current_li is None:
            continue
        if current_li.find("ul", recursive=False) is not None:
            continue

        path = [normalize_text(anchor.get_text(" ", strip=True))]
        while current_li is not None:
            parent_li = current_li.find_parent("li")
            if parent_li is None:
                break
            parent_anchor = parent_li.find("a", recursive=False)
            if parent_anchor is not None:
                parent_label = normalize_text(parent_anchor.get_text(" ", strip=True))
                if parent_label:
                    path.append(parent_label)
            current_li = parent_li

        normalized_path = tuple(reversed([part for part in path if part]))
        if not normalized_path:
            continue

        seen_doc_ids.add(doc_id)
        links.append(
            SidebarLink(
                doc_id=doc_id,
                url=urljoin(ROOT_URL, anchor["href"]),
                path=normalized_path,
            )
        )
    return links


def resolve_existing_row(
    api_name: str,
    normalized_category: str,
    raw_path: tuple[str, ...],
    existing_by_api: dict[str, list[ExistingRow]],
) -> ExistingRow | None:
    candidates = existing_by_api.get(api_name, [])
    if not candidates:
        return None
    if len(candidates) == 1:
        return candidates[0]

    leaf_label = raw_path[-1]
    for candidate in candidates:
        if candidate.category == normalized_category:
            return candidate
    for candidate in candidates:
        if candidate.item == leaf_label or candidate.sub_category == leaf_label:
            return candidate
    return candidates[0]


def classify_top_category(raw_category: str, leaf_label: str) -> str:
    if raw_category in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[raw_category]

    if raw_category == "大模型语料专题数据":
        if any(token in leaf_label for token in ("新闻", "公告", "问答", "政策", "报告")):
            return "资讯数据"
        return "大模型语料"

    return raw_category


def derive_sub_category(path: tuple[str, ...]) -> str:
    if len(path) >= 3:
        return path[1]
    if len(path) >= 2:
        return path[-1]
    return path[0]


def derive_item(path: tuple[str, ...]) -> str:
    return path[-1]


def strip_trailing_reference(value: str) -> str:
    cleaned = normalize_text(value)
    cleaned = re.sub(r"[，,]?具体请参阅$", "", cleaned)
    cleaned = re.sub(r"[，,]?请参考$", "", cleaned)
    cleaned = re.sub(r"[。；;]+$", "", cleaned)
    return cleaned


def extract_limit_fragment(value: str) -> str:
    match = LIMIT_FRAGMENT_RE.search(value)
    return strip_trailing_reference(match.group(1)) if match else ""


def remove_limit_fragment(permission: str, limit: str) -> str:
    if not permission or not limit:
        return strip_trailing_reference(permission)
    cleaned = permission.replace(limit, "")
    cleaned = re.sub(r"(^[，,；;\s]+|[，,；;\s]+$)", "", cleaned)
    return strip_trailing_reference(cleaned)


def extract_metadata(page_soup: BeautifulSoup) -> tuple[str, str, str, str] | None:
    lines = [normalize_text(line) for line in page_soup.get_text("\n").splitlines()]
    lines = [line for line in lines if line]

    api_name = ""
    description = ""
    limit = ""
    permission = ""
    start_index = 0

    for index, line in enumerate(lines):
        match = re.search(r"接口[:：]\s*([A-Za-z0-9_]+)", line)
        if match:
            api_name = match.group(1)
            start_index = index
            break

    if not api_name:
        return None

    for line in lines[start_index + 1 :]:
        if line.startswith(STOP_LINE_PREFIXES) and (description or limit or permission):
            break

        if not description and line.startswith(INFO_LINE_PREFIXES["description"]):
            description = strip_trailing_reference(line.removeprefix(INFO_LINE_PREFIXES["description"]))
            continue

        if not limit and line.startswith(INFO_LINE_PREFIXES["limit"]):
            limit = strip_trailing_reference(line.removeprefix(INFO_LINE_PREFIXES["limit"]))
            continue

        if not permission and line.startswith(INFO_LINE_PREFIXES["permission"]):
            permission = strip_trailing_reference(line.removeprefix(INFO_LINE_PREFIXES["permission"]))
            continue

        if not permission and line.startswith(INFO_LINE_PREFIXES["points"]):
            permission = strip_trailing_reference(line.removeprefix(INFO_LINE_PREFIXES["points"]))

    if not limit:
        limit = extract_limit_fragment(permission)
    permission = remove_limit_fragment(permission, limit)

    return api_name, description, limit, permission


def collect_category_links(category_page: SidebarLink) -> list[SidebarLink]:
    soup = parse_html(fetch_html(category_page.url))
    links = sidebar_links(soup)
    if not links:
        return [category_page]
    return [link for link in links if link.path and link.path[0] == category_page.path[0]]


def fetch_leaf_metadata(link: SidebarLink) -> FetchAttempt:
    try:
        soup = parse_html(fetch_html(link.url))
        return FetchAttempt(link=link, metadata=extract_metadata(soup))
    except Exception as exc:
        return FetchAttempt(link=link, metadata=None, error=str(exc))


def sort_rows(rows: list[GeneratedRow]) -> list[GeneratedRow]:
    preferred_index = {name: index for index, name in enumerate(PREFERRED_CATEGORY_ORDER)}
    first_seen_fallbacks: dict[str, int] = {}
    next_fallback = len(preferred_index)

    def category_index(category: str) -> int:
        nonlocal next_fallback
        if category in preferred_index:
            return preferred_index[category]
        if category not in first_seen_fallbacks:
            first_seen_fallbacks[category] = next_fallback
            next_fallback += 1
        return first_seen_fallbacks[category]

    return sorted(rows, key=lambda row: (category_index(row.category), row.crawl_index))


def write_rows(path: Path, rows: Iterable[GeneratedRow]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "数据大类": row.category,
                    "数据子类": row.sub_category,
                    "数据项": row.item,
                    "接口名称": row.api_name,
                    "描述": row.description,
                    "限量": row.limit,
                    "权限": row.permission,
                }
            )


def main() -> int:
    existing_rows = load_existing_rows(OUTPUT_PATH)
    existing_by_api = build_existing_api_index(existing_rows)

    root_soup = parse_html(fetch_html(ROOT_URL))
    categories = top_level_categories(root_soup)
    log(f"Discovered {len(categories)} top-level Tushare categories")

    ordered_links: list[SidebarLink] = []
    seen_doc_ids: set[int] = set()
    for category in categories:
        log(f"Collecting leaf pages for {category.path[0]}")
        for link in collect_category_links(category):
            if link.doc_id in seen_doc_ids:
                continue
            seen_doc_ids.add(link.doc_id)
            ordered_links.append(link)

    log(f"Collected {len(ordered_links)} candidate API pages")

    generated_rows: list[GeneratedRow] = []
    with ThreadPoolExecutor(max_workers=LEAF_FETCH_WORKERS) as executor:
        future_map = {
            executor.submit(fetch_leaf_metadata, link): index for index, link in enumerate(ordered_links)
        }
        ordered_results: list[FetchAttempt | None] = [None] * len(ordered_links)
        for future in as_completed(future_map):
            ordered_results[future_map[future]] = future.result()

    failed_attempts = [result for result in ordered_results if result is not None and result.error]
    if failed_attempts:
        log(f"Retrying {len(failed_attempts)} transient leaf-page failures sequentially")
        for failed in failed_attempts:
            retried = fetch_leaf_metadata(failed.link)
            replacement_index = ordered_links.index(failed.link)
            ordered_results[replacement_index] = retried

    unresolved_failures = [result for result in ordered_results if result is not None and result.error]
    if unresolved_failures:
        preview = ", ".join(f"{result.link.doc_id}" for result in unresolved_failures[:10])
        raise SystemExit(f"Failed to fetch {len(unresolved_failures)} Tushare pages after retries: {preview}")

    for crawl_index, result in enumerate(ordered_results):
        if result is None:
            continue
        link = result.link
        metadata = result.metadata
        if metadata is None:
            continue

        api_name, description, limit, permission = metadata
        normalized_category = classify_top_category(link.path[0], link.path[-1])
        existing_row = resolve_existing_row(api_name, normalized_category, link.path, existing_by_api)

        category = existing_row.category if existing_row else normalized_category
        sub_category = existing_row.sub_category if existing_row else derive_sub_category(link.path)
        item = existing_row.item if existing_row else derive_item(link.path)
        generated_rows.append(
            GeneratedRow(
                category=category,
                sub_category=sub_category,
                item=item,
                api_name=api_name,
                description=description,
                limit=limit,
                permission=permission,
                crawl_index=crawl_index,
            )
        )

    merged_rows = generated_rows
    deduped_rows: list[GeneratedRow] = []
    seen_keys: set[tuple[str, str, str]] = set()
    for row in sort_rows(merged_rows):
        key = (row.category, row.sub_category, row.api_name)
        if key in seen_keys:
            continue
        seen_keys.add(key)
        deduped_rows.append(row)

    write_rows(OUTPUT_PATH, deduped_rows)

    categories_count = len({row.category for row in deduped_rows})
    print(f"Wrote {len(deduped_rows)} rows across {categories_count} categories to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())