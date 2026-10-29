import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";

export function createPostEditorExtensions() {
  return [
    StarterKit.configure({
      bold: false,
      italic: false,
      link: false,
      underline: false,
    }),
    Placeholder.configure({
      placeholder: "Ask a question, share notes, or explain what you learned.",
    }),
  ];
}
