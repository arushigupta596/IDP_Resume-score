import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import candidates, chat, upload, dashboard
from services.cache import SUGGESTION_QUERIES, get_cached, set_cached
from services.rag_engine import rag_chat
from models.database import SessionLocal, Candidate


async def prewarm_cache():
    db = SessionLocal()
    count = db.query(Candidate).count()
    if count == 0:
        db.close()
        return

    print(f"Pre-warming cache for {len(SUGGESTION_QUERIES)} common queries...")
    for query in SUGGESTION_QUERIES:
        if get_cached(query):
            continue
        try:
            result = await rag_chat(query, db)
            candidate_ids = result.get("candidate_ids", [])
            cands = []
            for cid in candidate_ids:
                c = db.query(Candidate).filter(Candidate.id == cid).first()
                if c:
                    import json
                    cands.append({
                        "id": c.id,
                        "name": c.name,
                        "overall_score": c.overall_score,
                        "current_role": c.current_role,
                        "current_company": c.current_company,
                        "skills": json.loads(c.skills) if c.skills else [],
                        "recommendation": c.recommendation,
                        "score_maritime": c.score_maritime,
                        "score_market_analysis": c.score_market_analysis,
                        "score_microsoft_tools": c.score_microsoft_tools,
                        "score_revenue_linking": c.score_revenue_linking,
                        "score_data_insights": c.score_data_insights,
                    })
            set_cached(query, {"response": result["response"], "candidates": cands})
            print(f"  Cached: {query[:50]}...")
        except Exception as e:
            print(f"  Failed to cache: {query[:50]}... - {e}")

    db.close()
    print("Cache pre-warming complete!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(prewarm_cache())
    yield


app = FastAPI(title="HR AI Copilot API", version="1.0.0", lifespan=lifespan)

import os

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if os.environ.get("FRONTEND_URL"):
    CORS_ORIGINS.append(os.environ["FRONTEND_URL"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidates.router)
app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
