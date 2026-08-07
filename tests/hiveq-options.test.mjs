import assert from "node:assert/strict";
import test from "node:test";

import {
  areEquivalentChoices,
  getMultipleChoiceOptions,
} from "../lib/hiveq-options.ts";

test("keeps the correct HiveQ option exactly once when choices have labels", () => {
  const options = getMultipleChoiceOptions({
    answer: "Photosynthesis",
    options: [
      "A. Photosynthesis",
      "B. Respiration",
      "C. Fermentation",
      "D. Transpiration",
    ],
  });

  assert.deepEqual(options, [
    "Photosynthesis",
    "Respiration",
    "Fermentation",
    "Transpiration",
  ]);
  assert.equal(
    options.filter((option) => areEquivalentChoices(option, "Photosynthesis"))
      .length,
    1,
  );
});

test("collapses correct-answer variants before limiting the option count", () => {
  const options = getMultipleChoiceOptions({
    answer: "Photosynthesis",
    options: [
      "Photosynthesis",
      "photosynthesis.",
      "Respiration",
      "Fermentation",
      "Transpiration",
    ],
  });

  assert.equal(options.length, 4);
  assert.equal(
    options.filter((option) => areEquivalentChoices(option, "Photosynthesis"))
      .length,
    1,
  );
});

test("replaces an excess distractor when the API omits the correct answer", () => {
  const options = getMultipleChoiceOptions({
    answer: "Photosynthesis",
    options: ["Respiration", "Fermentation", "Transpiration", "Digestion"],
  });

  assert.equal(options.length, 4);
  assert.ok(
    options.some((option) => areEquivalentChoices(option, "Photosynthesis")),
  );
});
