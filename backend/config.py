import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

DATABASE_URL = "sqlite:///./data/candidates.db"
CHROMA_PERSIST_DIR = "./data/chroma_db"
RESUMES_DIR = os.getenv("RESUMES_DIR", "../Resumes")
JD_PATH = os.getenv("JD_PATH", "../JD.docx")
SCORING_CRITERIA_PATH = os.getenv("SCORING_CRITERIA_PATH", "../Scoring Criteria.docx")
UPLOAD_DIR = "./data/uploads"

SCORING_CRITERIA = [
    {
        "id": "maritime",
        "name": "Maritime & Offshore Experience",
        "description": "Experience in Maritime offshore industry or worked in related sectors shipping, energy, ports",
        "weight": 0.25,
    },
    {
        "id": "market_analysis",
        "name": "Market Analysis & Research",
        "description": "Experience in Market analysis, trend identification, competitor & customer analysis",
        "weight": 0.25,
    },
    {
        "id": "microsoft_tools",
        "name": "Microsoft Tools Proficiency",
        "description": "Strong background in Microsoft tools, advanced Excel, PowerPoint, Power BI",
        "weight": 0.20,
    },
    {
        "id": "revenue_linking",
        "name": "Revenue & Data Linking",
        "description": "Ability to link data to revenue opportunities",
        "weight": 0.15,
    },
    {
        "id": "data_insights",
        "name": "Data-Driven Insights",
        "description": "Ability to translate data into insights and support commercial decisions",
        "weight": 0.15,
    },
]
