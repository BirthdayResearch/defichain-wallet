export enum AppLanguage {
  English = 'English',
  German = 'German'
}

export function getAppLanguages (): string[] {
  return [
    AppLanguage.English,
    AppLanguage.German
  ]
}
