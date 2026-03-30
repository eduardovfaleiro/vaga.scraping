from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from crud.job import get_jobs
import crud.recommendation as recommendation_crud
import crud.user as user_crud
from services.matcher import process_new_jobs_for_user
from services.sync import sync_all_global_terms
import schemas
from dotenv import load_dotenv

app = FastAPI(title="Vaga Scraping API")
load_dotenv()

@app.get("/")
async def root():
    return {"message": "Vaga Scraping API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/users", response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    created_user = user_crud.create_user(db, user)
    jobs = get_jobs(db)

    await process_new_jobs_for_user(db, created_user, jobs)
    return created_user

@app.get("/users/{user_id}", response_model=schemas.User)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user_crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user

@app.post("/sync-global")
async def trigger_global_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    result = sync_all_global_terms(db, background_tasks)
    return result

@app.get("/jobs")
async def list_jobs(db: Session = Depends(get_db)):
    return get_jobs(db)

@app.get("/users/{user_id}/recommendations")
async def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    return recommendation_crud.get_user_recommendations(db, user_id)
