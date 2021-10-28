import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

export function TransactionSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-2 w-full items-center justify-center')}
      testID='transaction_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={47}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 344 47'
        width='100%'
        {...props}
      >
        <Circle
          cx='17'
          cy='23'
          r='10'
        />

        <Rect
          height='15'
          width='100'
          x='44'
          y='7'
        />

        <Rect
          height='10'
          width='100'
          x='44'
          y='29'
        />

        <Rect
          height='15'
          width='85'
          x='250'
          y='16'
        />
      </ContentLoader>
    </ThemedView>
  )
}
