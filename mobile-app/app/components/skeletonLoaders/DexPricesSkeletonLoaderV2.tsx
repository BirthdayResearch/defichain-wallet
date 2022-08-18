import * as React from 'react'
import ContentLoader, { IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { View } from '@components'

export function DexPricesSkeletonLoaderV2 (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <View style={tailwind('p-0 m-0')}>
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={40}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 200 40'
        width='100%'
        {...props}
      >
        <Rect x='10' y='0' rx='4' ry='4' width='200' height='15' />
        <Rect x='10' y='18' rx='4' ry='4' width='200' height='15' />
      </ContentLoader>
    </View>
  )
}
