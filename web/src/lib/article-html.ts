import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";

const looksLikeHtml = (body: string) => /^\s*<[a-z][\s\S]*>/i.test(body);

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Article body as HTML. Bodies written before the rich-text editor are plain text:
 * blank lines become paragraphs and single newlines become <br>.
 */
export const toArticleHtml = (body: string | null | undefined) => {
  if (!body) return "";
  if (looksLikeHtml(body)) return body;
  return body
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
};

/**
 * Safe-to-render HTML. The server already sanitises on write; this is the second
 * line of defence for anything that reached the database another way.
 */
export const safeArticleHtml = (body: string | null | undefined) => {
  // RETURN_DOM gives the sanitised <body> element (typed as plain Node).
  const root = DOMPurify.sanitize(toArticleHtml(body), { ADD_ATTR: ["target"], RETURN_DOM: true }) as HTMLElement;
  // Syntax-highlight code blocks the editor tagged with a language. highlight.js escapes
  // the code itself, so its output is as safe as the text it replaces.
  for (const code of root.querySelectorAll<HTMLElement>("pre > code[class*='language-']")) {
    const language = code.className.match(/language-([\w+#-]+)/)?.[1];
    if (!language || !hljs.getLanguage(language)) continue;
    code.innerHTML = hljs.highlight(code.textContent ?? "", { language }).value;
    code.classList.add("hljs");
  }
  return root.innerHTML;
};

/** Readable text of a body (excerpts, read time). Uses an inert document: nothing loads or runs. */
export const articleText = (body: string | null | undefined) =>
  (
    new DOMParser().parseFromString(
      // textContent glues blocks together ("TitleFirst paragraph"); space them out first.
      toArticleHtml(body).replace(/<\/(p|h[1-6]|li|blockquote|pre|td|th)>|<br\s*\/?>/gi, "$& "),
      "text/html",
    ).body.textContent ?? ""
  )
    .replace(/\s+/g, " ")
    .trim();
