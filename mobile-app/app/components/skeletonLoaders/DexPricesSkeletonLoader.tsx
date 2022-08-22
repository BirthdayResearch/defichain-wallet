import * as React from 'react'
import ContentLoader, { IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedViewV2 } from '@components/themed'

export function DexPricesSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedViewV2
      style={tailwind('px-1')}
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
      testID='dex_skeleton_price_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={40}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 211 40'
        width='100%'
        {...props}
      >
        <Rect x='5' y='0' rx='4' ry='4' width='180' height='15' />
        <Rect x='5' y='18' rx='4' ry='4' width='180' height='15' />
      </ContentLoader>
    </ThemedViewV2>
  )
}
