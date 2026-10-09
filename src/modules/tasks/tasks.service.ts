import { Service, Inject, HttpException, getRequestValue } from '@forinda/kickjs'
import type { CreateTasksDTO } from './dtos/create-tasks.dto'
import type { UpdateTasksDTO } from './dtos/update-tasks.dto'
import { type Db, DB } from '@/db'
import { getAuditObj } from '@/utils/session'
import { toObjectId } from '@/utils/mongo-id-zod'

@Service()
export class TasksService {
  constructor(@Inject(DB) private readonly repo: Db) {}

  async findById(id: string) {
    const userId = getRequestValue('auth')?.id
    return this.repo.Task.findOne({ _id: id, createdBy: userId })
      .populate('createdBy', { id: 1, name: 1 })
      .populate('category', { id: 1, description: 1 })
  }

  async findAll() {
    const userId = getRequestValue('auth')?.id

    return await this.repo.Task.find({
      createdBy: userId,
    })
      .populate('createdBy', { id: 1, name: 1 })
      .populate('category', { id: 1, description: 1 })
  }

  async create(dto: CreateTasksDTO) {
    const payload = getAuditObj(dto, 'create')
    const category = await this.repo.Category.findById(payload.category)
    if (!category || category.createdBy.toString() !== payload.createdBy) {
      throw HttpException.notFound('Category not found')
    }
    const existingTask = await this.repo.Task.findOne({
      title: payload.title,
      createdBy: payload.createdBy,
    }).populate('createdBy', { id: 1, name: 1 })
    if (existingTask) {
      throw HttpException.conflict('Task with this title already exists')
    }
    const created = await this.repo.Task.create(payload)
    return created.toObject()
  }

  async update(id: string, dto: UpdateTasksDTO) {
    const payload = getAuditObj(dto, 'update')
    const { id: userId } = getRequestValue('auth')!
    const task = await this.repo.Task.findOne({ _id: id, createdBy: userId }).populate(
      'createdBy',
      { id: 1, name: 1 },
    )
    if (!task) {
      throw HttpException.notFound('Task not found')
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
    Object.assign(task, payload)
    await task.save()
  }

  async delete(id: string): Promise<void> {
    const { id: userId } = getRequestValue('auth')!
    const task = await this.repo.Task.findOne({ _id: id, createdBy: userId })
    if (!task) {
      throw HttpException.notFound('Task not found')
    }
    await task.deleteOne()
  }
}
