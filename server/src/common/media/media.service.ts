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

  async put(folder: string, file: UploadedFile) {
    const key = `${folder}/${randomBytes(8).toString('hex')}${path.extname(file.originalname)}`
    await this.storage.put(key, file.buffer, { contentType: file.mimetype })
    return key
  }

  url(key: string, kind: keyof typeof URL_TTL) {
    return this.storage.url(key, { expiresIn: URL_TTL[kind] })
  }

  /** Never throws: a leftover file must not fail the request that replaced it. */
  async remove(key: string | null | undefined) {
    if (key) await this.storage.delete(key).catch(() => {})
  }
}
