import { getEnvironment } from '@environment'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import * as Updates from 'expo-updates'
import { AdvertisementData, AnnouncementData, DefiChainStatus, FeatureFlag } from '@shared-types/website'

export const statusWebsiteSlice = createApi({
  reducerPath: 'websiteStatus',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.status.jellyfishsdk.com'
  }),
  endpoints: builder => ({
    getBlockchainStatus: builder.query<DefiChainStatus, any>({
      query: () => ({
        url: '/blockchain',
        method: 'GET'
      })
    }),
    // Ocean API
    getOceanStatus: builder.query<DefiChainStatus, any>({
      query: () => ({
        url: '/overall',
        method: 'GET'
      })
    })
  })
})

export const announcementWebsiteSlice = createApi({
  reducerPath: 'website',
  baseQuery: fetchBaseQuery({
    baseUrl: getEnvironment(Updates.releaseChannel).dfxApiUrl
  }),
  endpoints: builder => ({
    getAnnouncements: builder.query<AnnouncementData[], any>({
      query: () => ({
        url: '/app/announcements',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          mode: 'no-cors'
        }
      })
    }),
    getFeatureFlags: builder.query<FeatureFlag[], any>({
      query: () => ({
        url: '/app/settings/flags',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          mode: 'no-cors'
        }
      })
    }),
    getAdvertisement: builder.query<AdvertisementData, any>({
      query: ({ id, date, lang }: { id: string, date: string, lang: string }) => ({
        url: '/app/advertisements/',
        params: { id, lang, date },
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          mode: 'no-cors'
        }
      })
    })
  })
})

const {
  useGetBlockchainStatusQuery,
  useGetOceanStatusQuery
} = statusWebsiteSlice
const {
  useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  useLazyGetAdvertisementQuery,
  usePrefetch
} = announcementWebsiteSlice

export {
  useGetBlockchainStatusQuery,
  useGetOceanStatusQuery,
  useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  useLazyGetAdvertisementQuery,
  usePrefetch
}
