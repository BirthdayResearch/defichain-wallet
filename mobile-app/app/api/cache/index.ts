import QuickLRU from 'quick-lru'

class CacheAPI {
  private readonly cache

  constructor () {
    // setting maxAge to 10 min
    this.cache = new QuickLRU({
      maxSize: 10000,
      maxAge: 1000 * 60 * 10
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
  set (key: string, value: any): void {
    this.cache.set(key, value)
  }

  clear (): void {
    this.cache.reset()
  }
}

export const CacheApi = new CacheAPI()
