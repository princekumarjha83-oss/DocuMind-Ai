import json
import logging
import time
from typing import Any, Dict, List, Optional, Tuple
import httpx
from app.core.config import settings
from app.schemas.chat import (
    AskQuestionResponse,
    CitationSchema,
    CompareResponse,
    ExtractResponse,
    SummarizeResponse,
)

logger = logging.getLogger("documind.rag")

SYSTEM_PROMPT = """You are DocuMind AI, an elite document intelligence and conversational assistant.

Your Core Mission:
Deliver comprehensive, accurate, and deeply insightful answers about the user's uploaded documents in a POLISHED, HIGHLY PROFESSIONAL, AND EXECUTIVE FORMAT that is clear, articulate, and easy to understand.

Strict Formatting & Response Rules:
1. Direct Professional Answer:
   - Always answer the user's question directly with factual depth from the uploaded document.
   - Do NOT output generic suggestions or "Types of Questions You Can Ask" unless the user explicitly requested suggested questions.
   - Speak with executive clarity and professionalism: explain what the document says, how the concepts work, and why they matter.

2. NEVER USE MARKDOWN PIPE TABLES (| col | col |):
   - Markdown pipe tables look cluttered, cramped, and broken in chat screens.
   - NEVER generate pipe tables (| ... | ... |) or ASCII table grids.
   - Instead, ALWAYS present comparisons, multi-column data, and structured items using clean, beautiful bullet points with bold headings:
     • **Feature / Topic**: Detailed explanation...
     • **Mechanism / Field**: Detailed explanation...

3. Executive Structure for Explanations & Summaries:
   - When asked to explain, summarize, or identify what is important in a document, organize your answer like this:
     ### Executive Overview
     (A clear 2-3 sentence summary of the document's core purpose and scope)
     
     ### Key Concepts & What Is Important
     (Bulleted breakdown of the top critical findings, architecture, protocols, or requirements)
     
     ### Detailed Technical / Procedural Breakdown
     (Step-by-step or component-by-component explanation of how it works)
     
     ### Strategic Takeaway / Conclusion
     (The practical bottom line or summary of results)

4. Strict Document Grounding & Citations:
   - Answer exclusively using the verified evidence from <DOCUMENT_CONTEXT>.
   - Support every key claim with a citation tag, e.g. [Source 1, Page X] or [Doc 1].
   - If the uploaded document does not contain the answer, politely state: "Based on the provided documents, there is insufficient information to answer this question." Never fabricate facts.
"""

class RAGService:
    def __init__(self):
        self.groq_api_key = getattr(settings, "GROQ_API_KEY", "")
        self.default_model = getattr(settings, "GROQ_MODEL", "openai/gpt-oss-120b")

    def format_context(self, citations: List[CitationSchema]) -> str:
        """Format retrieved chunks into a safely sandboxed context block."""
        if not citations:
            return "No relevant document excerpts were found."

        context_blocks = []
        for idx, cite in enumerate(citations, 1):
            provenance = []
            if cite.page_number:
                provenance.append(f"Page {cite.page_number}")
            if cite.slide_number:
                provenance.append(f"Slide {cite.slide_number}")
            if cite.sheet_name:
                provenance.append(f"Sheet '{cite.sheet_name}'")
            if cite.row_number:
                provenance.append(f"Row {cite.row_number}")
            if cite.section_heading:
                provenance.append(f"Heading: '{cite.section_heading}'")

            prov_str = f" ({', '.join(provenance)})" if provenance else ""
            content_text = getattr(cite, "full_content", None) or cite.excerpt
            block = f"--- [Source {idx}: {cite.document_name}{prov_str}] ---\n{content_text}"
            context_blocks.append(block)

        return "\n\n".join(context_blocks)

    async def generate_answer(
        self,
        question: str,
        citations: List[CitationSchema],
        model: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[str, bool, int]:
        """Generate evidence-grounded answer using Groq cloud inference engine or intelligent local synthesis."""
        start_time = time.time()
        context_str = self.format_context(citations)

        # Check if we have sufficient retrieval context
        if not citations:
            return (
                "Based on the uploaded documents, there is no relevant information available to answer this question. Please make sure the relevant document is selected and processed.",
                False,
                int((time.time() - start_time) * 1000)
            )

        prompt = f"""<DOCUMENT_CONTEXT>
{context_str}
</DOCUMENT_CONTEXT>

User Question: {question}

Provide an accurate, evidence-backed answer based strictly on the document context above with citations."""

        # 1. Primary Engine: Ultra-Fast Groq Cloud Inference
        if self.groq_api_key:
            try:
                answer = await self._call_groq(prompt, model=model)
                latency = int((time.time() - start_time) * 1000)
                has_evidence = "insufficient information" not in answer.lower()
                return answer, has_evidence, latency
            except Exception as e:
                logger.error(f"Groq LLM call failed: {e}. Falling back to grounded synthesis.")

        # 2. Grounded Synthesis Fallback (Used during offline automated tests)
        answer = self._synthesize_grounded_response(question, citations)
        latency = int((time.time() - start_time) * 1000)
        return answer, True, latency

    async def _call_groq(self, prompt: str, model: Optional[str] = None) -> str:
        """Execute chat completion against Groq API with robust multi-model fallback."""
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }

        # Build candidate models list prioritizing fast & high-capacity models
        candidates = []
        if model:
            candidates.append(model)
        if self.default_model and self.default_model not in candidates:
            candidates.append(self.default_model)
        for preferred in ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"]:
            if preferred not in candidates:
                candidates.append(preferred)

        last_error = None
        async with httpx.AsyncClient(timeout=45.0) as client:
            for candidate in candidates:
                payload = {
                    "model": candidate,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2
                }
                try:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        logger.warning(f"Groq model '{candidate}' returned {resp.status_code}: {resp.text}. Trying next candidate.")
                        last_error = f"HTTP {resp.status_code}: {resp.text}"
                except Exception as e:
                    logger.warning(f"Groq invocation to '{candidate}' failed: {e}. Trying next candidate.")
                    last_error = str(e)

        raise RuntimeError(f"All Groq models failed. Last error: {last_error}")

    async def list_available_groq_models(self) -> List[Dict[str, Any]]:
        """Fetch all models currently available under this Groq API key."""
        if not self.groq_api_key:
            return []
        url = "https://api.groq.com/openai/v1/models"
        headers = {"Authorization": f"Bearer {self.groq_api_key}"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    data = resp.json().get("data", [])
                    models = []
                    for m in data:
                        mid = m.get("id", "")
                        # Include text and code generation models
                        if not mid.startswith("whisper") and "prompt-guard" not in mid:
                            models.append({
                                "id": mid,
                                "name": mid.split("/")[-1].replace("-", " ").title(),
                                "owned_by": m.get("owned_by", "groq")
                            })
                    return models
        except Exception as e:
            logger.warning(f"Failed to fetch Groq models list: {e}")
        return [
            {"id": "openai/gpt-oss-120b", "name": "GPT-OSS 120B (High Reasoning Quality)", "owned_by": "groq"},
            {"id": "openai/gpt-oss-20b", "name": "GPT-OSS 20B (Fast)", "owned_by": "groq"},
            {"id": "qwen/qwen3.8-27b", "name": "Qwen 3.8 27B", "owned_by": "groq"},
        ]

    def _synthesize_grounded_response(self, question: str, citations: List[CitationSchema]) -> str:
        """Grounded synthesis engine that extracts facts directly from retrieved chunks."""
        top_citations = citations[:3]
        doc_names = list(dict.fromkeys(c.document_name for c in top_citations))

        summary_parts = []
        for idx, cite in enumerate(top_citations, 1):
            prov = f"Page {cite.page_number}" if cite.page_number else (cite.section_heading or f"Section {idx}")
            summary_parts.append(f"**From {cite.document_name} ({prov})**:\n> \"{cite.excerpt.strip()}\"")

        joined_evidence = "\n\n".join(summary_parts)

        return (
            f"Based on your documents ({', '.join(doc_names)}), here is the verified evidence regarding **\"{question}\"**:\n\n"
            f"{joined_evidence}\n\n"
            f"*(Generated from verified source citations with relevance score {top_citations[0].relevance_score:.0%})*"
        )

    def generate_summary(self, doc_title: str, text: str, format_type: str = "concise") -> Tuple[str, List[str], List[Dict[str, Any]]]:
        """Generate structured document summary, key points, or action items."""
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
        lead_text = " ".join(paragraphs[:3])[:600]

        key_points = []
        action_items = []

        lines = text.split("\n")
        for line in lines:
            line_clean = line.strip(" -*•\t")
            if any(kw in line.lower() for kw in ["must", "action", "task", "todo", "assigned", "deadline", "by"]):
                if len(line_clean) > 10 and len(action_items) < 5:
                    action_items.append({"action": line_clean, "assignee": "Document Lead", "status": "pending"})
            elif any(kw in line.lower() for kw in ["key", "important", "finding", "result", "revenue", "conclusion", "summary"]):
                if len(line_clean) > 15 and len(key_points) < 6:
                    key_points.append(line_clean)

        if not key_points and paragraphs:
            key_points = [p[:120] + "..." for p in paragraphs[:4]]

        if format_type == "action_items":
            summary = f"Identified {len(action_items)} key actionable items from **{doc_title}**."
        elif format_type == "key_points":
            summary = f"Extracted {len(key_points)} core findings and takeaway points from **{doc_title}**."
        elif format_type == "detailed":
            summary = (
                f"### Executive Overview of {doc_title}\n\n"
                f"{lead_text}\n\n"
                f"### Structural Breakdown\n"
                f"- **Total Extracted Sections**: {len(paragraphs)} paragraph clusters\n"
                f"- **Key Takeaway Count**: {len(key_points)} identified points\n"
            )
        else:
            summary = f"**{doc_title} Summary**: {lead_text}..."

        return summary, key_points, action_items

rag_service = RAGService()
