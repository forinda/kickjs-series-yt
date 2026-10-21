import { Inject, Service } from '@forinda/kickjs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { STORAGE, type Storage } from '@/adapters/storage'

export type UploadedFile = { buffer: Buffer; originalname: string; mimetype: string }

/** Signed-URL lifetimes, in seconds. */
export const URL_TTL = {
  // Matches the old presigner default; thumbnails are fetched fresh with each page.
  thumbnail: 900,
  // Avatars live in the stored session, so use the max (7 days); the UI falls back to initials.
  avatar: 604800,
} as const

/** Stored files: random keys under a folder, signed URLs out, best-effort cleanup. */
@Service()
export class MediaService {
  @Inject(STORAGE) private readonly storage!: Storage

  /** `ext` defaults to the uploaded file name's; pass one derived from the MIME type when it matters. */
  async put(folder: string, file: UploadedFile, ext = path.extname(file.originalname)) {
    const key = `${folder}/${randomBytes(8).toString('hex')}${ext}`
    await this.storage.put(key, file.buffer, { contentType: file.mimetype })
    return key
  }

  url(key: string, kind: keyof typeof URL_TTL) {
    return this.storage.url(key, { expiresIn: URL_TTL[kind] })
  }

  /** Every stored file under `folder/`, page by page. */
  async *list(folder: string) {
    let cursor: string | undefined
    do {
      const page = await this.storage.list({ prefix: `${folder}/`, cursor })
      yield* page.files
      cursor = page.cursor
    } while (cursor)
  }

  /** Never throws: a leftover file must not fail the request that replaced it. */
  async remove(key: string | null | undefined) {
    if (key) await this.storage.delete(key).catch(() => {})
  }
}
