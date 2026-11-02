import json
import logging
import re
from typing import Any
from app.services.extractors.base import BaseExtractor, ExtractedSection, ExtractionResult

logger = logging.getLogger("documind.extractor.text")

class TextExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractionResult:
        result = ExtractionResult()

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()

            result.raw_text = content
            lines = content.split("\n")
            result.page_count = max(1, len(lines) // 40)

            # Segment by Markdown headings or paragraphs
            current_heading = "Content"
            current_chunk = []

            for line in lines:
                heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)
                if heading_match:
                    if current_chunk:
                        chunk_text = "\n".join(current_chunk).strip()
                        if chunk_text:
                            result.sections.append(
                                ExtractedSection(
                                    content=chunk_text,
                                    heading=current_heading,
                                    metadata={"heading": current_heading}
                                )
                            )
                        current_chunk = []
                    current_heading = heading_match.group(2).strip()
                else:
                    current_chunk.append(line)

            if current_chunk:
                chunk_text = "\n".join(current_chunk).strip()
                if chunk_text:
                    result.sections.append(
                        ExtractedSection(
                            content=chunk_text,
                            heading=current_heading,
                            metadata={"heading": current_heading}
                        )
                    )

            if not result.sections and content.strip():
                result.sections.append(
                    ExtractedSection(content=content.strip(), heading="Full Document")
                )
        except Exception as e:
            logger.error(f"Error extracting text file {file_path}: {e}")
            result.warnings.append(f"Text extraction error: {str(e)}")

        return result

class JSONExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractionResult:
        result = ExtractionResult()

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                data = json.load(f)

            records = []
            if isinstance(data, list):
                for idx, item in enumerate(data):
                    flattened = self._flatten_dict(item) if isinstance(item, dict) else str(item)
                    text = f"[Item {idx + 1}] {flattened}"
                    records.append(text)
                    result.sections.append(
                        ExtractedSection(content=text, heading=f"Item {idx + 1}")
                    )
            elif isinstance(data, dict):
                for key, val in data.items():
                    flattened = self._flatten_dict(val) if isinstance(val, dict) else str(val)
                    text = f"[{key}] {flattened}"
                    records.append(text)
                    result.sections.append(
                        ExtractedSection(content=text, heading=str(key))
                    )
            else:
                text = str(data)
                records.append(text)
                result.sections.append(ExtractedSection(content=text, heading="Root"))

            result.raw_text = "\n\n".join(records)
            result.page_count = max(1, len(records) // 10)
        except Exception as e:
            logger.error(f"Error extracting JSON {file_path}: {e}")
            result.warnings.append(f"JSON extraction error: {str(e)}")

        return result

    def _flatten_dict(self, d: Any, prefix: str = "") -> str:
        if not isinstance(d, dict):
            return str(d)
        items = []
        for k, v in d.items():
            field_name = f"{prefix}.{k}" if prefix else str(k)
            if isinstance(v, dict):
                items.append(self._flatten_dict(v, field_name))
            elif isinstance(v, list):
                items.append(f"{field_name}: [{', '.join(str(x) for x in v[:5])}]")
            else:
                items.append(f"{field_name}: {v}")
        return " | ".join(items)
