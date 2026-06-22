from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CandidateBase(BaseModel):
    name: str = "Unknown"
    email: str = ""
    phone: str = ""
    location: str = ""
    years_experience: float = 0
    education: str = ""
    current_role: str = ""
    current_company: str = ""
    skills: list[str] = []
    resume_filename: str = ""
    overall_score: float = 0
    score_maritime: float = 0
    score_market_analysis: float = 0
    score_microsoft_tools: float = 0
    score_revenue_linking: float = 0
    score_data_insights: float = 0
    ai_summary: str = ""
    ai_strengths: list[str] = []
    ai_weaknesses: list[str] = []
    recommendation: str = "pending"
    status: str = "new"
    hr_notes: str = ""


class CandidateResponse(CandidateBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CandidateUpdate(BaseModel):
    status: Optional[str] = None
    hr_notes: Optional[str] = None
    recommendation: Optional[str] = None


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    candidates: list[CandidateResponse] = []


class DashboardStats(BaseModel):
    total_candidates: int = 0
    average_score: float = 0
    top_scorer_name: str = ""
    top_scorer_score: float = 0
    shortlisted_count: int = 0
    rejected_count: int = 0
    new_count: int = 0


class PipelineStage(BaseModel):
    stage: str
    count: int
    label: str


class UploadStatus(BaseModel):
    total: int = 0
    processed: int = 0
    status: str = "idle"
