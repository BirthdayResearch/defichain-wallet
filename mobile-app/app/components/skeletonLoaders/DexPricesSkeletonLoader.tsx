import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

export function DexPricesSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('mb-2 items-center justify-center')}
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={65}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 400 65'
        width='100%'
        {...props}
      >
        <Circle cx='27' cy='30' r='8' />
        <Rect x='40' y='22' rx='4' ry='4' width='120' height='17' />
        <Circle cx='27' cy='53' r='8' />
        <Rect x='40' y='45' rx='4' ry='4' width='120' height='17' />
        <Rect x='20' y='5' rx='4' ry='4' width='44' height='12' />
      </ContentLoader>
    </ThemedView>
  )
}
