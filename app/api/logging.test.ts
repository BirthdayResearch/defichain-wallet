import { Logging } from './logging'

const error = jest.spyOn(Logging, 'error')
const info = jest.spyOn(Logging, 'info')
const consoleLog = jest.spyOn(console, 'log').mockImplementation(jest.fn)
const consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn)

beforeEach(() => {
  jest.clearAllMocks()
})

it('should log error', () => {
  Logging.error(new Error('foo'))
  expect(consoleError).toBeCalled()
  expect(error).toBeCalledTimes(1)
  expect(error).toBeCalledWith(new Error('foo'))
})

it('should log info', () => {
  Logging.info('bar')
  expect(consoleLog).toBeCalled()
  expect(info).toBeCalledTimes(1)
  expect(info).toBeCalledWith('bar')
})
