import os
from typing import Dict, Type
from app.services.extractors.base import BaseExtractor, ExtractionResult
from app.services.extractors.pdf_extractor import PDFExtractor
from app.services.extractors.docx_extractor import DocxExtractor
from app.services.extractors.pptx_extractor import PPTXExtractor
from app.services.extractors.spreadsheet_extractor import SpreadsheetExtractor
from app.services.extractors.text_extractor import TextExtractor, JSONExtractor

EXTRACTOR_MAP: Dict[str, Type[BaseExtractor]] = {
    ".pdf": PDFExtractor,
    ".docx": DocxExtractor,
    ".pptx": PPTXExtractor,
    ".csv": SpreadsheetExtractor,
    ".xlsx": SpreadsheetExtractor,
    ".xls": SpreadsheetExtractor,
    ".txt": TextExtractor,
    ".md": TextExtractor,
    ".markdown": TextExtractor,
    ".json": JSONExtractor,
}

def extract_document(file_path: str) -> ExtractionResult:
    """Extract structured sections and metadata from file using appropriate extractor."""
    ext = os.path.splitext(file_path)[1].lower()
    extractor_cls = EXTRACTOR_MAP.get(ext, TextExtractor)
    extractor = extractor_cls()
    return extractor.extract(file_path)

