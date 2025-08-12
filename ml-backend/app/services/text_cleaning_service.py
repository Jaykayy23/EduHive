import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path
import re

# Load environment variables robustly
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class GeminiTextCleaner:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("FATAL ERROR: GEMINI_API_KEY not found.")
        
        genai.configure(api_key=self.api_key)

        # --- PROMPT 1: For General Text Cleaning ---
        self.cleaning_prompt = """
You are an expert academic editor. You will be given messy, unstructured text that was
poorly extracted from a PDF document. Your task is to rewrite and restructure this text
into clean, coherent, well-formed paragraphs.

Follow these rules strictly:
- Correct spelling and grammar mistakes.
- Join broken sentences and merge sentence fragments into logical paragraphs.
- Remove all artifacts like page numbers, running headers, and file paths.
- Ignore and remove any text that looks like a table of contents or a list of figures.
- Maintain the original meaning, tone, and all technical terms. DO NOT summarize or add any new information.

Output ONLY the cleaned, restructured text and nothing else.
"""
        self.cleaning_model = genai.GenerativeModel(
            model_name='gemini-1.5-flash-latest',
            system_instruction=self.cleaning_prompt
        )

        # --- PROMPT 2: For Extracting Simple Facts for True/False Questions ---
        self.fact_extraction_prompt = """
You are a data extractor. Your task is to read the provided text and extract a list of simple, clear, and undeniable factual statements.

Follow these rules strictly:
- Each statement must be a single, complete sentence.
- Each statement must be a fact that can be definitively proven as "True" based *only* on the provided text.
- Do not extract opinions, questions, or complex sentences with multiple clauses.
- Output the facts as a numbered list. For example:
  1. The sky is blue.
  2. The study used the CICIoT2023 dataset.
  3. Wireless Sensor Networks provide real-time data flow.

If you cannot find any simple facts, output the text "No facts found.".
"""
        self.extraction_model = genai.GenerativeModel(
            model_name='gemini-1.5-flash-latest',
            system_instruction=self.fact_extraction_prompt
        )

    async def clean_text_with_llm(self, messy_text: str) -> str:
        try:
            # We use self.cleaning_model here
            response = await self.cleaning_model.generate_content_async(messy_text)
            return response.text.strip()
        except Exception as e:
            print(f"Error during text cleaning with Gemini: {e}")
            return messy_text # Fallback

    async def extract_facts_for_boolean_questions(self, clean_text: str) -> list[str]:
        """
        Takes clean text and uses Gemini to extract a list of simple, factual sentences.
        """
        try:
            response = await self.extraction_model.generate_content_async(clean_text)
            facts_text = response.text
            
            if "no facts found" in facts_text.lower():
                return []

            # Split the numbered list into individual sentences
            facts = [
                fact.strip() for fact in re.split(r'\d+\.\s*', facts_text) if fact.strip()
            ]
            return facts
        except Exception as e:
            print(f"Error during fact extraction with Gemini: {e}")
            return [] # Return empty list on failure

# Create a singleton instance
gemini_cleaner_instance = GeminiTextCleaner()
