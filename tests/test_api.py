import os
import requests
import unittest
from dotenv import load_dotenv
import os

dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(dotenv_path=dotenv_path)

API_BASE_URL = "http://127.0.0.1:8000"
API_ENDPOINT = f"{API_BASE_URL}/api/analyze"

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

class TestApi(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """
        Configuração inicial da classe de teste.
        Verifica as chaves de API e define o modo de teste.
        """
        print(f"{bcolors.BOLD}Iniciando testes de integração da API AutoU...{bcolors.ENDC}")
        gemini_key = os.getenv("GEMINI_API_KEY")
        hf_key = os.getenv("HF_API_KEY")

        if hf_key:
            print(f"{bcolors.OKCYAN}INFO: Chave de API do Hugging Face detectada. Testando com o modelo HF.{bcolors.ENDC}\n")
        elif gemini_key:
            print(f"{bcolors.OKCYAN}INFO: Chave de API do Gemini detectada. Testando com a API do Gemini.{bcolors.ENDC}\n")
        else:
            print(f"{bcolors.WARNING}AVISO: Nenhuma chave de API (GEMINI_API_KEY ou HF_API_KEY) encontrada.{bcolors.ENDC}")
            print(f"{bcolors.WARNING}Testando o modo de fallback com classificador local baseado em regras/NLP.{bcolors.ENDC}\n")

    def _run_test(self, file_path: str, expected_category: str):
        """
        Função auxiliar para rodar um único teste para um arquivo de exemplo.
        """
        print(f"{bcolors.HEADER}--- Testando arquivo: {os.path.basename(file_path)} ---{bcolors.ENDC}")
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (os.path.basename(file_path), f, 'text/plain')}
                response = requests.post(API_ENDPOINT, files=files, timeout=30)
                response.raise_for_status()  

            data = response.json()
            category = data.get("category")
            suggested_response = data.get("suggested_response")

            print(f"Status da API: {bcolors.OKCYAN}{response.status_code}{bcolors.ENDC}")
            print(f"Categoria Esperada: {bcolors.OKBLUE}{expected_category}{bcolors.ENDC}")
            print(f"Categoria Recebida:   {bcolors.OKBLUE}{category}{bcolors.ENDC}")

            self.assertEqual(category, expected_category, f"A categoria para {os.path.basename(file_path)} deveria ser '{expected_category}' mas foi '{category}'")
            
            print(f"{bcolors.OKGREEN}[SUCCESS] A categoria corresponde ao esperado.{bcolors.ENDC}")
            print("Resposta Sugerida:")
            print(f"{bcolors.WARNING}{suggested_response}{bcolors.ENDC}\n")

        except requests.exceptions.RequestException as e:
            self.fail(f"{bcolors.FAIL}[ERROR] Falha na requisição para a API: {e}{bcolors.ENDC}\n")
        except Exception as e:
            self.fail(f"{bcolors.FAIL}[ERROR] Ocorreu um erro inesperado: {e}{bcolors.ENDC}\n")

    def test_productive_sample(self):
        """
        Testa a classificação de um exemplo produtivo.
        """
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "..", "examples", "sample_productive.txt")
        self._run_test(file_path, "Produtivo")

    def test_nonproductive_sample(self):
        """
        Testa a classificação de um exemplo improdutivo.
        """
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "..", "examples", "sample_nonproductive.txt")
        self._run_test(file_path, "Improdutivo")

if __name__ == "__main__":
    unittest.main()
