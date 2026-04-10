import datetime
from sqlalchemy.orm import Session
import models

MAX_ATTEMPTS = 5


def create_outbox_entry(db: Session, phone: str, message: str) -> models.NotificationOutbox:
    """Cria entrada no outbox. Não faz commit — quem chama é responsável pelo commit."""
    entry = models.NotificationOutbox(phone=phone, message=message)
    db.add(entry)
    return entry


def get_pending_entries(db: Session) -> list[models.NotificationOutbox]:
    return (
        db.query(models.NotificationOutbox)
        .filter(
            models.NotificationOutbox.status == "pending",
            models.NotificationOutbox.attempts < MAX_ATTEMPTS,
        )
        .with_for_update(skip_locked=True)
        .limit(50)
        .all()
    )


def mark_sent(db: Session, entry: models.NotificationOutbox) -> None:
    entry.status = "sent"
    db.commit()


def mark_failed(db: Session, entry: models.NotificationOutbox) -> None:
    entry.status = "failed"
    db.commit()


def increment_attempt(db: Session, entry: models.NotificationOutbox) -> None:
    entry.attempts += 1
    entry.last_attempt_at = datetime.datetime.utcnow()
    db.commit()
