import { Autowired, Controller, Delete, Get, Post, Put, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { createCategorySchema } from '../dtos/create-category.dto'
import { updateCategorySchema } from '../dtos/update-category.dto'
import { listCategoriesQuerySchema } from '../dtos/list-categories.dto'
import { ListCategoriesUseCase } from '../use-cases/list-categories.use-case'
import { GetCategoryUseCase } from '../use-cases/get-category.use-case'
import { CreateCategoryUseCase } from '../use-cases/create-category.use-case'
import { UpdateCategoryUseCase } from '../use-cases/update-category.use-case'
import { DeleteCategoryUseCase } from '../use-cases/delete-category.use-case'

/** Any signed-in user can read; only admins change categories. */
@Controller()
@ApiBearerAuth()
@ApiTags('Categories')
export class CategoriesController {
  @Autowired() private readonly listCategories!: ListCategoriesUseCase
  @Autowired() private readonly getCategory!: GetCategoryUseCase
  @Autowired() private readonly createCategory!: CreateCategoryUseCase
  @Autowired() private readonly updateCategory!: UpdateCategoryUseCase
  @Autowired() private readonly deleteCategory!: DeleteCategoryUseCase

  @Get('/', { query: listCategoriesQuerySchema, name: 'ListCategories' })
  async list(ctx: Ctx<KickRoutes.CategoriesController['list']>) {
    return this.listCategories.execute(ctx.query)
  }

  @Get('/:id', { name: 'GetCategory' })
  async show(ctx: Ctx<KickRoutes.CategoriesController['show']>) {
    return this.getCategory.execute(ctx.params.id)
  }

  @Post('/', { body: createCategorySchema, name: 'CreateCategory' })
  @PermissionRequired({ permission: 'ADMIN' })
  async create(ctx: Ctx<KickRoutes.CategoriesController['create']>) {
    return reply.created(await this.createCategory.execute(ctx.require('auth').id, ctx.body))
  }

  @Put('/:id', { body: updateCategorySchema, name: 'UpdateCategory' })
  @PermissionRequired({ permission: 'ADMIN' })
  async update(ctx: Ctx<KickRoutes.CategoriesController['update']>) {
    await this.updateCategory.execute(ctx.params.id, ctx.require('auth').id, ctx.body)
    return reply.noContent()
  }

  @Delete('/:id', { name: 'DeleteCategory' })
  @PermissionRequired({ permission: 'ADMIN' })
  async remove(ctx: Ctx<KickRoutes.CategoriesController['remove']>) {
    await this.deleteCategory.execute(ctx.params.id)
    return reply.noContent()
  }
}
