import json
from datetime import datetime, timezone
from pgvector.sqlalchemy import Vector
from sqlalchemy import String, Text, DateTime, ForeignKey, Index, UniqueConstraint, Boolean, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from .config import EMBEDDING_DIMENSIONS

def now(): return datetime.now(timezone.utc)
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__="users"; __table_args__=(UniqueConstraint("tenant_id","external_id"),)
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); external_id:Mapped[str]=mapped_column(String(255)); name:Mapped[str]=mapped_column(String(255),default="")
class Conversation(Base):
    __tablename__="conversations"; id:Mapped[str]=mapped_column(String(64),primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); user_id:Mapped[int|None]=mapped_column(ForeignKey("users.id"),nullable=True); created_at:Mapped[datetime]=mapped_column(DateTime,default=now)
class Message(Base):
    __tablename__="messages"; id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); conversation_id:Mapped[str]=mapped_column(ForeignKey("conversations.id"),index=True); role:Mapped[str]=mapped_column(String(20)); content:Mapped[str]=mapped_column(Text); created_at:Mapped[datetime]=mapped_column(DateTime,default=now)
class Memory(Base):
    __tablename__="memories"
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); user_id:Mapped[int|None]=mapped_column(nullable=True); content:Mapped[str]=mapped_column(Text); metadata_json:Mapped[str]=mapped_column(Text,default="{}"); embedding:Mapped[list|None]=mapped_column(Vector(EMBEDDING_DIMENSIONS),nullable=True); created_at:Mapped[datetime]=mapped_column(DateTime,default=now)
    @property
    def parsed_metadata(self): return json.loads(self.metadata_json or "{}")
class Document(Base):
    __tablename__="documents"
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); title:Mapped[str]=mapped_column(String(255)); content:Mapped[str]=mapped_column(Text); source:Mapped[str]=mapped_column(String(500),default="api"); metadata_json:Mapped[str]=mapped_column(Text,default="{}"); created_at:Mapped[datetime]=mapped_column(DateTime,default=now)
class DocumentChunk(Base):
    __tablename__="document_chunks"; __table_args__=(UniqueConstraint("tenant_id","document_id","chunk_index"),Index("ix_document_chunks_tenant_document","tenant_id","document_id"),)
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); document_id:Mapped[int]=mapped_column(ForeignKey("documents.id",ondelete="CASCADE"),index=True); chunk_index:Mapped[int]; content:Mapped[str]=mapped_column(Text); source:Mapped[str]=mapped_column(String(500)); metadata_json:Mapped[str]=mapped_column(Text,default="{}"); embedding:Mapped[list|None]=mapped_column(Vector(EMBEDDING_DIMENSIONS),nullable=True); created_at:Mapped[datetime]=mapped_column(DateTime,default=now)
    @property
    def parsed_metadata(self): return json.loads(self.metadata_json or "{}")
class Audit(Base):
    __tablename__="audit"; id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); action:Mapped[str]=mapped_column(String(80)); metadata_json:Mapped[str]=mapped_column(Text); created_at:Mapped[datetime]=mapped_column(DateTime,default=now)
class ToolPermission(Base):
    __tablename__="tool_permissions"; __table_args__=(UniqueConstraint("tenant_id","tool_name"),)
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); tool_name:Mapped[str]=mapped_column(String(150)); allowed:Mapped[bool]=mapped_column(Boolean,default=False); created_at:Mapped[datetime]=mapped_column(DateTime,default=now)
class ToolExecution(Base):
    __tablename__="tool_executions"; __table_args__=(UniqueConstraint("tenant_id","tool_name","idempotency_key"),)
    id:Mapped[str]=mapped_column(String(64),primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); tool_name:Mapped[str]=mapped_column(String(150),index=True); mode:Mapped[str]=mapped_column(String(20)); idempotency_key:Mapped[str]=mapped_column(String(128)); params_json:Mapped[str]=mapped_column(Text); status:Mapped[str]=mapped_column(String(30)); result_json:Mapped[str|None]=mapped_column(Text,nullable=True); error:Mapped[str|None]=mapped_column(Text,nullable=True); attempts:Mapped[int]=mapped_column(Integer,default=0); duration_ms:Mapped[int]=mapped_column(Integer,default=0); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class ToolApproval(Base):
    __tablename__="tool_approvals"
    id:Mapped[str]=mapped_column(String(64),primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); tool_name:Mapped[str]=mapped_column(String(150)); params_hash:Mapped[str]=mapped_column(String(64)); status:Mapped[str]=mapped_column(String(20),default="approved"); expires_at:Mapped[datetime]=mapped_column(DateTime(timezone=True)); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class WorkflowDefinition(Base):
    __tablename__="workflow_definitions"; __table_args__=(UniqueConstraint("tenant_id","name","version"),)
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); name:Mapped[str]=mapped_column(String(150)); version:Mapped[int]=mapped_column(Integer); definition_json:Mapped[str]=mapped_column(Text); active:Mapped[bool]=mapped_column(Boolean,default=True); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class WorkflowRun(Base):
    __tablename__="workflow_runs"; __table_args__=(UniqueConstraint("tenant_id","workflow_name","idempotency_key"),)
    id:Mapped[str]=mapped_column(String(64),primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); workflow_name:Mapped[str]=mapped_column(String(150)); workflow_version:Mapped[int]=mapped_column(Integer); trigger_type:Mapped[str]=mapped_column(String(30)); idempotency_key:Mapped[str]=mapped_column(String(128)); status:Mapped[str]=mapped_column(String(40),index=True); variables_json:Mapped[str]=mapped_column(Text,default="{}"); budget_total:Mapped[int]=mapped_column(Integer,default=50); budget_used:Mapped[int]=mapped_column(Integer,default=0); max_concurrency:Mapped[int]=mapped_column(Integer,default=1); error:Mapped[str|None]=mapped_column(Text,nullable=True); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now); updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class WorkflowStep(Base):
    __tablename__="workflow_steps"; __table_args__=(UniqueConstraint("tenant_id","run_id","step_key"),)
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); run_id:Mapped[str]=mapped_column(ForeignKey("workflow_runs.id",ondelete="CASCADE"),index=True); step_key:Mapped[str]=mapped_column(String(150)); kind:Mapped[str]=mapped_column(String(30)); tool_name:Mapped[str|None]=mapped_column(String(150),nullable=True); depends_on_json:Mapped[str]=mapped_column(Text,default="[]"); status:Mapped[str]=mapped_column(String(40),index=True); input_json:Mapped[str]=mapped_column(Text,default="{}"); result_json:Mapped[str|None]=mapped_column(Text,nullable=True); attempts:Mapped[int]=mapped_column(Integer,default=0); max_retries:Mapped[int]=mapped_column(Integer,default=2); timeout_seconds:Mapped[int]=mapped_column(Integer,default=5); cost:Mapped[int]=mapped_column(Integer,default=1); compensation:Mapped[str|None]=mapped_column(String(150),nullable=True); started_at:Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True); completed_at:Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
class WorkflowEvent(Base):
    __tablename__="workflow_events"
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); run_id:Mapped[str]=mapped_column(ForeignKey("workflow_runs.id",ondelete="CASCADE"),index=True); step_id:Mapped[int|None]=mapped_column(ForeignKey("workflow_steps.id",ondelete="CASCADE"),nullable=True); event_type:Mapped[str]=mapped_column(String(100),index=True); data_json:Mapped[str]=mapped_column(Text,default="{}"); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class AuthUser(Base):
    __tablename__="auth_users"; __table_args__=(UniqueConstraint("tenant_id","email"),)
    id:Mapped[str]=mapped_column(String(64),primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); email:Mapped[str]=mapped_column(String(320)); password_hash:Mapped[str]=mapped_column(Text); role:Mapped[str]=mapped_column(String(30)); active:Mapped[bool]=mapped_column(Boolean,default=True); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class TenantSecret(Base):
    __tablename__="tenant_secrets"; __table_args__=(UniqueConstraint("tenant_id","name"),)
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); name:Mapped[str]=mapped_column(String(200)); encrypted_value:Mapped[str]=mapped_column(Text); version:Mapped[int]=mapped_column(Integer,default=1); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now); updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class TenantQuota(Base):
    __tablename__="tenant_quotas"; tenant_id:Mapped[str]=mapped_column(String(128),primary_key=True); requests_per_minute:Mapped[int]=mapped_column(Integer,default=120); jobs_per_day:Mapped[int]=mapped_column(Integer,default=1000); max_active_jobs:Mapped[int]=mapped_column(Integer,default=10); updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class Job(Base):
    __tablename__="jobs"; __table_args__=(UniqueConstraint("tenant_id","idempotency_key"),)
    id:Mapped[str]=mapped_column(String(64),primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); job_type:Mapped[str]=mapped_column(String(100),index=True); payload_json:Mapped[str]=mapped_column(Text); status:Mapped[str]=mapped_column(String(30),index=True); result_json:Mapped[str|None]=mapped_column(Text,nullable=True); error:Mapped[str|None]=mapped_column(Text,nullable=True); attempts:Mapped[int]=mapped_column(Integer,default=0); max_retries:Mapped[int]=mapped_column(Integer,default=3); timeout_seconds:Mapped[int]=mapped_column(Integer,default=30); idempotency_key:Mapped[str]=mapped_column(String(128)); available_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now); locked_at:Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True); locked_by:Mapped[str|None]=mapped_column(String(100),nullable=True); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now); updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class Schedule(Base):
    __tablename__="schedules"
    id:Mapped[str]=mapped_column(String(64),primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); name:Mapped[str]=mapped_column(String(200)); cron:Mapped[str]=mapped_column(String(100)); job_type:Mapped[str]=mapped_column(String(100)); payload_json:Mapped[str]=mapped_column(Text); active:Mapped[bool]=mapped_column(Boolean,default=True); next_run_at:Mapped[datetime]=mapped_column(DateTime(timezone=True)); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class CircuitState(Base):
    __tablename__="circuit_breaker_states"; __table_args__=(UniqueConstraint("tenant_id","adapter"),)
    id:Mapped[int]=mapped_column(primary_key=True); tenant_id:Mapped[str]=mapped_column(String(128),index=True); adapter:Mapped[str]=mapped_column(String(100)); state:Mapped[str]=mapped_column(String(20),default="closed"); failures:Mapped[int]=mapped_column(Integer,default=0); opened_at:Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True); updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class ServiceHeartbeat(Base):
    __tablename__="service_heartbeats"; service:Mapped[str]=mapped_column(String(100),primary_key=True); instance:Mapped[str]=mapped_column(String(150)); last_seen:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
