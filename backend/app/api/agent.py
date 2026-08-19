from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import AgentQueryRequest, AgentQueryResponse
from app.agents.agent_orchestrator import agent_orchestrator

router = APIRouter(prefix="/agent", tags=["Agentic AI Assistant"])

@router.post("/query", response_model=AgentQueryResponse)
def query_agent(req: AgentQueryRequest, db: Session = Depends(get_db)):
    return agent_orchestrator.process_query(db, req.query)

@router.post("/voice-query", response_model=AgentQueryResponse)
def voice_query_agent(req: AgentQueryRequest, db: Session = Depends(get_db)):
    # Accepts recognized voice transcript text
    return agent_orchestrator.process_query(db, req.query)
