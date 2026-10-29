import assert from "node:assert/strict";
import test from "node:test";
import {
  DEMO_SAMPLES,
  scoreDemo,
  createDemoExport,
} from "../lib/demo-study.ts";

test("blank and unknown answers do not earn quiz points", () => {
  const questions = DEMO_SAMPLES[0].questions;
  assert.deepEqual(scoreDemo(questions, {}), {
    correct: 0,
    answered: 0,
    total: questions.length,
  });
  assert.deepEqual(
    scoreDemo(questions, { unknown: "anything", [questions[0].id]: "  " }),
    { correct: 0, answered: 0, total: questions.length },
  );
});

test("scores partial attempts and normalizes case and surrounding whitespace", () => {
  const questions = DEMO_SAMPLES[0].questions;
  const answers = {
    [questions[0].id]: `  ${questions[0].answer.toUpperCase()}  `,
    [questions[1].id]: "incorrect",
  };
  assert.deepEqual(scoreDemo(questions, answers), {
    correct: 1,
    answered: 2,
    total: questions.length,
  });
  assert.equal(scoreDemo([], {}).total, 0);
});

test("each sample has unique questions, supported choices and accurate photosynthesis example", () => {
  assert.equal(
    new Set(DEMO_SAMPLES.map((s) => s.id)).size,
    DEMO_SAMPLES.length,
  );
  for (const sample of DEMO_SAMPLES) {
    assert.equal(
      new Set(sample.questions.map((q) => q.id)).size,
      sample.questions.length,
    );
    for (const q of sample.questions) {
      assert.ok(q.explanation.length > 20);
      if (q.options) assert.ok(q.options.includes(q.answer));
    }
    assert.equal(
      scoreDemo(
        sample.questions,
        Object.fromEntries(sample.questions.map((q) => [q.id, q.answer])),
      ).correct,
      sample.questions.length,
    );
  }
  const photosynthesis = DEMO_SAMPLES[0].questions.find((q) =>
    q.prompt.includes("only in plant"),
  );
  assert.equal(photosynthesis.answer, "False");
});

test("export clearly identifies fixed samples and includes only the current sample answers", () => {
  const sample = DEMO_SAMPLES[0];
  const exported = createDemoExport(sample, {
    [sample.questions[0].id]: sample.questions[0].answer,
    foreign: "secret",
  });
  assert.equal(exported.kind, "eduhive-fixed-sample");
  assert.equal(exported.liveGeneration, false);
  assert.equal(exported.score.correct, 1);
  assert.equal(exported.questions.length, sample.questions.length);
  assert.equal(JSON.stringify(exported).includes("secret"), false);
});
