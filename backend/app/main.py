# Automail Backend - Ricardo Alexandre Silva Galvão Filho - AutoU Case 2025
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os

from .services import analyze_text
from .utils import extract_text_from_file

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")


class AnalysisResponse(BaseModel):
    category: str
    suggested_response: str


app = FastAPI(title="Automail API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=200)
def health_check():
    """Endpoint to check if the API is running."""
    return {"status": "ok"}


@app.get("/")
def read_root():
    """Root endpoint to check if the API is running."""
    return {"message": "API do Automail"}


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_email(
    request: Request,
    text: Optional[str] = Form(None), file: Optional[UploadFile] = File(None)
):
    """Accepts either a text (form field) or an uploaded file (.txt/.pdf).

    Returns a JSON with `category` and `suggested_response`.
    """
    extracted = ""
    content_type = request.headers.get('content-type', '')
    if 'application/json' in content_type:
        try:
            data = await request.json()
            extracted = (data.get('text') or '').strip()
        except Exception:
            extracted = ''
    else:
        if file is not None:
            contents = await file.read()
            extracted = extract_text_from_file(file.filename, contents)
        else:
            extracted = (text or "").strip()

    if not extracted:
        return AnalysisResponse(
            category="Improdutivo",
            suggested_response=(
                "Nenhum texto fornecido para análise. Por favor cole o e-mail ou faça upload de um arquivo .txt/.pdf."
            ),
        )

    result = analyze_text(extracted)
    return AnalysisResponse(
        category=result.get("category", "Indefinido"),
        suggested_response=result.get("suggested_response", ""),
    )

