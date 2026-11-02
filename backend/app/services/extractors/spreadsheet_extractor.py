import csv
import logging
import os
from app.services.extractors.base import BaseExtractor, ExtractedSection, ExtractionResult

logger = logging.getLogger("documind.extractor.spreadsheet")

class SpreadsheetExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractionResult:
        result = ExtractionResult()
        ext = os.path.splitext(file_path)[1].lower()

        try:
            if ext == ".csv":
                self._extract_csv(file_path, result)
            else:
                self._extract_excel(file_path, result)
        except Exception as e:
            logger.error(f"Error extracting spreadsheet {file_path}: {e}")
            result.warnings.append(f"Spreadsheet extraction error: {str(e)}")

        return result

    def _extract_csv(self, file_path: str, result: ExtractionResult):
        all_lines = []
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f)
            headers = None
            row_idx = 0

            batch = []
            for row in reader:
                row_idx += 1
                if not headers:
                    headers = row
                    continue

                # Format row as column: value pairs for semantic searchability
                row_items = []
                for col_idx, val in enumerate(row):
                    col_name = headers[col_idx] if col_idx < len(headers) else f"Col_{col_idx+1}"
                    if val.strip():
                        row_items.append(f"{col_name}: {val.strip()}")

                if row_items:
                    line = f"[Row {row_idx}] " + " | ".join(row_items)
                    batch.append(line)
                    all_lines.append(line)

                # Batch every 10 rows into a section
                if len(batch) >= 10:
                    content = "\n".join(batch)
                    result.sections.append(
                        ExtractedSection(
                            content=content,
                            sheet_name="Default",
                            row_number=row_idx - len(batch) + 1,
                            heading=f"Rows {row_idx - len(batch) + 1}-{row_idx}",
                            metadata={"start_row": row_idx - len(batch) + 1, "end_row": row_idx}
                        )
                    )
                    batch = []

            if batch:
                content = "\n".join(batch)
                result.sections.append(
                    ExtractedSection(
                        content=content,
                        sheet_name="Default",
                        row_number=row_idx - len(batch) + 1,
                        heading=f"Rows {row_idx - len(batch) + 1}-{row_idx}",
                        metadata={"start_row": row_idx - len(batch) + 1, "end_row": row_idx}
                    )
                )

        result.raw_text = "\n".join(all_lines)
        result.page_count = max(1, len(all_lines) // 25)

    def _extract_excel(self, file_path: str, result: ExtractionResult):
        try:
            import pandas as pd
        except ImportError:
            result.warnings.append("pandas is required for Excel extraction.")
            return

        excel_file = pd.ExcelFile(file_path)
        all_sheet_texts = []
        result.page_count = len(excel_file.sheet_names)

        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            if df.empty:
                continue

            columns = [str(c) for c in df.columns]
            batch = []

            for idx, row in df.iterrows():
                row_num = idx + 2  # 1-indexed + header
                row_items = []
                for col in columns:
                    val = str(row[col]).strip()
                    if val and val.lower() != "nan":
                        row_items.append(f"{col}: {val}")

                if row_items:
                    line = f"[{sheet_name} Row {row_num}] " + " | ".join(row_items)
                    batch.append(line)
                    all_sheet_texts.append(line)

                if len(batch) >= 10:
                    content = "\n".join(batch)
                    result.sections.append(
                        ExtractedSection(
                            content=content,
                            sheet_name=sheet_name,
                            row_number=row_num - len(batch) + 1,
                            heading=f"{sheet_name} (Rows {row_num - len(batch) + 1}-{row_num})",
                            metadata={"sheet": sheet_name, "start_row": row_num - len(batch) + 1, "end_row": row_num}
                        )
                    )
                    batch = []

            if batch:
                content = "\n".join(batch)
                result.sections.append(
                    ExtractedSection(
                        content=content,
                        sheet_name=sheet_name,
                        row_number=row_num - len(batch) + 1,
                        heading=f"{sheet_name} (Rows {row_num - len(batch) + 1}-{row_num})",
                        metadata={"sheet": sheet_name, "start_row": row_num - len(batch) + 1, "end_row": row_num}
                    )
                )

        result.raw_text = "\n".join(all_sheet_texts)

