# Variáveis
DOCKER_COMPOSE = docker compose

.PHONY: help up down restart status logs build sync shell-backend shell-db clean setup-scripts issue migrate migrate-create

help: ## Mostra esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Sobe todos os containers em modo daemon
	$(DOCKER_COMPOSE) up -d

down: ## Para todos os containers
	$(DOCKER_COMPOSE) down

restart: ## Reinicia todos os containers
	$(DOCKER_COMPOSE) restart

status: ## Mostra o status dos containers
	$(DOCKER_COMPOSE) ps

logs: ## Mostra os logs em tempo real
	$(DOCKER_COMPOSE) logs -f

build: ## Reconstrói as imagens dos containers
	$(DOCKER_COMPOSE) build --no-cache

sync: ## Dispara a sincronização global de termos (via curl)
	curl -X POST http://localhost:8000/sync-global

migrate: ## Aplica todas as migrations pendentes
	docker exec -it $$(docker ps -q -f name=backend) alembic upgrade head

migrate-create: ## Cria uma nova migration (uso: make migrate-create MSG="descricao")
	docker exec -it $$(docker ps -q -f name=backend) alembic revision --autogenerate -m "$(MSG)"

shell-backend: ## Acessa o terminal do container backend
	docker exec -it $$(docker ps -q -f name=backend) /bin/bash

shell-db: ## Acessa o terminal do banco de dados (Postgres)
	$(DOCKER_COMPOSE) exec db psql -U postgres -d vagas

clean: ## Remove containers, redes e volumes (CUIDADO: Apaga o banco de dados)
	$(DOCKER_COMPOSE) down -v