from sqlalchemy.orm import Session
import models
import schemas
from services.auth import hash_password


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        title=user.title,
        skills=user.skills,
        match_threshold=user.match_threshold,
        phone=user.phone,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return False
    db.query(models.Recommendation).filter(models.Recommendation.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return True


def update_user(db: Session, user_id: int, user_update: schemas.UserCreate):
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in user_update.dict().items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user
