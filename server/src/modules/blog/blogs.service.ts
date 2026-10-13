import { Service, Inject, HttpException, getRequestValue } from '@forinda/kickjs'
import { S3Key, type S3Uploader } from '@/adapters/s3.adapter'
import type { CreateBlogPostDTO } from './dtos/create-blogs.dto'
import type { UpdateBlogDTO } from './dtos/update-blogs.dto'
import { type Db, DB } from '@/db'
import { getAuditObj } from '@/utils/session'

@Service()
export class BlogsService {
  constructor(@Inject(DB) private readonly repo: Db) {}
  @Inject(S3Key) private readonly uploader!: S3Uploader

  async findById(id: string) {
    const userId = getRequestValue('auth')?.id
    const blog = await this.repo.Blog.findOne({ _id: id, createdBy: userId })
      .populate('createdBy', { id: 1, name: 1 })
      .populate('category', { id: 1, description: 1 })
    if (blog?.thumbnail) {
      blog.thumbnail = await this.uploader.getUrl(blog.thumbnail)
    }
    return blog
  }

  async findAll() {

    const allBlogs = await this.repo.Blog.find({
    })
      .populate('createdBy', { id: 1, name: 1 })
      .populate('category', { id: 1, description: 1 })
    await Promise.all(
      allBlogs.map(async (blog) => {
        if (blog.thumbnail) {
          blog.thumbnail = await this.uploader.getUrl(blog.thumbnail)
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
    }).populate('createdBy', { id: 1, name: 1 })
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

  attachThumbnail(blogId: string, thumbnailKey: string) {
    const { id: userId } = getRequestValue('auth')!
    return this.repo.Blog.updateOne({ _id: blogId, createdBy: userId }, { thumbnail: thumbnailKey })
  }
}
