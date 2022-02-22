import { getEnvironment } from '@environment'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import * as Updates from 'expo-updates'
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
    })
  })
})

const { useGetStatusQuery } = statusWebsiteSlice
const {
  useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  usePrefetch
} = announcementWebsiteSlice

export {
  useGetStatusQuery,
  useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  usePrefetch
}
