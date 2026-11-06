"""
LangGraph agent nodes for FitFinder.

Each node is a pure function: (state) -> partial state update dict.

Graph topology:
  START
    ├─► amazon_node  ─┐
    ├─► myntra_node  ─┤
    ├─► hm_node      ─┤─► fit_analysis_node ─► ranking_node ─► END
    ├─► zara_node    ─┤
    ├─► nike_node    ─┤
    └─► adidas_node  ─┘

The 6 retailer nodes run in PARALLEL (Send API / fan-out).
fit_analysis_node and ranking_node run sequentially after all retailers finish.
"""
from __future__ import annotations
import os
import json
import re
from typing import List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from agents.state import SearchState, Product, AgentLog
from agents.data import STORE_PRODUCTS


# ── LLM singleton ──────────────────────────────────────────────────────────────
def _get_llm() -> ChatGoogleGenerativeAI:
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if not api_key or api_key == "your_google_api_key_here":
        raise RuntimeError(
            "GOOGLE_API_KEY not set. Copy .env.example → .env and add your key."
        )
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.2,
    )


# ── Helpers ────────────────────────────────────────────────────────────────────
def _filter_products(
    products: List[Product],
    keywords: List[str],
    max_price: float | None,
    min_price: float | None,
    category_filter: str | None,
) -> List[Product]:
    """Filter products by price, category, and keyword matching."""
    results = []
    for p in products:
        if max_price is not None and p["price"] > max_price:
            continue
        if min_price is not None and p["price"] < min_price:
            continue
        if category_filter and p["category"] != category_filter:
            continue
        if keywords:
            text = f"{p['name']} {p['brand']} {p['category']}".lower()
            if not any(kw.lower() in text for kw in keywords):
                continue
        results.append(p)
    return results


# ── Retailer nodes (run in parallel) ──────────────────────────────────────────
def _make_retailer_node(store_key: str, agent_name: str, icon: str):
    """Factory that creates a retailer search node."""
    def node(state: SearchState) -> dict:
        products = STORE_PRODUCTS.get(store_key, [])
        filtered = _filter_products(
            products,
            state["keywords"],
            state.get("max_price"),
            state.get("min_price"),
            state.get("category_filter"),
        )
        return {
            "raw_products": filtered,
            "agent_logs": [
                {
                    "agent": agent_name,
                    "status": "done",
                    "message": f"Found {len(filtered)} matching product{'s' if len(filtered) != 1 else ''}",
                }
            ],
        }
    node.__name__ = f"{store_key}_node"
    return node


amazon_node  = _make_retailer_node("amazon",  "Amazon Agent",  "🛒")
myntra_node  = _make_retailer_node("myntra",  "Myntra Agent",  "🛍️")
hm_node      = _make_retailer_node("hm",      "H&M Agent",     "👔")
zara_node    = _make_retailer_node("zara",    "Zara Agent",    "🛍️")
nike_node    = _make_retailer_node("nike",    "Nike Agent",    "👟")
adidas_node  = _make_retailer_node("adidas",  "Adidas Agent",  "👟")


# ── Fit Analysis node (uses Gemini LLM) ───────────────────────────────────────
def fit_analysis_node(state: SearchState) -> dict:
    """
    Uses Gemini to re-score and re-explain the fit of each product
    against the user's actual body measurements and fit preference.
    Falls back to the demo scores if the API key is missing.
    """
    raw = state.get("raw_products", [])
    measurements = state.get("measurements", {})
    fit_pref = state.get("fit_preference", "regular")

    if not raw:
        return {
            "raw_products": [],
            "agent_logs": [{"agent": "Fit Agent", "status": "done", "message": "No products to analyse"}],
        }

    try:
        llm = _get_llm()

        # Build a compact product list for the prompt
        product_summary = "\n".join(
            f"ID={p['id']} | {p['name']} ({p['brand']}) | "
            f"Price={p['currency']}{p['price']} | Sizes={','.join(p['sizes'])} | "
            f"Category={p['category']}"
            for p in raw
        )

        system_prompt = """You are a fashion sizing expert AI.
Given a user's body measurements and their preferred fit style, analyse each product
and return a JSON array with updated fit scores and recommendations.

Rules:
- fit_match must be an integer 0-100
- recommended_size must be one of the product's available sizes
- fit_explanation must be 1 concise sentence referencing actual measurements
- Return ONLY valid JSON, no markdown fences, no extra text
"""

        user_prompt = f"""User measurements:
  Height: {measurements.get('height', 175)} cm
  Chest:  {measurements.get('chest', 96)} cm
  Waist:  {measurements.get('waist', 82)} cm
  Hips:   {measurements.get('hips', 100)} cm
  Shoulders: {measurements.get('shoulders', 44)} cm
  Foot length: {measurements.get('foot_length', 27)} cm
Preferred fit style: {fit_pref}

Products to analyse:
{product_summary}

Return a JSON array. Each element:
{{
  "id": "<product id>",
  "recommended_size": "<size from product's available sizes>",
  "fit_match": <0-100>,
  "fit_explanation": "<one sentence>"
}}
"""
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ])

        # Parse JSON from response
        content = response.content.strip()
        # Strip markdown fences if LLM adds them anyway
        content = re.sub(r"```(?:json)?", "", content).strip().rstrip("`").strip()
        updates = json.loads(content)

        # Apply LLM scores back to products
        update_map = {u["id"]: u for u in updates}
        updated_products = []
        for p in raw:
            upd = update_map.get(p["id"], {})
            updated_products.append({
                **p,
                "fit_match": upd.get("fit_match", p["fit_match"]),
                "recommended_size": upd.get("recommended_size", p["recommended_size"]),
                "fit_explanation": upd.get("fit_explanation", p["fit_explanation"]),
            })

        return {
            "raw_products": updated_products,
            "agent_logs": [
                {
                    "agent": "Fit Agent",
                    "status": "done",
                    "message": f"Analysed {len(updated_products)} products with Gemini AI",
                }
            ],
        }

    except RuntimeError:
        # No API key — use existing demo scores, just log it
        return {
            "raw_products": raw,
            "agent_logs": [
                {
                    "agent": "Fit Agent",
                    "status": "done",
                    "message": "Using demo fit scores (add GOOGLE_API_KEY for AI analysis)",
                }
            ],
        }
    except Exception as exc:
        # LLM error — fall back gracefully
        return {
            "raw_products": raw,
            "agent_logs": [
                {
                    "agent": "Fit Agent",
                    "status": "done",
                    "message": f"Fit analysis used demo scores (LLM error: {str(exc)[:60]})",
                }
            ],
        }


# ── Ranking node ───────────────────────────────────────────────────────────────
def ranking_node(state: SearchState) -> dict:
    """
    Deduplicates products (same name+brand), sorts by fit_match descending,
    then generates a natural-language search summary.
    """
    products = state.get("raw_products", [])

    # Deduplicate by (name, brand) keeping highest fit_match
    seen: dict[str, Product] = {}
    for p in products:
        key = f"{p['name'].lower()}|{p['brand'].lower()}"
        if key not in seen or p["fit_match"] > seen[key]["fit_match"]:
            seen[key] = p

    ranked = sorted(seen.values(), key=lambda x: x["fit_match"], reverse=True)

    # Build summary
    query = state.get("query", "")
    max_p = state.get("max_price")
    min_p = state.get("min_price")
    price_clause = ""
    if max_p:
        price_clause = f" under ₹{int(max_p):,}"
    elif min_p:
        price_clause = f" above ₹{int(min_p):,}"

    if ranked:
        top = ranked[0]
        summary = (
            f"Found {len(ranked)} product{'s' if len(ranked) != 1 else ''}{price_clause} "
            f"matching \"{query}\". "
            f"Best match: {top['name']} by {top['brand']} "
            f"({top['fit_match']}% fit, size {top['recommended_size']})."
        )
    else:
        summary = f"No products found matching \"{query}\"{price_clause}. Try broadening your search."

    return {
        "ranked_products": ranked,
        "summary": summary,
        "agent_logs": [
            {
                "agent": "Ranking Agent",
                "status": "done",
                "message": f"Ranked {len(ranked)} unique products by fit score",
            }
        ],
    }
