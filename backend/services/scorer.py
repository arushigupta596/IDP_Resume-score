import httpx
import json
from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL, SCORING_CRITERIA


async def score_resume(resume_text: str, jd_text: str) -> dict:
    criteria_desc = "\n".join(
        f"{i+1}. {c['name']} (weight {c['weight']*100:.0f}%): {c['description']}"
        for i, c in enumerate(SCORING_CRITERIA)
    )

    prompt = f"""You are an expert HR recruiter. Analyze the following resume against the job description and scoring criteria.

JOB DESCRIPTION:
{jd_text}

SCORING CRITERIA (score each 0-10):
{criteria_desc}

RESUME:
{resume_text}

Respond ONLY with valid JSON (no markdown, no code blocks):
{{
  "name": "candidate full name",
  "email": "email or empty string",
  "phone": "phone or empty string",
  "location": "location or empty string",
  "years_experience": number,
  "education": "highest education",
  "current_role": "current or most recent role",
  "current_company": "current or most recent company",
  "skills": ["skill1", "skill2", ...],
  "scores": {{
    "maritime": 0-10,
    "market_analysis": 0-10,
    "microsoft_tools": 0-10,
    "revenue_linking": 0-10,
    "data_insights": 0-10
  }},
  "summary": "2-3 sentence assessment",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"]
}}"""

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
                    "max_tokens": 1000,
                },
            )
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1]
                content = content.rsplit("```", 1)[0]
            return json.loads(content)
    except Exception as e:
        print(f"Scoring error: {e}")
        return None


def calculate_overall_score(scores: dict) -> float:
    total = 0
    for criterion in SCORING_CRITERIA:
        cid = criterion["id"]
        score = scores.get(cid, 0)
        total += score * criterion["weight"]
    return round(total * 10, 1)


def get_recommendation(overall_score: float) -> str:
    if overall_score >= 70:
        return "recommended"
    elif overall_score >= 45:
        return "maybe"
    return "not_recommended"
