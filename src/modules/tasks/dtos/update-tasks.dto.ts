import { z } from 'zod'
import { createTasksSchema } from './create-tasks.dto'

export const updateTasksSchema = createTasksSchema.partial()

export type UpdateTasksDTO = z.infer<typeof updateTasksSchema>
