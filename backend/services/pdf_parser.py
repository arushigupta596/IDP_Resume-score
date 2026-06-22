import fitz
from docx import Document
import os


def extract_text_from_pdf(filepath: str) -> str:
    try:
        doc = fitz.open(filepath)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Error parsing PDF {filepath}: {e}")
        return ""


def extract_text_from_docx(filepath: str) -> str:
    try:
        doc = Document(filepath)
        return "\n".join(p.text for p in doc.paragraphs).strip()
    except Exception as e:
        print(f"Error parsing DOCX {filepath}: {e}")
        return ""


def extract_text(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(filepath)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(filepath)
    return ""
