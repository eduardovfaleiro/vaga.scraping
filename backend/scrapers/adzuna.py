from typing import List, Dict
import httpx
import os
from scrapers.base import BaseScraper
from logger import get_logger

log = get_logger("adzuna")

class AdzunaScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        # Recomendado usar variáveis de ambiente para segurança
        self.app_id = os.getenv("ADZUNA_APP_ID")
        self.app_key = os.getenv("ADZUNA_APP_KEY")
        # 'br' para vagas no Brasil
        self.base_url = "https://api.adzuna.com/v1/api/jobs/br/search/1"

    async def scrape(self, search_term: str) -> List[Dict]:
        """
        Busca vagas na Adzuna usando a API oficial.
        """
        if not self.app_id or not self.app_key:
            log.error("ADZUNA_APP_ID ou ADZUNA_APP_KEY não configurados nas variáveis de ambiente.")
            return []

        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "what": search_term,
            "results_per_page": 10,
            "content-type": "application/json"
        }
        
        async with httpx.AsyncClient(headers=self.headers) as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                jobs = []
                for entry in data.get("results", []):
                    # Adzuna retorna HTML básico na descrição, você pode limpar com BS4 se quiser
                    jobs.append({
                        "title": entry.get("title"),
                        "company": entry.get("company", {}).get("display_name"),
                        "location": entry.get("location", {}).get("display_name") or "Remoto",
                        "description": entry.get("description", ""),
                        "url": entry.get("redirect_url"),
                        "source": "Adzuna"
                    })
                return jobs
            except Exception as e:
                log.exception("Erro ao buscar na Adzuna", extra={"search_term": search_term, "error": str(e)})
                return []
