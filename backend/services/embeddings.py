from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def is_available() -> bool:
    return True


def generate_embedding(text: str) -> list[float]:
    model = get_model()
    embedding = model.encode(text, show_progress_bar=False)
    return embedding.tolist()
