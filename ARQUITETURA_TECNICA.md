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

Para o correto funcionamento do sistema, duas configurações de ambiente são cruciais:

1.  **Chave de API (Opcional):**
    -   A chave `GEMINI_API_KEY` deve ser colocada em um arquivo `.env` na raiz da pasta `backend/`.
    -   A aplicação é totalmente funcional sem esta chave, operando no modo de fallback.

2.  **Dados do NLTK (Obrigatório para Fallback):**
    -   O mecanismo de fallback depende dos pacotes `stopwords` e `punkt`.
    -   A instalação é feita via comando: `python -m nltk.downloader stopwords punkt`.

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

## 5. Próximos Passos Técnicos Sugeridos

-   **Expandir Cobertura de Testes:** Adicionar mais casos de teste unitário e de integração, explorando diferentes tipos de e-mails.
-   **Melhorar Extração de PDF:** Substituir `PyPDF2` por `PyMuPDF` para uma extração de texto mais precisa e robusta de arquivos PDF.
-   **CI/CD:** Configurar um pipeline de integração contínua (ex: GitHub Actions) para rodar testes automaticamente a cada commit.