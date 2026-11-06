"""
Utility: parse a natural-language query into structured filter fields.
"""
from __future__ import annotations
import re
from typing import List, Optional, Tuple

FILLER_WORDS = {
    "that", "fit", "me", "perfectly", "for", "my", "with", "a", "an", "the",
    "good", "best", "nice", "perfect", "some", "in", "on", "at", "and", "or",
    "want", "need", "find", "show", "give", "get", "buy", "looking", "search",
    "please", "can", "you", "help", "budget", "price", "range", "around",
    "approximately", "roughly", "size", "find", "i",
}

CATEGORY_MAP = {
    "shirt": "shirts", "shirts": "shirts",
    "tshirt": "tshirts", "tshirts": "tshirts", "t-shirt": "tshirts",
    "jeans": "jeans", "jean": "jeans", "denim": "jeans",
    "trouser": "trousers", "trousers": "trousers", "chino": "trousers", "chinos": "trousers",
    "shoe": "shoes", "shoes": "shoes", "sneaker": "shoes", "sneakers": "shoes",
    "jacket": "jackets", "jackets": "jackets", "puffer": "jackets",
}


def parse_query(raw: str) -> Tuple[Optional[float], Optional[float], List[str], Optional[str]]:
    """
    Returns (min_price, max_price, keywords, category_filter).
    """
    q = raw.lower().strip()
    # Strip currency symbols
    q = re.sub(r"₹|rs\.?|inr", "", q, flags=re.IGNORECASE).replace(",", "")

    min_price: Optional[float] = None
    max_price: Optional[float] = None

    # between X and Y
    m = re.search(r"between\s+(\d+(?:\.\d+)?)\s+(?:and|to|-)\s+(\d+(?:\.\d+)?)", q)
    if m:
        min_price, max_price = float(m.group(1)), float(m.group(2))
        q = q[:m.start()] + " " + q[m.end():]
    else:
        # X to Y / X - Y (only if both > 50)
        m = re.search(r"(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)", q)
        if m:
            a, b = float(m.group(1)), float(m.group(2))
            if a > 50 and b > 50 and b > a:
                min_price, max_price = a, b
                q = q[:m.start()] + " " + q[m.end():]

        # under / below / less than / upto
        m = re.search(r"(?:under|below|less\s+than|upto|up\s+to)\s+(\d+(?:\.\d+)?)", q)
        if m:
            max_price = float(m.group(1))
            q = q[:m.start()] + " " + q[m.end():]

        # above / over / more than
        m = re.search(r"(?:above|over|more\s+than|greater\s+than|from)\s+(\d+(?:\.\d+)?)", q)
        if m:
            min_price = float(m.group(1))
            q = q[:m.start()] + " " + q[m.end():]

    # Detect category
    category_filter: Optional[str] = None
    for token, cat in CATEGORY_MAP.items():
        if token in q.split():
            category_filter = cat
            break

    # Extract keywords (strip fillers, punctuation, short words)
    tokens = re.sub(r"[^a-z0-9\s]", " ", q).split()
    keywords = [t for t in tokens if len(t) > 1 and t not in FILLER_WORDS]

    return min_price, max_price, keywords, category_filter
