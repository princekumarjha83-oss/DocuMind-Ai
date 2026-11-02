from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

@dataclass
class ExtractedSection:
    content: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    sheet_name: Optional[str] = None
    row_number: Optional[int] = None
    heading: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ExtractionResult:
    sections: List[ExtractedSection] = field(default_factory=list)
    raw_text: str = ""
    page_count: int = 1
    metadata: Dict[str, Any] = field(default_factory=dict)
    is_ocr_used: bool = False
    warnings: List[str] = field(default_factory=list)

class BaseExtractor(ABC):
    @abstractmethod
    def extract(self, file_path: str) -> ExtractionResult:
        """Extract structured text and section boundaries from file."""
        pass

