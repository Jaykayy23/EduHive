"""Small deterministic text reducer used for long uploaded documents."""

from __future__ import annotations

import math
import re
from collections import Counter

WORD_RE = re.compile(r"[A-Za-z][A-Za-z'-]{2,}")
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+|\n+")
STOP_WORDS = {
    "about", "after", "also", "and", "are", "because", "been", "before",
    "being", "between", "both", "but", "can", "could", "does", "each",
    "for", "from", "had", "has", "have", "into", "its", "may", "more",
    "most", "not", "other", "our", "over", "such", "than", "that", "the",
    "their", "there", "these", "they", "this", "those", "through", "under",
    "using", "was", "were", "which", "while", "will", "with", "would",
}


class Summarizer:
    """Extract representative sentences with no model or network dependency."""

    def __init__(self, max_words: int = 3_500) -> None:
        self.max_words = max_words

    def summarize(self, text: str) -> str:
        clean_text = text.strip()
        if not clean_text or len(clean_text.split()) <= self.max_words:
            return clean_text

        sentences = [sentence.strip() for sentence in SENTENCE_RE.split(clean_text) if sentence.strip()]
        if len(sentences) < 3:
            return " ".join(clean_text.split()[: self.max_words])

        words = [word.lower() for word in WORD_RE.findall(clean_text)]
        frequencies = Counter(word for word in words if word not in STOP_WORDS)
        if not frequencies:
            return " ".join(clean_text.split()[: self.max_words])

        highest = max(frequencies.values())
        normalized = {word: count / highest for word, count in frequencies.items()}
        scored: list[tuple[float, int, str, int]] = []
        last_index = len(sentences) - 1

        for index, sentence in enumerate(sentences):
            sentence_words = [word.lower() for word in WORD_RE.findall(sentence)]
            if not sentence_words:
                continue
            relevance = sum(normalized.get(word, 0) for word in sentence_words)
            position_bonus = 0.35 if index in {0, last_index} else 0
            score = relevance / math.sqrt(len(sentence_words)) + position_bonus
            scored.append((score, index, sentence, len(sentence.split())))

        chosen: list[tuple[int, str]] = []
        word_count = 0
        for _, index, sentence, sentence_words in sorted(scored, reverse=True):
            if word_count + sentence_words > self.max_words:
                continue
            chosen.append((index, sentence))
            word_count += sentence_words
            if word_count >= self.max_words * 0.9:
                break

        return " ".join(sentence for _, sentence in sorted(chosen))

    def chunk_and_summarize(self, text: str) -> str:
        return self.summarize(text)
