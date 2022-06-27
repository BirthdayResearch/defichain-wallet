import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AnnouncementData, DefiChainStatus, FeatureFlag } from '@shared-types/website'

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
        url:'/overall',
        method: 'GET'
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

const { 
  useGetBlockchainStatusQuery,
  useGetOceanStatusQuery
} = statusWebsiteSlice
const {
  useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  usePrefetch
} = announcementWebsiteSlice

export {
  useGetBlockchainStatusQuery,
  useGetOceanStatusQuery,
  useGetAnnouncementsQuery,
  useGetFeatureFlagsQuery,
  usePrefetch
}
