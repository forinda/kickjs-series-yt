export interface TasksResponseDTO {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  category: string
  createdAt: string
  updatedAt: string
}
