import os
import httpx
from dotenv import load_dotenv

load_dotenv()

EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY")
EVOLUTION_API_INSTANCE = os.getenv("EVOLUTION_API_INSTANCE")

async def send_whatsapp_message(phone: str, message: str):
    """
    Envia uma mensagem via Evolution API.
    """
    if not EVOLUTION_API_URL or not EVOLUTION_API_KEY or not EVOLUTION_API_INSTANCE:
        print("[WHATSAPP] Credenciais não configuradas no .env. Ignorando envio.")
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
                print(f"[WHATSAPP] Mensagem enviada para {phone}")
                return True
            else:
                print(f"[WHATSAPP] Erro ao enviar: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        print(f"[WHATSAPP] Exceção ao enviar: {str(e)}")
        return False
