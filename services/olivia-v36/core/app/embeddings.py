import hashlib, math, os, re
import httpx
from .config import EMBEDDING_PROVIDER, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS

class EmbeddingProvider:
    name = "base"
    def embed(self, texts: list[str]) -> list[list[float]]: raise NotImplementedError

class LocalHashEmbeddingProvider(EmbeddingProvider):
    name = "local-hash"
    def embed(self, texts):
        output=[]
        for text in texts:
            vector=[0.0]*EMBEDDING_DIMENSIONS
            for token in re.findall(r"[\wÀ-ÿ]{2,}", text.lower()):
                digest=hashlib.sha256(token.encode()).digest()
                vector[int.from_bytes(digest[:4],"big")%EMBEDDING_DIMENSIONS] += 1.0 if digest[4]%2 else -1.0
            norm=math.sqrt(sum(x*x for x in vector)) or 1.0
            output.append([x/norm for x in vector])
        return output

class OpenAIEmbeddingProvider(EmbeddingProvider):
    name = "openai"
    def __init__(self, key): self.key=key
    def embed(self, texts):
        response=httpx.post("https://api.openai.com/v1/embeddings", headers={"Authorization":f"Bearer {self.key}"}, json={"model":EMBEDDING_MODEL,"input":texts,"dimensions":EMBEDDING_DIMENSIONS}, timeout=60)
        response.raise_for_status()
        return [item["embedding"] for item in sorted(response.json()["data"],key=lambda x:x["index"])]

def get_provider():
    key=os.getenv("OPENAI_API_KEY","")
    if EMBEDDING_PROVIDER == "openai" and key: return OpenAIEmbeddingProvider(key)
    return LocalHashEmbeddingProvider()
