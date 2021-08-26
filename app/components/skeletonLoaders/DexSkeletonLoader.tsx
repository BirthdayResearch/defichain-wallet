import * as React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedView } from '../themed'

export function DexSkeletonLoader (): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      testID='dex_skeleton_loader'
      light='bg-white border-b border-gray-200'
      dark='bg-gray-800 border-b border-gray-700'
      style={tailwind('p-4 w-full items-center justify-center')}
    >
      <ContentLoader
        speed={2}
        viewBox='0 0 328 130'
        width='100%'
        height={130}
        preserveAspectRatio='xMidYMid slice'
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
      >
        <Circle cx='17' cy='23' r='16' />
        <Rect x='50' y='13' width='100' height='20' />

        <Rect x='0' y='55' width='100' height='15' />
        <Rect x='210' y='55' width='150' height='15' />

        <Rect x='0' y='80' width='100' height='15' />
        <Rect x='210' y='80' width='150' height='15' />

        <Rect x='0' y='105' width='100' height='15' />
        <Rect x='210' y='105' width='150' height='15' />

      </ContentLoader>
    </ThemedView>
  )
}
