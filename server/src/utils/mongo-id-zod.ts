import { isObjectIdOrHexString, Types } from 'mongoose'
import { HttpException } from '@forinda/kickjs'
import { z } from 'zod'

type ErrorMessage = {
  invalidId?: string
  required?: string
}

export const mongoIdSchema = (err?: ErrorMessage) =>
  z.string().transform((val) => {
    if (!val) {
      throw new HttpException(422, err?.required ?? 'ID is required')
    }
    return isObjectIdOrHexString(val)
      ? val
      : (() => {
          throw new HttpException(422, err?.invalidId ?? 'Please provide a valid ID')
        })()
  })

export const toObjectId = (val: string = '') => {
  if (!isObjectIdOrHexString(val)) {
    throw new HttpException(422, 'Please provide a valid ID')
  }
  return new Types.ObjectId(val)
}
