from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from crud.job import get_jobs
from services.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("")
async def list_jobs(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return get_jobs(db)
