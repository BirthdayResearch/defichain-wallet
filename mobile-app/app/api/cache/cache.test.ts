import { CacheApi } from './index'

describe('CacheApi', () => {
  it('should check cached value', () => {
    const obj = { label: 'foo' }
    const key = 'TEST_KEY'
    CacheApi.set(key, obj)
    const res = CacheApi.get(key)
    expect(res).toEqual(obj)
  })

  it('should not get cached value after timeout', async () => {
    const obj = { label: 'foo' }
    const key = 'TEST_KEY'
    CacheApi.set(key, obj, 100)
    await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    const res = CacheApi.get(key)
    expect(res).toEqual(undefined)
  })
})
