export enum AppLanguage {
  English = 'English',
  German = 'Deutsch'
}

export function getAppLanguages (): string[] {
  return [
    AppLanguage.English,
    AppLanguage.German
  ]
}
