import os
import json
from typing import Dict, Optional
import re
import requests

import nltk
from nltk.corpus import stopwords
from nltk.stem import RSLPStemmer
from nltk.tokenize import word_tokenize

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = os.getenv("HF_MODEL", "google/flan-t5-small")

try:
    stopwords.words("portuguese")
except LookupError:
    nltk.download("stopwords")
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")


def _prompt_for_analysis(text: str) -> str:
    examples = [
        {
            "email": "Olá, preciso de uma atualização sobre o chamado 12345. O sistema retorna erro ao subir anexos.",
            "json": {"category": "Produtivo", "suggested_response": "Olá, obrigado pelo contato. Vamos verificar e retornaremos com um posicionamento."}
        },
        {
            "email": "Parabéns pelo lançamento, muito sucesso a todos!",
            "json": {"category": "Improdutivo", "suggested_response": "Olá, agradecemos a mensagem!"}
        }
    ]
    prompt = "Você é um assistente que classifica e-mails como 'Produtivo' ou 'Improdutivo' e sugere uma resposta corporativa."
    prompt += " Sempre retorne APENAS um objeto JSON válido com as chaves: category (Produtivo|Improdutivo) e suggested_response (string).\n\n"
    prompt += "EXEMPLOS:\n"
    for ex in examples:
        prompt += f"EMAIL: {ex['email']}\nSAÍDA_JSON: {json.dumps(ex['json'], ensure_ascii=False)}\n\n"
    prompt += "Analise o seguinte e-mail e retorne SOMENTE o JSON:\n"
    prompt += text
    return prompt

def _preprocess_text(text: str):
    try:
        stop_words = set(stopwords.words("portuguese"))
        stemmer = RSLPStemmer()
        words = word_tokenize(text.lower(), language="portuguese")
        return [stemmer.stem(word) for word in words if word.isalpha() and word not in stop_words]
    except LookupError:
        print("NLTK data not found. Falling back to basic split. Please run `python -m nltk.downloader stopwords punkt`")
        return text.lower().split()

def _parse_json_from_text(content: str) -> Optional[Dict[str, str]]:
    """Robustly extracts a JSON object from a string that might contain other text."""
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None

def _analyze_with_hf(text: str) -> Optional[Dict[str, str]]:
    """Analyzes text using Hugging Face Inference API."""
    try:
        hf_url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
        headers = {"Authorization": f"Bearer {HF_API_KEY}"}
        prompt = _prompt_for_analysis(text)
        payload = {"inputs": prompt, "parameters": {"max_new_tokens": 256}}
        
        response = requests.post(hf_url, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        content = data[0].get("generated_text", "") if isinstance(data, list) and data else ""

        return _parse_json_from_text(content)
    except requests.RequestException as e:
        print(f"Hugging Face request failed: {e}")
    except Exception as e:
        print(f"An error occurred during HF analysis: {e}")
    return None

def _analyze_with_gemini(text: str) -> Optional[Dict[str, str]]:
    """Analyzes text using the Google Gemini API."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = _prompt_for_analysis(text)
        response = model.generate_content(prompt)
        return _parse_json_from_text(response.text)
    except ImportError:
        print("Google Generative AI library not found. Run: pip install google-generativeai")
    except Exception as e:
        print(f"An error occurred during Gemini analysis: {e}")
    return None


def _analyze_with_fallback(text: str) -> Dict[str, str]:
    """
    Analyzes text using a local, rule-based classifier with contextual keywords
    and intent recognition. This provides a more robust fallback.
    """
    keyword_sets = {
        "meeting_proposal": ["reuni", "marc", "agend", "convit", "dispon", "call", "encontr", "horario", "calend"],
        "support_request": ["problem", "err", "suport", "ajud", "cham", "dificuldad", "erro", "bug", "incident", "falh"],
        "document_request": ["precis", "envi", "mand", "compartilh", "poderi", "gostaria", "acess", "copi", "document", "relatori", "planilh", "apresent"],
        "status_request": ["atualiz", "status", "pendenc", "praz", "andament", "posicion", "retorn", "novidad"],
        "question": ["duvid", "pergunt", "inform", "feedback", "esclarec", "gost", "sab"],
        
        "document_submission": ["segue", "anex", "estou enviando", "está o arquivo"],

        "nonproductive": ["obrig", "parabem", "agradec", "sucess", "bom dia", "boa tard", "boa noit", "feliz", "fest", "feriad", "confirmado", "ciente", "oportunidade", "exclusiv", "vagas", "demonstra", "concorrenc", "revolucion", "custos", "plataform", "especialist"]
    }

    responses = {
        "meeting_proposal": "Olá,\n\nObrigado pelo contato. Vou verificar a disponibilidade na agenda e retorno em breve para confirmarmos.\n\nAtenciosamente,\nEquipe",
        "support_request": "Olá,\n\nRecebemos sua solicitação de suporte. Nossa equipe técnica já está analisando o ocorrido e retornaremos com uma solução o mais breve possível.\n\nAtenciosamente,\nEquipe",
        "document_request": "Olá,\n\nRecebemos sua solicitação. Estamos localizando o documento e o enviaremos assim que possível.\n\nAtenciosamente,\nEquipe",
        "status_request": "Olá,\n\nObrigado por solicitar uma atualização. Estamos verificando o andamento da sua requisição e enviaremos um posicionamento detalhado em breve.\n\nAtenciosamente,\nEquipe",
        "question": "Olá,\n\nRecebemos sua dúvida. Nossa equipe está buscando a informação para lhe responder da forma mais completa possível e retornará em breve.\n\nAtenciosamente,\nEquipe",
        "document_submission": "Olá,\n\nAgradecemos o envio. O material foi recebido e será analisado por nossa equipe. Retornaremos caso seja necessário algum complemento.\n\nAtenciosamente,\nEquipe",
        "default_productive": "Olá,\n\nObrigado pelo contato. Recebemos sua mensagem e daremos o devido tratamento. Retornaremos em breve.\n\nAtenciosamente,\nEquipe",
        "default_improdutivo": "Olá,\n\nAgradecemos a mensagem. No momento, esta comunicação não requer uma ação imediata. Caso precise de suporte, por favor, envie um novo e-mail com mais detalhes.\n\nAtenciosamente,\nEquipe"
    }

    processed_words = _preprocess_text(text)
    
    scores = {category: 0 for category in keyword_sets}
    for word in processed_words:
        for category, kws in keyword_sets.items():
            for kw in kws:
                if word.startswith(kw):
                    scores[category] += 1
                    break 

    productive_scores = {k: v for k, v in scores.items() if k != "nonproductive"}
    nonproductive_score = scores.get("nonproductive", 0)

    max_productive_score = 0
    best_productive_category = None
    if any(s > 0 for s in productive_scores.values()):
        best_productive_category = max(productive_scores, key=productive_scores.get)
        max_productive_score = productive_scores[best_productive_category]

    if max_productive_score > 0 and max_productive_score >= nonproductive_score:
        category = "Produtivo"
        suggested = responses.get(best_productive_category, responses["default_productive"])
    else:
        category = "Improdutivo"
        suggested = responses["default_improdutivo"]
        
    return {"category": category, "suggested_response": suggested}


def analyze_text(text: str) -> Dict[str, str]:
    """Analyzes text by trying different providers (Gemini, HF) and falling back to a local classifier."""
    result = None

    if GEMINI_API_KEY:
        print("INFO: Chave do Gemini encontrada. Tentando análise via API do Gemini...")
        result = _analyze_with_gemini(text)
        if result:
            print("INFO: Análise com Gemini bem-sucedida.")

    if not result and HF_API_KEY:
        print("INFO: Chave do Hugging Face encontrada. Tentando análise via API do HF...")
        result = _analyze_with_hf(text)
        if result:
            print("INFO: Análise com Hugging Face bem-sucedida.")
        
    if not result:
        print("INFO: Nenhuma API configurada ou ambas falharam. Usando fallback local...")
        result = _analyze_with_fallback(text)
        print("INFO: Análise com fallback concluída.")
        
    return result
