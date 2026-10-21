import { hasPermission, type PermissionKeys } from '@/common/permissions/permissions'
import { HttpException } from '@forinda/kickjs'
import { defineHttpContextDecorator } from '@forinda/kickjs'

export type PermissionParams = {
  permission?: PermissionKeys
}

/** Requires a permission bit on the caller's role. Reads `ctx.auth`; no queries of its own. */
export const PermissionRequired = defineHttpContextDecorator.withParams<PermissionParams>()({
  key: 'permission',
  requiredParams: ['permission'],
  dependsOn: ['auth'],
  resolve: (ctx, _deps, params) => {
    if (!params.permission) return undefined
    if (!hasPermission(ctx.require('auth').permissions, params.permission)) {
      throw HttpException.forbidden('You do not have permission to do this')
    }
  },
})
