import { describe, expect, it } from 'vitest'
import { articleText, sanitizeArticleHtml } from './article-html'

describe('sanitizeArticleHtml', () => {
  it('keeps editor formatting and strips anything executable', () => {
    const out = sanitizeArticleHtml(
      '<h2>Hi</h2><p onclick="x()">ok <script>alert(1)</script><a href="javascript:alert(1)">bad</a>' +
        '<a href="https://kickjs.app">good</a><img src=x onerror=alert(1)><iframe src="//evil"></iframe></p>',
    )
    expect(out).toBe(
      '<h2>Hi</h2><p>ok <a target="_blank" rel="noopener noreferrer nofollow">bad</a>' +
        '<a href="https://kickjs.app" target="_blank" rel="noopener noreferrer nofollow">good</a></p>',
    )
  })

  it('forces safe target/rel even when the input sets its own', () => {
    expect(sanitizeArticleHtml('<a href="https://x.dev" target="_self" rel="opener">x</a>')).toBe(
      '<a href="https://x.dev" target="_blank" rel="noopener noreferrer nofollow">x</a>',
    )
  })
})

describe('articleText', () => {
  it('treats an empty editor as empty', () => {
    expect(articleText('<p>  </p><p><br></p>')).toBe('')
  })
  it('returns the readable text', () => {
    expect(articleText('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })
})

describe('embedded images and tables', () => {
  it('keeps our uploaded images and drops everything else', () => {
    const ours = '/api/v1/articles/images/0123456789abcdef.png'
    expect(sanitizeArticleHtml(`<img src="${ours}" alt="Diagram" onerror="x()">`)).toBe(
      `<img src="${ours}" alt="Diagram" />`,
    )
    for (const src of [
      'https://tracker.example/pixel.gif',
      'data:image/png;base64,AAAA',
      '/api/v1/articles/images/../../me',
      '/api/v1/articles/images/0123456789abcdef.svg',
    ]) {
      expect(sanitizeArticleHtml(`<p>a<img src="${src}">b</p>`)).toBe('<p>ab</p>')
    }
  })

  it('keeps table structure but not inline styles', () => {
    expect(
      sanitizeArticleHtml(
        '<table style="min-width:50px"><tbody><tr><th colspan="2" style="x">H</th></tr><tr><td>1</td><td>2</td></tr></tbody></table>',
      ),
    ).toBe('<table><tbody><tr><th colspan="2">H</th></tr><tr><td>1</td><td>2</td></tr></tbody></table>')
  })
})
