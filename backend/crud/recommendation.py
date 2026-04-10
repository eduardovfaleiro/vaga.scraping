from sqlalchemy.orm import Session
import models

def create_recommendation(db: Session, user_id: int, job_id: int, score: float):
    # Verifica se já existe uma recomendação dessa vaga para este usuário
    existing = db.query(models.Recommendation).filter(
        models.Recommendation.user_id == user_id,
        models.Recommendation.job_id == job_id
    ).first()
    
    if existing:
        return existing
        
    db_rec = models.Recommendation(
        user_id=user_id,
        job_id=job_id,
        match_score=score,
        status="pending"
    )
    db.add(db_rec)
    return db_rec

def get_user_recommendations(db: Session, user_id: int):
    return db.query(models.Recommendation).filter(
        models.Recommendation.user_id == user_id
    ).order_by(models.Recommendation.match_score.desc()).all()


def update_recommendation_status(db: Session, recommendation_id: int, user_id: int, status: str):
    rec = db.query(models.Recommendation).filter(
        models.Recommendation.id == recommendation_id,
        models.Recommendation.user_id == user_id
    ).first()
    if not rec:
        return None
    rec.status = status
    db.commit()
    db.refresh(rec)
    return rec