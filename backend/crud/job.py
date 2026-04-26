from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models

def create_job(db: Session, job_data: dict) -> tuple:
    existing_job = db.query(models.Job).filter(models.Job.url == job_data["url"]).first()
    if existing_job:
        return existing_job, False

    db_job = models.Job(**job_data)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job, True

def get_jobs(db: Session, skip: int = 0, limit: int = 100, only_recent: bool = True):
    query = db.query(models.Job)
    
    if only_recent:
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(models.Job.posted_at >= one_week_ago)
        
    return query.order_by(models.Job.posted_at.desc()).offset(skip).limit(limit).all()
