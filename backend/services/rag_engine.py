import chromadb
from rank_bm25 import BM25Okapi
import re
import asyncio
import httpx
import json
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm import Session
from models.database import Candidate
from services.embeddings import generate_embedding
from config import CHROMA_PERSIST_DIR, OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL

_executor = ThreadPoolExecutor(max_workers=2)

_chroma_client = None
_collection = None

RANKING_KEYWORDS = [
    "top", "best", "highest", "rank", "most suitable", "strongest",
    "recommend", "shortlist", "score", "compare", "versus", "vs",
    "who should", "which candidate", "number 1", "#1", "leading",
]


def get_collection():
    global _chroma_client, _collection
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        _collection = _chroma_client.get_or_create_collection(
            name="resumes",
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def add_to_vector_store(candidate_id: str, text: str):
    collection = get_collection()
    embedding = generate_embedding(text)
    collection.upsert(
        ids=[candidate_id],
        embeddings=[embedding],
        documents=[text],
    )


def semantic_search(query: str, n_results: int = 10) -> list[tuple[str, float]]:
    collection = get_collection()
    if collection.count() == 0:
        return []
    query_embedding = generate_embedding(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, collection.count()),
    )
    pairs = []
    for cid, dist in zip(results["ids"][0], results["distances"][0]):
        pairs.append((cid, 1 - dist))
    return pairs


def bm25_search(query: str, db: Session, n_results: int = 10) -> list[tuple[str, float]]:
    candidates = db.query(Candidate).filter(Candidate.resume_text != "").all()
    if not candidates:
        return []
    corpus = [c.resume_text.lower().split() for c in candidates]
    bm25 = BM25Okapi(corpus)
    tokenized_query = query.lower().split()
    scores = bm25.get_scores(tokenized_query)
    indexed = [(candidates[i].id, float(scores[i])) for i in range(len(candidates))]
    indexed.sort(key=lambda x: x[1], reverse=True)
    return indexed[:n_results]


async def hybrid_search_async(query: str, db: Session, n_results: int = 10) -> list[str]:
    loop = asyncio.get_event_loop()
    sem_future = loop.run_in_executor(_executor, semantic_search, query, n_results * 2)
    bm25_future = loop.run_in_executor(_executor, bm25_search, query, db, n_results * 2)
    semantic_results, bm25_results = await asyncio.gather(sem_future, bm25_future)

    rrf_scores = {}
    k = 60
    for rank, (cid, _) in enumerate(semantic_results):
        rrf_scores[cid] = rrf_scores.get(cid, 0) + 1 / (k + rank + 1)
    for rank, (cid, _) in enumerate(bm25_results):
        rrf_scores[cid] = rrf_scores.get(cid, 0) + 1 / (k + rank + 1)

    sorted_ids = sorted(rrf_scores, key=rrf_scores.get, reverse=True)
    return sorted_ids[:n_results]


def hybrid_search(query: str, db: Session, n_results: int = 10) -> list[str]:
    semantic_results = semantic_search(query, n_results=n_results * 2)
    bm25_results = bm25_search(query, db, n_results=n_results * 2)

    rrf_scores = {}
    k = 60
    for rank, (cid, _) in enumerate(semantic_results):
        rrf_scores[cid] = rrf_scores.get(cid, 0) + 1 / (k + rank + 1)
    for rank, (cid, _) in enumerate(bm25_results):
        rrf_scores[cid] = rrf_scores.get(cid, 0) + 1 / (k + rank + 1)

    sorted_ids = sorted(rrf_scores, key=rrf_scores.get, reverse=True)
    return sorted_ids[:n_results]


def is_ranking_query(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in RANKING_KEYWORDS)


def get_top_scored_ids(db: Session, n: int = 10) -> list[str]:
    candidates = (
        db.query(Candidate)
        .filter(Candidate.overall_score > 0)
        .order_by(Candidate.overall_score.desc())
        .limit(n)
        .all()
    )
    return [c.id for c in candidates]


def _format_candidate_context(c: Candidate) -> str:
    return (
        f"Candidate: {c.name} | Overall Score: {c.overall_score}/100 | "
        f"Role: {c.current_role} | Company: {c.current_company} | "
        f"Experience: {c.years_experience}yr | Skills: {c.skills} | "
        f"Maritime: {c.score_maritime}/10 | Market Analysis: {c.score_market_analysis}/10 | "
        f"MS Tools: {c.score_microsoft_tools}/10 | Revenue: {c.score_revenue_linking}/10 | "
        f"Insights: {c.score_data_insights}/10 | "
        f"Recommendation: {c.recommendation} | "
        f"Summary: {c.ai_summary}"
    )


async def rag_chat(query: str, db: Session) -> dict:
    if is_ranking_query(query):
        top_ids = get_top_scored_ids(db, n=15)
        rag_ids = await hybrid_search_async(query, db, n_results=10)
        seen = set(top_ids)
        merged_ids = list(top_ids)
        for rid in rag_ids:
            if rid not in seen:
                merged_ids.append(rid)
                seen.add(rid)
        candidate_ids = merged_ids[:15]
    else:
        candidate_ids = await hybrid_search_async(query, db, n_results=10)

    candidates = []
    context_parts = []
    for cid in candidate_ids:
        c = db.query(Candidate).filter(Candidate.id == cid).first()
        if c:
            candidates.append(c)
            context_parts.append(_format_candidate_context(c))

    context = "\n\n".join(context_parts)

    total = db.query(Candidate).count()
    avg = db.query(Candidate).with_entities(
        Candidate.overall_score
    ).all()
    avg_score = round(sum(r[0] for r in avg) / len(avg), 1) if avg else 0

    prompt = f"""You are an HR AI assistant helping with candidate evaluation for a Market Research Analyst position in the marine logistics/offshore sector.

DATABASE SUMMARY: {total} total candidates, average score {avg_score}/100.

CANDIDATE DATA (sorted by score, these are the actual scores from our scoring system):
{context}

USER QUESTION: {query}

CRITICAL RULES:
- The scores shown above are the ACTUAL scores from our AI scoring system. Trust them completely.
- When asked about "best", "top", or "most suitable" candidates, rank STRICTLY by the Overall Score number shown above.
- The candidate with the highest Overall Score is the best candidate. Do not override scores with your own judgment.
- Never use emojis or special unicode characters
- Use plain markdown: **bold** for names/scores, bullet points with -, numbered lists
- Keep responses concise and professional
- Use short paragraphs, not walls of text
- If asked to compare, create a structured comparison"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 1200,
                },
            )
            data = response.json()
            answer = data["choices"][0]["message"]["content"]
            return {"response": answer, "candidate_ids": [c.id for c in candidates[:5]]}
    except Exception as e:
        return {"response": f"Error generating response: {str(e)}", "candidate_ids": []}
