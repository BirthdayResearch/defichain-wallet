import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

export function DexSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border border-gray-700')}
      light={tailwind('bg-white border border-gray-200')}
      style={tailwind('py-4 mx-4 mt-2 items-center justify-center')}
      testID='dex_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={190}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 328 190'
        width='100%'
        {...props}
      >
        <Circle cx='30' cy='20' r='12' />
        <Rect x='60' y='13' rx='5' ry='5' width='110' height='16' />

        <Rect x='16' y='46' rx='4' ry='4' width='100' height='12' />
        <Rect x='16' y='64' rx='4' ry='4' width='60' height='14' />

        <Rect x='166' y='46' rx='4' ry='4' width='100' height='12' />
        <Rect x='166' y='64' rx='4' ry='4' width='60' height='14' />

        <Rect x='16' y='96' rx='4' ry='4' width='100' height='12' />
        <Rect x='16' y='114' rx='4' ry='4' width='60' height='14' />

        <Rect x='166' y='96' rx='4' ry='4' width='100' height='12' />
        <Rect x='166' y='114' rx='4' ry='4' width='60' height='14' />

        <Rect x='16' y='145' rx='4' ry='4' width='144' height='30' />
        <Rect x='168' y='145' rx='4' ry='4' width='80' height='30' />
        <Rect x='280' y='145' rx='4' ry='4' width='32' height='30' />

      </ContentLoader>
    </ThemedView>
    )
}
