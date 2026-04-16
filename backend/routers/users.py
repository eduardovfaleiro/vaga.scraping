from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud.job import get_jobs
import crud.recommendation as recommendation_crud
import crud.user as user_crud
from services.matcher import process_new_jobs_for_user
from services.auth import get_current_user
import schemas
from schemas.recommendation import RecommendationStatusUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=schemas.User, status_code=201)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user_crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    created_user = user_crud.create_user(db, user)
    jobs = get_jobs(db)
    await process_new_jobs_for_user(db, created_user, jobs)
    return created_user


@router.get("/{user_id}", response_model=schemas.User)
async def read_user(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return current_user


@router.get("/{user_id}/recommendations")
async def get_recommendations(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return recommendation_crud.get_user_recommendations(db, user_id)


@router.patch("/{user_id}/recommendations/{recommendation_id}")
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


@router.delete("/{user_id}", status_code=204)
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
