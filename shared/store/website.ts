import { getEnvironment } from '@environment'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AnnouncementData, FeatureFlag } from '@shared-types/website'
import * as Updates from 'expo-updates'

export const websiteSlice = createApi({
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

export const {
  useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  usePrefetch
} = websiteSlice
