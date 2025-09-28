import io
from typing import Optional

def extract_text_from_file(filename: str, content: bytes) -> str:
    """Extract text from uploaded file bytes. Supports .txt and .pdf (basic)."""
    name = filename.lower()
    if name.endswith('.txt'):
        try:
            return content.decode('utf-8')
        except Exception:
            try:
                return content.decode('latin-1')
            except Exception:
                return ""

    if name.endswith('.pdf'):
        try:
            import PyPDF2

            reader = PyPDF2.PdfReader(io.BytesIO(content))
            out = []
            for p in reader.pages:
                try:
                    out.append(p.extract_text() or "")
                except Exception:
                    continue
            return "\n".join(out)
        except Exception as e:
            print(f"PDF extraction failed: {e}")
            return ""

    return ""
