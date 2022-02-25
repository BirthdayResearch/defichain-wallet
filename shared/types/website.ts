import { EnvironmentNetwork } from '../environment'

export interface AnnouncementText {
  en: string
  de: string
  'zh-Hans': string
  'zh-Hant': string
  'fr'?: string
}

export interface AnnouncementData {
  lang: AnnouncementText
  /**
   * Versioned matching represented as semver satisfies
   */
  version: string
  url?: {
    ios: string
    android: string
    macos: string
    windows: string
    web: string
  }
  /**
   * `id` will be stored in device's persistence storage. Therefore, each announcement's `id` should be unique string to enable close announcement function
   */
  id?: string
  type: 'EMERGENCY' | 'OTHER_ANNOUNCEMENT' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'MAINTENANCE'
}

export interface FeatureFlag {
  id: FEATURE_FLAG_ID
  name: string
  version: string
  stage: FEATURE_FLAG_STAGE
  description: string
  networks: EnvironmentNetwork[]
  platforms: Platform[]
}

export interface DefiChainStatus {
  page?: {
    id: string
    name: string
    url: string
    updated_at: string
  }
  status: {
    description: 'All Systems Operational' | 'Partial System Outage' | 'Major Service Outage'
    indicator: string
  }
  components?: Array<{
    created_at: string
    description?: string
    id: string
    name: string
    page_id: string
    position: number
    status: string
    updated_at: string
  }>
  incidents?: Array<{
      created_at: string
      id: string
      impact: string
      incident_updates: Array<{
          body: string
          created_at: string
          display_at: string
          id: string
          incident_id: string
          status: string
          updated_at: string
      }>
      monitoring_at?: string
      name: string
      page_id?: string
      resolved_at?: string
      shortlink: string
      status: string
      updated_at: string
    }>
  scheduled_maintenances: Array<{
      created_at: string
      id: string
      impact: string
      incident_updates: Array<{
          body: string
          created_at: string
          display_at: string
          id: string
          incident_id: string
          status: string
          updated_at: string
        }>
      monitoring_at?: string
      name: string
      page_id: string
      resolved_at?: string
      scheduled_for: string
      scheduled_until: string
      shortlink: string
      status: 'Scheduled' | 'In Progress' | 'Verifying' | 'Completed'
      updated_at: string
    }>
}

export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'web'

export type FEATURE_FLAG_ID = 'loan' | 'auction' | 'dfi_loan_payment'

export type FEATURE_FLAG_STAGE = 'alpha' | 'beta' | 'public'
