from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.database import get_db, Candidate
import json
import os
from collections import Counter
from services.pdf_parser import extract_text

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

JD_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "JD.docx")


@router.get("/jd")
def get_jd():
    if os.path.exists(JD_PATH):
        text = extract_text(JD_PATH)
        return {"content": text}
    return {"content": "Job Description file not found."}


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Candidate).count()
    if total == 0:
        return {
            "total_candidates": 0,
            "average_score": 0,
            "top_scorer_name": "-",
            "top_scorer_score": 0,
            "shortlisted_count": 0,
            "rejected_count": 0,
            "new_count": 0,
            "recommended_count": 0,
        }

    avg = db.query(func.avg(Candidate.overall_score)).scalar() or 0
    top = db.query(Candidate).order_by(Candidate.overall_score.desc()).first()
    shortlisted = db.query(Candidate).filter(Candidate.status == "shortlisted").count()
    rejected = db.query(Candidate).filter(Candidate.status == "rejected").count()
    new_count = db.query(Candidate).filter(Candidate.status == "new").count()
    recommended = db.query(Candidate).filter(Candidate.recommendation == "recommended").count()

    return {
        "total_candidates": total,
        "average_score": round(avg, 1),
        "top_scorer_name": top.name if top else "-",
        "top_scorer_score": top.overall_score if top else 0,
        "shortlisted_count": shortlisted,
        "rejected_count": rejected,
        "new_count": new_count,
        "recommended_count": recommended,
    }


@router.get("/charts")
def get_charts(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()

    score_ranges = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    criteria_avg = {
        "Maritime": [], "Market Analysis": [], "MS Tools": [],
        "Revenue Linking": [], "Data Insights": [],
    }
    experience_buckets = {"0-2": 0, "3-5": 0, "6-10": 0, "10+": 0}
    all_skills = []

    for c in candidates:
        s = c.overall_score
        if s <= 20:
            score_ranges["0-20"] += 1
        elif s <= 40:
            score_ranges["21-40"] += 1
        elif s <= 60:
            score_ranges["41-60"] += 1
        elif s <= 80:
            score_ranges["61-80"] += 1
        else:
            score_ranges["81-100"] += 1

        criteria_avg["Maritime"].append(c.score_maritime)
        criteria_avg["Market Analysis"].append(c.score_market_analysis)
        criteria_avg["MS Tools"].append(c.score_microsoft_tools)
        criteria_avg["Revenue Linking"].append(c.score_revenue_linking)
        criteria_avg["Data Insights"].append(c.score_data_insights)

        y = c.years_experience or 0
        if y <= 2:
            experience_buckets["0-2"] += 1
        elif y <= 5:
            experience_buckets["3-5"] += 1
        elif y <= 10:
            experience_buckets["6-10"] += 1
        else:
            experience_buckets["10+"] += 1

        try:
            skills = json.loads(c.skills) if c.skills else []
            all_skills.extend(skills)
        except:
            pass

    criteria_averages = {
        k: round(sum(v) / len(v), 1) if v else 0
        for k, v in criteria_avg.items()
    }

    skill_counts = Counter(all_skills).most_common(15)

    pipeline = [
        {"stage": "01", "name": "Uploaded", "count": len(candidates), "label": "total resumes"},
        {"stage": "02", "name": "Parsed", "count": len([c for c in candidates if c.resume_text]), "label": "text extracted"},
        {"stage": "03", "name": "Scored", "count": len([c for c in candidates if c.overall_score > 0]), "label": "AI scored"},
        {"stage": "04", "name": "Recommended", "count": len([c for c in candidates if c.recommendation == "recommended"]), "label": "recommended"},
        {"stage": "05", "name": "Shortlisted", "count": len([c for c in candidates if c.status == "shortlisted"]), "label": "by HR"},
        {"stage": "06", "name": "Interviewed", "count": len([c for c in candidates if c.status == "interviewed"]), "label": "scheduled"},
    ]

    return {
        "score_distribution": score_ranges,
        "criteria_averages": criteria_averages,
        "experience_distribution": experience_buckets,
        "top_skills": [{"skill": s, "count": c} for s, c in skill_counts],
        "pipeline": pipeline,
    }
