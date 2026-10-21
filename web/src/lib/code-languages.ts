import hljs from "highlight.js/lib/common";

// Languages offered in the editor's code-block picker. All ship in highlight.js "common",
// which both the editor (lowlight) and the article page use, so they highlight identically.
export const CODE_LANGUAGES: [value: string, label: string][] = [
  ["plaintext", "Plain text"],
  ["bash", "Bash / Shell"],
  ["c", "C"],
  ["cpp", "C++"],
  ["csharp", "C#"],
  ["css", "CSS"],
  ["diff", "Diff"],
  ["go", "Go"],
  ["graphql", "GraphQL"],
  ["xml", "HTML / XML"],
  ["java", "Java"],
  ["javascript", "JavaScript"],
  ["json", "JSON"],
  ["kotlin", "Kotlin"],
  ["markdown", "Markdown"],
  ["php", "PHP"],
  ["python", "Python"],
  ["ruby", "Ruby"],
  ["rust", "Rust"],
  ["scss", "SCSS"],
  ["sql", "SQL"],
  ["swift", "Swift"],
  ["typescript", "TypeScript"],
  ["yaml", "YAML"],
];

// Fences and pastes often use aliases ("ts", "js", "py", "sh", "yml"). Map each alias to the
// picker's entry so it shows "TypeScript" rather than a raw "ts". Built from highlight.js's own
// alias lists, so it stays in step with what the highlighter understands.
const ALIAS_TO_VALUE = new Map<string, string>(
  CODE_LANGUAGES.flatMap(([value]) => [
    [value, value] as [string, string],
    ...(hljs.getLanguage(value)?.aliases ?? []).map((alias) => [alias.toLowerCase(), value] as [string, string]),
  ]),
);

/** The picker value for a code block's language attribute ("ts" → "typescript"). */
export const canonicalLanguage = (language: string | null | undefined) =>
  ALIAS_TO_VALUE.get((language ?? "").toLowerCase()) ?? language ?? "plaintext";
