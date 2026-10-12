import { HttpException } from '@forinda/kickjs'

/**
 *
 * @param date - The date to check.
 * @returns True if the date is valid, false otherwise.
 */
const isValidDate = (date: Date) => !isNaN(date.getTime())

/**
 * Formats a given date as 'YYYY-MM-DD'.
 * @param date - The date to format, either as a string or a Date object.
 * @returns The formatted date string.
 * @throws Will throw an error if the date is invalid.
 */
export const getDateFormat = (date: string | Date) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  if (!isValidDate(date)) {
    throw new HttpException(422, 'Invalid date')
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
