---
title: DP Resume Backend
emoji: 📄
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# DP World Talent Intelligence Platform

An AI-powered HR Copilot that scores, ranks, and manages candidate resumes against a Market Research Analyst job description for DP World. The system processes 124+ resumes, scores them across five weighted criteria, and provides a RAG-based chat interface for natural language candidate queries.

## Features

- **AI Resume Scoring** - Automated scoring of resumes across 5 weighted dimensions (Maritime Experience, Market Analysis, Microsoft Tools, Revenue Linking, Data Insights)
- **RAG-Based AI Copilot** - Chat interface for natural language queries about candidates with hybrid BM25 + semantic search
- **Interactive Dashboard** - Score distributions, criteria breakdowns, pipeline tracker, and top candidate overview
- **Candidate Management** - Browse, filter, shortlist, reject, and compare candidates side-by-side
- **Pipeline Tracker** - Two-phase visual pipeline: Applied > Scored > Pre-Screening > Outreach > Interview > Selected > Onboarded
- **Email Outreach** - Send interview invitation emails to shortlisted candidates via Gmail SMTP
- **Authentication** - Supabase-based login for admin access
- **CSV Export** - Export candidate data for external analysis

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Auth**: Supabase Auth (email/password)
- **Deployment**: Vercel

### Backend
- **Framework**: Python FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Vector Store**: ChromaDB for semantic search
- **LLM**: Claude via OpenRouter API (scoring, chat, structured extraction)
- **Email**: Gmail SMTP via Python smtplib
- **Deployment**: Hugging Face Spaces (Docker, 16GB RAM)

### Architecture

```
Frontend (Vercel)  <-->  Backend API (HF Spaces)
     |                        |
  Supabase Auth          SQLite + ChromaDB
                              |
                        OpenRouter (Claude)
```

## Project Structure

```
DP_Resume/
├── frontend/                   # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/      # Dashboard with charts and stats
│   │   │   ├── copilot/        # AI chat interface
│   │   │   ├── nominations/    # Candidate list and profiles
│   │   │   └── login/          # Authentication page
│   │   ├── components/         # UI components (sidebar, charts, tables)
│   │   └── lib/                # API client, auth context, utilities
│   └── public/                 # Static assets
│
├── backend/                    # FastAPI service
│   ├── routers/                # API endpoints (candidates, chat, dashboard, upload)
│   ├── services/               # Business logic (scoring, RAG, email, PDF parsing)
│   ├── models/                 # Database models and schemas
│   └── scripts/                # Data ingestion scripts
│
├── Resumes/                    # 124 candidate resume PDFs
├── JD.docx                     # Job description
└── Scoring Criteria.docx       # Scoring rubric
```

## Scoring Criteria

| # | Dimension | Weight |
|---|-----------|--------|
| 1 | Maritime / offshore / shipping / energy / ports experience | 25% |
| 2 | Market analysis, trend identification, competitor & customer analysis | 25% |
| 3 | Microsoft tools (advanced Excel, PowerPoint, Power BI) | 20% |
| 4 | Ability to link data to revenue opportunities | 15% |
| 5 | Ability to translate data into insights, support commercial decisions | 15% |

Each dimension is scored 0-10, then weighted to produce an overall score out of 100.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard summary statistics |
| GET | `/api/dashboard/charts` | Chart data (distributions, breakdowns) |
| GET | `/api/candidates` | List candidates with filters and sorting |
| GET | `/api/candidates/{id}` | Full candidate profile with scores |
| POST | `/api/candidates/{id}/shortlist` | Shortlist a candidate |
| POST | `/api/candidates/{id}/reject` | Reject a candidate |
| POST | `/api/candidates/{id}/outreach` | Send outreach email |
| POST | `/api/candidates/compare` | Compare 2-3 candidates side by side |
| GET | `/api/candidates/export` | Export candidates as CSV |
| POST | `/api/chat` | Send message to AI copilot |
| POST | `/api/upload` | Bulk upload resumes |

## Environment Variables

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access |
| `OPENROUTER_MODEL` | Model to use (e.g. `anthropic/claude-opus-4-6`) |
| `SMTP_EMAIL` | Gmail address for outreach emails |
| `SMTP_PASSWORD` | Gmail app password |

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
python scripts/ingest.py        # Process resumes (first time only)
uvicorn main:app --reload       # Start API server on :8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                     # Start dev server on :3000
```

## Deployment

- **Frontend**: Pushed to Vercel via GitHub. Set env vars in Vercel project settings.
- **Backend**: Deployed as a Docker container on Hugging Face Spaces. SQLite is ephemeral (auto-ingests on startup). Set secrets in HF Space settings.
