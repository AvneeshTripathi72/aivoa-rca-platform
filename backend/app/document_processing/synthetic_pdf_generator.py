import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_sample_incident_pdf(output_path: str):
    """
    Generates a realistic GMP API Manufacturing Deviation & Quality Incident Report PDF.
    Scenario: Atorvastatin Calcium Trihydrate - Alert Limit Excursion for Related Substance B (Impurity B).
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#172B4D'),
        alignment=1, # Center
        spaceAfter=15
    )
    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2563EB'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#172033')
    )
    bold_style = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    alert_style = ParagraphStyle(
        'Alert',
        parent=body_style,
        textColor=colors.HexColor('#DC2626'),
        fontName='Helvetica-Bold'
    )

    elements = []

    # Header Banner
    elements.append(Paragraph("AURA PHARMACEUTICALS MANUFACTURING LTD.", ParagraphStyle('Comp', parent=bold_style, fontSize=11, alignment=1, textColor=colors.HexColor('#64748B'))))
    elements.append(Paragraph("QUALITY ASSURANCE DIVISION — GMP QUALITY INCIDENT REPORT", title_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#172B4D'), spaceAfter=12))

    # Metadata Table
    meta_data = [
        [Paragraph("<b>Incident ID:</b> DEV-2026-0891", body_style), Paragraph("<b>Date of Incident:</b> 2026-10-14", body_style)],
        [Paragraph("<b>Product / API:</b> Atorvastatin Calcium Trihydrate (Synthetic API)", body_style), Paragraph("<b>Date of Detection:</b> 2026-10-15", body_style)],
        [Paragraph("<b>Batch Number:</b> API-BT-2026-014", body_style), Paragraph("<b>Manufacturing Stage:</b> Stage 4: Crystallization & Cooling", body_style)],
        [Paragraph("<b>Equipment ID:</b> CR-402 (10,000L Jacketed Crystallizer)", body_style), Paragraph("<b>Severity Classification:</b> Major (Critical In-Process Alert)", body_style)],
        [Paragraph("<b>Lead Investigator:</b> Dr. Eleanor Vance (Senior QA Specialist)", body_style), Paragraph("<b>Status:</b> Initial Notification / Pending RCA", body_style)],
    ]
    t_meta = Table(meta_data, colWidths=[270, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 10))

    # Section 1: Incident Description & Detection
    elements.append(Paragraph("1. Incident Summary & Analytical Excursion", h2_style))
    desc_p = (
        "During routine in-process HPLC purity testing for commercial batch API-BT-2026-014 of Atorvastatin Calcium Trihydrate, "
        "Quality Control Laboratory observed an unexpected peak elevation corresponding to Related Substance B (Impurity B). "
        "The measured impurity level was <b>0.38% w/w</b>, which breaches the internal Quality Alert Limit of <b>0.25% w/w</b> "
        "(Specification Release Limit: NMT 0.50% w/w). While the batch remains within the final registered release specification, "
        "this represents an Out-of-Trend (OOT) excursion under ICH Q7 Chapter 8 and requires comprehensive Root Cause Analysis (RCA)."
    )
    elements.append(Paragraph(desc_p, body_style))
    elements.append(Spacer(1, 8))

    # Section 2: Laboratory Analytical Findings
    elements.append(Paragraph("2. Analytical Laboratory Summary (QC-LAB-REPORT-942)", h2_style))
    lab_data = [
        [Paragraph("<b>Test Parameter</b>", bold_style), Paragraph("<b>Method / Instrument</b>", bold_style), Paragraph("<b>Internal Alert Limit</b>", bold_style), Paragraph("<b>Observed Result</b>", bold_style), Paragraph("<b>Evaluation</b>", bold_style)],
        [Paragraph("Related Substance B", body_style), Paragraph("RP-HPLC (System HPLC-08)", body_style), Paragraph("≤ 0.25% w/w", body_style), Paragraph("0.38% w/w", alert_style), Paragraph("Alert Exceeded (OOT)", alert_style)],
        [Paragraph("Related Substance A", body_style), Paragraph("RP-HPLC (System HPLC-08)", body_style), Paragraph("≤ 0.15% w/w", body_style), Paragraph("0.08% w/w", body_style), Paragraph("Conforms", body_style)],
        [Paragraph("Enantiomeric Purity", body_style), Paragraph("Chiral HPLC (System HPLC-04)", body_style), Paragraph("≥ 99.5%", body_style), Paragraph("99.8%", body_style), Paragraph("Conforms", body_style)],
        [Paragraph("Residual Solvent (IPA)", body_style), Paragraph("GC-HS (System GC-02)", body_style), Paragraph("≤ 5000 ppm", body_style), Paragraph("1,820 ppm", body_style), Paragraph("Conforms", body_style)],
    ]
    t_lab = Table(lab_data, colWidths=[120, 110, 100, 100, 110])
    t_lab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_lab)
    elements.append(Spacer(1, 8))

    # Section 3: Process & Engineering Investigation Observations
    elements.append(Paragraph("3. Manufacturing & Process Engineering Observations", h2_style))
    obs_text = (
        "Preliminary review of the Batch Manufacturing Record (BMR-2026-014) and SCADA automation historian for Crystallizer CR-402 revealed the following key events:<br/>"
        "• <b>Temperature Excursion:</b> During the controlled cooling crystallisation profile (Step 4.4), the target ramp rate was 0.5°C/min from 65°C to 18°C. "
        "At 14:22 UTC, jacket cooling valve CV-402 experienced an erratic oscillation. SCADA data shows the batch solution temperature plateaued at 42.5°C for 84 minutes instead of the validated hold time of max 15 minutes.<br/>"
        "• <b>Thermal Degradation Kinetic:</b> Impurity B is known to be a thermally induced isomerisation degradation product formed when intermediate solutions reside at temperatures >38°C for prolonged holding durations.<br/>"
        "• <b>Instrument Calibration Check:</b> Primary RTD sensor TT-402A passed calibration on 2026-09-01. However, secondary pneumatic control loop actuator on valve CV-402 exhibited stick-slip behavior due to dried silicone sealant in the positioner diaphragm.<br/>"
        "• <b>Raw Material Verification:</b> Precursor reactant Batch RM-CAT-8812 was verified with CoA #RM-2026-778 and was confirmed to meet raw material specifications (Impurity precursor <0.05%)."
    )
    elements.append(Paragraph(obs_text, body_style))
    elements.append(Spacer(1, 8))

    # Section 4: Immediate Containment Actions
    elements.append(Paragraph("4. Immediate Containment & Impact Assessment", h2_style))
    containment = (
        "<b>Immediate Actions Executed:</b><br/>"
        "1. Batch API-BT-2026-014 was placed on QA Quarantine Hold in isolation warehouse Bay 4.<br/>"
        "2. Equipment CR-402 was tagged Out-of-Service pending engineering diagnostic and positioner overhaul.<br/>"
        "3. Downstream wet cake isolation and drying operations for subsequent batch API-BT-2026-015 were paused.<br/><br/>"
        "<b>Patient & Product Safety Impact Assessment:</b><br/>"
        "Impurity B is non-genotoxic (ICH M7 Class 5). While the batch meets final finished API specification (NMT 0.50%), "
        "the batch cannot be released until an investigation establishes the exact degradation mechanism and confirms process capability (Cpk) is not compromised."
    )
    elements.append(Paragraph(containment, body_style))
    elements.append(Spacer(1, 8))

    # Footer note
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94A3B8'), spaceBefore=8, spaceAfter=8))
    elements.append(Paragraph("<b>NOTE:</b> THIS DOCUMENT CONTAINS SYNTHETIC QUALITY DEMO DATA FOR RCA EVALUATION. STRICTLY CONTROLLED UNDER AIVOA SYSTEM INTEGRITY.", ParagraphStyle('Foot', parent=body_style, fontSize=7, textColor=colors.HexColor('#64748B'), alignment=1)))

    doc.build(elements)
    return output_path
