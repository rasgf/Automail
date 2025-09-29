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

## 💡 Melhorias e Refinamentos

Durante o desenvolvimento, o projeto passou por um ciclo de iteração para refinar a experiência do usuário e a robustez técnica.

### Experiência do Usuário (UX)
*   **Clareza da Proposta de Valor:** Com base em feedback de usuários, a comunicação da tela inicial foi reescrita para ser mais direta e orientada a benefícios (`microcopy`), deixando claro o propósito da ferramenta em menos de 5 segundos.
*   **Responsividade para Tablets:** Ajustes de CSS foram feitos para garantir uma experiência de usuário consistente e sem quebras de layout em telas de tamanho intermediário.

### Otimização de Deploy e Segurança
*   **Segurança (Hardening):** Após um alerta de segurança, a chave de API que havia sido acidentalmente versionada foi imediatamente invalidada. O arquivo `.env` foi removido, adicionado ao `.gitignore`, e o histórico do repositório foi completamente limpo para remover qualquer vestígio do segredo, seguindo as melhores práticas de segurança.
*   **Otimização de Build na Nuvem:** O processo de deploy na Render foi otimizado. Os pacotes de dados do NLTK agora são pré-instalados durante a fase de build, o que garante uma inicialização (`startup`) muito mais rápida e confiável da aplicação, eliminando erros de `timeout` (502) causados pelo "spin down" do plano gratuito.

## 🚀 Melhorias e Próximos Passos

Uma visão para a evolução do Automail, transformando-o de um protótipo em uma plataforma de produtividade completa.

### Inteligência e Automação
*   **Fine-Tuning de Modelo Dedicado:** Treinar (fine-tune) um modelo de linguagem open-source (como uma variação do Mistral ou Llama) com dados de e-mails específicos da empresa para aumentar drasticamente a acurácia da classificação e a relevância das respostas.
*   **Extração de Ações e Entidades:** Evoluir a IA para não apenas classificar, mas extrair "entidades" (ex: número do pedido, nome do cliente) e "intenções" (ex: "marcar reunião", "solicitar documento") para permitir automações mais profundas.
*   **Envio Automático Supervisionado:** Para e-mails classificados como "Improdutivos" com alta confiança, implementar uma opção para que o sistema envie a resposta e arquive o e-mail automaticamente.

### Integrações e Ecossistema (Workflow)
*   **Conexão com Sistemas de Ticketing:** Integrar com APIs de plataformas como Jira ou Zendesk para que um e-mail de suporte técnico possa criar um ticket automaticamente.
*   **Integração com Agendas:** Ao identificar um pedido de reunião, a IA poderia consultar a Google Agenda/Outlook do usuário e sugerir horários disponíveis na resposta.
*   **Dashboard de Métricas:** Criar um painel para gestores com métricas de produtividade da equipe (volume de e-mails, tempo médio de resposta, etc.).

### Experiência do Usuário (UX)
*   **Ações em Massa (Bulk Actions):** Permitir que o usuário selecione múltiplos e-mails e aplique uma ação em lote, como "Arquivar todos".
*   **Atalhos de Teclado:** Implementar atalhos para "power users" no desktop, permitindo navegar e gerenciar e-mails sem o mouse.

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