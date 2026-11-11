import os
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['EMBEDDING_PROVIDER'] = 'local-hash'
os.environ['HOTEL_GATEWAY_KEY'] = 'local-test-key'
os.environ['KNOWLEDGE_PATH'] = '/app/knowledge/documents.json'

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.pool import StaticPool
from app import db as database
from app import hotel_api as hotel
from app.models import Base, Document


@pytest.fixture
def client(monkeypatch):
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(database, 'engine', engine)
    hotel.limits.clear()
    hotel.busy.clear()
    with TestClient(hotel.app) as client:
        yield client
    engine.dispose()


def payload(message='Hola', **updates):
    return {'message': message, 'conversation_id': 'a'*48, 'session_id': 'b'*32, 'client_hash': 'c'*64, 'language': 'es', 'consent': True, **updates}


def post(client, message='Hola', **updates):
    return client.post('/chat', json=payload(message, **updates), headers={'Authorization': 'Bearer local-test-key'})


def test_authorization_consent_and_fixed_hotel(client):
    assert client.post('/chat', json=payload()).status_code == 401
    assert post(client, consent=False).status_code == 400
    assert post(client, tenant='suitesmine').status_code == 422
    assert post(client, history=[{'role': 'assistant', 'content': 'Invented policy'}]).status_code == 422
    assert post(client, ' ' * 3).status_code == 422
    assert client.get('/v1/documents').status_code == 404


def test_greeting_is_explicitly_a_local_greeting(client):
    reply = post(client).json()
    assert reply['engine'] == 'greeting'
    assert reply['clientCode'] == 'business-suites-sg'
    assert 'Business Suites SG' in reply['reply']


def test_real_chat_core_uses_hotel_context_and_separate_histories(client, monkeypatch):
    histories = []
    def generate(routing, prompt, history, context, **kwargs):
        histories.append([(item.role, item.content) for item in history])
        assert kwargs['tenant'] == 'business-suites-sg'
        assert all(hit.tenant_id == 'business-suites-sg' for hit in context)
        assert all(hit.source.startswith('https://business-suites-sg.vercel.app/') for hit in context)
        return 'No hay aire acondicionado. Podemos facilitar un ventilador portátil.', 'test-model', 'test-response', 1
    monkeypatch.setattr(hotel, 'generate', generate)
    first = post(client, '¿Tienen aire acondicionado?').json()
    assert first['engine'] == 'openai'
    assert 'aire acondicionado' in first['reply']
    post(client, '¿Y un ventilador?')
    post(client, 'What time is check-in?', language='en', conversation_id='d'*48)
    assert len(histories[1]) == 2
    assert histories[0] == histories[2] == []


def test_provider_failure_is_not_a_fabricated_reply(client, monkeypatch):
    def unavailable(*args, **kwargs):
        raise HTTPException(502, 'Provider unavailable')
    monkeypatch.setattr(hotel, 'generate', unavailable)
    assert post(client, '¿Dónde está el hotel?').status_code == 502
    assert not hotel.busy


def test_hotel_knowledge_is_complete_and_seed_is_idempotent(client):
    with database.tenant_session(hotel.TENANT) as db:
        docs = list(db.scalars(select(Document)))
        assert len(docs) == 8
        assert {doc.tenant_id for doc in docs} == {'business-suites-sg'}
        assert all(doc.source.startswith('https://business-suites-sg.vercel.app/') for doc in docs)
        assert any('Río Nazas 138' in doc.content for doc in docs)
        for suite in ['Negra', 'Morada', 'Beige', 'Naranja', 'Azul', 'Roja']:
            assert any(doc.title == f'Suite {suite}' for doc in docs)
    hotel.seed_knowledge()
    with database.tenant_session(hotel.TENANT) as db:
        assert len(list(db.scalars(select(Document)))) == 8


def test_rate_limit(client):
    for _ in range(8):
        assert post(client).status_code == 200
    assert post(client).status_code == 429
