"""
LangGraph graph definition for FitFinder multi-agent search.

Topology:
  START ──fan-out──► [amazon, myntra, hm, zara, nike, adidas]
                           │  (all run in parallel)
                           ▼
                    fit_analysis_node
                           │
                           ▼
                     ranking_node
                           │
                           ▼
                          END
"""
from langgraph.graph import StateGraph, START, END
from agents.state import SearchState
from agents.nodes import (
    amazon_node, myntra_node, hm_node,
    zara_node, nike_node, adidas_node,
    fit_analysis_node, ranking_node,
)

# ── Build the graph ────────────────────────────────────────────────────────────
def build_graph():
    builder = StateGraph(SearchState)

    # Add all nodes
    builder.add_node("amazon",       amazon_node)
    builder.add_node("myntra",       myntra_node)
    builder.add_node("hm",           hm_node)
    builder.add_node("zara",         zara_node)
    builder.add_node("nike",         nike_node)
    builder.add_node("adidas",       adidas_node)
    builder.add_node("fit_analysis", fit_analysis_node)
    builder.add_node("ranking",      ranking_node)

    # Fan-out from START to all 6 retailer nodes (parallel)
    for store in ["amazon", "myntra", "hm", "zara", "nike", "adidas"]:
        builder.add_edge(START, store)

    # All retailer nodes converge into fit_analysis
    for store in ["amazon", "myntra", "hm", "zara", "nike", "adidas"]:
        builder.add_edge(store, "fit_analysis")

    # Sequential: fit_analysis → ranking → END
    builder.add_edge("fit_analysis", "ranking")
    builder.add_edge("ranking", END)

    return builder.compile()


# Singleton compiled graph
graph = build_graph()
