import { Controller, Get, Post, Put, Delete, Autowired, reply, type Ctx } from '@forinda/kickjs'
import { ApiTags } from '@forinda/kickjs-swagger'
import { TasksService } from './tasks.service'
import { createTasksSchema } from './dtos/create-tasks.dto'
import { updateTasksSchema } from './dtos/update-tasks.dto'

@Controller()
export class TasksController {
  @Autowired() private readonly tasksService!: TasksService

  @Get('/')
  @ApiTags('Tasks')
  async list(_ctx: Ctx<KickRoutes.TasksController['list']>) {
    return reply.ok(await this.tasksService.findAll())
  }

  @Get('/:id')
  @ApiTags('Tasks')
  async getById(ctx: Ctx<KickRoutes.TasksController['getById']>) {
    const result = await this.tasksService.findById(ctx.params.id)
    return result
  }

  @Post('/', { body: createTasksSchema, name: 'CreateTasks' })
  @ApiTags('Tasks')
  async create(ctx: Ctx<KickRoutes.TasksController['create']>) {
    return reply.created(await this.tasksService.create(ctx.body))
  }

  @Put('/:id', { body: updateTasksSchema, name: 'UpdateTasks' })
  @ApiTags('Tasks')
  async update(ctx: Ctx<KickRoutes.TasksController['update']>) {
    await this.tasksService.update(ctx.params.id, ctx.body)
    return reply.noContent()
  }

  @Delete('/:id')
  @ApiTags('Tasks')
  async remove(ctx: Ctx<KickRoutes.TasksController['remove']>) {
    await this.tasksService.delete(ctx.params.id)
    return reply.noContent()
  }
}
