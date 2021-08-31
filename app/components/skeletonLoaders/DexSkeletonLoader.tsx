import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedView } from '../themed'

export function DexSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-blue-800 border-b border-blue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 w-full items-center justify-center')}
      testID='dex_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={130}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 328 130'
        width='100%'
        {...props}
      >
        <Circle
          cx='17'
          cy='23'
          r='16'
        />

        <Rect
          height='20'
          width='100'
          x='50'
          y='13'
        />

        <Rect
          height='15'
          width='100'
          x='0'
          y='55'
        />

        <Rect
          height='15'
          width='150'
          x='210'
          y='55'
        />

        <Rect
          height='15'
          width='100'
          x='0'
          y='80'
        />

        <Rect
          height='15'
          width='150'
          x='210'
          y='80'
        />

        <Rect
          height='15'
          width='100'
          x='0'
          y='105'
        />

        <Rect
          height='15'
          width='150'
          x='210'
          y='105'
        />

      </ContentLoader>
    </ThemedView>
  )
}
