import { Controller, Get, Post, Put, Delete, Autowired, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { CategoryService } from './category.service'
import { createCategorySchema } from './dtos/create-category.dto'
import { updateCategorySchema } from './dtos/update-category.dto'
import { PermissionRequired } from '@/contributors/permission.contributor'

@Controller()
@ApiBearerAuth()
@ApiTags('Category')
export class CategoryController {
  @Autowired() private readonly categoryService!: CategoryService

  @Get('/')
  async list(_ctx: Ctx<KickRoutes.CategoryController['list']>) {
    return this.categoryService.findAll()
  }

  @Get('/:id')
  async getById(ctx: Ctx<KickRoutes.CategoryController['getById']>) {
    const result = await this.categoryService.findById(ctx.params.id)
    if (!result) {
      ctx.problem.notFound({ detail: `Category ${ctx.params.id} not found` })
      return
    }
    return result
  }

  @Post('/', { body: createCategorySchema, name: 'CreateCategory' })
  @PermissionRequired({ permission: 'ADMIN' })
  async create(ctx: Ctx<KickRoutes.CategoryController['create']>) {
    return reply.created(await this.categoryService.create(ctx.body))
  }

  @Put('/:id', { body: updateCategorySchema, name: 'UpdateCategory' })
  @PermissionRequired({ permission: 'ADMIN' })
  async update(ctx: Ctx<KickRoutes.CategoryController['update']>) {
    await this.categoryService.update(ctx.params.id, ctx.body)
    return reply.noContent()
  }

  @Delete('/:id')
  @PermissionRequired({ permission: 'ADMIN' })
  async remove(ctx: Ctx<KickRoutes.CategoryController['remove']>) {
    await this.categoryService.delete(ctx.params.id)
    return reply.noContent()
  }
}
