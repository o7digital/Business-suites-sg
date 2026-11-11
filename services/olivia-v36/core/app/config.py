import os

EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "openai")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "1536"))
DEFAULT_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
DEFAULT_THRESHOLD = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.20"))
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "800"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "120"))
OPENAI_MODEL_FAST = os.getenv("OPENAI_MODEL_FAST", "gpt-5.6-luna")
OPENAI_MODEL_BALANCED = os.getenv("OPENAI_MODEL_BALANCED", "gpt-5.6-terra")
OPENAI_MODEL_POWERFUL = os.getenv("OPENAI_MODEL_POWERFUL", "gpt-5.6-sol")
OPENAI_MODEL_MAIL = os.getenv("OPENAI_MODEL_MAIL", "gpt-4o")
OPENAI_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1").rstrip("/")
CHAT_TIMEOUT_SECONDS = float(os.getenv("CHAT_TIMEOUT_SECONDS", "120"))
CHAT_MAX_HISTORY_MESSAGES = int(os.getenv("CHAT_MAX_HISTORY_MESSAGES", "20"))
LOCAL_LLM_ENABLED = os.getenv("LOCAL_LLM_ENABLED", "true").lower() in {"1", "true", "yes", "on"}
LOCAL_LLM_BASE_URL = os.getenv("LOCAL_LLM_BASE_URL", "http://olivia-v3-local-llm:11434").rstrip("/")
LOCAL_LLM_MODEL = os.getenv("LOCAL_LLM_MODEL", "qwen2.5:1.5b")
