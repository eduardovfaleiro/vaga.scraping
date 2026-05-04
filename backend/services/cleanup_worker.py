import datetime
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import select, not_
import models
from database import SessionLocal
from logger import get_logger

log = get_logger("cleanup_worker")

def perform_cleanup(db: Session):
    """
    Executa a limpeza periódica do banco de dados.
    """
    log.info("Iniciando limpeza periódica do banco de dados")
    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    
    # 1. Deletar recomendações rejeitadas há mais de 7 dias
    seven_days_ago = now - datetime.timedelta(days=7)
    deleted_recs = db.query(models.Recommendation).filter(
        models.Recommendation.status == "rejected",
        models.Recommendation.updated_at < seven_days_ago
    ).delete(synchronize_session=False)
    log.info(f"Recomendações rejeitadas removidas: {deleted_recs}")
    
    # 2. Identificar e deletar vagas antigas (> 3 meses) que NÃO possuem aplicações (status 'applied')
    three_months_ago = now - datetime.timedelta(days=90)
    
    # Subquery para encontrar IDs de vagas que possuem alguma aplicação
    vagas_com_aplicacao = select(models.Recommendation.job_id).filter(
        models.Recommendation.status == "applied"
    ).scalar_subquery()
    
    # Vagas antigas sem aplicações
    old_jobs_to_delete_query = db.query(models.Job).filter(
        models.Job.posted_at < three_months_ago,
        not_(models.Job.id.in_(vagas_com_aplicacao))
    )
    
    job_ids_to_delete = [j.id for j in old_jobs_to_delete_query.all()]
    if job_ids_to_delete:
        # Deletamos as recomendações manualmente antes para garantir compatibilidade
        # (ex: SQLite sem foreign keys ativas nos testes)
        db.query(models.Recommendation).filter(
            models.Recommendation.job_id.in_(job_ids_to_delete)
        ).delete(synchronize_session=False)
        
        deleted_jobs = db.query(models.Job).filter(
            models.Job.id.in_(job_ids_to_delete)
        ).delete(synchronize_session=False)
        log.info(f"Vagas antigas sem aplicações removidas: {deleted_jobs}")

    # 3. Deletar vagas órfãs (sem nenhuma recomendação)
    vagas_com_recomendacao = select(models.Recommendation.job_id).scalar_subquery()
    deleted_orphans = db.query(models.Job).filter(
        not_(models.Job.id.in_(vagas_com_recomendacao))
    ).delete(synchronize_session=False)
    log.info(f"Vagas órfãs removidas: {deleted_orphans}")
    
    db.commit()
    log.info("Limpeza periódica concluída")

async def run_cleanup_worker():
    """
    Worker que roda a limpeza periodicamente (a cada 24h).
    """
    log.info("Worker de limpeza iniciado")
    while True:
        db = SessionLocal()
        try:
            perform_cleanup(db)
        except Exception as e:
            log.error(f"Erro durante a limpeza: {e}")
        finally:
            db.close()
        
        # Espera 24 horas (86400 segundos)
        await asyncio.sleep(86400)
