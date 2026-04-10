"""
============================================================
CareConnect — Clinical NLP Extractor
Uses LangChain + OpenAI to:
  1. Extract structured clinical intent from doctor dictation
  2. Generate vector embeddings for text (for Atlas Vector Search)
============================================================
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field

from config import settings
from prompts import EXTRACTION_PROMPT


# ============================================================
# Pydantic Schema for Structured Extraction
# LangChain's with_structured_output() enforces this shape
# ============================================================
class ExtractionSchema(BaseModel):
    """Structured output schema for clinical NLP extraction."""

    symptoms: List[str] = Field(
        default_factory=list,
        description="List of symptoms, complaints, or clinical observations mentioned by the doctor."
    )
    medicationChanges: List[str] = Field(
        default_factory=list,
        description="List of medication changes: new prescriptions, dosage adjustments, or discontinued medications."
    )
    actions: List[str] = Field(
        default_factory=list,
        description="List of clinical actions ordered: follow-ups, tests, referrals, procedures."
    )


# ============================================================
# 1. Extract Clinical Intent from Raw Dictation
# ============================================================
def extract_clinical_intent(raw_text: str) -> Dict:
    """
    Parse raw physician dictation into structured JSON using
    LangChain's structured output with an LLM.

    Args:
        raw_text: The raw dictation text from the doctor.

    Returns:
        Dictionary with keys: symptoms, medicationChanges, actions
    """
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.prompts import ChatPromptTemplate

        # --- Initialize the LLM with structured output ---
        llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            api_key=settings.GOOGLE_API_KEY,
            temperature=0,  # Deterministic extraction
        )

        # Bind the Pydantic schema for guaranteed structured output
        structured_llm = llm.with_structured_output(ExtractionSchema)

        # --- Build the prompt ---
        prompt = ChatPromptTemplate.from_messages([
            ("system", EXTRACTION_PROMPT),
        ])

        # --- Run the chain ---
        chain = prompt | structured_llm
        result: ExtractionSchema = chain.invoke({"raw_text": raw_text})

        print(f"🔍 NLP Extraction complete: {len(result.symptoms)} symptoms, "
              f"{len(result.medicationChanges)} med changes, {len(result.actions)} actions")

        return result.model_dump()

    except Exception as e:
        # --- Graceful fallback ---
        print(f"⚠️  NLP extraction failed: {e}")
        print("   → Returning mock extraction.")

        return _mock_extraction(raw_text)


# ============================================================
# 2. Generate Vector Embedding for Text
# ============================================================
def generate_embedding(text: str) -> List[float]:
    """
    Convert text into a vector embedding using OpenAI's
    embedding model. Used for Atlas Vector Search indexing.

    Args:
        text: The raw text to embed.

    Returns:
        List of floats representing the embedding vector (1536-dim).
    """
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        embeddings_model = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
        )

        # Generate the embedding
        vector = embeddings_model.embed_query(text)

        print(f"📐 Embedding generated: {len(vector)} dimensions")
        return vector

    except Exception as e:
        # --- Graceful fallback ---
        # Return a zero vector so downstream code doesn't crash
        print(f"⚠️  Embedding generation failed: {e}")
        print("   → Returning mock zero vector.")

        return [0.0] * 768  # Match text-embedding-004 dimensions


# ============================================================
# Mock Fallback — Simple keyword-based extraction
# ============================================================
def _mock_extraction(raw_text: str) -> Dict:
    """
    Basic keyword matching fallback when the LLM is unavailable.
    Not medically accurate — just keeps the demo running.
    """
    text_lower = raw_text.lower()

    # Simple keyword detection
    symptom_keywords = [
        "pain", "fatigue", "swelling", "edema", "dyspnea", "cough",
        "fever", "nausea", "dizziness", "weakness", "shortness of breath",
        "crackles", "confusion", "tingling", "numbness",
    ]
    med_keywords = [
        "prescribe", "start", "increase", "decrease", "discontinue",
        "switch", "add", "mg", "bid", "tid", "daily",
    ]
    action_keywords = [
        "schedule", "order", "refer", "follow-up", "admit",
        "discharge", "reassess", "monitor", "consult",
    ]

    symptoms = [kw for kw in symptom_keywords if kw in text_lower]
    medications = [kw for kw in med_keywords if kw in text_lower]
    actions = [kw for kw in action_keywords if kw in text_lower]

    return {
        "symptoms": symptoms or ["Unable to extract — AI Engine offline"],
        "medicationChanges": medications,
        "actions": actions or ["Review note manually"],
    }
