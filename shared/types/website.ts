export interface AnnouncementText {
  en: string
  de: string
  'zh-Hans': string
  'zh-Hant': string
}

export interface AnnouncementData {
  lang: AnnouncementText
  /**
   * Versioned matching represented as semver satisfies
   */
  version: string
}

export interface FeatureFlag {
  id: string
  name: string
  version: string
  stage: 'alpha' | 'beta' | 'public'
}

export type FEATURE_FLAG_ID = 'loan' | 'auction'

export type FEATURE_FLAG_STAGE = 'alpha' | 'beta' | 'public'
