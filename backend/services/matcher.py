from sqlalchemy.orm import Session
from thefuzz import fuzz
from crud.user import get_users
from crud.recommendation import create_recommendation
from services.whatsapp import send_whatsapp_message
from models import User
from constants import DEFAULT_MATCH_THRESHOLD
from logger import get_logger

log = get_logger("matcher")


def _score_job(skills: list[str], job_title: str, job_description: str) -> float:
    """
    Calcula o score de match entre as skills do usuário e uma vaga.
    Cada skill é verificada individualmente contra título e descrição.
    O score final é a porcentagem de skills que deram match.
    O título tem peso maior (2x) que a descrição.
    """
    if not skills:
        return 0.0

    title = job_title.lower() if job_title else ""
    description = job_description.lower() if job_description else ""

    matched = 0
    for skill in skills:
        skill = skill.lower().strip()
        if not skill:
            continue

        title_score = fuzz.partial_ratio(skill, title)
        description_score = fuzz.partial_ratio(skill, description)

        # Peso 2x para título
        weighted_score = (title_score * 2 + description_score) / 3

        if weighted_score >= 70:
            matched += 1

    return round((matched / len(skills)) * 100, 1)


async def process_new_jobs_for_user(db: Session, user: User, new_jobs: list):
    if not user.skills:
        return

    skills = user.skills if isinstance(user.skills, list) else []
    match_threshold = user.match_threshold or DEFAULT_MATCH_THRESHOLD

    for job in new_jobs:
        if not job.description and not job.title:
            continue

        match_score = _score_job(skills, job.title, job.description)

        log.debug("Job scored", extra={"user": user.name, "job": job.title, "score": match_score, "threshold": match_threshold})

        if match_score >= match_threshold:
            create_recommendation(db, user_id=user.id, job_id=job.id, score=match_score)

            if user.phone:
                message = (
                    f"🚀 *Nova vaga com Match!*\n\n"
                    f"*Título:* {job.title}\n"
                    f"*Empresa:* {job.company or 'Não informada'}\n"
                    f"*Score:* {match_score}%\n"
                    f"*Link:* {job.url}"
                )
                await send_whatsapp_message(user.phone, message)

                log.info("Vaga recomendada", extra={"user": user.name, "job": job.title, "score": match_score})


async def process_new_jobs_for_users(db: Session, new_jobs: list):
    if not new_jobs:
        return

    users = get_users(db, skip=0, limit=1000)

    for user in users:
        await process_new_jobs_for_user(db, user, new_jobs)
