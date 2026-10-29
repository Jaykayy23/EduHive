import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_TUTOR_MODEL, getTutorModel } from "../lib/tutor-provider.ts";

test("tutor model falls back to the provider-verified model for missing configuration", () => {
  assert.equal(DEFAULT_TUTOR_MODEL, "nvidia/nemotron-3.5-bolt-e4b");
  assert.equal(getTutorModel(""), DEFAULT_TUTOR_MODEL);
  assert.equal(getTutorModel("  "), DEFAULT_TUTOR_MODEL);
});

test("explicit model configuration is preserved and trimmed", () => {
  assert.equal(getTutorModel(" example/approved-model "), "example/approved-model");
});
