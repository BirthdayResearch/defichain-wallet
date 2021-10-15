import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const websiteSlice = createApi({
  reducerPath: 'website',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://deploy-preview-1063--wallet-defichain.netlify.app/api/v0'
  }),
  endpoints: builder => ({
    getAnnouncements: builder.query({
      query: () => ({
        url: '/announcements',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          mode: 'no-cors'
        }
      })
    })
  })
})

export const { useGetAnnouncementsQuery } = websiteSlice
