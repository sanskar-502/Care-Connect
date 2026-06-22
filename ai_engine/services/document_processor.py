import base64
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser

from config import settings
from prompts import DOCUMENT_EXTRACTION_PROMPT, PATIENT_INSIGHTS_PROMPT
from services.nlp_extractor import generate_embedding

# We'll use structured output
class DocumentExtractionSchema(BaseModel):
    diagnosis: str = Field(description="Primary diagnosis or impression")
    medications: List[str] = Field(description="List of medications")
    testResults: List[str] = Field(description="Summary of key lab/imaging results")
    recommendations: List[str] = Field(description="Follow-up actions or procedures")

class PatientInsightsSchema(BaseModel):
    currentCondition: str = Field(description="2-3 sentence summary of current stability")
    risks: List[str] = Field(description="1-3 specific clinical risks")
    recommendations: List[str] = Field(description="1-3 actionable recommendations")

def process_document_with_gemini(mime_type: str, file_b64: str) -> Dict[str, Any]:
    """
    Passes the base64 file to Gemini Vision for OCR and semantic extraction.
    """
    try:
        # Initialize multimodal LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", # Use the vision-capable model
            api_key=settings.GOOGLE_API_KEY,
            temperature=0,
        )

        parser = JsonOutputParser(pydantic_object=DocumentExtractionSchema)
        format_instructions = parser.get_format_instructions()

        # Build multimodal message
        message = HumanMessage(
            content=[
                {"type": "text", "text": f"{DOCUMENT_EXTRACTION_PROMPT}\n\n{format_instructions}"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{file_b64}"},
                },
            ]
        )

        response = llm.invoke([message])
        extracted = parser.invoke(response)

        # Generate a textual summary for vector search embedding
        doc_summary = f"Diagnosis: {extracted.get('diagnosis')}. " \
                      f"Meds: {', '.join(extracted.get('medications', []))}. " \
                      f"Results: {', '.join(extracted.get('testResults', []))}. " \
                      f"Recs: {', '.join(extracted.get('recommendations', []))}."
        
        embedding = generate_embedding(doc_summary)

        return {
            "extracted": extracted,
            "rawText": doc_summary, # We save the summary as the raw text for RAG fallback
            "embedding": embedding
        }

    except Exception as e:
        print(f"⚠️  Document extraction failed: {e}")
        return {
            "extracted": {
                "diagnosis": "Extraction failed",
                "medications": [],
                "testResults": [],
                "recommendations": []
            },
            "rawText": "Extraction failed due to an error.",
            "embedding": [0.0] * 768
        }

def generate_patient_insights(context_text: str) -> Dict[str, Any]:
    """
    Generates holistic patient insights based on all their records.
    """
    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
        )

        parser = JsonOutputParser(pydantic_object=PatientInsightsSchema)
        
        prompt = f"{PATIENT_INSIGHTS_PROMPT}\n\n{parser.get_format_instructions()}\n\n--- PATIENT CONTEXT ---\n{context_text}\n--- END CONTEXT ---"
        
        response = llm.invoke([HumanMessage(content=prompt)])
        return parser.invoke(response)
        
    except Exception as e:
        print(f"⚠️  Patient insights generation failed: {e}")
        return {
            "currentCondition": "Unable to generate insights at this time.",
            "risks": [],
            "recommendations": []
        }
