import assert from "node:assert/strict";
import test from "node:test";
import { Editor } from "@tiptap/core";
import { createPostEditorExtensions } from "../lib/post-editor.ts";

test("post editor preserves plain-text notes, subject tags and empty document state after the dependency upgrade", () => {
  const editor = new Editor({
    element: null,
    extensions: createPostEditorExtensions(),
    content: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Study notes" }] },
      ],
    },
  });
  try {
    assert.equal(editor.getText(), "Study notes");
    editor.commands.insertContentAt(1, { type: "text", text: "#Biology " });
    assert.equal(editor.getText(), "#Biology Study notes");
    // JSON state changes can run without a browser DOM; clearContent is browser-only.
    editor.commands.setContent({
      type: "doc",
      content: [{ type: "paragraph" }],
    });
    assert.equal(editor.getText(), "");
    const names = editor.extensionManager.extensions.map(
      (extension) => extension.name,
    );
    for (const name of ["bold", "italic", "link", "underline"])
      assert.equal(names.includes(name), false);
  } finally {
    editor.destroy();
  }
});
