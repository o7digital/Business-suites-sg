"""Fixed-hotel gateway built on the existing Olivia 3.6 RAG and chat core."""
import hashlib
import hmac
import json
import os
import re
import threading
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select

from .chat_engine import generate
from .db import tenant_session
from .embeddings import get_provider
from .models import Audit, Conversation, Document, DocumentChunk, Message
from .vector_store import PgVectorStore

TENANT = "business-suites-sg"
provider = get_provider()
store = PgVectorStore()
limits = defaultdict(deque)
lock = threading.Lock()
busy = set()
knowledge_path = Path(os.getenv("KNOWLEDGE_PATH", "/app/knowledge/documents.json"))


def seed_knowledge():
    docs = json.loads(knowledge_path.read_text())
    revision = hashlib.sha256(knowledge_path.read_bytes()).hexdigest()
    with tenant_session(TENANT) as db:
        previous = list(db.scalars(select(Document).where(Document.tenant_id == TENANT)))
        if any(json.loads(doc.metadata_json).get("seed_hash") != revision for doc in previous):
            raise RuntimeError("Knowledge changed: an explicit migration is required")
        existing = {doc.source for doc in previous}
    for doc in docs:
        if doc["source"] in existing:
            continue
        chunks = [doc["content"][i:i+1400] for i in range(0, len(doc["content"]), 1220)]
        vectors = provider.embed(chunks)
        with tenant_session(TENANT) as db:
            metadata = json.dumps({**doc["metadata"], "seed_hash": revision})
            row = Document(tenant_id=TENANT, title=doc["title"], content=doc["content"], source=doc["source"], metadata_json=metadata)
            db.add(row)
            db.flush()
            for index, (chunk, vector) in enumerate(zip(chunks, vectors)):
                db.add(DocumentChunk(tenant_id=TENANT, document_id=row.id, chunk_index=index, content=chunk, source=doc["source"], metadata_json=metadata, embedding=vector))
            db.commit()


@asynccontextmanager
async def lifespan(app):
    seed_knowledge()
    yield


app = FastAPI(title="Business Suites SG — Olivia 3.6", version="3.6.0", lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)


class ChatIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: str = Field(pattern=r"^[a-f0-9]{48}$")
    session_id: str = Field(pattern=r"^[a-f0-9]{32}$")
    client_hash: str = Field(pattern=r"^[a-f0-9]{64}$")
    language: str = Field(default="es", pattern=r"^(es|en)$")
    consent: bool


def reserve(body):
    now = time.monotonic()
    with lock:
        for key in list(limits):
            while limits[key] and limits[key][0] < now - 60:
                limits[key].popleft()
            if not limits[key]:
                del limits[key]
        caps = [("global", 40), ("session:" + body.session_id, 8), ("ip:" + body.client_hash, 16)]
        if len(limits) > 5000 or any(len(limits[key]) >= cap for key, cap in caps):
            raise HTTPException(429, "Please wait before sending another message")
        if body.conversation_id in busy or len(busy) >= 3:
            raise HTTPException(429, "A reply is already being prepared")
        for key, _ in caps:
            limits[key].append(now)
        busy.add(body.conversation_id)


@app.get("/health")
def health():
    return {"status": "ok", "version": "3.6.0", "site": TENANT, "knowledge_documents": len(json.loads(knowledge_path.read_text())), "provider_configured": bool(os.getenv("OPENAI_API_KEY"))}


@app.post("/chat")
def chat(body: ChatIn, authorization: str | None = Header(None)):
    key = os.getenv("HOTEL_GATEWAY_KEY", "")
    if not key or not hmac.compare_digest(authorization or "", "Bearer " + key):
        raise HTTPException(401, "Authentication required")
    if body.consent is not True:
        raise HTTPException(400, "Consent required")
    if not body.message.strip():
        raise HTTPException(422, "Message required")
    reserve(body)
    try:
        with tenant_session(TENANT) as db:
            conversation = db.get(Conversation, body.conversation_id)
            if conversation and conversation.tenant_id != TENANT:
                raise HTTPException(404, "Conversation not found")
            history = list(db.scalars(select(Message).where(Message.tenant_id == TENANT, Message.conversation_id == body.conversation_id).order_by(Message.id.desc()).limit(12)))[::-1]
            if re.fullmatch(r"\s*(hola|hello|hi|buenos días|buenas tardes|buenas noches)[!,. ]*", body.message, re.I):
                reply = "Hello! I'm Olivia, the AI concierge for Business Suites SG. How can I help with your stay?" if body.language == "en" else "¡Hola! Soy Olivia, la concierge de IA de Business Suites SG. ¿En qué puedo ayudarte con tu estancia?"
                engine = "greeting"
            else:
                context = store.search(db, TENANT, provider.embed([body.message])[0], body.message, 6, 0.15)
                if any(hit.tenant_id != TENANT for hit in context):
                    raise HTTPException(502, "Invalid hotel context")
                prompt = f"Preferred language: {body.language}; follow the visitor's language if explicitly requested.\nHotel guest question: {body.message}"
                reply, model, _, _ = generate("BALANCED", prompt, history, context, tenant=TENANT)
                engine = "local" if model.startswith("local:") else "openai"
            if not conversation:
                db.add(Conversation(id=body.conversation_id, tenant_id=TENANT))
                db.flush()
            db.add_all([Message(tenant_id=TENANT, conversation_id=body.conversation_id, role="user", content=body.message), Message(tenant_id=TENANT, conversation_id=body.conversation_id, role="assistant", content=reply)])
            db.add(Audit(tenant_id=TENANT, action="hotel.chat", metadata_json=json.dumps({"conversation_id": body.conversation_id, "consent": True, "engine": engine})))
            db.commit()
        return {"reply": reply, "clientCode": TENANT, "version": "3.6.0", "engine": engine}
    finally:
        with lock:
            busy.discard(body.conversation_id)
