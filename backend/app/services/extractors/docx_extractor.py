import logging
from app.services.extractors.base import BaseExtractor, ExtractedSection, ExtractionResult

logger = logging.getLogger("documind.extractor.docx")

class DocxExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractionResult:
        result = ExtractionResult()

        try:
            import docx
        except ImportError:
            result.warnings.append("python-docx is not installed. DOCX extraction unavailable.")
            return result

        try:
            doc = docx.Document(file_path)
            current_heading = "Introduction"
            current_section_lines = []
            all_text_blocks = []

            for paragraph in doc.paragraphs:
                text = paragraph.text.strip()
                if not text:
                    continue

                # Check if paragraph is a heading style
                style_name = paragraph.style.name.lower() if paragraph.style else ""
                if "heading" in style_name or "title" in style_name:
                    if current_section_lines:
                        section_text = "\n".join(current_section_lines)
                        all_text_blocks.append(section_text)
                        result.sections.append(
                            ExtractedSection(
                                content=section_text,
                                heading=current_heading,
                                metadata={"heading": current_heading}
                            )
                        )
                        current_section_lines = []
                    current_heading = text
                else:
                    current_section_lines.append(text)

            # Flush remaining paragraph lines
            if current_section_lines:
                section_text = "\n".join(current_section_lines)
                all_text_blocks.append(section_text)
                result.sections.append(
                    ExtractedSection(
                        content=section_text,
                        heading=current_heading,
                        metadata={"heading": current_heading}
                    )
                )

            # Extract tables preserving tabular structure
            for table_idx, table in enumerate(doc.tables):
                table_lines = []
                for row_idx, row in enumerate(table.rows):
                    row_cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                    table_lines.append(" | ".join(row_cells))

                if table_lines:
                    table_content = "\n".join(table_lines)
                    table_heading = f"Table {table_idx + 1}"
                    all_text_blocks.append(table_content)
                    result.sections.append(
                        ExtractedSection(
                            content=table_content,
                            heading=table_heading,
                            metadata={"table_index": table_idx + 1, "is_table": True}
                        )
                    )

            result.raw_text = "\n\n".join(all_text_blocks)
            result.page_count = max(1, len(result.sections) // 3)
        except Exception as e:
            logger.error(f"Error extracting DOCX {file_path}: {e}")
            result.warnings.append(f"DOCX extraction error: {str(e)}")

        return result

