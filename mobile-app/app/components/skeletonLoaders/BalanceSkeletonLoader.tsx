import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

export function BalanceSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('py-4 mb-3 items-center justify-center rounded-lg')}
      testID='balance_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={40}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 328 40'
        width='100%'
        {...props}
      >
        <Circle cx='30' cy='20' r='16' />
        <Rect x='58' y='2' rx='5' ry='5' width='110' height='16' />
        <Rect x='58' y='24' rx='5' ry='5' width='110' height='12' />

        <Rect x='220' y='2' rx='5' ry='5' width='93' height='16' />
        <Rect x='220' y='24' rx='5' ry='5' width='93' height='12' />
      </ContentLoader>
    </ThemedView>
    )
}
