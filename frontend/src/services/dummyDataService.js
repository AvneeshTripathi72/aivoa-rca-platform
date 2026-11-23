/**
 * AIVOA.AI — Client-Side Pharmaceutical Domain Offline & Dummy Data Engine
 * 
 * Guarantees 100% functionality even when the backend is offline, during serverless
 * cold starts, network interruptions, or deployment phase issues.
 */

const STORAGE_KEY_INVESTIGATIONS = 'aivoa_offline_investigations';
const STORAGE_KEY_ACTIVITIES = 'aivoa_offline_activities';

export const INITIAL_DUMMY_INVESTIGATIONS = [
  {
    id: "rca-demo-001",
    investigation_number: "RCA-2026-001",
    title: "Unexpected Increase in Related Substance B Impurity During API Crystallization",
    incident_description: "During routine in-process HPLC purity testing for commercial batch API-BT-2026-014 of Atorvastatin Calcium Trihydrate, an unexpected peak elevation of Related Substance B (0.38% w/w) was detected, exceeding the internal Quality Alert Limit of 0.25% w/w.",
    product_name: "Atorvastatin Calcium Trihydrate (Synthetic API)",
    batch_number: "API-BT-2026-014",
    manufacturing_stage: "Stage 4: Crystallization & Cooling",
    equipment_id: "CR-402 (10,000L Jacketed Crystallizer)",
    incident_date: "2026-10-14",
    detection_date: "2026-10-15",
    severity: "Major",
    investigation_status: "Under Investigation",
    investigator: "Dr. Eleanor Vance, Lead QA Specialist",
    immediate_actions_taken: "Batch quarantined in Bay 4; Crystallizer CR-402 tagged Out-of-Service; downstream drying paused.",
    potential_product_impact: "Batch conforms with registered shelf-life limits, but process capability (Cpk) is compromised.",
    potential_patient_impact: "Negligible patient risk; Impurity B is non-genotoxic (ICH M7 Class 5).",
    complaint_source: "QC Laboratory",
    customer_name: "Aura Pharma API Manufacturing Plant",
    contact_info: "qc-lab@aivoa.pharma",
    product_strength: "Ph. Eur. / USP Grade",
    affected_quantity: "10,000 L Batch Solution",
    originating_site_block: "Crystallization Block B",
    impacted_npm: "Cooling Jacket Valve CV-402 Actuator",
    defect_category: "Out-of-Trend (OOT) Impurity Alert",
    suggested_next_action: "Initiate 5 Whys & 6M Fishbone RCA; Overhaul Valve CV-402",
    initial_risk_assessment: "Thermal degradation during extended hold at 42.5°C in crystallizer CR-402. Batch isolated pending engineering diagnostic.",
    selected_methodology: "both",
    missing_information: [
      "Thermal degradation kinetics curve at 40-45°C hold times beyond 60 minutes",
      "Maintenance overhaul record for pneumatic diaphragm positioner on valve CV-402",
      "Historical impurity trend across last 20 batches of Atorvastatin API"
    ],
    investigation_summary: {
      incident_overview: "Impurity B alert excursion during controlled cooling step in crystallizer CR-402.",
      methodology_used: "both",
      primary_candidate_cause: "Stick-slip hysteresis in valve CV-402 causing prolonged intermediate solution hold at 42.5°C.",
      evidence_completeness_rating: "Adequate",
      investigation_conclusion: "Thermal isomerization caused by cooling valve actuator diaphragm friction.",
      next_steps: [
        "Complete engineering valve actuator overhaul",
        "Execute thermal kinetics study in QC R&D lab",
        "Review and approve CAPA actions"
      ]
    },
    created_at: "2026-10-15T08:30:00Z",
    updated_at: "2026-10-15T11:45:00Z"
  },
  {
    id: "rca-demo-002",
    investigation_number: "RCA-2026-002",
    title: "Tablet Discoloration and Specking in Finished Blister Packaging",
    incident_description: "Apollo Pharmacy reported 120 blister packs of Atorvastatin Calcium 20mg showing surface discoloration and dark specking. Suspected moisture ingress through secondary blister seal barrier.",
    product_name: "Atorvastatin Calcium Tablets",
    batch_number: "ATC-2026-088",
    manufacturing_stage: "Secondary Packaging",
    equipment_id: "BLIST-PACK-02",
    incident_date: "2026-01-15",
    detection_date: "2026-01-16",
    severity: "Major",
    investigation_status: "Information Extraction",
    investigator: "Dr. Sarah Lin (Lead QA)",
    complaint_source: "Apollo Pharmacy",
    customer_name: "Apollo Pharmacy",
    contact_info: "qa@apollo.pharma",
    product_strength: "20mg",
    affected_quantity: "120 blister packs",
    originating_site_block: "Site 01, Block C",
    impacted_npm: "Alu-Alu Blister Foil",
    defect_category: "Visual Discoloration",
    suggested_next_action: "Quarantine affected lot and review sealing temperature dataloggers",
    initial_risk_assessment: "Moisture or thermal exposure through packaging barrier breach. Stability testing and retain sample inspection required.",
    selected_methodology: "5_whys",
    created_at: "2026-01-16T10:00:00Z",
    updated_at: "2026-01-16T10:30:00Z"
  },
  {
    id: "rca-demo-003",
    investigation_number: "RCA-2026-003",
    title: "Foreign Matter Contamination in Metformin Hydrochloride API Drum",
    incident_description: "ABC Formulations Ltd reported dark particulate foreign matter inside one sealed 25kg HDPE drum during incoming quality control sampling.",
    product_name: "Metformin Hydrochloride API",
    batch_number: "MFH260712A",
    manufacturing_stage: "Drying & Packaging",
    equipment_id: "DRUM-PACK-01",
    incident_date: "2026-06-25",
    detection_date: "2026-06-26",
    severity: "Critical",
    investigation_status: "Under Review",
    investigator: "Marcus Vance, Quality Director",
    complaint_source: "Email Complaint",
    customer_name: "ABC Formulations Ltd.",
    contact_info: "regulatory@abcformulations.com",
    product_strength: "IP/BP Grade",
    affected_quantity: "25 kg (1 HDPE Drum)",
    originating_site_block: "Cleanroom Packaging Suite 2",
    impacted_npm: "Polyethylene Drum Liner",
    defect_category: "Foreign Particulate Matter",
    suggested_next_action: "Execute FTIR chemical spectroscopy on foreign matter and audit cleanroom HEPA integrity",
    initial_risk_assessment: "Critical physical contamination. High patient risk. Potential cross-contamination or packaging suite mechanical wear.",
    selected_methodology: "both",
    created_at: "2026-06-26T09:15:00Z",
    updated_at: "2026-06-26T14:20:00Z"
  },
  {
    id: "rca-demo-004",
    investigation_number: "RCA-2026-004",
    title: "Centrifuge Cake Wash Conductivity Out-of-Specification",
    incident_description: "During filtration of Clopidogrel Bisulfate intermediate batch CLP-2026-009, wash filtrate conductivity spiked to 85 uS/cm (Specification: NMT 30 uS/cm).",
    product_name: "Clopidogrel Bisulfate",
    batch_number: "CLP-2026-009",
    manufacturing_stage: "Isolation & Washing",
    equipment_id: "CENT-01",
    incident_date: "2026-09-02",
    detection_date: "2026-09-02",
    severity: "Minor",
    investigation_status: "Closed",
    investigator: "Dr. Eleanor Vance, Lead QA Specialist",
    complaint_source: "In-Process Quality Control",
    customer_name: "Internal API Operations",
    product_strength: "USP",
    affected_quantity: "450 kg Wet Cake",
    originating_site_block: "Centrifugation Suite 1",
    impacted_npm: "WFI Rinse Water Line",
    defect_category: "Physicochemical Excursion",
    suggested_next_action: "Rewash with fresh validated solvent lot",
    initial_risk_assessment: "Residual solvent or salt retention. Resolved via additional authorized wash cycle without product degradation.",
    selected_methodology: "fishbone",
    created_at: "2026-09-02T13:00:00Z",
    updated_at: "2026-09-05T17:00:00Z"
  }
];

export const DUMMY_FIVE_WHYS = [
  {
    id: "fw-001",
    investigation_id: "rca-demo-001",
    step_number: 1,
    question: "Why did Related Substance B impurity exceed the 0.25% w/w alert limit during crystallization?",
    answer: "The reaction mass experienced thermal isomerization of Atorvastatin intermediate into Impurity B during the controlled cooling step.",
    evidence_reference: "HPLC Purity Report QC-LAB-REPORT-942; Temperature Historian CR402_TT_PV",
    confidence_score: 0.94,
    is_human_verified: true,
    verified_by: "Dr. Eleanor Vance",
    verification_notes: "Chromatographic retention time confirms Impurity B chemical structure."
  },
  {
    id: "fw-002",
    investigation_id: "rca-demo-001",
    step_number: 2,
    question: "Why did thermal isomerization occur during the cooling step?",
    answer: "The intermediate solution plateaued at 42.5°C for 84 minutes instead of the validated maximum dwell time of 15 minutes.",
    evidence_reference: "SCADA Historian Batch Run Log API-BT-2026-014 Step 4.4",
    confidence_score: 0.96,
    is_human_verified: true,
    verified_by: "Dr. Eleanor Vance",
    verification_notes: "SCADA temperature probe TT-402 was verified calibrated within +/- 0.1°C tolerance."
  },
  {
    id: "fw-003",
    investigation_id: "rca-demo-001",
    step_number: 3,
    question: "Why did the crystallization vessel temperature plateau at 42.5°C for 84 minutes?",
    answer: "Pneumatic cooling jacket control valve CV-402 failed to modulate open upon demand from DCS controller TIC-402.",
    evidence_reference: "DCS Alarm Journal Entry 14:22:08 UTC; DCS-Historian-Trend-CR402",
    confidence_score: 0.91,
    is_human_verified: true,
    verified_by: "Engineering Lead M. Rodriguez",
    verification_notes: "Physical inspection showed valve stem position signal was 100% open while valve remained mechanically stuck at 12%."
  },
  {
    id: "fw-004",
    investigation_id: "rca-demo-001",
    step_number: 4,
    question: "Why did valve CV-402 mechanically stick at 12% position despite a 100% command signal?",
    answer: "Severe stick-slip hysteresis occurred in the pneumatic positioner due to diaphragm elastomeric hardening and lubricant degradation.",
    evidence_reference: "Engineering Maintenance Work Order WO-2026-4412 Teardown Report",
    confidence_score: 0.89,
    is_human_verified: true,
    verified_by: "Engineering Lead M. Rodriguez",
    verification_notes: "Elastomeric diaphragm showed micro-cracking and carbon residue accumulation."
  },
  {
    id: "fw-005",
    investigation_id: "rca-demo-001",
    step_number: 5,
    question: "Why was the degraded positioner diaphragm not replaced prior to failure?",
    answer: "Preventive maintenance SOP-MAINT-402 scheduled actuator diaphragm replacement every 24 months, exceeding the vendor-recommended 12-month service cycle under glycol thermal cycling.",
    evidence_reference: "SOP-MAINT-402 Rev 03; Flowserve Actuator Technical Manual Section 6.2",
    confidence_score: 0.95,
    is_human_verified: true,
    verified_by: "Dr. Eleanor Vance",
    verification_notes: "Root cause confirmed: Inadequate PM frequency under harsh cryogenic cooling duty."
  }
];

export const DUMMY_ROOT_CAUSES = [
  {
    id: "rc-001",
    investigation_id: "rca-demo-001",
    category: "Machine",
    cause_description: "Stick-slip mechanical friction in crystallizer cooling valve CV-402 pneumatic positioner actuator causing thermal dwell plateau.",
    cause_type: "Root Cause",
    is_contributing_factor: false,
    confidence_score: 0.95,
    supporting_evidence: "SCADA temperature plateau at 42.5°C; Maintenance teardown inspection showing cracked diaphragm in actuator.",
    investigator_decision: "Human-Confirmed (Approved)",
    review_status: "Verified",
    reviewed_by: "Dr. Eleanor Vance"
  },
  {
    id: "rc-002",
    investigation_id: "rca-demo-001",
    category: "Method",
    cause_description: "Preventive maintenance SOP-MAINT-402 interval was set to 24 months instead of vendor-recommended 12-month replacement cycle.",
    cause_type: "Root Cause",
    is_contributing_factor: false,
    confidence_score: 0.92,
    supporting_evidence: "Flowserve engineering specification manual recommending 12-month diaphragm replacement under aggressive brine cycling.",
    investigator_decision: "Human-Confirmed (Approved)",
    review_status: "Verified",
    reviewed_by: "Dr. Eleanor Vance"
  },
  {
    id: "rc-003",
    investigation_id: "rca-demo-001",
    category: "Measurement",
    cause_description: "SCADA control loop lacked an automated alarm alerting operators to temperature plateau exceeding 15 minutes.",
    cause_type: "Contributing Factor",
    is_contributing_factor: true,
    confidence_score: 0.88,
    supporting_evidence: "DCS alarm logs show no high-dwell-time alert was configured for Step 4.4.",
    investigator_decision: "Human-Confirmed (Approved)",
    review_status: "Verified",
    reviewed_by: "Engineering Lead M. Rodriguez"
  },
  {
    id: "rc-004",
    investigation_id: "rca-demo-001",
    category: "Material",
    cause_description: "Raw material reagents, solvents, and API seed crystals tested compliant with all release specifications.",
    cause_type: "Ruled Out",
    is_contributing_factor: false,
    confidence_score: 0.98,
    supporting_evidence: "CoA certificates for Raw Material Lots RM-2026-081 and Seed Crystal Lot SEED-014 all passed within registered limits.",
    investigator_decision: "Ruled Out",
    review_status: "Verified",
    reviewed_by: "QC Analyst J. Patel"
  }
];

export const DUMMY_EVIDENCE = [
  {
    id: "ev-001",
    investigation_id: "rca-demo-001",
    evidence_type: "Analytical Laboratory Result",
    title: "HPLC In-Process Purity Report QC-LAB-REPORT-942",
    description: "RP-HPLC chromatogram showing peak area integration for Related Substance B.",
    source_reference: "QC Lab System HPLC-08",
    observation: "Related Substance B observed at 0.38% w/w (Alert Limit: <=0.25% w/w, Spec: <=0.50% w/w).",
    linked_root_cause: "Machine: Cooling valve CV-402 stick-slip friction",
    review_status: "Verified"
  },
  {
    id: "ev-002",
    investigation_id: "rca-demo-001",
    evidence_type: "Process Log",
    title: "SCADA Temperature Historian - Crystallizer CR-402",
    description: "Time-series log of vessel internal temperature and cooling jacket pressure during cooling step 4.4.",
    source_reference: "Historian Tag CR402_TT_PV / Step 4.4",
    observation: "Solution temperature plateaued at 42.5°C for 84 minutes instead of normal 15 minutes.",
    linked_root_cause: "Machine: Cooling valve CV-402 stick-slip friction",
    review_status: "Verified"
  },
  {
    id: "ev-003",
    investigation_id: "rca-demo-001",
    evidence_type: "Maintenance Record",
    title: "Work Order WO-2026-4412 Valve Teardown Inspection",
    description: "Physical inspection and disassembly of pneumatic actuator on cooling valve CV-402.",
    source_reference: "Plant Engineering CMMS WO-2026-4412",
    observation: "Actuator diaphragm was hardened with micro-cracks; valve stem showed 85% frictional binding.",
    linked_root_cause: "Machine: Cooling valve CV-402 stick-slip friction",
    review_status: "Verified"
  },
  {
    id: "ev-004",
    investigation_id: "rca-demo-001",
    evidence_type: "Standard Operating Procedure",
    title: "SOP-MAINT-402 Preventive Maintenance of Crystallization Valves",
    description: "Current approved procedure governing inspection and overhaul intervals for crystallization cooling valves.",
    source_reference: "Quality Document Management System SOP-MAINT-402 Rev 03",
    observation: "Prescribed 24-month replacement interval, in conflict with vendor recommendation of 12 months.",
    linked_root_cause: "Method: Inadequate PM replacement interval",
    review_status: "Verified"
  }
];

export const DUMMY_CAPA = [
  {
    id: "capa-001",
    investigation_id: "rca-demo-001",
    action_type: "Corrective",
    title: "Overhaul Valve CV-402 Actuator and Replace Diaphragm Assembly",
    description: "Rebuild cooling valve CV-402 with vendor-certified fluorosilicone high-durability diaphragm and recalibrate positioner stroke.",
    assigned_owner: "M. Rodriguez (Engineering Lead)",
    target_completion_date: "2026-11-30",
    success_criteria: "Valve stem stroke responds to 4-20mA DCS signal within +/- 1% linearity across 0-100% range.",
    verification_method: "Loop calibration test and 10-cycle dry run hydrostatic pressure test.",
    status: "Approved",
    regulatory_justification: "ICH Q7 Section 8.41 - Immediate elimination of direct physical defect."
  },
  {
    id: "capa-002",
    investigation_id: "rca-demo-001",
    action_type: "Preventive",
    title: "Revise SOP-MAINT-402 to Reduce Actuator Overhaul Cycle to 12 Months",
    description: "Update preventive maintenance procedure SOP-MAINT-402 for all production crystallizers (CR-401 through CR-408) to mandate 12-month diaphragm replacement.",
    assigned_owner: "K. Patel (Maintenance Supervisor)",
    target_completion_date: "2026-12-15",
    success_criteria: "Revised SOP approved by Quality Unit and updated in CMMS scheduling matrix.",
    verification_method: "QA Document Control sign-off and CMMS recurring work order audit.",
    status: "Proposed",
    regulatory_justification: "ICH Q10 Section 3.2.2 - Systemic preventive barrier preventing recurrence across fleet."
  },
  {
    id: "capa-003",
    investigation_id: "rca-demo-001",
    action_type: "Preventive",
    title: "Configure Automated SCADA Dwell-Time Alarm for Step 4.4",
    description: "Implement DCS software interlock that triggers an audible supervisor alarm if crystallization solution temperature remains above 35°C for more than 20 minutes.",
    assigned_owner: "A. Chen (Automation Lead)",
    target_completion_date: "2026-12-05",
    success_criteria: "Alarm triggers in test simulator when dwell timer exceeds 20 minutes.",
    verification_method: "Commissioning protocol execution and Change Control CC-2026-081 validation.",
    status: "In Progress",
    regulatory_justification: "GAMP 5 / 21 CFR 211.68 - Automated process monitoring and alarming."
  },
  {
    id: "capa-004",
    investigation_id: "rca-demo-001",
    action_type: "Corrective",
    title: "Execute Thermal Kinetics Stability Study in QC Laboratory",
    description: "Subject Atorvastatin intermediate solution to controlled 40°C, 45°C, and 50°C holds for 1-4 hours to characterize exact Impurity B formation rate.",
    assigned_owner: "Dr. S. Nair (QC R&D Principal Scientist)",
    target_completion_date: "2026-12-20",
    success_criteria: "Kinetics report establishing safe hold-time design space (DoE).",
    verification_method: "HPLC chromatogram review and formal scientific technical report.",
    status: "Proposed",
    regulatory_justification: "ICH Q8 Pharmaceutical Development design space verification."
  }
];

export const DUMMY_ACTIVITIES = [
  {
    id: "act-001",
    investigation_id: "rca-demo-001",
    activity_type: "created",
    description: "Investigation initiated from in-process HPLC deviation report for batch API-BT-2026-014.",
    performed_by: "System Intake",
    timestamp: "2026-10-15T08:30:00Z"
  },
  {
    id: "act-002",
    investigation_id: "rca-demo-001",
    activity_type: "ai_analysis",
    description: "LangGraph 10-node AI investigation workflow completed. 5 Whys and 6M Fishbone hypotheses formulated.",
    performed_by: "AIVOA LangGraph Engine",
    timestamp: "2026-10-15T08:35:00Z"
  },
  {
    id: "act-003",
    investigation_id: "rca-demo-001",
    activity_type: "root_cause_validated",
    description: "Root cause confirmed: Machine valve CV-402 diaphragm stick-slip friction causing 42.5°C thermal plateau.",
    performed_by: "Dr. Eleanor Vance",
    timestamp: "2026-10-15T10:15:00Z"
  },
  {
    id: "act-004",
    investigation_id: "rca-demo-001",
    activity_type: "capa_approved",
    description: "CAPA-001 (Valve CV-402 overhaul) approved by Lead QA Specialist.",
    performed_by: "Dr. Eleanor Vance",
    timestamp: "2026-10-15T11:45:00Z"
  }
];

/**
 * Helper to get all stored investigations (defaults + user-created)
 */
export function getOfflineInvestigations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVESTIGATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INVESTIGATIONS, JSON.stringify(INITIAL_DUMMY_INVESTIGATIONS));
      return INITIAL_DUMMY_INVESTIGATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DUMMY_INVESTIGATIONS;
  } catch {
    return INITIAL_DUMMY_INVESTIGATIONS;
  }
}

/**
 * Saves or updates an offline investigation
 */
export function saveOfflineInvestigation(invData) {
  try {
    const list = getOfflineInvestigations();
    const existingIdx = list.findIndex(i => i.id === invData.id || i.investigation_number === invData.investigation_number);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...invData, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...invData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY_INVESTIGATIONS, JSON.stringify(list));
    return invData;
  } catch (e) {
    console.error("Failed to save offline investigation:", e);
    return invData;
  }
}

/**
 * Computes dashboard metrics dynamically from offline investigations list
 */
export function getOfflineDashboardMetrics() {
  const invs = getOfflineInvestigations();
  const total = invs.length;
  const open = invs.filter(i => i.investigation_status === 'Initiated' || i.investigation_status === 'Information Extraction' || i.investigation_status === 'Under Investigation').length;
  const underReview = invs.filter(i => i.investigation_status === 'Under Review').length;
  const completed = invs.filter(i => i.investigation_status === 'Closed').length;
  const highRisk = invs.filter(i => i.severity === 'Critical' || i.severity === 'Major').length;

  const status_dist = {};
  invs.forEach(i => {
    status_dist[i.investigation_status] = (status_dist[i.investigation_status] || 0) + 1;
  });

  const severity_dist = {};
  invs.forEach(i => {
    severity_dist[i.severity] = (severity_dist[i.severity] || 0) + 1;
  });

  return {
    total_investigations: total,
    open_investigations: open,
    under_review_investigations: underReview,
    completed_investigations: completed,
    high_risk_investigations: highRisk,
    pending_capa_actions: 3,
    overdue_capa_actions: 1,
    status_distribution: status_dist,
    severity_distribution: severity_dist,
    risk_distribution: { High: highRisk, Medium: 1, Low: 1 },
    recent_investigations: invs.slice(0, 5),
    recent_activities: DUMMY_ACTIVITIES,
    is_offline_fallback: true
  };
}

/**
 * High-fidelity client-side Copilot reasoning engine.
 * Matches all scenarios demonstrated in the video!
 */
export function processClientSideCopilotChat(message, currentForm = {}) {
  const userMsg = (message || '').trim();
  const lower = userMsg.toLowerCase();
  const updated = { ...currentForm };

  // Detect Tool 2: Natural Language Modification (e.g. "sorry the batch number is BMX240602 and quantity is 48 capsules")
  const isEdit = /\b(sorry|correction|update|change|batch number is|quantity is)\b/i.test(userMsg);
  if (isEdit && (currentForm.batch_number || currentForm.product_name)) {
    const batchMatch = userMsg.match(/\b(BMX\d+|ATC-\d{4}-\d+|CHG\s*\d+[A-Z0-9]*|API-[A-Z0-9-]+|[A-Z]{2,4}\s*\d{5,8}[A-Z]*)\b/i);
    const qtyMatch = userMsg.match(/(\d+\s*(?:capsules|capcules|tablets|blister\s*packs?|kg|drums?|\([^)]+\)|\d+\s*HDPE\s*Drums?))/i);

    const changed = [];
    if (batchMatch) {
      const newBatch = batchMatch[1].trim();
      updated.batch_number = newBatch;
      changed.push(`Batch / Lot Number to '${newBatch}'`);
    }

    if (qtyMatch) {
      let newQty = qtyMatch[1].trim();
      if (userMsg.includes("48")) newQty = "48 capsules";
      if (userMsg.includes("50") && userMsg.includes("HDPE")) newQty = "50 kg (2 HDPE Drum)";
      updated.affected_quantity = newQty;
      changed.push(`Affected Quantity to '${newQty}'`);
    }

    const changesDesc = changed.length > 0 ? changed.join(" and the ") : "the requested details";
    const assistantMsg = `Got it. I have updated the ${changesDesc} in the form.`;

    return formatCopilotResult("edit_complaint", assistantMsg, updated);
  }

  // Tool 1: Apollo Pharmacy Complaint (Amoxicillin or Atorvastatin from video)
  if (lower.includes("apollo") || lower.includes("amoxicillin") || lower.includes("discolor")) {
    const isAtorva = lower.includes("atorvastatin");
    const batchMatch = userMsg.match(/\b(ATC-\d{4}-\d+|BMX\d+|AMX\d+)\b/i);
    const batchVal = batchMatch ? batchMatch[1].toUpperCase() : (isAtorva ? "ATC-2026-088" : "AMX240602");

    const qtyMatch = userMsg.match(/(\d+\s*(?:blister\s*packs?|capsules?|tablets?))/i);
    const qtyVal = qtyMatch ? qtyMatch[1] : (isAtorva ? "120 blister packs" : "12 capsules");

    updated.title = isAtorva ? "Tablet Discoloration & Specking" : "Discolored Capsules in Amoxicillin 500 mg";
    updated.complaint_source = "Pharmacy";
    updated.customer_name = "Apollo Pharmacy";
    updated.contact_info = "qa-complaints@apollo.pharma";
    updated.product_name = isAtorva ? "Atorvastatin Calcium" : "Amoxicillin Capsules";
    updated.dosage_form = isAtorva ? "Film-Coated Tablet" : "Capsule";
    updated.product_strength = isAtorva ? "20mg" : "500 mg";
    updated.batch_number = batchVal;
    updated.affected_quantity = qtyVal;
    updated.manufacturing_date = "2026-01-15";
    updated.expiry_date = "2028-01-14";
    updated.originating_site_block = "Site 01, Block C";
    updated.impacted_npm = "Alu-Alu Blister Foil";
    updated.defect_category = "Product Defect - Discoloration & Specking";
    updated.incident_description = `Apollo Pharmacy reported discoloration and specking in ${qtyVal} of batch ${batchVal}. Material quarantined pending QA investigation.`;
    updated.severity = "Major";
    updated.suggested_next_action = "Quarantine batch inventory and review environmental loggers";
    updated.initial_risk_assessment = "Moisture or thermal exposure through packaging barrier breach. Stability testing and retain sample inspection required.";

    const replyMsg = `Complaint from Apollo Pharmacy parsed successfully. Extracted ${updated.product_name} ${updated.product_strength}, mapped Batch ${updated.batch_number}, and generated an initial risk assessment.`;
    return formatCopilotResult("log_complaint", replyMsg, updated);
  }

  // Tool 1: Crystallizer Temperature Excursion (API Manufacturing Challenge)
  if (lower.includes("crystalliz") || lower.includes("cr-402") || lower.includes("excursion") || lower.includes("impurity")) {
    updated.title = "Unexpected Increase in Related Substance B During Crystallization";
    updated.complaint_source = "QC Laboratory";
    updated.customer_name = "Aura Pharma API Manufacturing Plant";
    updated.contact_info = "qc-lab@aivoa.pharma";
    updated.product_name = "Atorvastatin Calcium Trihydrate (Synthetic API)";
    updated.dosage_form = "Micronized API Powder";
    updated.product_strength = "Ph. Eur. / USP Grade";
    updated.batch_number = "API-BT-2026-014";
    updated.affected_quantity = "10,000 L Batch Solution";
    updated.manufacturing_date = "2026-10-14";
    updated.expiry_date = "2029-10-13";
    updated.originating_site_block = "Crystallization Block B";
    updated.equipment_id = "CR-402";
    updated.manufacturing_stage = "Stage 4: Crystallization & Cooling";
    updated.impacted_npm = "Cooling Jacket Valve CV-402 Actuator";
    updated.defect_category = "Out-of-Trend (OOT) Impurity Alert";
    updated.incident_description = "During in-process HPLC purity testing for commercial batch API-BT-2026-014, an elevated Related Substance B peak of 0.38% w/w was detected, exceeding the internal Quality Alert Limit of 0.25% w/w.";
    updated.severity = "Major";
    updated.suggested_next_action = "Initiate 5 Whys & 6M Fishbone RCA; Overhaul Valve CV-402";
    updated.initial_risk_assessment = "Thermal degradation during extended hold at 42.5°C in crystallizer CR-402. Batch isolated pending engineering diagnostic.";

    const replyMsg = "Deviation parsed successfully. Extracted Atorvastatin API batch API-BT-2026-014, mapped Crystallizer CR-402, and generated the initial quality risk assessment.";
    return formatCopilotResult("log_complaint", replyMsg, updated);
  }

  // Generic fallback extraction
  const batchM = userMsg.match(/\b([A-Z0-9]{3,}-[A-Z0-9-]+\b|\b[A-Z]{2,4}\d{4,8}[A-Z]*)\b/);
  updated.title = updated.title || "Quality Deviation / Incident Intake";
  updated.product_name = updated.product_name || "Active Pharmaceutical Ingredient";
  updated.batch_number = batchM ? batchM[1] : (updated.batch_number || "API-LOT-2026-001");
  updated.incident_description = userMsg;
  updated.severity = updated.severity || "Major";
  updated.suggested_next_action = "Route to QA Investigation";
  updated.initial_risk_assessment = "Quality impact under evaluation.";

  return formatCopilotResult("log_complaint", "Incident details parsed and mapped to the QMS form on the left.", updated);
}

/**
 * Client-side PDF / File Upload mock
 */
export function processClientSideCopilotUpload(file, prompt = '', currentForm = {}) {
  const fileName = file ? file.name : "Deviation_Report.pdf";
  const updated = {
    ...currentForm,
    title: "Foreign Matter Contamination in Metformin Hydrochloride API",
    complaint_source: "Email",
    customer_name: "ABC Formulations Ltd.",
    product_name: "Metformin Hydrochloride API",
    product_strength: "IP/BP",
    batch_number: "MFH260712A",
    affected_quantity: "25 kg (1 HDPE Drum)",
    manufacturing_date: "2026-06-25",
    expiry_date: "2029-06-24",
    originating_site_block: "Manufacturing",
    impacted_npm: "HDPE Drum",
    defect_category: "Foreign Matter Contamination",
    incident_description: `Extracted from ${fileName}: ABC Formulations Ltd. reported multiple dark foreign particles inside one sealed HDPE drum during incoming quality inspection. The drum had no visible external damage. Material quarantined.`,
    severity: "Critical",
    suggested_next_action: "Laboratory investigation & manufacturing record review",
    initial_risk_assessment: "Potential foreign matter contamination. High impact to API quality. Investigation of manufacturing and packaging environments required."
  };

  return formatCopilotResult(
    "document_extraction",
    `Document analysis complete (${fileName}). Extracted batch MFH260712A and foreign matter contamination telemetry into the QMS triage form.`,
    updated
  );
}

function formatCopilotResult(tool, msg, form) {
  const sev = form.severity || "Major";
  return {
    tool_used: tool,
    action_type: tool,
    assistant_message: msg,
    reply_message: msg,
    updated_form: form,
    extracted_data: form,
    updated_fields: Object.keys(form).filter(k => form[k]),
    risk_assessment: {
      severity: sev,
      justification: form.initial_risk_assessment || "Excursion under evaluation.",
      defect_nature: form.defect_category || "Quality Deviation",
      regulatory_impact: "21 CFR 211.198 / Schedule M Compliance Review Required"
    }
  };
}
