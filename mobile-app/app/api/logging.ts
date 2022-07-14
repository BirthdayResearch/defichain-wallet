/**
 * Centralize logging/error reporting for log abstraction
 */
export const Logging = {
  error (error: any): void {
    // eslint-disable-next-line
    console.error(error)
  },
  info (message: string): void {
    // eslint-disable-next-line
    console.log(message)
  }
}
