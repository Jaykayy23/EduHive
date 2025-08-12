from pydantic import BaseModel, Field
from typing import List, Optional, Union

# This file should now contain both models

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