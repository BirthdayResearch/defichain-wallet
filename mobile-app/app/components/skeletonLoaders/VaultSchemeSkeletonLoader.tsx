import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'
import { theme } from '../../tailwind.config'

export function VaultSchemesSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-300')}
      dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
      style={tailwind('mb-1 py-2 border rounded-lg items-center justify-center')}
      testID='balance_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : theme.extend.colors.dfxblue[900]}
        foregroundColor={isLight ? '#ffffff' : theme.extend.colors.dfxblue[800]}
        height={50}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 400 50'
        width='100%'
        {...props}
      >
        <Circle cx='50' cy='29' r='8' />
        <Rect x='81' y='6' rx='4' ry='4' width='120' height='20' />
        <Rect x='81' y='34' rx='4' ry='4' width='80' height='10' />
        <Rect x='220' y='6' rx='4' ry='4' width='100' height='20' />
        <Rect x='220' y='34' rx='4' ry='4' width='80' height='10' />
      </ContentLoader>
    </ThemedView>
  )
}
