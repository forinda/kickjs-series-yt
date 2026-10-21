import 'reflect-metadata'
import { describe, expect, it } from 'vitest'
import { excerpt } from './feeds.service'

describe('excerpt', () => {
  it('returns plain text, entities decoded once, cut at the length', () => {
    expect(excerpt('<p>a &lt;b&gt; &amp;lt; "q"</p><pre>x\n  y</pre>')).toBe('a <b> &lt; "q"x y')
    expect(excerpt(`<p>${'word '.repeat(50)}</p>`, 12)).toBe('word word wo…')
  })
})
