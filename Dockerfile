FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY Resumes/ ./Resumes/
COPY JD.docx .
COPY "Scoring Criteria.docx" .

WORKDIR /app/backend

ENV RESUMES_DIR=/app/Resumes
ENV JD_PATH=/app/JD.docx
ENV SCORING_CRITERIA_PATH=/app/Scoring\ Criteria.docx

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
