from sqlalchemy.orm import Session
import models
import datetime

def get_scrape_history(db: Session, term: str):
    return db.query(models.ScrapeHistory).filter(models.ScrapeHistory.term == term).first()

def get_recent_scrapes(db: Session, hours: int):
    threshold = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
    return db.query(models.ScrapeHistory).filter(models.ScrapeHistory.last_scraped >= threshold).all()

def clear_scrape_history(db: Session):
    db.query(models.ScrapeHistory).delete()
    db.commit()

def upsert_scrape_history(db: Session, term: str):
    history = get_scrape_history(db, term)
    if history:
        history.last_scraped = datetime.datetime.utcnow()
    else:
        history = models.ScrapeHistory(term=term, last_scraped=datetime.datetime.utcnow())
        db.add(history)
    db.commit()
    db.refresh(history)
    return history
