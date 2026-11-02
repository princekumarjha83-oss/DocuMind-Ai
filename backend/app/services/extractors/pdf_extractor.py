import logging
import os
from typing import Optional
from app.services.extractors.base import BaseExtractor, ExtractedSection, ExtractionResult

logger = logging.getLogger("documind.extractor.pdf")

class PDFExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractionResult:
        result = ExtractionResult()
        
        try:
            import fitz  # PyMuPDF
        except ImportError:
            result.warnings.append("PyMuPDF (fitz) is not installed. PDF extraction unavailable.")
            return result

        try:
            doc = fitz.open(file_path)
            result.page_count = len(doc)
            result.metadata = {
                "title": doc.metadata.get("title") or "",
                "author": doc.metadata.get("author") or "",
                "subject": doc.metadata.get("subject") or "",
                "creator": doc.metadata.get("creator") or "",
                "producer": doc.metadata.get("producer") or "",
                "page_count": len(doc)
            }

            all_page_texts = []
            for page_index in range(len(doc)):
                page_num = page_index + 1
                page = doc[page_index]
                text = page.get_text("text").strip()

                if text:
                    all_page_texts.append(text)
                    result.sections.append(
                        ExtractedSection(
                            content=text,
                            page_number=page_num,
                            heading=f"Page {page_num}",
                            metadata={"page": page_num}
                        )
                    )

            result.raw_text = "\n\n".join(all_page_texts)

            # Check if this might be a scanned document (minimal or no extractable text)
            if len(result.raw_text.strip()) < 50 and len(doc) > 0:
                logger.info(f"PDF {file_path} contains low extractable text ({len(result.raw_text)} chars). Attempting OCR.")
                ocr_success = self._attempt_ocr(doc, result)
                if not ocr_success:
                    result.warnings.append(
                        "Scanned PDF detected with minimal extractable text. "
                        "OCR engine (Tesseract) is either not installed or not configured."
                    )

            doc.close()
        except Exception as e:
            logger.error(f"Error extracting PDF {file_path}: {e}")
            result.warnings.append(f"PDF extraction error: {str(e)}")

        return result

    def _attempt_ocr(self, doc, result: ExtractionResult) -> bool:
        """Attempt OCR on scanned PDF pages using pytesseract if available."""
        try:
            import pytesseract
            from PIL import Image
            import io
            
            ocr_texts = []
            for page_index in range(min(len(doc), 20)):  # Guard max 20 pages for OCR
                page_num = page_index + 1
                page = doc[page_index]
                pix = page.get_pixmap(dpi=150)
                img_data = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_data))
                
                page_ocr_text = pytesseract.image_to_string(image).strip()
                if page_ocr_text:
                    ocr_texts.append(page_ocr_text)
                    result.sections.append(
                        ExtractedSection(
                            content=page_ocr_text,
                            page_number=page_num,
                            heading=f"Page {page_num} (OCR)",
                            metadata={"page": page_num, "is_ocr": True}
                        )
                    )

            if ocr_texts:
                result.raw_text = "\n\n".join(ocr_texts)
                result.is_ocr_used = True
                return True
        except Exception as e:
            logger.debug(f"OCR attempt failed: {e}")
        return False

