import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Inject, Service, Value } from '@forinda/kickjs'
import { resolveClientDir } from '@forinda/kickjs/spa'
import { DB, type Db } from '@/db'
import { articleText } from '../articles/article-html'
import { AUTHOR_FIELDS, CATEGORY_FIELDS } from '../articles/article.queries'

const SITE_NAME = 'Inkwell'
const SITE_DESCRIPTION = 'Stories, guides and ideas from the Inkwell writers.'
const FEED_SIZE = 50

type Author = { name?: string; firstName?: string; lastName?: string } | null
type Article = {
  _id: unknown
  title: string
  body: string
  thumbnail?: string | null
  publishedAt?: Date | null
  updatedAt: Date
  createdBy?: Author
  category?: { name?: string } | null
}

/** Safe inside XML text, XML/HTML attributes and HTML text. */
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

const authorName = (author: Author | undefined) =>
  [author?.firstName, author?.lastName].filter(Boolean).join(' ') || author?.name || SITE_NAME

// articleText keeps the entities sanitize-html writes; undo them so `escape` doesn't double up.
const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&amp;': '&' }

export const excerpt = (html: string, length = 160) => {
  const text = articleText(html)
    .replace(/&(?:lt|gt|quot|#39|nbsp|amp);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text
}

/** RSS, sitemap, robots.txt and share tags: what feed readers and crawlers read. */
@Service()
export class FeedsService {
  @Inject(DB) private readonly db!: Db
  @Value('SITE_URL') private readonly siteUrl!: string

  private get origin() {
    return this.siteUrl.replace(/\/$/, '')
  }

  private articleUrl(article: Article) {
    return `${this.origin}/blogs/${String(article._id)}`
  }

  private published(limit?: number) {
    const query = this.db.Blog.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .populate('createdBy', AUTHOR_FIELDS)
      .populate('category', CATEGORY_FIELDS)
    if (limit) query.limit(limit)
    return query.lean<Article[]>()
  }

  async rss() {
    const articles = await this.published(FEED_SIZE)
    const items = articles.map((article) => {
      // Embedded images use site-relative src; readers need them absolute.
      const body = article.body
        .replaceAll('src="/', `src="${this.origin}/`)
        .replaceAll(']]>', ']]]]><![CDATA[>')
      const url = this.articleUrl(article)
      return [
        '<item>',
        `<title>${escape(article.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        article.publishedAt ? `<pubDate>${article.publishedAt.toUTCString()}</pubDate>` : '',
        `<dc:creator>${escape(authorName(article.createdBy))}</dc:creator>`,
        article.category?.name ? `<category>${escape(article.category.name)}</category>` : '',
        `<description>${escape(excerpt(article.body, 300))}</description>`,
        `<content:encoded><![CDATA[${body}]]></content:encoded>`,
        '</item>',
      ].join('')
    })
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
      '<channel>',
      `<title>${SITE_NAME}</title>`,
      `<link>${this.origin}/</link>`,
      `<description>${SITE_DESCRIPTION}</description>`,
      '<language>en</language>',
      `<atom:link href="${this.origin}/rss.xml" rel="self" type="application/rss+xml"/>`,
      articles[0]?.publishedAt ? `<lastBuildDate>${articles[0].publishedAt.toUTCString()}</lastBuildDate>` : '',
      ...items,
      '</channel>',
      '</rss>',
    ].join('\n')
  }

  async sitemap() {
    const articles = await this.published()
    const urls = [
      `<url><loc>${this.origin}/</loc></url>`,
      ...articles.map(
        (article) => `<url><loc>${this.articleUrl(article)}</loc><lastmod>${article.updatedAt.toISOString()}</lastmod></url>`,
      ),
    ]
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n')
  }

  robots() {
    return ['User-agent: *', 'Disallow: /dashboard', 'Disallow: /auth', '', `Sitemap: ${this.origin}/sitemap.xml`, ''].join('\n')
  }

  /**
   * The built SPA page with the article's title and share tags in <head>.
   *
   * Link previews (Slack, X, LinkedIn…) and most crawlers don't run JavaScript,
   * so tags the app sets in the browser never reach them. Null when there is no
   * build (dev serves the page from Vite instead).
   */
  async articlePage(articleId: string) {
    const index = await readFile(join(resolveClientDir('../web/dist'), 'index.html'), 'utf8').catch(() => null)
    if (!index) return null
    const article = await this.db.Blog.findOne({ _id: articleId, status: 'published' })
      .populate('createdBy', AUTHOR_FIELDS)
      .populate('category', CATEGORY_FIELDS)
      .lean<Article>()
      .catch(() => null) // a malformed id reads as missing
    if (!article) return { html: index, found: false }

    const url = this.articleUrl(article)
    const description = excerpt(article.body)
    const image = article.thumbnail ? `${this.origin}/api/v1/articles/${String(article._id)}/thumbnail` : null
    const author = authorName(article.createdBy)
    const structured = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description,
      url,
      datePublished: article.publishedAt?.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      author: { '@type': 'Person', name: author },
      publisher: { '@type': 'Organization', name: SITE_NAME },
      ...(image && { image }),
    }
    const tags = [
      `<title>${escape(article.title)} · ${SITE_NAME}</title>`,
      `<meta name="description" content="${escape(description)}" />`,
      `<link rel="canonical" href="${url}" />`,
      `<meta property="og:type" content="article" />`,
      `<meta property="og:site_name" content="${SITE_NAME}" />`,
      `<meta property="og:title" content="${escape(article.title)}" />`,
      `<meta property="og:description" content="${escape(description)}" />`,
      `<meta property="og:url" content="${url}" />`,
      image ? `<meta property="og:image" content="${image}" />` : '',
      article.publishedAt ? `<meta property="article:published_time" content="${article.publishedAt.toISOString()}" />` : '',
      article.category?.name ? `<meta property="article:section" content="${escape(article.category.name)}" />` : '',
      `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
      // `<` escaped so a title can't close the script element.
      `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script>`,
    ]
      .filter(Boolean)
      .join('\n    ')
    // Swap the site-wide title and description for the article's.
    const html = index.replace(/\s*<meta name="description"[^>]*>/, '').replace(/<title>[\s\S]*?<\/title>/, tags)
    return { html, found: true }
  }
}
