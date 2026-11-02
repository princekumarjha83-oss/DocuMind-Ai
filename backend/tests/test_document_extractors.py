import os
import tempfile
import pytest
from app.services.extractors.registry import extract_document
from app.services.extractors.text_extractor import TextExtractor, JSONExtractor
from app.services.extractors.spreadsheet_extractor import SpreadsheetExtractor

def test_text_and_markdown_extraction():
    md_content = """# Company Overview
DocuMind AI provides universal document intelligence for enterprises.

## Security Architecture
All embeddings are encrypted at rest with AES-GCM-256.

## Compliance
SOC 2 Type II certified.
"""
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
        f.write(md_content)
        temp_path = f.name

    try:
        res = extract_document(temp_path)
        assert len(res.sections) >= 2
        assert "DocuMind AI" in res.raw_text
        headings = [s.heading for s in res.sections]
        assert "Security Architecture" in headings or "Company Overview" in headings
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_json_extraction():
    json_data = '{"name": "DocuMind AI", "version": "1.0.0", "features": ["rag", "citations", "ocr"]}'
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        f.write(json_data)
        temp_path = f.name

    try:
        res = extract_document(temp_path)
        assert "DocuMind AI" in res.raw_text
        assert "features" in res.raw_text or "rag" in res.raw_text
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_csv_spreadsheet_extraction():
    csv_content = """Product,Quarter,Revenue,Growth
DocuMind Enterprise,Q1,$1.2M,18%
DocuMind Pro,Q2,$2.4M,24%
DocuMind Starter,Q3,$3.8M,35%
"""
    with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, encoding="utf-8") as f:
        f.write(csv_content)
        temp_path = f.name

    try:
        res = extract_document(temp_path)
        assert "Revenue: $1.2M" in res.raw_text or "$1.2M" in res.raw_text
        assert len(res.sections) >= 1
        assert res.sections[0].sheet_name == "Default"
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_docx_extraction_integration():
    try:
        import docx
        doc = docx.Document()
        doc.add_heading("Financial Report 2026", level=1)
        doc.add_paragraph("Total revenue grew by 42% year-over-year.")
        table = doc.add_table(rows=2, cols=2)
        table.cell(0, 0).text = "Metric"
        table.cell(0, 1).text = "Value"
        table.cell(1, 0).text = "Net Margin"
        table.cell(1, 1).text = "28.5%"

        with tempfile.NamedTemporaryFile("wb", suffix=".docx", delete=False) as f:
            doc.save(f.name)
            temp_path = f.name

        try:
            res = extract_document(temp_path)
            assert "revenue grew by 42%" in res.raw_text
            assert "Net Margin" in res.raw_text
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except ImportError:
        pytest.skip("python-docx not installed in test environment")

