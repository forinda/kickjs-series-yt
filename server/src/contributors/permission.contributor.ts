import { PermissionKeys, PERMISSIONS } from '@/common/permissions/permissions'
import { DB } from '@/db'
import { HttpException, Logger } from '@forinda/kickjs';
import { defineHttpContextDecorator } from '@forinda/kickjs'

declare module '@forinda/kickjs' {
  interface ContextMeta {
    // hasAccess: boolean
  }
}

export type PermissionParams = {
  permission?: PermissionKeys
}

const logger = Logger.for('PermissionContributor')
export const PermissionRequired = defineHttpContextDecorator.withParams<PermissionParams>()({
  key: 'permission',
  requiredParams: ['permission'],
  dependsOn: ['auth'],
  deps: { db: DB },
  resolve: async (ctx, { db }, params) => {
    logger.debug('Resolving permission with params:', params)
    const auth = ctx.require('auth')
    if (!params.permission) {
      return undefined
    }
    // Check if the user has the required permission
    const user = await db.User.findById(auth.id).populate('role', { name: 1, permissions: 1 })
    if (!user?.role) {
     throw HttpException.forbidden('You do not have permission to access this resource')
    }
    const role = await db.Role.findById(user?.role?._id)
    const hasAccess =  role?.hasPermission(PERMISSIONS[params.permission!])
    logger.debug('User has access:', hasAccess, user)
    // return hasAccess
    if (!hasAccess) {
      throw HttpException.forbidden('Unauthorized access')
    }
  },
})
