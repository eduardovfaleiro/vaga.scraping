from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.sync import sync_all_global_terms

router = APIRouter(prefix="/sync-global", tags=["sync"])


@router.post("")
async def trigger_global_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return sync_all_global_terms(db, background_tasks)


@router.post("/force")
async def force_global_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    from crud.scrape_history import clear_scrape_history
    clear_scrape_history(db)
    return sync_all_global_terms(db, background_tasks)
