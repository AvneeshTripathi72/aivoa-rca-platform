import os
import pytest
from backend.app.document_processing.extractor import DocumentExtractor
from backend.app.document_processing.synthetic_pdf_generator import generate_sample_incident_pdf

def test_email_extraction():
    raw_email = (
        "From: quality.lead@pharma-corp.com\n"
        "To: qa-investigations@pharma-corp.com\n"
        "Date: 2026-10-14 10:00:00\n"
        "Subject: Out-of-trend in crystallization API-BT-2026-014\n\n"
        "Impurity B level detected at 0.38% w/w on crystallizer CR-402."
    )
    result = DocumentExtractor.extract_from_email(raw_email)
    assert result["subject"] == "Out-of-trend in crystallization API-BT-2026-014"
    assert "CR-402" in result["text"]
    assert "0.38%" in result["text"]

def test_synthetic_pdf_generation_and_extraction(tmp_path):
    pdf_file = tmp_path / "test_incident.pdf"
    generate_sample_incident_pdf(str(pdf_file))
    assert os.path.exists(pdf_file)
    
    extracted_text = DocumentExtractor.extract_from_pdf(str(pdf_file))
    assert "API-BT-2026-014" in extracted_text
    assert "Atorvastatin Calcium Trihydrate" in extracted_text
    assert "CR-402" in extracted_text
    assert "0.38% w/w" in extracted_text
