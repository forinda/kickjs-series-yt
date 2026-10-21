import { Service, Inject, HttpException, getRequestValue } from '@forinda/kickjs'
import { STORAGE, type Storage } from '@/adapters/storage'
import { AVATAR_URL_TTL } from '@/modules/auth/auth.service'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import type { CreateBlogPostDTO } from './dtos/create-blogs.dto'
import type { UpdateBlogDTO } from './dtos/update-blogs.dto'
import { type Db, DB } from '@/db'
import { getAuditObj } from '@/utils/session'

@Service()
export class BlogsService {
  constructor(@Inject(DB) private readonly repo: Db) { }
  @Inject(STORAGE) private readonly storage!: Storage

  async findById(id: string) {
    const blog = await this.repo.Blog.findOne({ _id: id })
      .populate('createdBy', { id: 1, name: 1, firstName: 1, lastName: 1, avatar: 1 })
      .populate('category', { id: 1, name: 1, description: 1 })
    if (blog?.thumbnail) {
      blog.thumbnail = await this.thumbnailUrl(blog.thumbnail)
    }
    return blog
  }

  async getMineById(id: string) {
    const { id: userId } = getRequestValue('auth')!
    const blog = await this.repo.Blog.findOne({ _id: id, createdBy: userId })
      .populate('category', { id: 1, name: 1, description: 1 })
    if (blog?.thumbnail) {
      blog.thumbnail = await this.thumbnailUrl(blog.thumbnail)
    }
    return blog
  }

  async getAllMine() {
    const { id: userId } = getRequestValue('auth')!
    const allBlogs = await this.repo.Blog.find({ createdBy: userId })
      .populate('category', { id: 1, name: 1, description: 1 })
    await Promise.all(allBlogs.map((blog) => this.signPublicUrls(blog)))
    return allBlogs
  }

  async findAll() {

    const allBlogs = await this.repo.Blog.find({
    })
      .populate('createdBy', { id: 1, name: 1, firstName: 1, lastName: 1, avatar: 1 })
      .populate('category', { id: 1, name: 1, description: 1 })
    await Promise.all(
      allBlogs.map(async (blog) => {
        if (blog.thumbnail) {
          blog.thumbnail = await this.thumbnailUrl(blog.thumbnail)
        }
      }),
    )
    return allBlogs
  }

  async create(dto: CreateBlogPostDTO) {
    const payload = getAuditObj(dto, 'create')
    const category = await this.repo.Category.findById(payload.category)
    if (!category || category.createdBy.toString() !== payload.createdBy) {
      throw HttpException.notFound('Category not found')
    }
    const existingBlogPost = await this.repo.Blog.findOne({
      title: payload.title,
      createdBy: payload.createdBy,
    }).populate('createdBy', { id: 1, name: 1, firstName: 1, lastName: 1, avatar: 1 })
    if (existingBlogPost) {
      throw HttpException.conflict('Blog post with this title already exists')
    }
    const created = await this.repo.Blog.create(payload)
    return created.toObject()
  }

  async update(id: string, dto: UpdateBlogDTO) {
    const payload = getAuditObj(dto, 'update')
    const { id: userId } = getRequestValue('auth')!
    const blogPost = await this.repo.Blog.findOne({ _id: id, createdBy: userId }).populate(
      'createdBy',
      { id: 1, name: 1 },
    )
    if (!blogPost) {
      throw HttpException.notFound('Blog post not found')
    }
    if (payload.category) {
      const category = await this.repo.Category.findOne({
        _id: payload.category,
        createdBy: payload.updatedBy,
      })
      if (!category) {
        throw HttpException.notFound('Category not found')
      }
    }

    //  await this.repo.Task.updateOne({ _id: id,createBy: userId }, payload)
    Object.assign(blogPost, payload)
    await blogPost.save()
  }

  async delete(id: string): Promise<void> {
    const { id: userId } = getRequestValue('auth')!
    const blogPost = await this.repo.Blog.findOne({ _id: id, createdBy: userId })
    if (!blogPost) {
      throw HttpException.notFound('Blog post not found')
    }
    await blogPost.deleteOne()
  }

  // Swap stored keys for signed URLs: thumbnail + populated author avatar. Response-only, never saved.
  private async signPublicUrls(blog: { thumbnail?: string | null; createdBy: unknown }) {
    if (blog.thumbnail) blog.thumbnail = await this.thumbnailUrl(blog.thumbnail)
    const author = blog.createdBy as { avatar?: string | null } | null
    if (author?.avatar) {
      author.avatar = await this.storage.url(author.avatar, { expiresIn: AVATAR_URL_TTL })
    }
  }

  // Signed for 15 minutes, matching the previous presigner default.
  private thumbnailUrl(key: string) {
    return this.storage.url(key, { expiresIn: 900 })
  }

  async uploadThumbnail(blogId: string, file: { buffer: Buffer; originalname: string; mimetype: string }) {
    const { id: userId } = getRequestValue('auth')!
    const blog = await this.repo.Blog.findOne({ _id: blogId, createdBy: userId })
    if (!blog) {
      throw HttpException.notFound('Blog post not found')
    }
    const key = `thumbnails/${randomBytes(8).toString('hex')}${path.extname(file.originalname)}`
    await this.storage.put(key, file.buffer, { contentType: file.mimetype })
    const previous = blog.thumbnail
    blog.thumbnail = key
    await blog.save()
    // Old file is unreachable once replaced; don't let cleanup failure fail the upload.
    if (previous) await this.storage.delete(previous).catch(() => {})
    return { key }
  }
}
