from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List

from services.document_processor import process_document_with_gemini, generate_patient_insights

router = APIRouter(tags=["Document & Insights"])

class ProcessDocumentRequest(BaseModel):
    patientId: str = Field(..., description="MongoDB ObjectId of the patient")
    mimeType: str = Field(..., description="MIME type of the file (e.g., application/pdf, image/png)")
    fileBase64: str = Field(..., description="Base64 encoded string of the file")

class ProcessDocumentResponse(BaseModel):
    extracted: Dict[str, Any]
    rawText: str
    embedding: List[float]

class GenerateInsightsRequest(BaseModel):
    context: str = Field(..., description="The combined text context of the patient's history")

class GenerateInsightsResponse(BaseModel):
    currentCondition: str
    risks: List[str]
    recommendations: List[str]

@router.post(
    "/process-document",
    response_model=ProcessDocumentResponse,
    summary="Process Medical Document",
    description="Extract structured medical data from an uploaded document using Gemini Vision."
)
async def process_document(request: ProcessDocumentRequest):
    try:
        result = process_document_with_gemini(request.mimeType, request.fileBase64)
        
        # --- Save to ChromaDB ---
        from services.chroma_service import add_record
        add_record(request.patientId, result.get("rawText", ""), result.get("embedding", []), "medical_document")
        
        return ProcessDocumentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/generate-insights",
    response_model=GenerateInsightsResponse,
    summary="Generate Patient Insights",
    description="Generate holistic patient insights based on full context."
)
async def generate_insights(request: GenerateInsightsRequest):
    try:
        result = generate_patient_insights(request.context)
        return GenerateInsightsResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
