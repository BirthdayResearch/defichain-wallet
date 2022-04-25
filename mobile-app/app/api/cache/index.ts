// @ts-expect-error
// TODO: add typings one available
import Cache from 'lru-cache'

class LruCache {
  private readonly cache

  constructor () {
    // setting maxAge to 10 min
    this.cache = new Cache({
      max: 1000,
      ttl: 1000 * 60 * 5
    })
  }

  /**
   * @param key {string} of item with 'network' prefixed
   * @return {string | null}
   */
  get (key: string): any {
    return this.cache.get(key)
  }

  /**
   * @param key {string} of item with 'network' prefixed
   * @param value {any} to set
   * @param ttl {number} TTL
   */
  set (key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, { ttl })
  }

  clear (): void {
    this.cache.reset()
  }
}

export const CacheApi = new LruCache()
