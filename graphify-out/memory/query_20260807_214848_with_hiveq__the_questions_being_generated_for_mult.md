---
type: "query"
date: "2026-08-07T21:48:48.244545+00:00"
question: "with hiveq, the questions being generated for multiple choice, the correct answer is obvious because its appearing twice in the option which shouldnt be so"
contributor: "graphify"
outcome: "useful"
source_nodes: ["getMultipleChoiceOptions()", "QuestgenService"]
---

# Q: with hiveq, the questions being generated for multiple choice, the correct answer is obvious because its appearing twice in the option which shouldnt be so

## Answer

Expanded from original query via graph vocab: [hiveq, question, options, answer, correct, choice, quiz, questgen]. The frontend option builder treated labels and punctuation as meaningful, so an API choice such as A. Photosynthesis did not match the answer Photosynthesis and the answer was appended again. The fix canonicalizes and deduplicates MCQ choices, guarantees the answer appears once, uses the same comparison for scoring, and adds backend normalization plus regression tests.

## Outcome

- Signal: useful

## Source Nodes

- getMultipleChoiceOptions()
- QuestgenService