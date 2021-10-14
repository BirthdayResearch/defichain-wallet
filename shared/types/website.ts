export interface AnnouncementText {
  en: string
  de: string
  'zh-Hans': string
  'zh-Hant': string
}

export interface AnnouncementData {
  lang: AnnouncementText
  version: {
    min: string
    max?: string
  }
}
