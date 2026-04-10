"""
============================================================
CareConnect — FastAPI Endpoints
All API routes for the AI Engine microservice.
These endpoints are called by the Node.js API Gateway.
============================================================
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

from services.databricks_client import get_risk_score
from services.nlp_extractor import extract_clinical_intent, generate_embedding
from services.llm_rag_service import generate_patient_summary, query_copilot

# ---------- FastAPI Router ----------
router = APIRouter(tags=["AI Engine"])


# ============================================================
# Pydantic Request/Response Models
# ============================================================

class PredictRiskRequest(BaseModel):
    """Input for risk prediction endpoint."""
    patient_features: Dict[str, Any] = Field(
        ...,
        description="Dictionary of patient features for the ML model",
        examples=[{
            "age": 72,
            "systolicBP": 148,
            "diastolicBP": 92,
            "bloodSugar": 115,
            "medicationsTaken": False,
            "baselineRiskScore": 60,
        }],
    )


class PredictRiskResponse(BaseModel):
    """Output from risk prediction."""
    riskScore: float = Field(..., description="Predicted 30-day readmission risk (0-100)")
    source: str = Field(default="databricks", description="Score source (databricks or mock)")


class ExtractNoteRequest(BaseModel):
    """Input for clinical NLP extraction."""
    rawText: str = Field(
        ...,
        min_length=5,
        description="Raw physician dictation text",
        examples=["Patient reports persistent fatigue. Increased Lasix to 40mg BID. Schedule follow-up in 3 days."],
    )


class ExtractNoteResponse(BaseModel):
    """Output from NLP extraction."""
    symptoms: List[str]
    medicationChanges: List[str]
    actions: List[str]
    embedding: List[float] = Field(
        default_factory=list,
        description="Vector embedding of the raw text (1536-dim)",
    )


class GenerateSummaryRequest(BaseModel):
    """Input for patient summary generation."""
    vitals: Dict[str, Any] = Field(
        ...,
        description="Patient vitals data",
        examples=[{
            "patientName": "Rajesh Mehta",
            "systolicBP": 148,
            "diastolicBP": 92,
            "bloodSugar": 115,
            "medicationsTaken": True,
        }],
    )


class GenerateSummaryResponse(BaseModel):
    """Output from summary generation."""
    summary: str = Field(..., description="LLM-generated patient summary")


class RAGQueryRequest(BaseModel):
    """Input for the RAG copilot."""
    patientId: str = Field(..., description="MongoDB ObjectId of the patient")
    query: str = Field(
        ...,
        min_length=3,
        description="Doctor's natural language question",
        examples=["What were the BP trends over the last 3 admissions?"],
    )


class RAGQueryResponse(BaseModel):
    """Output from the RAG copilot."""
    answer: str = Field(..., description="LLM-generated answer grounded in patient history")
    sources: List[str] = Field(default_factory=list, description="Source references")


# ============================================================
# 1. POST /api/predict-risk
#    Proxy to Databricks XGBoost model
# ============================================================
@router.post(
    "/predict-risk",
    response_model=PredictRiskResponse,
    summary="Predict Readmission Risk",
    description="Forward patient features to the Databricks XGBoost model for risk prediction.",
)
async def predict_risk(request: PredictRiskRequest):
    """Predict 30-day readmission risk score."""
    try:
        score = get_risk_score(request.patient_features)
        return PredictRiskResponse(
            riskScore=score,
            source="databricks" if score != 42.5 else "mock",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk prediction failed: {str(e)}")


# ============================================================
# 2. POST /api/extract-note
#    NLP extraction from doctor dictation
# ============================================================
@router.post(
    "/extract-note",
    response_model=ExtractNoteResponse,
    summary="Extract Clinical Intent",
    description="Parse raw physician dictation into structured symptoms, medications, and actions.",
)
async def extract_note(request: ExtractNoteRequest):
    """Extract structured clinical intent from dictation text."""
    try:
        # --- Extract structured data ---
        extracted = extract_clinical_intent(request.rawText)

        # --- Generate embedding for vector indexing ---
        embedding = generate_embedding(request.rawText)

        return ExtractNoteResponse(
            symptoms=extracted.get("symptoms", []),
            medicationChanges=extracted.get("medicationChanges", []),
            actions=extracted.get("actions", []),
            embedding=embedding,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP extraction failed: {str(e)}")


# ============================================================
# 3. POST /api/generate-summary
#    LLM-powered patient vitals summary
# ============================================================
@router.post(
    "/generate-summary",
    response_model=GenerateSummaryResponse,
    summary="Generate Patient Summary",
    description="Generate a Grade-6 readability summary from patient vitals using the LLM.",
)
async def generate_summary(request: GenerateSummaryRequest):
    """Generate an empathetic, simple patient summary."""
    try:
        summary = generate_patient_summary(request.vitals)
        return GenerateSummaryResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")


# ============================================================
# 4. POST /api/rag-query
#    RAG Copilot — Vector search + LLM reasoning
# ============================================================
@router.post(
    "/rag-query",
    response_model=RAGQueryResponse,
    summary="RAG Copilot Query",
    description="Answer a doctor's question using patient history via RAG (Vector Search + LLM).",
)
async def rag_query(request: RAGQueryRequest):
    """Query the RAG Medical Copilot about a specific patient."""
    try:
        answer = query_copilot(request.patientId, request.query)
        return RAGQueryResponse(
            answer=answer,
            sources=["ClinicalNotes", "VitalsLogs"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")
