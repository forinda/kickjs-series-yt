import { Extension, InputRule } from "@tiptap/react"; // re-exports @tiptap/core

// Only links that are safe to store; anything else (e.g. "javascript:") stays plain text.
const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/))/i;

/**
 * Typing `[text](https://…)` turns into a link, like other Markdown shortcuts.
 * Tiptap's Link extension doesn't ship this rule. `![alt](…)` (image syntax) is left alone.
 */
export const MarkdownLinkInput = Extension.create({
  name: "markdownLinkInput",
  addInputRules() {
    return [
      new InputRule({
        find: /(?<!!)\[([^\]]+)\]\(([^)\s]+)\)$/,
        handler: ({ range, match, chain }) => {
          const [, text, href] = match;
          if (!SAFE_HREF.test(href)) return null;
          chain()
            .deleteRange(range)
            .insertContent({ type: "text", text, marks: [{ type: "link", attrs: { href } }] })
            .run();
        },
      }),
    ];
  },
});
