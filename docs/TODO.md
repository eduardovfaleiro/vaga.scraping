# 📝 Plano de Lançamento e Checklist de Progresso - Vaga Pipe (v2)

Este documento reflete o estado atual da infraestrutura, desenvolvimento e os passos necessários para concluir o deploy em produção.

## 🟢 1. Infraestrutura AWS
- [x] **Instância EC2**: Criada e rodando Ubuntu 24.04.
- [x] **Elastic IP**: Alocado e associado ao IP privado `172.31.0.103`. (IP Público: `56.126.79.112`).
- [x] **Security Group**: Configurado com Inbound Rules para SSH (22), HTTP (80) e HTTPS (443).
- [ ] **Domínio**: Pendente (O acesso será feito via IP por enquanto).
- [ ] **Configuração de DNS**: Apontar subdomínios `api.vaga-pipe.com` e `app.vaga-pipe.com` (quando o domínio for adquirido).

## 🟢 2. Preparação do Servidor (Ubuntu)
- [x] **Acesso SSH**: Validado e funcional.
- [x] **Atualização Geral**: Rodar `sudo apt update && sudo apt upgrade -y`.
- [x] **Limpeza de Docker**: Remover containers/imagens antigas.
- [x] **Instalação do Docker**: Docker e Docker Compose instalados e atualizados.
- [x] **Permissões**: Usuário `ubuntu` adicionado ao grupo `docker`.

## 🟡 3. Configuração da Aplicação (Vaga Pipe)
- [x] **Repositório**: Projeto clonado em `/home/ubuntu/vaga-pipe`.
- [x] **Variáveis de Ambiente**: Arquivo `.env` configurado para produção.
- [x] **Deploy Inicial**: Execução bem-sucedida de `docker compose up -d`.
- [ ] **Banco de Dados**: Rodar as migrações (Alembic) no ambiente de produção.
- [ ] **Seed de Dados**: Inserir termos iniciais de scraping para popular a base.

## 🔴 4. Proxy Reverso e Nginx
- [ ] **Instalação do Nginx**: Configurar como proxy reverso para o frontend (porta 3000) e backend (porta 8000).
- [ ] **Configuração de Upstreams**: Otimizar a entrega do frontend na porta 80.
- [ ] **HTTPS (Certbot/Let's Encrypt)**: Aguardando domínio para ativação do SSL.

## 🚀 5. Próximos Passos (Pós-Launch)
- [ ] Implementar novos Scrapers (LinkedIn, Glassdoor).
- [ ] Refinar algoritmo de Match Score.
- [ ] Configurar CI/CD via GitHub Actions para deploy automático na AWS.
- [ ] Monitoramento de logs e performance do servidor.

---
*Atualizado em: 10 de Maio de 2026*
