/**
 * Centralize logging/error reporting for log abstraction
 */
export const Logging = {
  error (error: any): void {
    console.error(error)
  },
  info (message: string): void {
    console.log(message)
  }
}
