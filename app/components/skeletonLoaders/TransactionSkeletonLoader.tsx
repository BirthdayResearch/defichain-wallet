import * as React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedView } from '../themed'

export function TransactionSkeletonLoader (): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      testID='transaction_skeleton_loader'
      light={tailwind('bg-white border-b border-gray-200')}
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      style={tailwind('p-2 w-full items-center justify-center')}
    >
      <ContentLoader
        speed={2}
        viewBox='0 0 344 47'
        width='100%'
        height={47}
        preserveAspectRatio='xMidYMid slice'
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
      >
        <Circle cx='17' cy='23' r='10' />
        <Rect x='44' y='7' width='100' height='15' />
        <Rect x='44' y='29' width='100' height='10' />
        <Rect x='250' y='16' width='85' height='15' />
      </ContentLoader>
    </ThemedView>
  )
}
