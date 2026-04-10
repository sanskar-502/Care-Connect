"""
============================================================
CareConnect — AI Engine Entry Point
FastAPI server powering LLM inference, NLP extraction,
RAG copilot, and Databricks model proxy.
============================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from api.endpoints import router as api_router

# ---------- Initialize FastAPI ----------
app = FastAPI(
    title="CareConnect AI Engine",
    description=(
        "Python microservice powering the CareConnect Language Brain. "
        "Handles LLM inference, clinical NLP extraction, RAG copilot, "
        "and proxies requests to the Databricks ML endpoint."
    ),
    version="1.0.0",
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc",     # ReDoc at /redoc
)

# ---------- CORS Middleware ----------
# Allow the Node.js API Gateway (port 5000) and React frontend (port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",    # Node.js backend
        "http://localhost:5173",    # React frontend (Vite)
        "http://localhost:3000",    # Fallback
        "*",                        # Allow all during hackathon demo
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Mount API Routes ----------
app.include_router(api_router, prefix="/api")

# ---------- Health Check ----------
@app.get("/", tags=["Health"])
async def health_check():
    """Root health check endpoint."""
    return {
        "service": "CareConnect AI Engine",
        "status": "running",
        "version": "1.0.0",
        "port": settings.AI_ENGINE_PORT,
        "llm_model": settings.LLM_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL,
    }


# ---------- Run with Uvicorn ----------
if __name__ == "__main__":
    import uvicorn

    print("\n🧠 CareConnect AI Engine starting...")
    print(f"   Docs:  http://localhost:{settings.AI_ENGINE_PORT}/docs")
    print(f"   ReDoc: http://localhost:{settings.AI_ENGINE_PORT}/redoc\n")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.AI_ENGINE_PORT,
        reload=True,
    )
