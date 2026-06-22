#!/usr/bin/env python3
"""One-time script to ingest all existing resumes from the Resumes/ folder."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import SessionLocal
from routers.upload import _process_single_resume, _read_jd
from config import RESUMES_DIR


async def main():
    db = SessionLocal()
    jd_text = _read_jd()

    from models.database import Candidate
    existing = {c.resume_filename for c in db.query(Candidate.resume_filename).all()}

    files = [
        f for f in os.listdir(RESUMES_DIR)
        if f.lower().endswith((".pdf", ".docx")) and f not in existing
    ]

    print(f"Found {len(files)} new resumes to process")

    for i, filename in enumerate(files):
        filepath = os.path.join(RESUMES_DIR, filename)
        print(f"[{i+1}/{len(files)}] Processing: {filename}")
        try:
            candidate = await _process_single_resume(filepath, filename, jd_text, db)
            if candidate:
                print(f"  -> {candidate.name} | Score: {candidate.overall_score}")
            else:
                print(f"  -> FAILED to extract/score")
        except Exception as e:
            print(f"  -> ERROR: {e}")

    db.close()
    print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
