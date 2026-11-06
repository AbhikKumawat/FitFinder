"""
Shared state schema for the FitFinder LangGraph agent graph.
Every node reads from and writes to this TypedDict.
"""
from __future__ import annotations
from typing import TypedDict, List, Optional, Annotated
import operator


class UserMeasurements(TypedDict):
    height: float       # cm
    chest: float        # cm
    waist: float        # cm
    hips: float         # cm
    shoulders: float    # cm
    foot_length: float  # cm
    unit: str           # "cm" | "in"


class Product(TypedDict):
    id: str
    name: str
    brand: str
    price: float
    currency: str
    category: str
    image: str
    colors: List[str]
    sizes: List[str]
    recommended_size: str
    fit_match: int          # 0-100
    fit_explanation: str
    rating: float
    review_count: int
    description: str
    specs: dict
    store_url: str
    source: str             # "Amazon" | "Myntra" | "H&M" etc.


class AgentLog(TypedDict):
    agent: str
    status: str    # "running" | "done" | "error"
    message: str


class SearchState(TypedDict):
    # ── Inputs ──────────────────────────────────────────
    query: str
    measurements: UserMeasurements
    fit_preference: str          # slim | regular | relaxed | oversized
    max_price: Optional[float]
    min_price: Optional[float]
    keywords: List[str]
    category_filter: Optional[str]

    # ── Intermediate results (each agent appends) ────────
    # Annotated with operator.add so parallel nodes can merge lists safely
    raw_products: Annotated[List[Product], operator.add]
    agent_logs: Annotated[List[AgentLog], operator.add]

    # ── Final outputs ────────────────────────────────────
    ranked_products: List[Product]
    summary: str
    error: Optional[str]
