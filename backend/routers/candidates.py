from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from models.database import get_db, Candidate
from models.schemas import CandidateResponse, CandidateUpdate
import json
import io
import csv

router = APIRouter(prefix="/api/candidates", tags=["candidates"])


def _to_response(c: Candidate) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "location": c.location,
        "years_experience": c.years_experience,
        "education": c.education,
        "current_role": c.current_role,
        "current_company": c.current_company,
        "skills": json.loads(c.skills) if c.skills else [],
        "resume_filename": c.resume_filename,
        "overall_score": c.overall_score,
        "score_maritime": c.score_maritime,
        "score_market_analysis": c.score_market_analysis,
        "score_microsoft_tools": c.score_microsoft_tools,
        "score_revenue_linking": c.score_revenue_linking,
        "score_data_insights": c.score_data_insights,
        "ai_summary": c.ai_summary,
        "ai_strengths": json.loads(c.ai_strengths) if c.ai_strengths else [],
        "ai_weaknesses": json.loads(c.ai_weaknesses) if c.ai_weaknesses else [],
        "recommendation": c.recommendation,
        "status": c.status,
        "hr_notes": c.hr_notes,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


@router.get("")
def list_candidates(
    search: str = Query("", description="Search by name, skills, role"),
    status: str = Query("", description="Filter by status"),
    min_score: float = Query(0, description="Minimum overall score"),
    max_score: float = Query(100, description="Maximum overall score"),
    sort_by: str = Query("overall_score", description="Sort field"),
    sort_order: str = Query("desc", description="asc or desc"),
    limit: int = Query(100),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    query = db.query(Candidate)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Candidate.name.ilike(search_term))
            | (Candidate.skills.ilike(search_term))
            | (Candidate.current_role.ilike(search_term))
            | (Candidate.current_company.ilike(search_term))
        )

    if status:
        query = query.filter(Candidate.status == status)

    query = query.filter(
        Candidate.overall_score >= min_score,
        Candidate.overall_score <= max_score,
    )

    sort_col = getattr(Candidate, sort_by, Candidate.overall_score)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    total = query.count()
    candidates = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "candidates": [_to_response(c) for c in candidates],
    }


@router.get("/export")
def export_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).order_by(Candidate.overall_score.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Name", "Email", "Phone", "Location", "Experience (yrs)",
        "Education", "Current Role", "Company", "Overall Score",
        "Maritime", "Market Analysis", "MS Tools", "Revenue Linking",
        "Data Insights", "Recommendation", "Status", "Skills",
    ])

    for c in candidates:
        writer.writerow([
            c.name, c.email, c.phone, c.location, c.years_experience,
            c.education, c.current_role, c.current_company, c.overall_score,
            c.score_maritime, c.score_market_analysis, c.score_microsoft_tools,
            c.score_revenue_linking, c.score_data_insights,
            c.recommendation, c.status,
            ", ".join(json.loads(c.skills) if c.skills else []),
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=candidates_export.csv"},
    )


@router.get("/{candidate_id}")
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        return {"error": "Candidate not found"}
    return _to_response(c)


@router.patch("/{candidate_id}")
def update_candidate(candidate_id: str, update: CandidateUpdate, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        return {"error": "Candidate not found"}

    if update.status is not None:
        c.status = update.status
    if update.hr_notes is not None:
        c.hr_notes = update.hr_notes
    if update.recommendation is not None:
        c.recommendation = update.recommendation

    db.commit()
    db.refresh(c)
    return _to_response(c)


@router.post("/{candidate_id}/shortlist")
def shortlist_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        return {"error": "Candidate not found"}
    c.status = "shortlisted"
    db.commit()
    return {"status": "ok"}


@router.get("/{candidate_id}/outreach-preview")
def outreach_preview(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        return {"error": "Candidate not found"}

    from services.email_service import get_email_body
    return {
        "to": c.email or "",
        "subject": "Interview Invitation - Market Research Analyst at DP World",
        "body": get_email_body(c.name or "Candidate"),
    }


@router.post("/{candidate_id}/outreach")
def outreach_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        return {"error": "Candidate not found"}
    if c.status != "shortlisted":
        return {"error": "Candidate must be shortlisted before outreach"}
    if not c.email:
        return {"error": "Candidate has no email address on file"}

    from services.email_service import send_outreach_email
    result = send_outreach_email(c.name or "Candidate", c.email)

    if result["success"]:
        c.status = "outreach"
        db.commit()
        return {"status": "ok", "message": f"Outreach email sent to {c.email}"}
    else:
        return {"error": f"Failed to send email: {result.get('error', 'Unknown error')}"}


@router.post("/{candidate_id}/reject")
def reject_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        return {"error": "Candidate not found"}
    c.status = "rejected"
    db.commit()
    return {"status": "ok"}


@router.post("/compare")
def compare_candidates(body: dict, db: Session = Depends(get_db)):
    ids = body.get("candidate_ids", [])
    candidates = db.query(Candidate).filter(Candidate.id.in_(ids)).all()
    return {"candidates": [_to_response(c) for c in candidates]}
