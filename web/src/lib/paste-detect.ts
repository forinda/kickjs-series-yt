import type { createLowlight } from "lowlight";
import { CODE_LANGUAGES } from "./code-languages";

// Lines that read like source code rather than prose.
const CODE_LINE = [
  /[;{}()[\],]\s*$/, // ends like a statement / block / call / literal
  /^\s{2,}\S/, // indented
  /^\s*(def|class|function|const|let|var|import|export|from|return|if|elif|else|for|while|switch|case|try|catch|async|await|public|private|protected|static|fn|func|package|interface|type|enum|struct|SELECT|INSERT|UPDATE|DELETE|CREATE|#include|using)\b/,
  /=>|===|!==|::|->|\+=|&&|\|\|/,
  /^\s*(\/\/|\/\*|\*|--\s)/, // comments
  /^\s*[\w.-]+:\s*(\S.*)?$/, // key: value (YAML, config, Python blocks)
  /^\s*<\/?[a-z][\w-]*[\s>/]/i, // markup
  /^\s*[$>]\s+\S/, // shell prompt
  // SQL clauses, uppercase only: "From the start…" / "Set aside…" are prose, not queries.
  /^\s*(SELECT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|LIMIT|(LEFT |RIGHT |INNER |OUTER )?JOIN|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE TABLE|ALTER TABLE)\b/,
];

/** A prose sentence: several words ending in . ! or ? (code lines almost never do). */
const isSentence = (line: string) => /[.!?]["')]?\s*$/.test(line) && line.trim().split(/\s+/).length >= 4;

/**
 * Plain-text paste that is probably code: several lines, most of them code-shaped.
 * Markdown with fences is left to the Markdown path, which keeps the fences' languages.
 */
export const looksLikeCode = (text: string) => {
  if (/^\s*```/m.test(text)) return false;
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return false;
  const codeLike = lines.filter((l) => !isSentence(l) && CODE_LINE.some((re) => re.test(l))).length;
  return codeLike / lines.length >= 0.6;
};

const LANGUAGE_SUBSET = CODE_LANGUAGES.map(([value]) => value).filter((v) => v !== "plaintext");

/** Best-guess language among the editor's picker options, or "plaintext". */
export const guessLanguage = (lowlight: ReturnType<typeof createLowlight>, code: string) => {
  // Terminal transcripts ("$ pnpm install") confuse auto-detection; they're shell.
  const lines = code.split("\n").filter((l) => l.trim());
  if (lines.filter((l) => /^\s*\$\s/.test(l)).length / lines.length >= 0.5) return "bash";
  const result = lowlight.highlightAuto(code, { subset: LANGUAGE_SUBSET });
  // relevance ~0 means "no idea"; better to say plain text than guess wrong confidently.
  return result.data?.language && (result.data.relevance ?? 0) > 2 ? result.data.language : "plaintext";
};
