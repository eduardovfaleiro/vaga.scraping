.PHONY: migrate migrate-create

migrate: ## Aplica todas as migrations pendentes
	docker exec -it $$(docker ps -q -f name=backend) alembic upgrade head

migrate-create: ## Cria uma nova migration (uso: make migrate-create MSG="descricao")
	docker exec -it $$(docker ps -q -f name=backend) alembic revision --autogenerate -m "$(MSG)"