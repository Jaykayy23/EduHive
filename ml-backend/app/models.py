from pydantic import BaseModel, Field
from typing import List, Optional, Union

# This file should now contain both models
class CleaningDiagnostics(BaseModel):
    original_length: int
    cleaned_length: int
    headers_removed: int
    citations_removed: int
    equations_preserved: int
    reading_time_min: float
    avg_sentence_length: float

class Question(BaseModel):
    """A flexible model for a single generated question."""
    question_statement: str
    question_type: str
    answer: Union[str, bool]
    options: Optional[List[str]] = None
    context: Optional[str] = None

class GeneratedQuestionsResponse(BaseModel):
    """This is the main response model that our API will return."""
    source_text: str
    questions: List[Question]

# --- ADD THIS NEW MODEL ---
class TextGenerationRequest(BaseModel):
    """
    Defines the structure for a JSON request to the /generate-from-text/ endpoint.
    """
    text_input: str
    total_questions: int = 10
    mcq_percentage: float = 0.5
    true_false_percentage: float = 0.5
    fill_in_percentage: float = 0.0