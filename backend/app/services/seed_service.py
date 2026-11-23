import os
from datetime import datetime
from sqlalchemy.orm import Session

from backend.app.models.models import (
    Investigation,
    SourceDocument,
    ExtractedInformation,
    Evidence,
    RootCause,
    FiveWhys,
    CapaAction,
    InvestigationActivity
)
from backend.app.document_processing.synthetic_pdf_generator import generate_sample_incident_pdf

def seed_database_if_empty(db: Session):
    """
    Seeds realistic synthetic pharmaceutical investigations if database is empty.
    Clearly marks all records with DEMO DATA attributes.
    """
    count = db.query(Investigation).count()
    if count > 0:
        return

    # Ensure sample PDF exists for download
    sample_pdf_path = os.path.join(settings.UPLOAD_DIR, "sample_incident_DEV-2026-0891.pdf")
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        generate_sample_incident_pdf(sample_pdf_path)
    except Exception as e:
        print(f"Sample PDF generation note: {e}")

    # --- Investigation 1: Primary Demo Incident (DEV-2026-0891) ---
    inv1 = Investigation(
        investigation_number="RCA-2026-001",
        title="Unexpected Increase in Related Substance B Impurity During API Crystallization",
        incident_description=(
            "During routine in-process HPLC purity testing for commercial batch API-BT-2026-014 of Atorvastatin Calcium Trihydrate, "
            "an unexpected peak elevation of Related Substance B (0.38% w/w) was detected, exceeding the internal Quality Alert Limit "
            "of 0.25% w/w. Batch remains within final finished release limit (NMT 0.50% w/w) but represents an Out-of-Trend excursion."
        ),
        product_name="Atorvastatin Calcium Trihydrate (Synthetic API)",
        batch_number="API-BT-2026-014",
        manufacturing_stage="Stage 4: Crystallization & Cooling",
        equipment_id="CR-402 (10,000L Jacketed Crystallizer)",
        incident_date="2026-10-14",
        detection_date="2026-10-15",
        severity="Major",
        investigation_status="Under Investigation",
        investigator="Dr. Eleanor Vance, Senior QA Specialist",
        immediate_actions_taken="Batch quarantined in isolation Bay 4; Crystallizer CR-402 tagged Out-of-Service; downstream drying paused.",
        potential_product_impact="Batch conforms with registered shelf-life limits, but process capability (Cpk) is compromised.",
        potential_patient_impact="Negligible patient risk; Impurity B is non-genotoxic (ICH M7 Class 5).",
        missing_information=[
            "Thermal degradation kinetics curve at 40-45°C hold times beyond 60 minutes",
            "Maintenance overhaul record for pneumatic diaphragm positioner on valve CV-402",
            "Historical impurity trend across last 20 batches of Atorvastatin API"
        ],
        selected_methodology="both",
        investigation_summary={
            "incident_overview": "Impurity B alert excursion during controlled cooling step in crystallizer CR-402.",
            "methodology_used": "both",
            "primary_candidate_cause": "Stick-slip hysteresis in valve CV-402 causing prolonged intermediate solution hold at 42.5°C.",
            "evidence_completeness_rating": "Adequate",
            "investigation_conclusion": "Preliminary AI investigation indicates thermal isomerization caused by cooling valve actuator diaphragm friction.",
            "next_steps": [
                "Complete engineering valve actuator overhaul",
                "Execute thermal kinetics study in QC R&D lab",
                "Review and approve CAPA actions"
            ]
        }
    )
    db.add(inv1)
    db.flush()

    # Evidence for inv1
    ev_items = [
        Evidence(
            investigation_id=inv1.id,
            evidence_type="Analytical Laboratory Result",
            title="HPLC In-Process Purity Report QC-LAB-REPORT-942",
            description="RP-HPLC chromatogram showing peak area integration for Impurity B.",
            source_reference="QC Lab System HPLC-08",
            observation="Related Substance B observed at 0.38% w/w (Alert Limit: <=0.25% w/w).",
            linked_root_cause="Machine: Crystallizer cooling valve CV-402 stick-slip friction",
            review_status="Verified"
        ),
        Evidence(
            investigation_id=inv1.id,
            evidence_type="Process Log",
            title="SCADA Temperature Historian - Crystallizer CR-402",
            description="Time-series log of vessel internal temperature and cooling jacket pressure.",
            source_reference="Historian Tag CR402_TT_PV / Step 4.4",
            observation="Solution temperature plateaued at 42.5°C for 84 minutes instead of normal 15 minutes.",
            linked_root_cause="Machine: Crystallizer cooling valve CV-402 stick-slip friction",
            review_status="Verified"
        ),
        Evidence(
            investigation_id=inv1.id,
            evidence_type="Calibration Record",
            title="Metrology Calibration Sheet TT-402A & CV-402",
            description="Annual calibration and stroke travel inspection record.",
            source_reference="Engineering Maintenance Logbook 2026-Q3",
            observation="RTD temperature sensor TT-402A calibrated on 2026-09-01; valve positioner showed friction hysteresis.",
            linked_root_cause="Machine: Crystallizer cooling valve CV-402 stick-slip friction",
            review_status="Verified"
        ),
        Evidence(
            investigation_id=inv1.id,
            evidence_type="Batch Manufacturing Record",
            title="Precursor Intermediate CoA RM-CAT-8812",
            description="CoA for starting precursor intermediate material.",
            source_reference="Warehouse Receiving Record",
            observation="Starting material purity 99.8% with <0.05% starting precursor impurity.",
            linked_root_cause="Material: Raw Material Impurity",
            review_status="Verified"
        )
    ]
    db.add_all(ev_items)

    # 5 Whys for inv1
    fw_items = [
        FiveWhys(
            investigation_id=inv1.id,
            sequence_number=1,
            question="Why did Batch API-BT-2026-014 fail the in-process alert limit for Related Substance B?",
            answer="Excess thermal degradation occurred during the crystallization cooling stage, accelerating isomer formation to 0.38% w/w.",
            evidence_reference="QC Lab Report QC-LAB-REPORT-942",
            is_root_cause=False,
            status="Human-Validated"
        ),
        FiveWhys(
            investigation_id=inv1.id,
            sequence_number=2,
            question="Why did excess thermal degradation occur during crystallization?",
            answer="The batch solution remained held at 42.5°C for 84 minutes instead of the validated cooling transition limit of max 15 minutes.",
            evidence_reference="SCADA Historian CR-402 (14:22 UTC)",
            is_root_cause=False,
            status="Human-Validated"
        ),
        FiveWhys(
            investigation_id=inv1.id,
            sequence_number=3,
            question="Why did the crystallization vessel temperature plateau at 42.5°C for 84 minutes?",
            answer="Jacket cooling control valve CV-402 failed to modulate chilled brine flow according to the recipe ramp rate.",
            evidence_reference="Engineering Valve Log CV-402",
            is_root_cause=False,
            status="Human-Validated"
        ),
        FiveWhys(
            investigation_id=inv1.id,
            sequence_number=4,
            question="Why did cooling control valve CV-402 fail to modulate chilled brine flow?",
            answer="The pneumatic positioner diaphragm suffered severe hysteresis and stick-slip friction due to silicone degradation.",
            evidence_reference="Instrument Diagnostic Memo Metrology-2026-118",
            is_root_cause=True,
            status="Human-Validated"
        ),
        FiveWhys(
            investigation_id=inv1.id,
            sequence_number=5,
            question="Why was the mechanical stick-slip behavior of valve CV-402 not detected prior to batch execution?",
            answer="Preventive maintenance frequency for pneumatic valve actuator seals was set at 24 months, exceeding manufacturer high-duty cycle wear threshold (12 months).",
            evidence_reference="SOP-MAINT-402 & Equipment History Logbook",
            is_root_cause=True,
            status="Human-Validated"
        )
    ]
    db.add_all(fw_items)

    # Root Causes (Fishbone) for inv1
    rc_items = [
        RootCause(
            investigation_id=inv1.id,
            methodology="fishbone",
            cause_category="Machine",
            cause_description="Pneumatic cooling control valve CV-402 actuator sticking caused prolonged solution hold at 42.5°C.",
            supporting_evidence=["SCADA temperature plateau for 84 mins", "Engineering actuator diagnostic showing positioner diaphragm friction"],
            contradictory_evidence=[],
            evidence_strength="High",
            verification_status="Evidence-Supported",
            is_primary_root_cause=True,
            investigator_decision_notes="Confirmed as primary physical root cause by engineering teardown."
        ),
        RootCause(
            investigation_id=inv1.id,
            methodology="fishbone",
            cause_category="Method",
            cause_description="Batch automation recipe lacked an automated SCADA alert trigger when solution temperature hold exceeded 20 minutes.",
            supporting_evidence=["Recipe Step 4.4 parameters lack active dwell-time deviation alarms"],
            contradictory_evidence=[],
            evidence_strength="Moderate",
            verification_status="Evidence-Supported",
            is_primary_root_cause=False,
            investigator_decision_notes="Contributing factor. Systemic automation safety gap."
        ),
        RootCause(
            investigation_id=inv1.id,
            methodology="fishbone",
            cause_category="Material",
            cause_description="Potential raw material precursor impurity or reagent reactivity variation.",
            supporting_evidence=[],
            contradictory_evidence=["Incoming CoA RM-CAT-8812 conformed with specification (<0.05% initial impurity)"],
            evidence_strength="Low",
            verification_status="Rejected",
            is_primary_root_cause=False,
            investigator_decision_notes="Ruled out by analytical retest of retain starting material."
        ),
        RootCause(
            investigation_id=inv1.id,
            methodology="fishbone",
            cause_category="Measurement",
            cause_description="Analytical HPLC system chromatographic integration error or temperature sensor drift.",
            supporting_evidence=[],
            contradictory_evidence=["Primary RTD temperature sensor TT-402A passed calibration on 2026-09-01", "HPLC system suitability passed RSD < 1.0%"],
            evidence_strength="Low",
            verification_status="Rejected",
            is_primary_root_cause=False,
            investigator_decision_notes="Ruled out. Secondary lab test on duplicate instrument confirmed 0.38%."
        ),
        RootCause(
            investigation_id=inv1.id,
            methodology="fishbone",
            cause_category="Man",
            cause_description="Operator delay in recognizing automated temperature plateau on local HMI.",
            supporting_evidence=["Operator intervention logged 60 minutes after valve oscillation began"],
            contradictory_evidence=["Operator followed standard SOP visual round schedule every 60 minutes"],
            evidence_strength="Low",
            verification_status="Hypothesis",
            is_primary_root_cause=False,
            investigator_decision_notes="Secondary factor; primary remedy is automated alarming rather than operator policing."
        ),
        RootCause(
            investigation_id=inv1.id,
            methodology="fishbone",
            cause_category="Environment",
            cause_description="Cleanroom ambient temperature or utilities chilled brine supply temperature fluctuation.",
            supporting_evidence=[],
            contradictory_evidence=["Central utility brine header remained stable at -10°C +/- 0.5°C"],
            evidence_strength="None",
            verification_status="Rejected",
            is_primary_root_cause=False,
            investigator_decision_notes="Utility records confirm chilled brine supply was stable."
        )
    ]
    db.add_all(rc_items)

    # CAPA Actions for inv1
    capa_items = [
        CapaAction(
            investigation_id=inv1.id,
            action_number="CAPA-2026-001",
            action_type="Corrective",
            description="Overhaul pneumatic positioner and replace elastomeric diaphragm on crystallization cooling valve CV-402.",
            associated_root_cause="Machine: Pneumatic valve CV-402 actuator sticking and friction hysteresis.",
            reason_for_recommendation="Direct physical remedy to restore smooth linear modulating control of cooling brine to crystallizer CR-402.",
            priority="Critical",
            owner="Metrology & Engineering Department",
            due_date="2026-11-05",
            status="In Progress",
            verification_criteria="Engineering post-overhaul loop stroke test (0%, 25%, 50%, 75%, 100%) showing zero stick-slip hysteresis.",
            effectiveness_result="Stable temperature control curve verified on water-run trial prior to commercial API batch release.",
            is_ai_generated=True
        ),
        CapaAction(
            investigation_id=inv1.id,
            action_number="CAPA-2026-002",
            action_type="Preventive",
            description="Update preventive maintenance procedure SOP-MAINT-402 to reduce actuator diaphragm replacement cycle from 24 months to 12 months.",
            associated_root_cause="Machine: Excessive maintenance interval for high-duty cycling valve positioners.",
            reason_for_recommendation="Prevents mechanical fatigue and silicone diaphragm hardening before catastrophic in-process failure occurs.",
            priority="High",
            owner="Plant Maintenance & Reliability Lead",
            due_date="2026-11-20",
            status="Approved",
            verification_criteria="Approved revision of SOP-MAINT-402 and updated Maximo/SAP CMMS scheduled maintenance task.",
            effectiveness_result="Zero valve failure events across all plant crystallizer vessels over subsequent 12 months.",
            is_ai_generated=True
        ),
        CapaAction(
            investigation_id=inv1.id,
            action_number="CAPA-2026-003",
            action_type="Preventive",
            description="Implement automated SCADA safety interlock and operator audible alarm when crystallization temperature deviation > 2°C or plateau hold > 20 minutes.",
            associated_root_cause="Method: Lack of automated dwell-time alarm in SCADA crystallization recipe Step 4.4.",
            reason_for_recommendation="Ensures immediate contemporaneous alerting of shift operators without waiting for hourly manual rounds.",
            priority="High",
            owner="Process Automation & Control Systems Engineering",
            due_date="2026-11-25",
            status="Approved",
            verification_criteria="Factory Acceptance Test (FAT) simulation of temperature plateau with automated alarm trip log.",
            effectiveness_result="Operator notification within 2 minutes during any subsequent abnormal temperature plateau.",
            is_ai_generated=True
        ),
        CapaAction(
            investigation_id=inv1.id,
            action_number="CAPA-2026-004",
            action_type="Corrective",
            description="Execute thermal degradation laboratory study on retain intermediate solution to define exact time-temperature threshold for Impurity B formation.",
            associated_root_cause="Method: Insufficiently characterized intermediate thermal degradation kinetics.",
            reason_for_recommendation="Provide scientifically sound regulatory data for submission in batch disposition dossier.",
            priority="Medium",
            owner="Process Development & QC Analytical R&D",
            due_date="2026-12-10",
            status="Under Review",
            verification_criteria="Formal Technical Report with isothermal kinetics curves at 35°C, 40°C, 45°C, and 50°C.",
            effectiveness_result="Updated Critical Process Parameter (CPP) range incorporated into Atorvastatin master batch record.",
            is_ai_generated=True
        )
    ]
    db.add_all(capa_items)

    # Activity trail for inv1
    activities_inv1 = [
        InvestigationActivity(
            investigation_id=inv1.id,
            activity_type="created",
            description="Investigation RCA-2026-001 opened following in-process HPLC excursion notification.",
            performed_by="Dr. Eleanor Vance, Senior QA Specialist",
            created_at=datetime(2026, 10, 15, 9, 30)
        ),
        InvestigationActivity(
            investigation_id=inv1.id,
            activity_type="ai_extraction",
            description="LangGraph AI processed deviation PDF and SCADA logs. Form auto-populated.",
            performed_by="AIVOA AI Assistant",
            created_at=datetime(2026, 10, 15, 9, 35)
        ),
        InvestigationActivity(
            investigation_id=inv1.id,
            activity_type="root_cause_analyzed",
            description="Fishbone and 5 Whys generated. Mechanical valve CV-402 sticking identified as primary candidate.",
            performed_by="AIVOA AI Assistant",
            created_at=datetime(2026, 10, 15, 9, 40)
        ),
        InvestigationActivity(
            investigation_id=inv1.id,
            activity_type="field_edited",
            description="Investigator confirmed 5 Whys steps and validated Machine category root cause.",
            performed_by="Dr. Eleanor Vance, Senior QA Specialist",
            created_at=datetime(2026, 10, 15, 11, 15)
        )
    ]
    db.add_all(activities_inv1)

    # --- Investigation 2: Completed Investigation (RCA-2026-002) ---
    inv2 = Investigation(
        investigation_number="RCA-2026-002",
        title="Drying Temperature Sensor Drift in Fluidized Bed Dryer FBD-102",
        incident_description="Residual moisture content in API batch API-BT-2026-009 exceeded limit due to uncalibrated dual RTD sensor drift.",
        product_name="Losartan Potassium (Synthetic API)",
        batch_number="API-BT-2026-009",
        manufacturing_stage="Stage 6: Fluidized Bed Drying",
        equipment_id="FBD-102 (Fluidized Bed Dryer)",
        incident_date="2026-09-02",
        detection_date="2026-09-03",
        severity="Minor",
        investigation_status="Closed",
        investigator="Marcus Sterling, Metrology Quality Lead",
        immediate_actions_taken="Batch re-dried under validated deviation protocol; moisture met target 0.2% w/w.",
        potential_product_impact="No degradation observed; stability testing confirmed compliance.",
        potential_patient_impact="None.",
        missing_information=[],
        selected_methodology="5_whys",
        investigation_summary={
            "incident_overview": "Moisture excursion caused by RTD offset in dryer exhaust port.",
            "primary_candidate_cause": "Thermocouple wire corrosion caused 4°C negative measurement offset.",
            "investigation_conclusion": "Sensors replaced and dual-redundancy interlock verified. Investigation closed."
        }
    )
    db.add(inv2)

    # --- Investigation 3: Critical Excursion Under CAPA Review (RCA-2026-003) ---
    inv3 = Investigation(
        investigation_number="RCA-2026-003",
        title="Filtration Flow Rate Decay and Pressure Spikes During Intermediate Isolation",
        incident_description="Agitated Nutsche Filter Dryer ANFD-03 experienced filter membrane blinding and pressure surge during Batch API-BT-2026-012.",
        product_name="Rosuvastatin Intermediate (Synthetic API)",
        batch_number="API-BT-2026-012",
        manufacturing_stage="Stage 3: Intermediate Isolation",
        equipment_id="ANFD-03 (Agitated Nutsche Filter Dryer)",
        incident_date="2026-10-01",
        detection_date="2026-10-01",
        severity="Critical",
        investigation_status="CAPA Review",
        investigator="Dr. Eleanor Vance, Senior QA Specialist",
        immediate_actions_taken="Cake washed and isolated; vessel depressurized under nitrogen blanket.",
        potential_product_impact="Yield reduced by 4.2%; purity unaffected.",
        potential_patient_impact="None.",
        missing_information=["Filter cloth microscopic pore examination"],
        selected_methodology="both",
        investigation_summary={
            "incident_overview": "Rapid blinding of 5-micron sintered mesh filter cloth.",
            "primary_candidate_cause": "Polymorphic phase transformation generated fine sub-micron crystal needles blinding filter pores."
        }
    )
    db.add(inv3)

    db.commit()
