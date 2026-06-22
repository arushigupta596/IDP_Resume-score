from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, Candidate
from models.schemas import ChatMessage
from services.rag_engine import rag_chat
from services.cache import get_cached, set_cached, clear_cache, SUGGESTION_QUERIES
import json

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("")
async def chat(msg: ChatMessage, db: Session = Depends(get_db)):
    cached = get_cached(msg.message)
    if cached:
        return cached

    result = await rag_chat(msg.message, db)

    candidate_ids = result.get("candidate_ids", [])
    candidates = []
    for cid in candidate_ids:
        c = db.query(Candidate).filter(Candidate.id == cid).first()
        if c:
            candidates.append({
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

    response = {
        "response": result["response"],
        "candidates": candidates,
    }

    set_cached(msg.message, response)
    return response


@router.get("/suggestions")
def get_suggestions():
    return {"suggestions": SUGGESTION_QUERIES}


@router.get("/preload")
def preload_suggestions():
    results = {}
    for q in SUGGESTION_QUERIES:
        cached = get_cached(q)
        if cached:
            results[q] = cached
    return {"cached": results}


@router.post("/clear-cache")
def clear_chat_cache():
    clear_cache()
    return {"status": "cache cleared"}
