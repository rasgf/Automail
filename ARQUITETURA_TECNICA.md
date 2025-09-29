# Arquitetura Técnica: Classificador de E-mails AutoU

## 1. Visão Geral da Arquitetura

A solução é composta por uma arquitetura de 3 camadas, promovendo uma clara separação de responsabilidades que facilita o desenvolvimento, os testes e o deploy futuro.

```
[ Frontend (HTML/JS) ] <--> [ Backend API (FastAPI) ] <--> [ Serviço de Análise ]
                                                         |
                                                         +--> [ 1. Google Gemini API ]
                                                         |
                                                         +--> [ 2. Fallback (NLP com NLTK) ]
```

---

## 2. Componentes e Tecnologias

### 2.1. Frontend (Interface do Usuário)

-   **Tecnologia:** React + Vite, CSS moderno com variáveis e `backdrop-filter`.
-   **Arquivos principais:** `frontend/src/App.jsx`, `frontend/src/index.css`, `frontend/vite.config.js` (proxy para `/api`).
-   **Descrição:** Interface reativa com navegação lateral, tema claro/escuro, controle de fundo dinâmico e experiência mobile dedicada.
-   **UI/UX:**
    -   Liquid Glass (blur/saturate/contrast) com fallback via `@supports`. Ver [MDN `backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter).
    -   Drawer mobile com overlay e `aria-modal`, fecha com ESC e bloqueia scroll.
    -   Fluxo mobile: lista → detalhe (tela cheia) com swipe‑to‑back (>80px) e botão “Voltar”.
    -   Toggle de tema com ícones (sol/lua) e microanimação tipo “liquid glass”.

### 2.2. Backend (Servidor de Aplicação)

-   **Tecnologia:** Python 3.11+ com FastAPI.
-   **Justificativa:** FastAPI foi escolhido por sua alta performance, sintaxe moderna e geração automática de documentação (Swagger UI), alinhando-se às melhores práticas de desenvolvimento de APIs.
-   **Bibliotecas Essenciais:**
    -   `fastapi` / `uvicorn`: Framework web e servidor ASGI.
    -   `python-multipart`: Para manipulação de uploads de arquivos.
    -   `google-generativeai`: SDK oficial para a API do Google Gemini.
    -   `python-dotenv`: Para gerenciamento de variáveis de ambiente (`.env`).
    -   `nltk`: Para o pipeline de NLP do mecanismo de fallback.
    -   `PyPDF2`: Para extração de texto de arquivos PDF.

### 2.3. Serviço de IA (Classificação e Geração)

-   **Estratégia Híbrida:** A aplicação adota uma abordagem híbrida para garantir máxima resiliência e custo-efetividade.

-   **1. Análise Primária (Google Gemini):**
    -   **Modelo:** `gemini-flash-latest`.
    -   **Justificativa:** Este modelo foi escolhido por ser otimizado para velocidade e baixo custo, sendo ideal para tarefas de classificação de alto volume sem esgotar a cota gratuita rapidamente. A análise é instruída via *few-shot prompting* para retornar uma estrutura JSON precisa.

-   **2. Mecanismo de Fallback (NLP Local):**
    -   **Tecnologia:** NLTK (Natural Language Toolkit).
    -   **Descrição:** Se a chave da API do Gemini não for fornecida, o sistema aciona um classificador local. Este não é um simples buscador de palavras-chave; ele executa um pipeline de NLP que inclui tokenização, remoção de stopwords em português e *stemming* (redução de palavras ao seu radical), oferecendo uma análise de regras surpreendentemente robusta.

---

## 3. Configuração e Dependências Operacionais

Para o correto funcionamento do sistema, as seguintes configurações de ambiente são cruciais:

1.  **Chave de API (Opcional mas Recomendado):**
    -   A chave `GEMINI_API_KEY` é gerenciada como uma variável de ambiente segura na plataforma de hospedagem (Render).
    -   Para desenvolvimento local, ela deve ser colocada em um arquivo `.env` na pasta `backend/`, que é explicitamente ignorado pelo Git (`.gitignore`) para evitar vazamento de segredos.
    -   A aplicação é totalmente funcional sem esta chave, operando no modo de fallback.

2.  **Dados do NLTK (Automatizado):**
    -   O mecanismo de fallback depende dos pacotes `stopwords` e `punkt` do NLTK.
    -   A instalação desses pacotes é **automatizada durante o processo de build** na Render, conforme definido no `render.yaml`. Isso garante que o ambiente de produção sempre tenha as dependências corretas sem intervenção manual.

---

## 4. Contrato da API

-   **Endpoint:** `POST /api/analyze`
-   **Request:** Aceita `application/json` (`{ "text": "..." }`) ou `multipart/form-data` (campo `file`).
-   **Response (200 OK):**

```json
{
  "category": "Produtivo" | "Improdutivo",
  "suggested_response": "string"
}
```

### 4.1. Convenções do Frontend
-   Upload de arquivo (`.txt`, `.pdf`): quando não há texto, o “E‑mail Original” exibe apenas o ícone conforme tipo.
-   Itens possuem `id` numérico e `subject` derivado do conteúdo/arquivo enviado.

---

## 5. Arquitetura de Deploy

A solução foi implantada utilizando uma arquitetura desacoplada e moderna, aproveitando os pontos fortes de diferentes plataformas de nuvem (PaaS).

*   **Backend (API):**
    *   **Plataforma:** Render
    *   **Descrição:** A aplicação FastAPI em Python é conteinerizada e hospedada como um serviço web na Render. O arquivo `render.yaml` no repositório define a Infraestrutura como Código (IaC), automatizando o ambiente, o comando de build (incluindo a instalação de dependências e dados do NLTK) e o comando de inicialização.

*   **Frontend (UI):**
    *   **Plataforma:** Vercel
    *   **Descrição:** A aplicação React (Vite) é hospedada na Vercel, que otimiza os ativos estáticos e os distribui através de uma CDN global para garantir performance e baixa latência de acesso para usuários em qualquer lugar.

*   **Comunicação Frontend-Backend:**
    *   **Método:** Proxy Reverso (Serverless)
    *   **Descrição:** Para evitar problemas de CORS e não expor a URL do backend no navegador, o `vercel.json` configura uma regra de `rewrite`. Todas as chamadas do frontend para `/api/*` são interceptadas pela Vercel e redirecionadas de forma segura para o serviço backend na Render. O cliente nunca sabe o endereço real da API.

## 6. Próximos Passos Técnicos Sugeridos

-   **Expandir Cobertura de Testes:** Adicionar mais casos de teste unitário e de integração, explorando diferentes tipos de e-mails.
-   **Melhorar Extração de PDF:** Substituir `PyPDF2` por `PyMuPDF` para uma extração de texto mais precisa e robusta de arquivos PDF.
-   **CI/CD:** Configurar um pipeline de integração contínua (ex: GitHub Actions) para rodar testes automaticamente a cada commit.