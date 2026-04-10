import asyncio
from database import SessionLocal
from crud.outbox import get_pending_entries, mark_sent, mark_failed, increment_attempt, MAX_ATTEMPTS
from services.whatsapp import send_whatsapp_message
from logger import get_logger

log = get_logger("outbox_worker")

POLL_INTERVAL = 30  # segundos entre cada ciclo


async def run_outbox_worker():
    log.info("Outbox worker iniciado")
    while True:
        db = SessionLocal()
        try:
            entries = get_pending_entries(db)
            for entry in entries:
                increment_attempt(db, entry)
                success = await send_whatsapp_message(entry.phone, entry.message)
                if success:
                    mark_sent(db, entry)
                    log.info("Mensagem enviada pelo outbox", extra={"id": entry.id, "phone": entry.phone})
                elif entry.attempts >= MAX_ATTEMPTS:
                    mark_failed(db, entry)
                    log.error("Mensagem movida para failed após tentativas esgotadas", extra={"id": entry.id})
        except Exception as e:
            log.exception("Erro no outbox worker", extra={"error": str(e)})
        finally:
            db.close()

        await asyncio.sleep(POLL_INTERVAL)
