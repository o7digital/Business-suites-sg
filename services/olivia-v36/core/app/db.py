import os
from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from .models import Base

url=os.getenv("DATABASE_URL","sqlite:///./data/olivia-v3.db")
engine=create_engine(url,connect_args={"check_same_thread":False} if url.startswith("sqlite") else {},pool_pre_ping=True)
Base.metadata.create_all(engine)

@contextmanager
def tenant_session(tenant_id:str):
    with Session(engine) as db:
        if url.startswith("postgresql"):
            db.execute(text("select set_config('app.tenant_id', :tenant, false)"),{"tenant":tenant_id})
        try:
            yield db
        finally:
            if url.startswith("postgresql"):
                db.rollback()
                db.execute(text("select set_config('app.tenant_id', '', false)"))
                db.commit()
