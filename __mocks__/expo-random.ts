import * as crypto from 'crypto'

export const getRandomBytes = jest.fn(length => {
  return crypto.randomBytes(length)
})
