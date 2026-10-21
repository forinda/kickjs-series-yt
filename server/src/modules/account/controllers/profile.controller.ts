import {
  Autowired,
  Controller,
  Delete,
  FileUpload,
  Get,
  HttpException,
  Post,
  Put,
  reply,
  type Ctx,
} from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { updateProfileSchema } from '../dtos/update-profile.dto'
import { GetProfileUseCase } from '../use-cases/get-profile.use-case'
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case'
import { SetAvatarUseCase } from '../use-cases/set-avatar.use-case'
import { DeleteAccountUseCase } from '../use-cases/delete-account.use-case'

/** The signed-in user's own account. */
@Controller()
@ApiBearerAuth()
@ApiTags('Account')
export class ProfileController {
  @Autowired() private readonly getProfile!: GetProfileUseCase
  @Autowired() private readonly updateProfile!: UpdateProfileUseCase
  @Autowired() private readonly setAvatar!: SetAvatarUseCase
  @Autowired() private readonly deleteAccount!: DeleteAccountUseCase

  @Get('/', { name: 'GetProfile' })
  async show(ctx: Ctx<KickRoutes.ProfileController['show']>) {
    return this.getProfile.execute(ctx.require('auth').id)
  }

  @Put('/', { body: updateProfileSchema, name: 'UpdateProfile' })
  async update(ctx: Ctx<KickRoutes.ProfileController['update']>) {
    return this.updateProfile.execute(ctx.require('auth').id, ctx.body)
  }

  @Delete('/', { name: 'DeleteAccount' })
  async destroy(ctx: Ctx<KickRoutes.ProfileController['destroy']>) {
    await this.deleteAccount.execute(ctx.require('auth').id)
    return reply.noContent()
  }

  @FileUpload({
    mode: 'single',
    fieldName: 'avatar',
    maxSize: 2 * 1024 * 1024, // 2 MB
    allowedTypes: ['image/*'],
  })
  @Post('/avatar', { name: 'UploadAvatar' })
  async uploadAvatar(ctx: Ctx<KickRoutes.ProfileController['uploadAvatar']>) {
    if (!ctx.file) throw HttpException.badRequest('No image uploaded in the "avatar" field')
    return this.setAvatar.execute(ctx.require('auth').id, ctx.file)
  }

  @Delete('/avatar', { name: 'RemoveAvatar' })
  async removeAvatar(ctx: Ctx<KickRoutes.ProfileController['removeAvatar']>) {
    return this.setAvatar.execute(ctx.require('auth').id, null)
  }
}
