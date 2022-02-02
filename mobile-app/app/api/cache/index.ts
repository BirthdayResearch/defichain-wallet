import LRU from 'lru-cache'

class CacheAPI {
  private readonly cache

  constructor () {
    // setting to 30 sec considering block timing as 30 sec to flush old values
    this.cache = new LRU({
      maxAge: 30000
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
