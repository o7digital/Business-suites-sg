from dataclasses import dataclass
from math import sqrt
from sqlalchemy import select
from sqlalchemy.orm import Session

@dataclass
class SearchHit:
    kind:str; source:str; document_id:int|None; tenant_id:str; content:str; metadata:dict; similarity:float; lexical_score:float; score:float=0

class VectorStore:
    def search(self, db:Session, tenant_id:str, vector:list[float], query:str, top_k:int, threshold:float)->list[SearchHit]: raise NotImplementedError

class PgVectorStore(VectorStore):
    def search(self,db,tenant_id,vector,query,top_k,threshold):
        from .models import DocumentChunk, Memory
        terms={t for t in query.lower().split() if len(t)>2}; candidates=[]
        def cosine_distance(left,right):
            dot=sum(float(a)*float(b) for a,b in zip(left,right)); ln=sqrt(sum(float(x)**2 for x in left)); rn=sqrt(sum(float(x)**2 for x in right))
            return 1.0-(dot/(ln*rn)) if ln and rn else 1.0
        if db.bind.dialect.name=="postgresql":
            distance=DocumentChunk.embedding.cosine_distance(vector)
            chunks=db.execute(select(DocumentChunk,distance.label("distance")).where(DocumentChunk.tenant_id==tenant_id,DocumentChunk.embedding.is_not(None)).order_by(distance).limit(max(top_k*4,20))).all()
        else:
            rows=db.scalars(select(DocumentChunk).where(DocumentChunk.tenant_id==tenant_id,DocumentChunk.embedding.is_not(None))).all(); chunks=[(row,cosine_distance(row.embedding,vector)) for row in rows]
        for row,dist in chunks:
            sim=max(0.0,1.0-float(dist)); lex=len(terms & set(row.content.lower().split()))/max(len(terms),1)
            if sim>=threshold or lex>0: candidates.append(SearchHit("document",row.source,row.document_id,row.tenant_id,row.content,row.parsed_metadata,sim,lex))
        if db.bind.dialect.name=="postgresql":
            mdistance=Memory.embedding.cosine_distance(vector)
            memories=db.execute(select(Memory,mdistance.label("distance")).where(Memory.tenant_id==tenant_id,Memory.embedding.is_not(None)).order_by(mdistance).limit(max(top_k*2,10))).all()
        else:
            rows=db.scalars(select(Memory).where(Memory.tenant_id==tenant_id,Memory.embedding.is_not(None))).all(); memories=[(row,cosine_distance(row.embedding,vector)) for row in rows]
        for row,dist in memories:
            sim=max(0.0,1.0-float(dist)); lex=len(terms & set(row.content.lower().split()))/max(len(terms),1)
            if sim>=threshold or lex>0: candidates.append(SearchHit("memory","memory",None,row.tenant_id,row.content,row.parsed_metadata,sim,lex))
        for hit in candidates: hit.score=round(0.75*hit.similarity+0.25*hit.lexical_score,6)
        return sorted(candidates,key=lambda x:x.score,reverse=True)[:top_k]
