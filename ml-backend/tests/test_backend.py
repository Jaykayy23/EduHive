import io
import os
import unittest
import zipfile
from unittest.mock import patch

from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app, _validate_distribution, health_check, require_internal_api_key
from app.models import Question, TextGenerationRequest
from app.services.questgen_service import QuestgenService, allocate_question_counts
from app.services.summarizer import Summarizer
from app.utils.file_parser import FileParser


class DistributionTests(unittest.TestCase):
    def test_largest_remainder_always_allocates_exact_total(self):
        counts = allocate_question_counts(
            7, {"mcq": 0.34, "true_false": 0.33, "fill_in": 0.33}
        )
        self.assertEqual(sum(counts.values()), 7)
        self.assertEqual(counts, {"mcq": 3, "true_false": 2, "fill_in": 2})

    def test_invalid_request_distribution_is_rejected(self):
        with self.assertRaises(ValidationError):
            TextGenerationRequest(
                text_input="A sufficiently long source sentence. " * 8,
                mcq_percentage=0.5,
                true_false_percentage=0.4,
                fill_in_percentage=0.0,
            )

    def test_file_distribution_requires_all_known_keys(self):
        with self.assertRaisesRegex(ValueError, "exactly"):
            _validate_distribution({"mcq": 1.0})


class QuestionNormalizationTests(unittest.TestCase):
    def test_fill_in_answer_is_converted_to_a_blank(self):
        question = Question(
            question_statement="Mitochondria produce cellular energy.",
            question_type="fill_in",
            answer="Mitochondria",
        )
        normalized = QuestgenService._normalize_question(question)
        self.assertIsNotNone(normalized)
        self.assertIn("_____", normalized.question_statement)

    def test_invalid_mcq_is_discarded(self):
        question = Question(
            question_statement="Which value is correct?",
            question_type="mcq",
            answer="A",
            options=["A", "B"],
        )
        self.assertIsNone(QuestgenService._normalize_question(question))

    def test_mcq_answer_is_not_duplicated_by_option_labels(self):
        question = Question(
            question_statement="What process converts light into chemical energy?",
            question_type="mcq",
            answer="Photosynthesis",
            options=[
                "A. Photosynthesis",
                "B. Respiration",
                "C. Fermentation",
                "D. Transpiration",
            ],
        )

        normalized = QuestgenService._normalize_question(question)

        self.assertIsNotNone(normalized)
        self.assertEqual(normalized.answer, "Photosynthesis")
        self.assertEqual(normalized.options.count("Photosynthesis"), 1)
        self.assertEqual(len(normalized.options), 4)

    def test_mcq_with_equivalent_duplicate_options_is_discarded(self):
        question = Question(
            question_statement="What process converts light into chemical energy?",
            question_type="mcq",
            answer="Photosynthesis",
            options=[
                "Photosynthesis",
                "photosynthesis.",
                "Respiration",
                "Fermentation",
            ],
        )

        self.assertIsNone(QuestgenService._normalize_question(question))


class LightweightRuntimeTests(unittest.TestCase):
    def test_summarizer_reduces_without_model_downloads(self):
        text = " ".join(
            f"Photosynthesis sentence {index} explains sunlight and plant energy."
            for index in range(100)
        )
        summary = Summarizer(max_words=80).summarize(text)
        self.assertLessEqual(len(summary.split()), 80)
        self.assertIn("Photosynthesis", summary)

    def test_health_check_does_not_disclose_provider_configuration(self):
        response = health_check()
        self.assertEqual(response["status"], "healthy")
        self.assertNotIn("provider", response)
        self.assertNotIn("provider_configured", response)

    def test_generation_key_fails_closed_and_uses_constant_time_comparison(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(HTTPException) as missing:
                require_internal_api_key(None)
            self.assertEqual(missing.exception.status_code, 503)

        key = "k" * 32
        with patch.dict(os.environ, {"HIVEQ_INTERNAL_API_KEY": key}, clear=True):
            with self.assertRaises(HTTPException) as invalid:
                require_internal_api_key("wrong")
            self.assertEqual(invalid.exception.status_code, 401)
            self.assertIsNone(require_internal_api_key(key))

    def test_generation_endpoint_rejects_requests_without_internal_key(self):
        with patch.dict(
            os.environ,
            {"HIVEQ_INTERNAL_API_KEY": "k" * 32},
            clear=True,
        ):
            response = TestClient(app).post(
                "/generate-from-text/",
                json={
                    "text_input": "A sufficiently long source sentence. " * 8,
                    "total_questions": 5,
                    "mcq_percentage": 0.5,
                    "true_false_percentage": 0.5,
                    "fill_in_percentage": 0.0,
                },
            )
        self.assertEqual(response.status_code, 401)


class FileParserSecurityTests(unittest.TestCase):
    def setUp(self):
        self.parser = FileParser()

    def test_detects_content_from_magic_bytes_instead_of_client_mime(self):
        self.assertEqual(
            self.parser._detect_type(b"%PDF-1.7\nminimal"),
            "application/pdf",
        )
        self.assertEqual(
            self.parser._detect_type(b"plain UTF-8 study notes"),
            "text/plain",
        )

        archive_bytes = io.BytesIO()
        with zipfile.ZipFile(archive_bytes, "w") as archive:
            archive.writestr("[Content_Types].xml", "types")
            archive.writestr("word/document.xml", "document")
        self.assertEqual(
            self.parser._detect_type(archive_bytes.getvalue()),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

    def test_rejects_binary_data_and_excessive_extracted_text(self):
        with self.assertRaisesRegex(ValueError, "Binary files"):
            self.parser._detect_type(b"binary\x00payload")

        self.parser.max_extracted_chars = 10
        with self.assertRaisesRegex(ValueError, "character limit"):
            self.parser._ensure_text_limit(11)

    def test_parses_text_inside_disposable_worker_process(self):
        text, metadata = self.parser._parse_isolated(
            b"Photosynthesis turns light into stored chemical energy.",
            "text/plain",
        )
        self.assertIn("Photosynthesis", text)
        self.assertEqual(metadata["type"], "text")


if __name__ == "__main__":
    unittest.main()
