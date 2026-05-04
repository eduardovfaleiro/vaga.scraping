import models
import datetime
from sqlalchemy.orm import Session
from services.cleanup_worker import perform_cleanup

def test_cleanup_ignored_recommendations(db: Session):
    """
    Testa se recomendações ignoradas (rejected) há mais de 7 dias são excluídas,
    mas as recentes são mantidas.
    """
    # 1. Setup
    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    
    # Recomendações que devem ser apagadas (> 7 dias)
    old_date = now - datetime.timedelta(days=8)
    
    # Recomendações que devem ser mantidas (< 7 dias)
    recent_date = now - datetime.timedelta(days=6)

    job1 = models.Job(title="Old Job", url="url1")
    job2 = models.Job(title="Recent Job", url="url2")
    db.add_all([job1, job2])
    db.commit()

    # Criamos as recomendações e manipulamos o updated_at
    rec_old = models.Recommendation(job_id=job1.id, status="rejected", updated_at=old_date)
    rec_recent = models.Recommendation(job_id=job2.id, status="rejected", updated_at=recent_date)
    rec_applied = models.Recommendation(job_id=job2.id, status="applied", updated_at=old_date)
    
    db.add_all([rec_old, rec_recent, rec_applied])
    db.commit()

    # Guardamos IDs para evitar ObjectDeletedError
    rec_old_id = rec_old.id
    rec_recent_id = rec_recent.id
    rec_applied_id = rec_applied.id
    job1_id = job1.id
    job2_id = job2.id

    # 2. Action
    perform_cleanup(db)
    
    # 3. Assertions
    assert db.query(models.Recommendation).filter(models.Recommendation.id == rec_old_id).first() is None
    assert db.query(models.Recommendation).filter(models.Recommendation.id == rec_recent_id).first() is not None
    assert db.query(models.Recommendation).filter(models.Recommendation.id == rec_applied_id).first() is not None
    assert db.query(models.Job).filter(models.Job.id == job1_id).first() is None
    assert db.query(models.Job).filter(models.Job.id == job2_id).first() is not None

def test_cleanup_old_pending_jobs(db: Session):
    """
    Testa se vagas postadas há mais de 3 meses com apenas recomendações pendentes
    são excluídas em cascata.
    """
    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    old_post_date = now - datetime.timedelta(days=91)
    recent_post_date = now - datetime.timedelta(days=80)

    # Vaga antiga (deve ser apagada)
    job_old = models.Job(title="Very Old Job", url="old_url", posted_at=old_post_date)
    
    # Vaga recente (deve ser mantida)
    job_recent = models.Job(title="Recent Job", url="recent_url", posted_at=recent_post_date)
    
    # Vaga antiga mas com aplicação (deve ser mantida)
    job_old_applied = models.Job(title="Old but Applied", url="applied_url", posted_at=old_post_date)

    db.add_all([job_old, job_recent, job_old_applied])
    db.commit()

    rec_pending = models.Recommendation(job_id=job_old.id, status="pending")
    rec_recent = models.Recommendation(job_id=job_recent.id, status="pending")
    rec_applied = models.Recommendation(job_id=job_old_applied.id, status="applied")

    db.add_all([rec_pending, rec_recent, rec_applied])
    db.commit()

    job_old_id = job_old.id
    job_recent_id = job_recent.id
    job_old_applied_id = job_old_applied.id

    # Action
    perform_cleanup(db)

    # Assertions
    assert db.query(models.Job).filter(models.Job.id == job_old_id).first() is None
    assert db.query(models.Job).filter(models.Job.id == job_recent_id).first() is not None
    assert db.query(models.Job).filter(models.Job.id == job_old_applied_id).first() is not None
    
    assert db.query(models.Recommendation).filter(models.Recommendation.job_id == job_old_id).first() is None

def test_cleanup_orphan_jobs(db: Session):
    """
    Testa se vagas que não possuem nenhuma recomendação associada (órfãs) 
    também são limpas para não poluir o banco.
    """
    job_orphan = models.Job(title="Orphan Job", url="orphan_url")
    job_with_rec = models.Job(title="Job with Rec", url="with_rec_url")
    db.add_all([job_orphan, job_with_rec])
    db.commit()

    rec = models.Recommendation(job_id=job_with_rec.id, status="pending")
    db.add(rec)
    db.commit()

    job_orphan_id = job_orphan.id
    job_with_rec_id = job_with_rec.id

    # Action
    perform_cleanup(db)

    # Assertions
    assert db.query(models.Job).filter(models.Job.id == job_orphan_id).first() is None
    assert db.query(models.Job).filter(models.Job.id == job_with_rec_id).first() is not None

def test_cleanup_preserves_job_if_active_for_other_user(db: Session):
    """
    Cenário Crítico: Vaga antiga (> 3 meses) que foi ignorada por um usuário,
    mas foi APLICADA por outro. A vaga deve ser MANTIDA.
    """
    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    old_date = now - datetime.timedelta(days=91)

    job = models.Job(title="Shared Old Job", url="shared_url", posted_at=old_date)
    db.add(job)
    db.commit()

    # Usuário 1 ignorou (seria candidata a deletar a rec)
    rec1 = models.Recommendation(job_id=job.id, status="rejected", updated_at=old_date)
    # Usuário 2 aplicou (torna a vaga "viva" e não pode ser deletada)
    rec2 = models.Recommendation(job_id=job.id, status="applied", updated_at=now)

    db.add_all([rec1, rec2])
    db.commit()

    rec1_id = rec1.id
    rec2_id = rec2.id
    job_id = job.id

    # Action
    perform_cleanup(db)

    # Após o cleanup:
    # 1. rec1 deve sumir (rejeitada > 7 dias)
    # 2. rec2 deve ficar (aplicada)
    # 3. job deve ficar (porque rec2 é 'applied')
    assert db.query(models.Recommendation).filter(models.Recommendation.id == rec1_id).first() is None
    assert db.query(models.Recommendation).filter(models.Recommendation.id == rec2_id).first() is not None
    assert db.query(models.Job).filter(models.Job.id == job_id).first() is not None


