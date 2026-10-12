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
          // `this` is the Role model; found/created docs have the methods above
          let dbRole = await this.findOne({ name: role.name })
          if (!dbRole) {
            dbRole = await this.create({ name: role.name, description: role.description })
            logger.info(`Created role: ${dbRole.name}`)
          } else {
            logger.info(`Role already exists: ${dbRole.name}`)
          }
          for (const perm of role.permissions()) {
            ;(dbRole as RoleDocument).addPermission(perm)
          }
          await dbRole.save()
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
