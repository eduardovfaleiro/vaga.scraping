# ⚖️ Regras de Negócio: Vaga Pipe

Este documento descreve as regras e restrições que regem o comportamento do sistema Vaga Pipe.

## 1. Gestão de Usuários e Perfis
- **RN01 - Identificação Única**: Cada usuário é identificado exclusivamente por seu e-mail ou identificador de provedor social (Google/GitHub).
- **RN02 - Configuração de Match**: O usuário deve definir um `match_threshold` (limiar de compatibilidade) entre 0 e 1. O padrão recomendado é 0.5.
- **RN03 - Perfil de Skills**: As habilidades do usuário devem ser armazenadas como uma lista de tags para facilitar a comparação com as descrições das vagas.

## 2. Coleta de Dados (Scraping)
- **RN04 - Unicidade de Vaga**: Uma vaga é considerada única no sistema através de sua `URL`. Tentativas de inserir a mesma URL devem ser ignoradas ou atualizadas.
- **RN05 - Frequência de Scraping**: O sistema deve manter um histórico de termos pesquisados (`ScrapeHistory`) para evitar buscas redundantes em intervalos muito curtos.

## 3. Algoritmo de Matching
- **RN06 - Cálculo de Score**: O `match_score` deve ser calculado com base na presença das skills do usuário no título e descrição da vaga.

## 4. Recomendações e Pipeline
- **RN08 - Filtro de Exibição**: Somente recomendações com `match_score >= user.match_threshold` devem ser visíveis para o usuário no dashboard principal.
- **RN09 - Fluxo de Status**: O status de uma recomendação segue o fluxo:
  - `pending`: Vaga recém-descoberta.
  - `applied`: O usuário confirmou que se candidatou.
  - `rejected`: O usuário descartou a vaga ou foi reprovado no processo.
- **RN10 - Persistência de Decisão**: Uma vez que o usuário marca uma vaga como `rejected`, ela não deve reaparecer como recomendação `pending` para o mesmo usuário.

---
*Documento atualizado em: 10 de Maio de 2026*
