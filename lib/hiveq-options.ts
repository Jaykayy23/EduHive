interface MultipleChoiceQuestion {
  answer: string | boolean;
  options?: string[];
}

const OPTION_PREFIX = /^\s*(?:(?:[a-d1-4])\s*[.)\-:]|\((?:[a-d1-4])\))\s*/i;
const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/g;
const TRAILING_SENTENCE_PUNCTUATION = /[.!?]+$/;

export const normalizeChoiceText = (value: string) =>
  value
    .normalize("NFKC")
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(OPTION_PREFIX, "")
    .trim();

export const getChoiceKey = (value: string) =>
  normalizeChoiceText(value)
    .replace(TRAILING_SENTENCE_PUNCTUATION, "")
    .trim()
    .toLowerCase();

export const areEquivalentChoices = (
  first: string | boolean,
  second: string | boolean,
) => getChoiceKey(String(first)) === getChoiceKey(String(second));

export const getMultipleChoiceOptions = (question: MultipleChoiceQuestion) => {
  const uniqueOptions = new Map<string, string>();

  for (const option of question.options ?? []) {
    const displayText = normalizeChoiceText(option);
    const key = getChoiceKey(displayText);
    if (key && !uniqueOptions.has(key)) {
      uniqueOptions.set(key, displayText);
    }
  }

  const answer = normalizeChoiceText(String(question.answer));
  const answerKey = getChoiceKey(answer);
  const matchingAnswer = uniqueOptions.get(answerKey);
  const distractors = [...uniqueOptions.entries()]
    .filter(([key]) => key !== answerKey)
    .map(([, option]) => option);

  return [matchingAnswer ?? answer, ...distractors].filter(Boolean).slice(0, 4);
};
