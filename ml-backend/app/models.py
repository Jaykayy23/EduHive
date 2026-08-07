from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class CleaningDiagnostics(BaseModel):
    original_length: int
    cleaned_length: int
    headers_removed: int
    citations_removed: int
    equations_preserved: int
    reading_time_min: float
    avg_sentence_length: float

class Question(BaseModel):
    """A generated quiz question returned to the HiveQ frontend."""

    question_statement: str
    question_type: Literal["mcq", "true_false", "fill_in"]
    answer: str | bool
    options: list[str] = Field(default_factory=list)
    context: str | None = None

class GeneratedQuestionsResponse(BaseModel):
    """Response shared by text and file generation endpoints."""

    source_text: str
    questions: list[Question]
    cleaning_diagnostics: dict[str, Any] | None = None


class TextGenerationRequest(BaseModel):
    text_input: str = Field(min_length=150, max_length=60_000)
    total_questions: int = Field(default=10, ge=1, le=50)
    mcq_percentage: float = Field(default=0.5, ge=0, le=1)
    true_false_percentage: float = Field(default=0.5, ge=0, le=1)
    fill_in_percentage: float = Field(default=0.0, ge=0, le=1)

    @model_validator(mode="after")
    def validate_distribution(self) -> "TextGenerationRequest":
        total = self.mcq_percentage + self.true_false_percentage + self.fill_in_percentage
        if abs(total - 1.0) > 0.001:
            raise ValueError("Question percentages must sum to 1.0")
        return self


class GeneratedQuestionBatch(BaseModel):
    """Structured response schema sent to Gemini."""

    questions: list[Question]
