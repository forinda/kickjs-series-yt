import DOMPurify from "dompurify";

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
export const safeArticleHtml = (body: string | null | undefined) =>
  DOMPurify.sanitize(toArticleHtml(body), { ADD_ATTR: ["target"] });

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
