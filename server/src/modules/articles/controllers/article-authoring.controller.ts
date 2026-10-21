import {
  Autowired,
  Controller,
  Delete,
  FileUpload,
  HttpException,
  Post,
  Put,
  reply,
  type Ctx,
} from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { createArticleSchema, updateArticleSchema } from '../dtos/create-article.dto'
import { CreateArticleUseCase } from '../use-cases/create-article.use-case'
import { UpdateArticleUseCase } from '../use-cases/update-article.use-case'
import { DeleteArticleUseCase } from '../use-cases/delete-article.use-case'
import { SetArticleThumbnailUseCase } from '../use-cases/set-article-thumbnail.use-case'
import { UploadArticleImageUseCase } from '../use-cases/upload-article-image.use-case'
import { SweepArticleImagesUseCase } from '../use-cases/sweep-article-images.use-case'
import { ARTICLE_IMAGE_TYPES } from '../article-html'

/** Writing: needs WRITE, and every change is limited to the writer's own articles. */
@Controller()
@ApiBearerAuth()
@ApiTags('Articles')
export class ArticleAuthoringController {
  @Autowired() private readonly createArticle!: CreateArticleUseCase
  @Autowired() private readonly updateArticle!: UpdateArticleUseCase
  @Autowired() private readonly deleteArticle!: DeleteArticleUseCase
  @Autowired() private readonly setThumbnail!: SetArticleThumbnailUseCase
  @Autowired() private readonly uploadImage!: UploadArticleImageUseCase
  @Autowired() private readonly sweepImages!: SweepArticleImagesUseCase

  @Post('/', { body: createArticleSchema, name: 'CreateArticle' })
  @PermissionRequired({ permission: 'WRITE' })
  async create(ctx: Ctx<KickRoutes.ArticleAuthoringController['create']>) {
    return reply.created(await this.createArticle.execute(ctx.require('auth').id, ctx.body))
  }

  @Put('/:id', { body: updateArticleSchema, name: 'UpdateArticle' })
  @PermissionRequired({ permission: 'WRITE' })
  async update(ctx: Ctx<KickRoutes.ArticleAuthoringController['update']>) {
    await this.updateArticle.execute(ctx.params.id, ctx.require('auth').id, ctx.body)
    return reply.noContent()
  }

  @Delete('/:id', { name: 'DeleteArticle' })
  @PermissionRequired({ permission: 'WRITE' })
  async remove(ctx: Ctx<KickRoutes.ArticleAuthoringController['remove']>) {
    await this.deleteArticle.execute(ctx.params.id, ctx.require('auth').id)
    return reply.noContent()
  }

  /** Image to embed in an article body. Not tied to an article, so it works while drafting a new one. */
  @FileUpload({
    mode: 'single',
    fieldName: 'image',
    maxSize: 5 * 1024 * 1024, // 5 MB
    allowedTypes: Object.keys(ARTICLE_IMAGE_TYPES),
  })
  @Post('/images', { name: 'UploadArticleImage' })
  @PermissionRequired({ permission: 'WRITE' })
  async image(ctx: Ctx<KickRoutes.ArticleAuthoringController['image']>) {
    if (!ctx.file) throw HttpException.badRequest('No image uploaded in the "image" field')
    return reply.created(await this.uploadImage.execute(ctx.file))
  }

  /** Admin: delete embedded-image uploads older than 24h that no article references. */
  @Post('/images/cleanup', { name: 'SweepArticleImages' })
  @PermissionRequired({ permission: 'ADMIN' })
  async sweep(_ctx: Ctx<KickRoutes.ArticleAuthoringController['sweep']>) {
    return reply.ok(await this.sweepImages.execute())
  }

  @FileUpload({
    mode: 'single',
    fieldName: 'document',
    maxSize: 5 * 1024 * 1024, // 5 MB
    allowedTypes: ['image/*'],
  })
  @Post('/:id/thumbnail', { name: 'SetArticleThumbnail' })
  @PermissionRequired({ permission: 'WRITE' })
  async thumbnail(ctx: Ctx<KickRoutes.ArticleAuthoringController['thumbnail']>) {
    if (!ctx.file) throw HttpException.badRequest('No file uploaded in the "document" field')
    return reply.ok(await this.setThumbnail.execute(ctx.params.id, ctx.require('auth').id, ctx.file))
  }
}
