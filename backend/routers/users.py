from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud.job import get_jobs
import crud.recommendation as recommendation_crud
import crud.user as user_crud
from services.matcher import process_new_jobs_for_user, process_user_against_existing_jobs
from services.auth import get_current_user
import schemas
from schemas.recommendation import RecommendationStatusUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=schemas.User, status_code=201)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user_crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    created_user = user_crud.create_user(db, user)
    await process_user_against_existing_jobs(db, created_user)
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


@router.post("/re-match")
async def trigger_re_match(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dispara manualmente o cruzamento do perfil do usuário logado 
    com as vagas recentes armazenadas no banco de dados.
    """
    await process_user_against_existing_jobs(db, current_user)
    return {"message": "Processamento de match iniciado para o seu perfil"}


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


@router.patch("/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    body: schemas.UserUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    # Salva skills antigas para checar se mudaram
    old_skills = current_user.skills
    
    updated = user_crud.update_user(db, user_id, body)
    if not updated:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Se as skills mudaram ou o threshold mudou, reprocessa as vagas existentes
    if updated.skills != old_skills or body.match_threshold is not None:
        await process_user_against_existing_jobs(db, updated)
        
    return updated


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
