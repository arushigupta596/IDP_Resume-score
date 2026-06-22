from sqlalchemy import create_engine, Column, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import uuid
import os

os.makedirs("data", exist_ok=True)

engine = create_engine("sqlite:///./data/candidates.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, default="Unknown")
    email = Column(String, default="")
    phone = Column(String, default="")
    location = Column(String, default="")
    years_experience = Column(Float, default=0)
    education = Column(String, default="")
    current_role = Column(String, default="")
    current_company = Column(String, default="")
    skills = Column(Text, default="[]")
    resume_text = Column(Text, default="")
    resume_filename = Column(String, default="")
    overall_score = Column(Float, default=0)
    score_maritime = Column(Float, default=0)
    score_market_analysis = Column(Float, default=0)
    score_microsoft_tools = Column(Float, default=0)
    score_revenue_linking = Column(Float, default=0)
    score_data_insights = Column(Float, default=0)
    ai_summary = Column(Text, default="")
    ai_strengths = Column(Text, default="[]")
    ai_weaknesses = Column(Text, default="[]")
    recommendation = Column(String, default="pending")
    status = Column(String, default="new")
    hr_notes = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
