import { getRequestValue } from '@forinda/kickjs'

export const getAuditObj = <T extends Record<string, unknown> = {}>(
  obj: T,
  mode: 'create' | 'update',
) => {
  const auth = getRequestValue('auth')!

  return {
    ...obj,
    ...(mode === 'create' ? { createdBy: auth.id, updatedBy: auth.id } : {}),
    ...(mode === 'update' ? { updatedBy: auth.id } : {}),
  }
}
