"""
============================================================
CareConnect — AI Engine Configuration
Loads environment variables securely from .env
============================================================
"""

import os
from dotenv import load_dotenv

# Load .env file from the same directory
load_dotenv()


class Settings:
    """
    Centralized configuration loaded from environment variables.
    All AI Engine services import from this single source of truth.
    """

    # --- Google AI ---
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")

    # --- MongoDB Atlas ---
    MONGO_URI: str = os.getenv("MONGO_URI", "")

    # --- Databricks Model Serving ---
    DATABRICKS_HOST: str = os.getenv("DATABRICKS_HOST", "")
    DATABRICKS_TOKEN: str = os.getenv("DATABRICKS_TOKEN", "")

    # --- Server ---
    AI_ENGINE_PORT: int = int(os.getenv("AI_ENGINE_PORT", "8000"))

    # --- Model Names ---
    LLM_MODEL: str = "gemini-2.5-flash-lite"             # Speed and context width
    EMBEDDING_MODEL: str = "models/text-embedding-004"  # 768-dim embeddings

    # --- MongoDB Collection Names ---
    DB_NAME: str = "careconnect"
    COLLECTION_CLINICAL_NOTES: str = "clinicalnotes"
    COLLECTION_VITALS_LOGS: str = "vitalslogs"
    COLLECTION_PATIENTS: str = "patients"

    # --- Vector Search Index Name (configured in Atlas UI) ---
    VECTOR_INDEX_NAME: str = "clinical_vector_index"


# Singleton instance — import this everywhere
settings = Settings()
