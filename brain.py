from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()  # 👈 this loads .env

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def check_news(text):
    prompt = f"""
You are TruthLens AI.

Analyze the following text for misinformation.

Return the response EXACTLY in this format:
1. VERDICT: (Real/Fake)
2. CONFIDENCE SCORE: (0-100%)
3. ANALYSIS: (2 sentences on why)

Text:
{text}
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return response.output_text


if __name__ == "__main__":
    sample_text = "Drinking salt water cures COVID in 24 hours"
    print(check_news(sample_text))
