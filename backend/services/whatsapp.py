import os
import httpx
from dotenv import load_dotenv
from logger import get_logger

load_dotenv()

log = get_logger("whatsapp")

EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY")
EVOLUTION_API_INSTANCE = os.getenv("EVOLUTION_API_INSTANCE")

async def send_whatsapp_message(phone: str, message: str):
    """
    Envia uma mensagem via Evolution API.
    """
    if not EVOLUTION_API_URL or not EVOLUTION_API_KEY or not EVOLUTION_API_INSTANCE:
        log.warning("Credenciais não configuradas no .env. Ignorando envio.", extra={"phone": phone})
        return False

    url = f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_API_INSTANCE}"

    headers = {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY
    }

    payload = {
        "number": phone,
        "text": message
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code == 201 or response.status_code == 200:
                log.info("Mensagem enviada", extra={"phone": phone})
                return True
            else:
                log.error("Erro ao enviar mensagem", extra={"phone": phone, "status_code": response.status_code, "body": response.text})
                return False
    except Exception as e:
        log.exception("Exceção ao enviar mensagem", extra={"phone": phone, "error": str(e)})
        return False
