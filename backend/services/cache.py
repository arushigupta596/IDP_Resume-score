import hashlib
import time
from difflib import SequenceMatcher

_cache: dict[str, dict] = {}
CACHE_TTL = 3600
FUZZY_THRESHOLD = 0.75

_query_index: dict[str, str] = {}


def _key(query: str) -> str:
    normalized = query.strip().lower()
    return hashlib.md5(normalized.encode()).hexdigest()


def _normalize(query: str) -> str:
    return query.strip().lower().rstrip("?!.")


def get_cached(query: str):
    k = _key(query)
    entry = _cache.get(k)
    if entry and time.time() - entry["ts"] < CACHE_TTL:
        return entry["data"]

    norm = _normalize(query)
    best_score = 0.0
    best_key = None
    for stored_query, stored_key in _query_index.items():
        ratio = SequenceMatcher(None, norm, stored_query).ratio()
        if ratio > best_score:
            best_score = ratio
            best_key = stored_key

    if best_score >= FUZZY_THRESHOLD and best_key:
        entry = _cache.get(best_key)
        if entry and time.time() - entry["ts"] < CACHE_TTL:
            return entry["data"]

    return None


def set_cached(query: str, data: dict):
    k = _key(query)
    _cache[k] = {"data": data, "ts": time.time()}
    _query_index[_normalize(query)] = k


def clear_cache():
    _cache.clear()
    _query_index.clear()


SUGGESTION_QUERIES = [
    "Who is the most suitable candidate for this role?",
    "Show me the top 5 candidates ranked by score",
    "Which candidates have maritime or offshore experience?",
    "Who has Power BI or advanced Excel skills?",
    "Compare the top 3 candidates",
    "Which candidates have market research experience?",
    "Show candidates with energy sector background",
    "Who are the weakest candidates and why?",
]
