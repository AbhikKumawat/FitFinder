"""
FitFinder LangGraph Backend
FastAPI server exposing:
  POST /api/search          — run full LangGraph agent pipeline, return JSON
  GET  /api/search/stream   — same but as Server-Sent Events (SSE) for live agent logs
  GET  /api/products        — return all demo products
  GET  /api/health          — health check
"""
from __future__ import annotations
import asyncio
import json
import os
from typing import AsyncGenerator, Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from agents.graph import graph
from agents.parser import parse_query
from agents.data import ALL_PRODUCTS
from agents.state import UserMeasurements


# ── App setup ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FitFinder LangGraph API",
    description="Multi-agent fashion search powered by LangGraph + Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response models ────────────────────────────────────────────────────
class MeasurementsIn(BaseModel):
    height: float = 175
    chest: float = 96
    waist: float = 82
    hips: float = 100
    shoulders: float = 44
    foot_length: float = 27
    unit: str = "cm"


class SearchRequest(BaseModel):
    query: str
    measurements: MeasurementsIn = MeasurementsIn()
    fit_preference: str = "relaxed"


# ── Helper: build initial state from request ──────────────────────────────────
def _build_state(req: SearchRequest) -> dict:
    min_price, max_price, keywords, category_filter = parse_query(req.query)
    return {
        "query": req.query,
        "measurements": req.measurements.model_dump(),
        "fit_preference": req.fit_preference,
        "max_price": max_price,
        "min_price": min_price,
        "keywords": keywords,
        "category_filter": category_filter,
        "raw_products": [],
        "agent_logs": [],
        "ranked_products": [],
        "summary": "",
        "error": None,
    }


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    api_key = os.getenv("GOOGLE_API_KEY", "")
    has_key = bool(api_key and api_key != "your_google_api_key_here")
    return {
        "status": "ok",
        "gemini_configured": has_key,
        "mode": "AI-powered (Gemini)" if has_key else "Demo mode (no API key)",
    }


@app.get("/api/products")
def get_all_products():
    """Return the full demo catalogue."""
    return {"products": ALL_PRODUCTS, "count": len(ALL_PRODUCTS)}


@app.post("/api/search")
async def search(req: SearchRequest):
    """
    Run the full LangGraph agent pipeline and return the final result.
    """
    try:
        initial_state = _build_state(req)
        # LangGraph invoke is synchronous — run in thread pool so we don't block
        result = await asyncio.get_event_loop().run_in_executor(
            None, lambda: graph.invoke(initial_state)
        )
        return {
            "query": req.query,
            "products": result.get("ranked_products", []),
            "summary": result.get("summary", ""),
            "agent_logs": result.get("agent_logs", []),
            "filters": {
                "min_price": result.get("min_price"),
                "max_price": result.get("max_price"),
                "keywords": result.get("keywords", []),
                "category": result.get("category_filter"),
            },
        }
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": str(exc), "products": [], "summary": "Search failed."},
        )


@app.get("/api/search/stream")
async def search_stream(
    query: str = Query(..., description="Natural language search query"),
    measurements: str = Query(
        '{"height":175,"chest":96,"waist":82,"hips":100,"shoulders":44,"foot_length":27,"unit":"cm"}',
        description="JSON-encoded measurements",
    ),
    fit_preference: str = Query("relaxed"),
):
    """
    Streams agent progress as Server-Sent Events.
    Frontend listens with EventSource to show live agent statuses.

    Event types:
      agent_start  — an agent started (data: {agent, message})
      agent_done   — an agent finished (data: {agent, message})
      result       — final ranked products (data: {products, summary})
      error        — something went wrong (data: {error})
    """
    try:
        meas_dict = json.loads(measurements)
        meas = MeasurementsIn(**meas_dict)
    except Exception:
        meas = MeasurementsIn()

    req = SearchRequest(query=query, measurements=meas, fit_preference=fit_preference)

    async def event_generator() -> AsyncGenerator[dict, None]:
        # Announce each agent as "starting"
        agent_names = [
            "Amazon Agent", "Myntra Agent", "H&M Agent",
            "Zara Agent", "Nike Agent", "Adidas Agent",
        ]
        for name in agent_names:
            yield {
                "event": "agent_start",
                "data": json.dumps({"agent": name, "status": "running", "message": "Searching products…"}),
            }
            await asyncio.sleep(0.05)  # slight stagger for UI effect

        # Run graph in thread pool
        try:
            initial_state = _build_state(req)
            result = await asyncio.get_event_loop().run_in_executor(
                None, lambda: graph.invoke(initial_state)
            )
        except Exception as exc:
            yield {"event": "error", "data": json.dumps({"error": str(exc)})}
            return

        # Stream individual agent completion logs
        for log in result.get("agent_logs", []):
            yield {
                "event": "agent_done",
                "data": json.dumps({
                    "agent": log["agent"],
                    "status": log["status"],
                    "message": log["message"],
                }),
            }
            await asyncio.sleep(0.08)

        # Final result
        yield {
            "event": "result",
            "data": json.dumps({
                "products": result.get("ranked_products", []),
                "summary": result.get("summary", ""),
                "filters": {
                    "min_price": initial_state.get("min_price"),
                    "max_price": initial_state.get("max_price"),
                    "keywords": initial_state.get("keywords", []),
                    "category": initial_state.get("category_filter"),
                },
            }),
        }

    return EventSourceResponse(event_generator())


# ── Dev entrypoint ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
