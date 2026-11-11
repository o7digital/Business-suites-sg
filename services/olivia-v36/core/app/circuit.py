from datetime import datetime,timezone,timedelta
from sqlalchemy import select
from .db import tenant_session
from .models import CircuitState

def before_call(tenant,adapter):
 with tenant_session(tenant) as db:
  state=db.scalar(select(CircuitState).where(CircuitState.tenant_id==tenant,CircuitState.adapter==adapter))
  if state and state.state=="open" and state.opened_at and state.opened_at>datetime.now(timezone.utc)-timedelta(seconds=60): return False
  if state and state.state=="open": state.state="half_open"; db.commit()
 return True
def after_call(tenant,adapter,success):
 with tenant_session(tenant) as db:
  state=db.scalar(select(CircuitState).where(CircuitState.tenant_id==tenant,CircuitState.adapter==adapter))
  if not state: state=CircuitState(tenant_id=tenant,adapter=adapter); db.add(state)
  if success: state.state="closed"; state.failures=0; state.opened_at=None
  else:
   state.failures=(state.failures or 0)+1
   if state.failures>=5: state.state="open"; state.opened_at=datetime.now(timezone.utc)
  state.updated_at=datetime.now(timezone.utc); db.commit()
