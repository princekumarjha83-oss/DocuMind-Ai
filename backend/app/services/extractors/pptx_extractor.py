import logging
from app.services.extractors.base import BaseExtractor, ExtractedSection, ExtractionResult

logger = logging.getLogger("documind.extractor.pptx")

class PPTXExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractionResult:
        result = ExtractionResult()

        try:
            from pptx import Presentation
        except ImportError:
            result.warnings.append("python-pptx is not installed. PPTX extraction unavailable.")
            return result

        try:
            prs = Presentation(file_path)
            result.page_count = len(prs.slides)
            all_slide_texts = []

            for slide_idx, slide in enumerate(prs.slides):
                slide_num = slide_idx + 1
                slide_title = f"Slide {slide_num}"
                slide_lines = []

                for shape in slide.shapes:
                    if shape.has_text_frame:
                        for paragraph in shape.text_frame.paragraphs:
                            text = paragraph.text.strip()
                            if text:
                                # First text frame on a title slide is usually the title
                                if not slide_lines and shape == slide.shapes[0]:
                                    slide_title = f"Slide {slide_num}: {text}"
                                slide_lines.append(text)
                    elif shape.has_table:
                        for row in shape.table.rows:
                            row_cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                            slide_lines.append(" | ".join(row_cells))

                if slide_lines:
                    content = "\n".join(slide_lines)
                    all_slide_texts.append(content)
                    result.sections.append(
                        ExtractedSection(
                            content=content,
                            slide_number=slide_num,
                            heading=slide_title,
                            metadata={"slide": slide_num, "title": slide_title}
                        )
                    )

            result.raw_text = "\n\n".join(all_slide_texts)
        except Exception as e:
            logger.error(f"Error extracting PPTX {file_path}: {e}")
            result.warnings.append(f"PPTX extraction error: {str(e)}")

        return result

