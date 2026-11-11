import os
from pathlib import Path
import time

import httpx
from fastapi import HTTPException

from .config import (
    CHAT_TIMEOUT_SECONDS,
    OPENAI_MODEL_BALANCED,
    OPENAI_MODEL_FAST,
    OPENAI_MODEL_POWERFUL,
    LOCAL_LLM_BASE_URL,
    LOCAL_LLM_ENABLED,
    LOCAL_LLM_MODEL,
    OPENAI_API_URL,
)
from .circuit import after_call, before_call

MODELS = {
    "FAST": OPENAI_MODEL_FAST,
    "BALANCED": OPENAI_MODEL_BALANCED,
    "POWERFUL": OPENAI_MODEL_POWERFUL,
}


def _site_instructions(default):
    path = os.getenv("CHAT_SYSTEM_INSTRUCTIONS_FILE")
    return Path(path).read_text() if path else default


def _context_block(context):
    if not context:
        return "Aucun contexte RAG ou souvenir pertinent n'a été trouvé pour cette demande."
    rows = []
    for index, hit in enumerate(context, 1):
        label = "MEMORY" if hit.kind == "memory" else "SOURCE"
        rows.append(f"[{label} {index}] {hit.content}")
    return "\n".join(rows)


def _output_text(payload):
    if isinstance(payload.get("output_text"), str) and payload["output_text"].strip():
        return payload["output_text"].strip()
    chunks = []
    for item in payload.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                chunks.append(content["text"])
    return "\n".join(chunks).strip()


def _local_messages(message, history, context):
    instructions = (
        "Tu es Olivia, l'assistante IA privée du tenant authentifié. Réponds utilement, "
        "directement et dans la langue de l'utilisateur. Utilise uniquement le contexte privé "
        "fourni quand il est pertinent. Ne prétends jamais avoir envoyé, modifié ou exécuté "
        "une action externe : les outils d'écriture restent en sandbox."
    )
    instructions = _site_instructions(instructions)
    messages = [{"role": "system", "content": instructions}]
    messages.extend({"role": item.role, "content": item.content} for item in history)
    messages.append({"role": "user", "content": f"Contexte privé disponible:\n{_context_block(context)}\n\nDemande:\n{message}"})
    return messages


def _generate_local(message, history, context, fallback_reason=None):
    started = time.monotonic()
    try:
        response = httpx.post(
            f"{LOCAL_LLM_BASE_URL}/api/chat",
            json={"model": LOCAL_LLM_MODEL, "messages": _local_messages(message, history, context), "stream": False,
                  "options": {"temperature": 0.2, "num_ctx": 4096}, "keep_alive": "10m"},
            timeout=CHAT_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
        answer = (payload.get("message") or {}).get("content", "").strip()
        if not answer:
            raise ValueError("local model returned no answer")
        response_id = payload.get("created_at", "local")
        if fallback_reason:
            response_id = f"fallback:{fallback_reason}:{response_id}"
        return answer, f"local:{LOCAL_LLM_MODEL}", response_id, round((time.monotonic() - started) * 1000)
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(503, "Olivia local intelligence provider is unavailable") from exc


def generate(routing, message, history, context, tenant=None):
    key = os.getenv("OPENAI_API_KEY", "")
    if not key:
        if LOCAL_LLM_ENABLED:
            return _generate_local(message, history, context)
        raise HTTPException(503, "Olivia intelligence provider is not configured")
    adapter = "openai"
    if tenant and not before_call(tenant, adapter):
        if LOCAL_LLM_ENABLED:
            return _generate_local(message, history, context, "circuit_open")
        raise HTTPException(503, "Olivia OpenAI circuit is open")
    model = MODELS[routing]
    instructions = (
        "Tu es Olivia, l'assistante IA privée du tenant authentifié. Réponds utilement, "
        "directement et dans la langue de l'utilisateur. Utilise le contexte privé fourni "
        "quand il est pertinent, sans inventer de source ni de souvenir. Les actions externes "
        "restent en sandbox: ne prétends jamais avoir envoyé, modifié ou exécuté une action réelle."
    )
    instructions = _site_instructions(instructions)
    inputs = [{"role": item.role, "content": item.content} for item in history]
    inputs.append({
        "role": "user",
        "content": f"Contexte privé disponible:\n{_context_block(context)}\n\nDemande:\n{message}",
    })
    started = time.monotonic()
    try:
        response = httpx.post(
            f"{OPENAI_API_URL.rstrip('/')}/responses",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": model, "instructions": instructions, "input": inputs, "store": False, "max_output_tokens": 1800},
            timeout=CHAT_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        if tenant:
            after_call(tenant, adapter, False)
        if LOCAL_LLM_ENABLED:
            reason = "timeout" if isinstance(exc, httpx.TimeoutException) else "http_error"
            if isinstance(exc, httpx.HTTPStatusError):
                reason = f"http_{exc.response.status_code}"
            return _generate_local(message, history, context, reason)
        raise HTTPException(502, "Olivia intelligence provider request failed") from exc
    payload = response.json()
    answer = _output_text(payload)
    if not answer:
        if tenant:
            after_call(tenant, adapter, False)
        if LOCAL_LLM_ENABLED:
            return _generate_local(message, history, context, "empty_response")
        raise HTTPException(502, "Olivia intelligence provider returned no answer")
    if tenant:
        after_call(tenant, adapter, True)
    return answer, model, payload.get("id"), round((time.monotonic() - started) * 1000)
