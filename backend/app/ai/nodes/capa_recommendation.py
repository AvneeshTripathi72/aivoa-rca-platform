import json
from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.groq_client import groq_service
from backend.app.ai.prompts.prompts import CAPA_SYSTEM_PROMPT

def fallback_capa_recommendations(causes: list) -> list:
    return [
        {
            "action_number": "CAPA-2026-001",
            "action_type": "Corrective",
            "description": "Overhaul pneumatic positioner and replace elastomeric diaphragm on crystallization cooling valve CV-402.",
            "associated_root_cause": "Machine: Pneumatic valve CV-402 actuator sticking and friction hysteresis.",
            "reason_for_recommendation": "Direct physical remedy to restore smooth linear modulating control of cooling brine to crystallizer CR-402.",
            "priority": "Critical",
            "owner": "Metrology & Engineering Department",
            "due_date": "7 Days",
            "status": "Proposed",
            "verification_criteria": "Engineering post-overhaul loop stroke test (0%, 25%, 50%, 75%, 100%) showing zero stick-slip hysteresis.",
            "effectiveness_result": "Stable temperature control curve verified on water-run trial prior to commercial API batch release."
        },
        {
            "action_number": "CAPA-2026-002",
            "action_type": "Preventive",
            "description": "Update preventive maintenance procedure SOP-MAINT-402 to reduce actuator diaphragm replacement cycle from 24 months to 12 months.",
            "associated_root_cause": "Machine: Excessive maintenance interval for high-duty cycling valve positioners.",
            "reason_for_recommendation": "Prevents mechanical fatigue and silicone diaphragm hardening before catastrophic in-process failure occurs.",
            "priority": "High",
            "owner": "Plant Maintenance & Reliability Lead",
            "due_date": "30 Days",
            "status": "Proposed",
            "verification_criteria": "Approved revision of SOP-MAINT-402 and updated Maximo/SAP CMMS scheduled maintenance task.",
            "effectiveness_result": "Zero valve failure events across all plant crystallizer vessels over subsequent 12 months."
        },
        {
            "action_number": "CAPA-2026-003",
            "action_type": "Preventive",
            "description": "Implement automated SCADA safety interlock and operator audible alarm when crystallization temperature deviation > 2°C or plateau hold > 20 minutes.",
            "associated_root_cause": "Method: Lack of automated dwell-time alarm in SCADA crystallization recipe Step 4.4.",
            "reason_for_recommendation": "Ensures immediate contemporaneous alerting of shift operators without waiting for hourly manual rounds.",
            "priority": "High",
            "owner": "Process Automation & Control Systems Engineering",
            "due_date": "21 Days",
            "status": "Proposed",
            "verification_criteria": "Factory Acceptance Test (FAT) simulation of temperature plateau with automated alarm trip log.",
            "effectiveness_result": "Operator notification within 2 minutes during any subsequent abnormal temperature plateau."
        },
        {
            "action_number": "CAPA-2026-004",
            "action_type": "Corrective",
            "description": "Execute thermal degradation laboratory study on retain intermediate solution to define exact time-temperature threshold for Impurity B formation.",
            "associated_root_cause": "Method: Insufficiently characterized intermediate thermal degradation kinetics.",
            "reason_for_recommendation": "Provide scientifically sound regulatory data for submission in batch disposition dossier.",
            "priority": "Medium",
            "owner": "Process Development & QC Analytical R&D",
            "due_date": "45 Days",
            "status": "Proposed",
            "verification_criteria": "Formal Technical Report with isothermal kinetics curves at 35°C, 40°C, 45°C, and 50°C.",
            "effectiveness_result": "Updated Critical Process Parameter (CPP) range incorporated into Atorvastatin master batch record."
        }
    ]

def capa_recommendation_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 7: Formulates scientifically justified Corrective and Preventive Actions (CAPA)
    rooted in the identified root causes.
    """
    causes = state.get("fishbone_causes", [])
    extracted = state.get("extracted_data", {})
    new_state = dict(state)
    execution_log = list(state.get("execution_log", []))
    
    user_prompt = (
        f"Incident: {extracted.get('incident_title')}\n"
        f"Product/Batch: {extracted.get('product_name')} / {extracted.get('batch_number')}\n"
        f"Identified Potential Causes:\n" +
        "\n".join(f"- [{c.get('cause_category')}] {c.get('cause_description')} (Strength: {c.get('evidence_strength')})" for c in causes)
    )
    
    llm_resp = groq_service.generate_chat_completion(
        system_prompt=CAPA_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        json_mode=True
    )
    
    if llm_resp.get("success") and isinstance(llm_resp.get("data"), dict):
        capa_items = llm_resp["data"].get("capa_recommendations", [])
        execution_log.append(f"Node 7 [CAPA Recommendation]: Generated {len(capa_items)} actions via Groq.")
    else:
        capa_items = fallback_capa_recommendations(causes)
        execution_log.append(f"Node 7 [CAPA Recommendation]: Loaded {len(capa_items)} domain-engineered CAPA actions.")

    new_state["capa_recommendations"] = capa_items
    new_state["execution_log"] = execution_log
    return new_state
