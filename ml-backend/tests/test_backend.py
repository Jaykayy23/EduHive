import os
import unittest

from pydantic import ValidationError

from app.main import _validate_distribution, health_check
from app.models import Question, TextGenerationRequest
from app.services.questgen_service import QuestgenService, allocate_question_counts
from app.services.summarizer import Summarizer


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


class LightweightRuntimeTests(unittest.TestCase):
    def test_summarizer_reduces_without_model_downloads(self):
        text = " ".join(
            f"Photosynthesis sentence {index} explains sunlight and plant energy."
            for index in range(100)
        )
        summary = Summarizer(max_words=80).summarize(text)
        self.assertLessEqual(len(summary.split()), 80)
        self.assertIn("Photosynthesis", summary)

    def test_health_check_does_not_require_provider_call(self):
        old_key = os.environ.pop("GEMINI_API_KEY", None)
        try:
            response = health_check()
            self.assertEqual(response["status"], "healthy")
            self.assertFalse(response["provider_configured"])
        finally:
            if old_key is not None:
                os.environ["GEMINI_API_KEY"] = old_key


if __name__ == "__main__":
    unittest.main()
