FROM python:3.11-slim

RUN useradd -m -u 1000 user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user backend/ ./backend/
COPY --chown=user Resumes/ ./Resumes/
COPY --chown=user JD.docx .
COPY --chown=user ["Scoring Criteria.docx", "."]

RUN mkdir -p /app/backend/data && chown -R user:user /app

USER user

WORKDIR /app/backend

ENV RESUMES_DIR=/app/Resumes
ENV JD_PATH=/app/JD.docx
ENV SCORING_CRITERIA_PATH="/app/Scoring Criteria.docx"

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
