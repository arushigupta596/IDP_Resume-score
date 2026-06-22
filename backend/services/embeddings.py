from config import EMBEDDING_MODEL

_model = None
_load_failed = False


def get_model():
    global _model, _load_failed
    if _load_failed:
        return None
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(EMBEDDING_MODEL)
        except Exception as e:
            print(f"[embeddings] Failed to load model: {e}. Falling back to BM25-only search.")
            _load_failed = True
            return None
    return _model


def is_available() -> bool:
    return get_model() is not None


def generate_embedding(text: str) -> list[float]:
    model = get_model()
    if model is None:
        return []
    embedding = model.encode(text, show_progress_bar=False)
    return embedding.tolist()
