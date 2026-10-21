import sanitizeHtml from 'sanitize-html'

/**
 * Images embedded in articles are uploaded to storage and referenced by a stable app URL
 * (signed storage URLs expire, so they can't live inside saved HTML). The GET route behind
 * this path redirects to a freshly signed URL.
 */
export const ARTICLE_IMAGE_FOLDER = 'article-images'
export const ARTICLE_IMAGE_PATH = '/api/v1/articles/images/'
/** Raster only: SVG can carry script. Extension comes from the MIME type, never the client's file name. */
export const ARTICLE_IMAGE_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
}
export const ARTICLE_IMAGE_FILE = /^[a-f0-9]{16}\.(png|jpg|gif|webp|avif)$/
const isArticleImageSrc = (src = '') =>
  src.startsWith(ARTICLE_IMAGE_PATH) && ARTICLE_IMAGE_FILE.test(src.slice(ARTICLE_IMAGE_PATH.length))

/**
 * Article bodies are HTML from the Tiptap editor. Anything not on this list is
 * stripped on write, so a crafted request can't store script, styles, iframes,
 * event handlers or javascript: links. Keep in sync with the editor's toolbar.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'h2', 'h3', 'h4',
    'strong', 'b', 'em', 'i', 'u', 's', 'code', 'pre',
    'blockquote', 'ul', 'ol', 'li', 'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  // target/rel are always overwritten by transformTags below.
  // Code blocks carry their language for syntax highlighting ("language-ts").
  allowedClasses: { code: ['language-*'] },
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    ol: ['start'],
    img: ['src', 'alt', 'title'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  // Only our own uploaded images: no hotlinked trackers, no data: URIs.
  exclusiveFilter: (frame) => frame.tag === 'img' && !isArticleImageSrc(frame.attribs.src),
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    // External links open in a new tab without handing the article a window.opener.
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' }),
  },
}

export const sanitizeArticleHtml = (html: string) => sanitizeHtml(html, OPTIONS)

const EMBEDDED_IMAGE = new RegExp(
  `src="${ARTICLE_IMAGE_PATH.replace(/[/.]/g, '\\$&')}([a-f0-9]{16}\\.(?:png|jpg|gif|webp|avif))"`,
  'g',
)

/** File names of our images embedded in a (sanitised) body. */
export const embeddedImageFiles = (html: string | null | undefined) =>
  new Set([...(html ?? '').matchAll(EMBEDDED_IMAGE)].map((m) => m[1]))

/** Plain text of an article body (for "is it empty?" checks). */
export const articleText = (html: string) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim()

