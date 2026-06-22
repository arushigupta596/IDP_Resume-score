from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from models.database import get_db, SessionLocal, Candidate
from services.pdf_parser import extract_text
from services.scorer import score_resume, calculate_overall_score, get_recommendation
from services.rag_engine import add_to_vector_store
from services.cache import clear_cache
from config import RESUMES_DIR, JD_PATH, UPLOAD_DIR
import os
import json
import uuid
import asyncio

router = APIRouter(prefix="/api/upload", tags=["upload"])

upload_status = {"total": 0, "processed": 0, "status": "idle", "errors": []}


def _read_jd():
    from services.pdf_parser import extract_text_from_docx
    return extract_text_from_docx(JD_PATH)


async def _process_single_resume(filepath: str, filename: str, jd_text: str, db: Session):
    text = extract_text(filepath)
    if not text or len(text) < 50:
        return None

    result = await score_resume(text, jd_text)
    if not result:
        return None

    scores = result.get("scores", {})
    overall = calculate_overall_score(scores)

    candidate = Candidate(
        id=str(uuid.uuid4()),
        name=result.get("name", "Unknown"),
        email=result.get("email", ""),
        phone=result.get("phone", ""),
        location=result.get("location", ""),
        years_experience=float(result.get("years_experience", 0)),
        education=result.get("education", ""),
        current_role=result.get("current_role", ""),
        current_company=result.get("current_company", ""),
        skills=json.dumps(result.get("skills", [])),
        resume_text=text[:10000],
        resume_filename=filename,
        overall_score=overall,
        score_maritime=float(scores.get("maritime", 0)),
        score_market_analysis=float(scores.get("market_analysis", 0)),
        score_microsoft_tools=float(scores.get("microsoft_tools", 0)),
        score_revenue_linking=float(scores.get("revenue_linking", 0)),
        score_data_insights=float(scores.get("data_insights", 0)),
        ai_summary=result.get("summary", ""),
        ai_strengths=json.dumps(result.get("strengths", [])),
        ai_weaknesses=json.dumps(result.get("weaknesses", [])),
        recommendation=get_recommendation(overall),
        status="new",
    )

    db.add(candidate)
    db.commit()

    add_to_vector_store(candidate.id, text[:5000])

    return candidate


@router.post("")
async def upload_resumes(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    global upload_status
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    jd_text = _read_jd()
    upload_status = {"total": len(files), "processed": 0, "status": "processing", "errors": []}
    processed = []

    for file in files:
        try:
            filepath = os.path.join(UPLOAD_DIR, file.filename)
            content = await file.read()
            with open(filepath, "wb") as f:
                f.write(content)

            candidate = await _process_single_resume(filepath, file.filename, jd_text, db)
            if candidate:
                processed.append(candidate.name)
            else:
                upload_status["errors"].append(f"Failed to process: {file.filename}")
        except Exception as e:
            upload_status["errors"].append(f"{file.filename}: {str(e)}")

        upload_status["processed"] += 1

    upload_status["status"] = "complete"
    clear_cache()

    return {
        "processed": len(processed),
        "total": len(files),
        "candidates": processed,
        "errors": upload_status["errors"],
    }


async def _run_ingestion():
    global upload_status
    db = SessionLocal()
    try:
        jd_text = _read_jd()
        existing = {c.resume_filename for c in db.query(Candidate.resume_filename).all()}
        files = [
            f for f in os.listdir(RESUMES_DIR)
            if f.lower().endswith((".pdf", ".docx")) and f not in existing
        ]
        upload_status = {"total": len(files), "processed": 0, "status": "processing", "errors": []}

        for filename in files:
            filepath = os.path.join(RESUMES_DIR, filename)
            try:
                candidate = await _process_single_resume(filepath, filename, jd_text, db)
                if not candidate:
                    upload_status["errors"].append(f"Failed: {filename}")
            except Exception as e:
                upload_status["errors"].append(f"{filename}: {str(e)}")
            upload_status["processed"] += 1

        upload_status["status"] = "complete"
        clear_cache()
    except Exception as e:
        upload_status["status"] = f"error: {str(e)}"
    finally:
        db.close()


@router.post("/ingest")
async def ingest_existing():
    global upload_status
    if upload_status.get("status") == "processing":
        return {"message": "Ingestion already in progress", "status": upload_status}
    asyncio.ensure_future(_run_ingestion())
    return {"message": "Ingestion started in background. Check /api/upload/status for progress."}


@router.get("/status")
def get_upload_status():
    return upload_status
