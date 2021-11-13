import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'
import { theme } from '../../tailwind.config'

export function DexSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-blue-800 border border-blue-900')}
      light={tailwind('bg-white border border-gray-200')}
      style={tailwind('p-4 mx-4 mt-2 items-center justify-center')}
      testID='dex_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : theme.extend.colors.blue[900]}
        foregroundColor={isLight ? '#ffffff' : theme.extend.colors.blue[800]}
        height={194}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 328 130'
        width='100%'
        {...props}
      >
        <Rect x='98' y='10' rx='5' ry='5' width='60' height='10' />
        <Rect x='68' y='36' rx='4' ry='4' width='70' height='8' />
        <Rect x='68' y='50' rx='4' ry='4' width='60' height='8' />
        <Circle cx='80' cy='14' r='12' />
        <Rect x='160' y='36' rx='4' ry='4' width='70' height='8' />
        <Rect x='160' y='50' rx='4' ry='4' width='60' height='8' />

        <Rect x='68' y='70' rx='4' ry='4' width='70' height='8' />
        <Rect x='68' y='84' rx='4' ry='4' width='60' height='8' />

        <Rect x='160' y='70' rx='4' ry='4' width='70' height='8' />
        <Rect x='160' y='84' rx='4' ry='4' width='60' height='8' />

        <Rect x='68' y='113' rx='4' ry='4' width='70' height='14' />
        <Rect x='150' y='113' rx='4' ry='4' width='70' height='14' />

      </ContentLoader>
    </ThemedView>
    )
}
