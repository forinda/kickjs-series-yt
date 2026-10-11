import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Autowired,
  reply,
  type Ctx,
  FileUpload,
  Inject,
} from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { BlogsService } from './blogs.service'
import { createBlogPostSchema } from './dtos/create-blogs.dto'
import { updateBlogSchema } from './dtos/update-blogs.dto'
import { S3Key, S3Uploader } from '@/adapters/s3.adapter'

@Controller()
@ApiBearerAuth()
@ApiTags('Blogs')
export class BlogsController {
  @Autowired() private readonly blogsService!: BlogsService
  @Inject(S3Key) private readonly uploader!: S3Uploader

  @Get('/')
  async list(_ctx: Ctx<KickRoutes.BlogsController['list']>) {
    return reply.ok(await this.blogsService.findAll())
  }

  @Get('/:id')
  async getById(ctx: Ctx<KickRoutes.BlogsController['getById']>) {
    const result = await this.blogsService.findById(ctx.params.id)
    return result
  }

  @Post('/', { body: createBlogPostSchema, name: 'CreateBlogs' })
  async create(ctx: Ctx<KickRoutes.BlogsController['create']>) {
    return reply.created(await this.blogsService.create(ctx.body))
  }

  @Put('/:id', { body: updateBlogSchema, name: 'UpdateBlogs' })
  async update(ctx: Ctx<KickRoutes.BlogsController['update']>) {
    await this.blogsService.update(ctx.params.id, ctx.body)
    return reply.noContent()
  }

  @FileUpload({
    mode: 'single',
    fieldName: 'document',
    maxSize: 5 * 1024 * 1024, // 5 MB
    allowedTypes: ['image/*'],
  })
  @Post('/upload-thumbnail/:id', { name: 'UploadDocumentThumbnail' })
  async upload(ctx: Ctx<KickRoutes.BlogsController['upload']>) {
    const buffer = ctx.file?.buffer
    const key = this.uploader.prepareKey('thumbnails', ctx.file?.originalname || 'unknown')
    const resp = await this.uploader.upload(buffer!, key, ctx.file?.mimetype)
    await this.blogsService.attachThumbnail(ctx.params.id, key)
    return reply.ok({ key, resp })
  }

  @Delete('/:id')
  async remove(ctx: Ctx<KickRoutes.BlogsController['remove']>) {
    await this.blogsService.delete(ctx.params.id)
    return reply.noContent()
  }
}
