import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing from backend/.env")

client = genai.Client(
    api_key=api_key,
    http_options={
        "timeout": 30000
    }
)


def generate_ai_response(prompt: str) -> str:
    max_attempts = 5

    for attempt in range(max_attempts):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
            )

            if response.text:
                return response.text.strip()

        except Exception as error:
            print(
                f"Gemini error "
                f"(attempt {attempt + 1}/{max_attempts}): {error}"
            )

            error_text = str(error).lower()

            temporary_error = (
                "429" in error_text
                or "503" in error_text
                or "unavailable" in error_text
                or "timeout" in error_text
                or "deadline" in error_text
            )

            if temporary_error and attempt < max_attempts - 1:
                wait_time = 2 ** attempt

                print(
                    f"Retrying Gemini in {wait_time} seconds..."
                )

                time.sleep(wait_time)
                continue

            break

    return ""