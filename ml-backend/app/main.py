from __future__ import annotations

import json
import logging
import os
import secrets
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile

from .models import GeneratedQuestionsResponse, TextGenerationRequest
from .services.pdf_text_cleaner import PDFTextCleaner, ProcessingMode
from .services.questgen_service import (
    QuestionGenerationConfigurationError,
    QuestionGenerationError,
    questgen_instance,
)
from .utils.file_parser import FileParser

logger = logging.getLogger(__name__)
APP_VERSION = "2.0.0"
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

app = FastAPI(
    title="HiveQ Question Generation API",
    version=APP_VERSION,
    description="Lightweight document parsing and Gemini-backed quiz generation.",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)
file_parser = FileParser()
pdf_cleaner = PDFTextCleaner(
    {
        "processing_mode": ProcessingMode.ACADEMIC,
        "diagnostic_mode": True,
        "remove_citations": True,
        "sentence_chunking": True,
    }
)


def require_internal_api_key(
    provided_key: Annotated[str | None, Header(alias="X-HiveQ-API-Key")] = None,
) -> None:
    """Fail closed unless the trusted Next.js proxy supplies the shared key."""
    expected_key = os.getenv("HIVEQ_INTERNAL_API_KEY", "")
    if len(expected_key) < 32:
        logger.error("HiveQ is disabled because HIVEQ_INTERNAL_API_KEY is not configured")
        raise HTTPException(status_code=503, detail="Question generation is unavailable")

    if provided_key is None or not secrets.compare_digest(provided_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _validate_distribution(distribution: object) -> dict[str, float]:
    if not isinstance(distribution, dict):
        raise ValueError("Question distribution must be a JSON object")

    expected = {"mcq", "true_false", "fill_in"}
    if set(distribution) != expected:
        raise ValueError(f"Question distribution must contain exactly: {', '.join(sorted(expected))}")

    try:
        normalized = {key: float(distribution[key]) for key in expected}
    except (TypeError, ValueError) as exc:
        raise ValueError("Question distribution values must be numbers") from exc

    if any(value < 0 or value > 1 for value in normalized.values()):
        raise ValueError("Question distribution values must be between 0 and 1")
    if abs(sum(normalized.values()) - 1.0) > 0.001:
        raise ValueError("Question distribution must sum to 1.0")
    return normalized


async def process_and_generate(
    context: str,
    total_questions: int,
    distribution: dict[str, float],
    file_metadata: dict | None = None,
) -> GeneratedQuestionsResponse:
    try:
        cleaned_context, diagnostics = pdf_cleaner.clean_text(context)
        payload = await questgen_instance.generate_questions(
            context=cleaned_context,
            total_questions=total_questions,
            question_distribution=distribution,
        )

        diagnostics_data = {
            "original_length": diagnostics.original_length,
            "cleaned_length": diagnostics.cleaned_length,
            "headers_removed": diagnostics.removed_headers,
            "citations_removed": diagnostics.removed_citations,
            "equations_preserved": diagnostics.equations_preserved,
            "reading_time_min": diagnostics.reading_time_min,
            "avg_sentence_length": diagnostics.avg_sentence_length,
            **({"file_metadata": file_metadata} if file_metadata else {}),
        }
        payload.update(
            {
                "source_text": context[:1000] + ("..." if len(context) > 1000 else ""),
                "cleaning_diagnostics": diagnostics_data,
            }
        )
        return GeneratedQuestionsResponse(**payload)
    except QuestionGenerationConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except QuestionGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Question-processing pipeline failed")
        raise HTTPException(status_code=500, detail="Question processing failed") from exc


@app.post(
    "/generate-from-text/",
    response_model=GeneratedQuestionsResponse,
    tags=["Question Generation"],
    dependencies=[Depends(require_internal_api_key)],
)
async def create_questions_from_text(request: TextGenerationRequest) -> GeneratedQuestionsResponse:
    return await process_and_generate(
        context=request.text_input,
        total_questions=request.total_questions,
        distribution={
            "mcq": request.mcq_percentage,
            "true_false": request.true_false_percentage,
            "fill_in": request.fill_in_percentage,
        },
    )


@app.post(
    "/generate-from-file/",
    response_model=GeneratedQuestionsResponse,
    tags=["Question Generation"],
    dependencies=[Depends(require_internal_api_key)],
)
async def create_questions_from_file(
    file: Annotated[UploadFile, File()],
    total_questions: Annotated[int, Form(ge=1, le=50)] = 10,
    question_distribution_json: Annotated[str, Form()] = (
        '{"mcq": 0.5, "true_false": 0.5, "fill_in": 0.0}'
    ),
    summarize_large_files: Annotated[bool, Form()] = True,
    page_threshold: Annotated[int, Form(ge=1, le=50)] = 5,
) -> GeneratedQuestionsResponse:
    try:
        distribution = _validate_distribution(json.loads(question_distribution_json))
        text, file_metadata = await file_parser.parse_file(
            file,
            summarize_large_files=summarize_large_files,
            page_threshold=page_threshold,
        )
        if len(text) < 150:
            raise ValueError("Text from file is too short (minimum 150 characters)")

        return await process_and_generate(
            context=text,
            total_questions=total_questions,
            distribution=distribution,
            file_metadata=file_metadata,
        )
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid question distribution JSON") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/", tags=["Health Check"])
def root() -> dict:
    return {
        "status": "running",
        "service": "hiveq-api",
        "version": APP_VERSION,
        "file_support": list(file_parser.supported_types),
    }


@app.get("/health", tags=["Health Check"])
def health_check() -> dict:
    return {
        "status": "healthy",
        "service": "hiveq-api",
        "version": APP_VERSION,
    }
