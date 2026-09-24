import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)


def generate_ai_response(prompt: str) -> str:
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
            )

            return response.text

        except Exception as error:
            if attempt == 2:
                return (
                    "Gemini is temporarily unavailable right now. "
                    "Please try again in a few moments."
                )

            time.sleep(2)

    return "Unable to generate AI explanation."