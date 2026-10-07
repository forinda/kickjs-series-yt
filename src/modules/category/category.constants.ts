import type { QueryFieldConfig } from '@forinda/kickjs'

export const CATEGORY_QUERY_CONFIG: QueryFieldConfig = {
  filterable: ['name'],
  sortable: ['name', 'createdAt'],
  searchable: ['name'],
}
