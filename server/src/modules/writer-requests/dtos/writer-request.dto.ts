import { z } from 'zod'
import { writerRequestStatuses } from '@/db/models/writer-request'

export const submitWriterRequestSchema = z.object({
  message: z
    .string({ error: 'Tell us why you want to write' })
    .trim()
    .min(30, 'Please write at least 30 characters')
    .max(1000, 'Please keep it under 1000 characters'),
})

export const reviewWriterRequestSchema = z.object({
  note: z.string().trim().max(500, 'Keep the note under 500 characters').optional(),
})

export const listWriterRequestsQuerySchema = z.object({
  status: z.enum(writerRequestStatuses).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type SubmitWriterRequestDTO = z.infer<typeof submitWriterRequestSchema>
export type ReviewWriterRequestDTO = z.infer<typeof reviewWriterRequestSchema>
export type ListWriterRequestsQuery = z.infer<typeof listWriterRequestsQuerySchema>
