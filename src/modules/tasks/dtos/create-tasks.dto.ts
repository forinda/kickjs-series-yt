import { mongoIdSchema } from '@/utils/mongo-id-zod'
import { getDateFormat } from '@/utils/format-date'
import { z } from 'zod'

const taskStatuses = ['pending', 'in-progress', 'completed'] as const

export const createTasksSchema = z.object({
  title: z.string({ error: 'Title is required' }),
  description: z.string({ error: 'Description is required' }),
  status: z
    .enum(taskStatuses, { error: 'Invalid status. Allowed values are: ' + taskStatuses.join(', ') })
    .default('pending'),
  dueDate: z.string().transform(getDateFormat).default(getDateFormat(new Date())),
  category: mongoIdSchema({
    invalidId: 'Please provide a valid category ID',
    required: 'Category is required',
  }),
})

export type CreateTasksDTO = z.infer<typeof createTasksSchema>
