import { InferSchemaType, Schema } from 'mongoose'
import { MongooseType } from '@/db/types'
import { systemRoles } from '@/common/permissions/permissions'
import { Logger } from '@forinda/kickjs'

const logger = Logger.for('RoleSeeder')

export const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    permissions: { type: Number, required: true, default: 0 },
    // The role new sign-ups get. Exactly one system role sets it (systemRoles.*.isDefault).
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    methods: {
      hasPermission(permission: number) {
        return (this.permissions & permission) === permission
      },
      addPermission(permission: number) {
        this.permissions |= permission
      },
      removePermission(permission: number) {
        this.permissions &= ~permission
      },
      resetPermissions() {
        this.permissions = 0
      },
    },
    statics: {
      async initialize() {
        for (const role of Object.values(systemRoles)) {
          // Upsert so name/description/isDefault/permissions always match the code. Permissions
          // are assigned (not OR-ed in), so removing one from a system role takes effect too.
          const permissions = role.permissions().reduce((all, p) => all | p, 0)
          await this.updateOne(
            { name: role.name },
            { $set: { description: role.description, isDefault: role.isDefault, permissions } },
            { upsert: true },
          )
          logger.debug(`Synced role: ${role.name} (permissions=${permissions}, default=${role.isDefault})`)
        }
      },
    },
  },
)

// Derive the model type once from a real call, so nothing is restated.
const createRoleModel = (conn: MongooseType) => conn.model('Role', roleSchema)

export type RoleModel = ReturnType<typeof createRoleModel>
export type Role = InferSchemaType<typeof roleSchema> // plain shape
export type RoleDocument = ReturnType<RoleModel['hydrate']> // doc + methods

export const getRoleModel = (conn: MongooseType): RoleModel =>
  (conn.models.Role as RoleModel | undefined) ?? createRoleModel(conn)
