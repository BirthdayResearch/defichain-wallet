import Cache from 'lru-cache'

class LruCache {
  private readonly cache

  constructor () {
    // setting maxAge to 10 min
    this.cache = new Cache({
      max: 1000,
      maxAge: 1000 * 60 * 5
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
   */
  set (key: string, value: any, maxAge?: number): void {
    this.cache.set(key, value, maxAge)
  }

  clear (): void {
    this.cache.reset()
  }
}

export const CacheApi = new LruCache()
