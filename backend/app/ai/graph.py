try:
    from langgraph.graph import StateGraph, START, END
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False

from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.nodes import (
    document_processing_node,
    extraction_node,
    validation_node,
    evidence_analysis_node,
    method_selection_node,
    root_cause_node,
    capa_recommendation_node,
    summary_node,
    human_review_node,
    save_investigation_node
)

class LightweightSequentialGraph:
    """
    Lean, zero-dependency sequential executor for the 10-node RCA investigation workflow.
    Ensures identical state machine transitions in minimal serverless containers.
    """
    def __init__(self):
        self.node_sequence = [
            ("document_processing", document_processing_node),
            ("extraction", extraction_node),
            ("validation", validation_node),
            ("evidence_analysis", evidence_analysis_node),
            ("method_selection", method_selection_node),
            ("root_cause", root_cause_node),
            ("capa_recommendation", capa_recommendation_node),
            ("summary", summary_node),
            ("human_review", human_review_node),
            ("save_investigation", save_investigation_node)
        ]

    def invoke(self, state: RCAWorkflowState) -> RCAWorkflowState:
        current_state = dict(state)
        for name, node_func in self.node_sequence:
            try:
                updates = node_func(current_state)
                if isinstance(updates, dict):
                    current_state.update(updates)
            except Exception as e:
                print(f"Workflow Node '{name}' exception: {e}")
        return current_state

def build_rca_investigation_graph():
    """
    Constructs and compiles the 10-node Root Cause Analysis workflow.
    Uses LangGraph if available, or lightweight native sequential graph.
    """
    if not HAS_LANGGRAPH:
        return LightweightSequentialGraph()

    workflow = StateGraph(RCAWorkflowState)
    
    # 1. Add Nodes
    workflow.add_node("document_processing", document_processing_node)
    workflow.add_node("extraction", extraction_node)
    workflow.add_node("validation", validation_node)
    workflow.add_node("evidence_analysis", evidence_analysis_node)
    workflow.add_node("method_selection", method_selection_node)
    workflow.add_node("root_cause", root_cause_node)
    workflow.add_node("capa_recommendation", capa_recommendation_node)
    workflow.add_node("summary", summary_node)
    workflow.add_node("human_review", human_review_node)
    workflow.add_node("save_investigation", save_investigation_node)
    
    # 2. Add Linear & Conditional Edges
    workflow.add_edge(START, "document_processing")
    workflow.add_edge("document_processing", "extraction")
    workflow.add_edge("extraction", "validation")
    workflow.add_edge("validation", "evidence_analysis")
    workflow.add_edge("evidence_analysis", "method_selection")
    workflow.add_edge("method_selection", "root_cause")
    workflow.add_edge("root_cause", "capa_recommendation")
    workflow.add_edge("capa_recommendation", "summary")
    workflow.add_edge("summary", "human_review")
    workflow.add_edge("human_review", "save_investigation")
    workflow.add_edge("save_investigation", END)
    
    return workflow.compile()

# Compile singleton instance of the graph
rca_graph = build_rca_investigation_graph()
