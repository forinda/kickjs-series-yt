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
  HttpException,
} from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { BlogsService } from './blogs.service'
import { createBlogPostSchema } from './dtos/create-blogs.dto'
import { updateBlogSchema } from './dtos/update-blogs.dto'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { PublicRoute } from '@/contributors/auth.contributor'

@Controller()
@ApiBearerAuth()
@ApiTags('Blogs')
export class BlogsController {
  @Autowired() private readonly blogsService!: BlogsService

  @Get('/')
  @PublicRoute
  async list(_ctx: Ctx<KickRoutes.BlogsController['list']>) {
    return reply.ok(await this.blogsService.findAll())
  }
 @Get('/mine/:id')
  async getMineById(ctx: Ctx<KickRoutes.BlogsController['getMineById']>) {
    const result = await this.blogsService.getMineById(ctx.params.id)
    return result
  }
  @Get('/mine')
  async getAllMine(_ctx: Ctx<KickRoutes.BlogsController['getAllMine']>) {
    const result = await this.blogsService.getAllMine()
    return result
  }

  @Get('/:id')
  @PublicRoute
  async getById(ctx: Ctx<KickRoutes.BlogsController['getById']>) {
    const result = await this.blogsService.findById(ctx.params.id)
    return result
  }

  @Post('/', { body: createBlogPostSchema, name: 'CreateBlogs' })
  @PermissionRequired({ permission: 'WRITE' })
  async create(ctx: Ctx<KickRoutes.BlogsController['create']>) {
    return reply.created(await this.blogsService.create(ctx.body))
  }

  @Put('/:id', { body: updateBlogSchema, name: 'UpdateBlogs' })
  @PermissionRequired({ permission: 'WRITE' })
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
  @PermissionRequired({ permission: 'WRITE' })
  async upload(ctx: Ctx<KickRoutes.BlogsController['upload']>) {
    if (!ctx.file) {
      throw HttpException.badRequest('No file uploaded in the "document" field')
    }
    return reply.ok(await this.blogsService.uploadThumbnail(ctx.params.id, ctx.file))
  }

  @PermissionRequired({ permission: 'WRITE' })
  @Delete('/:id')
  async remove(ctx: Ctx<KickRoutes.BlogsController['remove']>) {
    await this.blogsService.delete(ctx.params.id)
    return reply.noContent()
  }
}
