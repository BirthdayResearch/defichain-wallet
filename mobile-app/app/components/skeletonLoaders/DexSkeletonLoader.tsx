import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

export function DexSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-gray-700')}
      light={tailwind('bg-white border-gray-200')}
      style={tailwind('py-4 mb-2 items-center justify-center rounded border')}
      testID='dex_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={156}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 343 156'
        width='100%'
        {...props}
      >
        <Circle cx='30' cy='19' r='12' />
        <Rect x='60' y='7' rx='4' ry='4' width='110' height='24' />
        <Rect x='228' y='5' rx='4' ry='4' width='100' height='28' />

        <Rect x='16' y='48' rx='4' ry='4' width='45' height='12' />
        <Circle cx='25' cy='75' r='8' />
        <Rect x='38' y='68' rx='4' ry='4' width='150' height='14' />
        <Circle cx='25' cy='95' r='8' />
        <Rect x='38' y='88' rx='4' ry='4' width='150' height='14' />

        <Rect x='16' y='118' rx='4' ry='4' width='68' height='32' />
        <Rect x='93' y='118' rx='4' ry='4' width='84' height='32' />
        <Rect x='245' y='118' rx='4' ry='4' width='81' height='32' />
      </ContentLoader>
    </ThemedView>
  )
}
