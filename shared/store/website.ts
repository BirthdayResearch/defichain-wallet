import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AnnouncementData, DefiChainStatus, FeatureFlag } from '@shared-types/website'

export const statusWebsiteSlice = createApi({
  reducerPath: 'websiteStatus',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://status.defichain.com/api'
  }),
  endpoints: builder => ({
    getStatus: builder.query<DefiChainStatus, any>({
      query: () => ({
        url: '/v2/summary.json',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          mode: 'no-cors'
        }
      })
    })
  })
})

export const announcementWebsiteSlice = createApi({
  reducerPath: 'website',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://wallet.defichain.com/api/v0'
  }),
  endpoints: builder => ({
    getAnnouncements: builder.query<AnnouncementData[], any>({
      query: () => ({
        url: '/announcements',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          mode: 'no-cors'
        }
      })
    }),
    getFeatureFlags: builder.query<FeatureFlag[], any>({
      query: () => ({
        url: '/settings/flags',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          mode: 'no-cors'
        }
      })
    })
  })
})

export const _useGetAnnouncementsQuery = () => {
  const test: AnnouncementData[] = [{
    lang: {
      en: 'Update to the latest app version to access Decentralized Loan.',
      de: 'Aktualisiere auf die neueste Version der App, um Zugang zu dezentralen Darlehen zu erhalten.',
      'zh-Hans': '请更新至最新版本应用程式使用去中心化贷款。',
      'zh-Hant': '請更新至最新版本應用程式使用去中心化貸款。',
      es: '',
      it: ''
    },
    version: '<0.0.0',
    url: {
      ios: 'website',
      android: 'website',
      web: 'website',
      macos: 'website',
      windows: 'website'
    },
    type: 'OTHER_ANNOUNCEMENT'
  }]
  return {
    data: test,
    isSuccess: true
  }
}

const { useGetStatusQuery } = statusWebsiteSlice

// TOdo: remove this once QA tested announcement function 
export const useGetAnnouncementsQuery = () => {
  const test: AnnouncementData[] = [{
    lang: {
      en: 'Update to the latest app version to access Decentralized Loan.',
      de: 'Aktualisiere auf die neueste Version der App, um Zugang zu dezentralen Darlehen zu erhalten.',
      'zh-Hans': '请更新至最新版本应用程式使用去中心化贷款。',
      'zh-Hant': '請更新至最新版本應用程式使用去中心化貸款。',
      it: '',
      es: ''
    },
    url: {
      ios: 'https://status.defichain.com/',
      android: 'https://status.defichain.com/',
      web: 'https://status.defichain.com/',
      macos: 'https://status.defichain.com/',
      windows: 'https://status.defichain.com/'
    },
    id: '11',
    version: '0.0.0',
    type: 'EMERGENCY'
  }]
  return {
    data: test,
    isSuccess: true
  }
} 

const {
  // useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  usePrefetch
} = announcementWebsiteSlice

export {
  useGetStatusQuery,
  // useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  usePrefetch
}
