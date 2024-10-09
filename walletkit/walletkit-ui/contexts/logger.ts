export interface BaseLogger {
  error: (error: any) => void;
  info: (message: string) => void;
}
