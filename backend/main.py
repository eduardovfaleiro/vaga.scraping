from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Cookie, Response, Request
from fastapi.security import HTTPBearer
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from crud.job import get_jobs
import crud.recommendation as recommendation_crud
import crud.user as user_crud
from services.matcher import process_new_jobs_for_user
from services.sync import sync_all_global_terms
from services.auth import (
    verify_password,
    create_access_token,
    create_refresh_token,
    refresh_access_token,
    get_current_user,
)
import schemas
from schemas.auth import LoginRequest, TokenResponse
from schemas.recommendation import RecommendationStatusUpdate
from dotenv import load_dotenv
import asyncio
from services.outbox_worker import run_outbox_worker

load_dotenv()

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app = FastAPI(title="Vaga Pipe API")


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_outbox_worker())
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/")
async def root():
    return {"message": "Vaga Pipe API is running"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# Auth
@app.post("/auth/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
    )
    return {"access_token": access_token}


@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh(refresh_token: Optional[str] = Cookie(default=None)):
    access_token = refresh_access_token(refresh_token)
    return {"access_token": access_token}


@app.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logout realizado"}


# Users
@app.post("/users", response_model=schemas.User, status_code=201)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user_crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    created_user = user_crud.create_user(db, user)
    jobs = get_jobs(db)
    await process_new_jobs_for_user(db, created_user, jobs)
    return created_user


@app.get("/users/{user_id}", response_model=schemas.User)
async def read_user(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return current_user


@app.get("/users/{user_id}/recommendations")
async def get_recommendations(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return recommendation_crud.get_user_recommendations(db, user_id)


# Jobs
@app.patch("/users/{user_id}/recommendations/{recommendation_id}")
async def update_recommendation(
    user_id: int,
    recommendation_id: int,
    body: RecommendationStatusUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    rec = recommendation_crud.update_recommendation_status(db, recommendation_id, user_id, body.status)
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendação não encontrada")
    return rec


@app.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    deleted = user_crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")


@app.get("/jobs")
async def list_jobs(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return get_jobs(db)


# Sync
@app.post("/sync-global")
async def trigger_global_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return sync_all_global_terms(db, background_tasks)


@app.post("/sync-global/force")
async def force_global_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    from crud.scrape_history import clear_scrape_history
    clear_scrape_history(db)
    return sync_all_global_terms(db, background_tasks)
