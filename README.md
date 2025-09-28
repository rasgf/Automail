# Automail - AI Email Assistant 📧✨

Uma aplicação web inteligente que classifica e-mails, sugere respostas e otimiza seu fluxo de trabalho, construída como solução para o Case Prático da AutoU.

**[Link para a Aplicação Online](https://automail-challenge.vercel.app) (Substituir pela URL da Vercel)**
**[Link para o Vídeo de Demonstração](https://youtube.com/placeholder) (Substituir pela URL do YouTube)**

---

## 🚀 Visão Geral

Este projeto vai além de um simples classificador de e-mails. Ele foi concebido como um protótipo para um **ambiente de gerenciamento de e-mails inteligente**, focado em três pilares:

1.  **Inteligência Híbrida:** Garante a melhor análise possível usando a API do Google Gemini, mas mantém a funcionalidade 100% do tempo com um robusto mecanismo de fallback local baseado em análise de intenção.
2.  **Experiência de Usuário Premium:** Oferece uma interface fluida, elegante e responsiva, inspirada nos melhores princípios de design da Apple (Liquid Glass) e Microsoft (Fluent UI), com uma experiência mobile que simula aplicativos nativos.
3.  **Foco no Fluxo de Trabalho:** Transforma a análise de e-mails em um fluxo de trabalho prático, com caixas de entrada, ações contextuais e gerenciamento de estado.

## ✨ Principais Features

*   **Classificação Inteligente:** Categoriza e-mails como "Produtivo" ou "Improdutivo" usando IA.
*   **Sugestão de Respostas Contextuais:** Gera respostas automáticas adequadas à intenção do e-mail.
*   **Arquitetura de IA Híbrida e Resiliente:** Prioriza a API do Google Gemini e possui um sofisticado sistema de fallback que funciona offline.
*   **Interface "Liquid Glass" Sofisticada:** Design moderno com efeitos de vidro translúcido, blobs animados e micro-interações.
*   **Experiência Mobile Nativa:**
    *   Layout totalmente responsivo que se transforma de sidebar para header.
    *   Menu "gaveta" (drawer) para navegação em telas pequenas.
    *   Animação de painel deslizante (estilo Outlook) para visualização de e-mails.
    *   Gesto de "swipe-to-return" para uma navegação intuitiva.
*   **Gerenciamento de E-mails:** Caixas de entrada separadas para e-mails produtivos e improdutivos.
*   **Ações Contextuais:** Botões para "Enviar Resposta" ou "Apagar", dependendo da categoria do e-mail.
*   **Suporte a Texto e Arquivos:** Analisa conteúdo de texto, `.txt` e `.pdf`.

## 🛠️ Tech Stack

### Frontend
*   **React (Vite):** Para uma interface de usuário reativa e performática.
*   **CSS Puro:** Estilização avançada com foco em performance, responsividade e animações.
*   **React Icons:** Para uma iconografia limpa e consistente.

### Backend
*   **Python 3.11**
*   **FastAPI:** Para a construção de uma API RESTful de alta performance.
*   **Uvicorn:** Como servidor ASGI.
*   **Google Generative AI:** Para a análise principal via API do Gemini.
*   **NLTK:** Para pré-processamento de texto (tokenização, stopwords, stemming) no mecanismo de fallback.
*   **PyPDF2:** Para extração de texto de arquivos PDF.

## 🏛️ Decisões de Arquitetura

1.  **Modelo de IA Híbrido:** A decisão mais importante foi não depender 100% de uma API externa. O sistema primeiro tenta usar o Gemini. Se a API estiver indisponível (falha, chave não configurada), ele aciona um **fallback local inteligente**. Este fallback não é apenas uma lista de palavras-chave, mas um pequeno motor de **análise de intenção** que classifica o e-mail e escolhe uma resposta contextual, garantindo a resiliência e a funcionalidade contínua da aplicação.

2.  **Design Responsivo "Mobile-First" na Prática:** A interface foi projetada para o desktop, mas a experiência mobile foi completamente reimaginada, não apenas adaptada. Adotamos padrões de UX de aplicativos nativos, como o painel deslizante, para garantir que a usabilidade em telas pequenas fosse intuitiva e fluida, em vez de comprometida.

## ⚙️ Como Executar Localmente

**Pré-requisitos:**
*   Node.js (v18 ou superior)
*   Python (v3.9 ou superior)
*   Uma chave de API do [Google Gemini](https://aistudio.google.com/app/apikey) (opcional, para usar a análise principal).

**1. Backend:**

```bash
# Navegue até a pasta do backend
cd backend

# Crie e ative um ambiente virtual
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Crie um arquivo .env na pasta 'backend' e adicione sua chave da API
echo "GEMINI_API_KEY='SUA_CHAVE_AQUI'" > .env

# Inicie o servidor
uvicorn app.main:app --reload --port 8000
```

**2. Frontend (em um novo terminal):**

```bash
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`. O proxy do Vite já está configurado para se comunicar com o backend na porta 8000.

## ☁️ Deploy

*   **Backend:** A aplicação está configurada para deploy na **Render** através do arquivo `render.yaml`.
*   **Frontend:** A aplicação está configurada para deploy na **Vercel**, com o arquivo `vercel.json` gerenciando o proxy para a API de backend.

## 📜 Licença

Este projeto é distribuído sob uma licença proprietária. O uso deste código é estritamente para fins de avaliação no processo seletivo da AutoU.

Para mais detalhes, consulte o arquivo [LICENSE](LICENSE).