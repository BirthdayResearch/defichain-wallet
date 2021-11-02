import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

function VaultLoader (props: {isLight: boolean}): JSX.Element {
  return (
    <ContentLoader
      backgroundColor={props.isLight ? '#ecebeb' : '#2f2f2f'}
      foregroundColor={props.isLight ? '#ffffff' : '#4a4a4a'}
      speed={2}
      width='100%'
      height={144}
      viewBox='0 0 163 144'
    >
      <Rect x='48' y='24' rx='6' ry='6' width='90' height='14' />
      <Rect x='13' y='56' rx='5' ry='5' width='51' height='12' />
      <Rect x='13' y='75' rx='6' ry='6' width='96' height='12' />
      <Circle cx='26' cy='31' r='13' />
      <Rect x='13' y='100' rx='6' ry='6' width='51' height='12' />
      <Rect x='13' y='118' rx='6' ry='6' width='96' height='12' />
    </ContentLoader>
  )
}

export function VaultSkeletonLoader (loaderProps: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  const skeletonCols = Array.from(Array(2), (_v, i) => i + 1)

  return (
    <ThemedView
      style={tailwind('p-2 flex-row justify-around')}
      testID='vault_skeleton_loader'
    >
      {skeletonCols.map((_col, i) => (
        <ThemedView
          dark={tailwind('bg-gray-800 border border-gray-700')}
          light={tailwind('bg-white border border-gray-200')}
          style={tailwind('rounded')}
          key={i}
        >
          <VaultLoader isLight={isLight} />
        </ThemedView>))}
    </ThemedView>
  )
}
