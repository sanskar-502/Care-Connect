"""
============================================================
CareConnect — LLM RAG Service
Handles:
  1. Patient vitals summaries (LLM-generated, Grade 6 readability)
  2. RAG Copilot queries (Vector Search + LLM reasoning)
============================================================
"""

from typing import Optional
from pymongo import MongoClient

from config import settings
from prompts import SUMMARY_PROMPT, RAG_PROMPT
from services.nlp_extractor import generate_embedding


# ============================================================
# MongoDB Client (lazy-initialized singleton)
# ============================================================
_mongo_client: Optional[MongoClient] = None


def _get_mongo_db():
    """Get or create the MongoDB client and return the database."""
    global _mongo_client
    try:
        if _mongo_client is None:
            _mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
            # Force a connection test
            _mongo_client.admin.command("ping")
            print("✅ MongoDB connected from AI Engine")
        return _mongo_client[settings.DB_NAME]
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        return None


# ============================================================
# 1. Generate Patient Summary
#    Takes raw vitals data and produces a human-friendly,
#    Grade-6 readability summary using the LLM.
# ============================================================
def generate_patient_summary(vitals_data: dict) -> str:
    """
    Generate a reassuring, simple patient summary from vitals.

    Args:
        vitals_data: Dictionary containing vitals like
            systolicBP, diastolicBP, bloodSugar, medicationsTaken, etc.

    Returns:
        A plain-language summary string.
    """
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.prompts import ChatPromptTemplate

        # --- Initialize LLM ---
        llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            api_key=settings.GOOGLE_API_KEY,
            temperature=0.7,  # Slightly creative for natural language
        )

        # --- Format the vitals into a readable string ---
        vitals_str = _format_vitals(vitals_data)

        # --- Build and run the chain ---
        prompt = ChatPromptTemplate.from_messages([
            ("system", SUMMARY_PROMPT),
        ])

        chain = prompt | llm
        result = chain.invoke({"vitals": vitals_str})

        summary = result.content.strip()
        print(f"📝 Summary generated: {summary[:80]}...")
        return summary

    except Exception as e:
        # --- Graceful fallback ---
        print(f"⚠️  Summary generation failed: {e}")
        return _mock_summary(vitals_data)


# ============================================================
# 2. RAG Copilot — Query Patient History
#    Performs vector search on MongoDB Atlas, retrieves
#    relevant context, and uses the LLM to answer.
# ============================================================
def query_copilot(patient_id: str, question: str) -> str:
    """
    Answer a doctor's question about a specific patient using
    RAG (Retrieval-Augmented Generation).

    Flow:
      1. Embed the question
      2. Vector search on ClinicalNotes + VitalsLogs (filtered by patientId)
      3. Retrieve Top 5 chunks
      4. Pass context + question to LLM

    Args:
        patient_id: MongoDB ObjectId string of the patient.
        question: The doctor's natural language question.

    Returns:
        An LLM-generated answer grounded in patient history.
    """
    try:
        # --- Step 1: Generate question embedding ---
        question_embedding = generate_embedding(question)

        # --- Step 2: Retrieve context via Vector Search ---
        context_chunks = _vector_search(patient_id, question_embedding)

        if not context_chunks:
            # If no chunks found, try a text-based fallback search
            context_chunks = _text_fallback_search(patient_id)

        if not context_chunks:
            return (
                "No clinical records found for this patient in the database. "
                "Please ensure the patient has documented clinical notes or vitals logs."
            )

        # --- Step 3: Build context string ---
        context_str = "\n\n".join([
            f"[{chunk.get('type', 'note')} — {chunk.get('date', 'unknown date')}]\n{chunk.get('text', '')}"
            for chunk in context_chunks
        ])

        # --- Step 4: LLM reasoning with RAG prompt ---
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.prompts import ChatPromptTemplate

        llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            api_key=settings.GOOGLE_API_KEY,
            temperature=0,  # Deterministic for medical queries
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", RAG_PROMPT),
        ])

        chain = prompt | llm
        result = chain.invoke({
            "context": context_str,
            "question": question,
        })

        answer = result.content.strip()
        print(f"🤖 RAG answer: {answer[:80]}...")
        return answer

    except Exception as e:
        # --- Graceful fallback ---
        print(f"⚠️  RAG copilot failed: {e}")
        return (
            f"[Mock Response] The AI Engine encountered an error processing your query. "
            f"Your question \"{question}\" for patient {patient_id} has been logged. "
            f"In production, this would search the patient's full clinical history "
            f"via MongoDB Atlas Vector Search and generate a grounded response."
        )


# ============================================================
# Vector Search — MongoDB Atlas
# ============================================================
def _vector_search(patient_id: str, query_embedding: list, top_k: int = 5) -> list:
    """
    Perform MongoDB Atlas Vector Search on ClinicalNotes.

    CRITICAL: Pre-filters by patientId to prevent cross-patient data leakage.
    """
    try:
        db = _get_mongo_db()
        if db is None:
            return []

        collection = db[settings.COLLECTION_CLINICAL_NOTES]

        # --- Atlas Vector Search aggregation pipeline ---
        # Uses the $vectorSearch stage (Atlas-specific)
        pipeline = [
            {
                "$vectorSearch": {
                    "index": settings.VECTOR_INDEX_NAME,
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 50,
                    "limit": top_k,
                    # CRITICAL: Pre-filter to prevent data leakage
                    "filter": {
                        "patientId": patient_id
                    }
                }
            },
            {
                "$project": {
                    "text": "$rawText",
                    "type": "clinical_note",
                    "date": "$timestamp",
                    "score": {"$meta": "vectorSearchScore"},
                    "_id": 0,
                }
            }
        ]

        results = list(collection.aggregate(pipeline))
        print(f"🔎 Vector search returned {len(results)} chunks for patient {patient_id}")
        return results

    except Exception as e:
        print(f"⚠️  Vector search failed: {e}")
        return []


# ============================================================
# Text Fallback Search — Simple MongoDB Query
# Used when vector search is not configured or fails.
# ============================================================
def _text_fallback_search(patient_id: str, limit: int = 5) -> list:
    """
    Fallback: Regular MongoDB find() on ClinicalNotes and VitalsLogs.
    Used during hackathon if Atlas Vector Search index isn't set up.
    """
    try:
        db = _get_mongo_db()
        if db is None:
            return []

        chunks = []

        # --- Fetch recent clinical notes ---
        notes = db[settings.COLLECTION_CLINICAL_NOTES].find(
            {"patientId": patient_id}
        ).sort("timestamp", -1).limit(limit)

        for note in notes:
            chunks.append({
                "type": "clinical_note",
                "date": str(note.get("timestamp", "")),
                "text": note.get("rawText", ""),
            })

        # --- Fetch recent vitals ---
        vitals = db[settings.COLLECTION_VITALS_LOGS].find(
            {"patientId": patient_id}
        ).sort("timestamp", -1).limit(limit)

        for v in vitals:
            chunks.append({
                "type": "vitals_log",
                "date": str(v.get("timestamp", "")),
                "text": (
                    f"BP: {v.get('systolicBP', '?')}/{v.get('diastolicBP', '?')}, "
                    f"Sugar: {v.get('bloodSugar', '?')} mg/dL, "
                    f"Medications taken: {'Yes' if v.get('medicationsTaken') else 'No'}"
                ),
            })

        print(f"📄 Text fallback returned {len(chunks)} chunks for patient {patient_id}")
        return chunks

    except Exception as e:
        print(f"⚠️  Text fallback search failed: {e}")
        return []


# ============================================================
# Helpers
# ============================================================
def _format_vitals(vitals_data: dict) -> str:
    """Format vitals dictionary into a human-readable string."""
    parts = []

    if "systolicBP" in vitals_data and "diastolicBP" in vitals_data:
        parts.append(f"Blood Pressure: {vitals_data['systolicBP']}/{vitals_data['diastolicBP']} mmHg")
    if "bloodSugar" in vitals_data:
        parts.append(f"Blood Sugar: {vitals_data['bloodSugar']} mg/dL")
    if "medicationsTaken" in vitals_data:
        status = "Yes" if vitals_data["medicationsTaken"] else "No"
        parts.append(f"Medications Taken Today: {status}")
    if "patientName" in vitals_data:
        parts.append(f"Patient: {vitals_data['patientName']}")

    return "; ".join(parts) if parts else str(vitals_data)


def _mock_summary(vitals_data: dict) -> str:
    """Generate a mock summary when the LLM is unavailable."""
    bp = f"{vitals_data.get('systolicBP', '?')}/{vitals_data.get('diastolicBP', '?')}"
    sugar = vitals_data.get("bloodSugar", "?")
    meds = "taken" if vitals_data.get("medicationsTaken", True) else "NOT taken"

    return (
        f"Your vitals today show a blood pressure of {bp} and blood sugar of {sugar} mg/dL. "
        f"Your medications were {meds}. Keep following your care plan — you're doing great! 💙"
    )
