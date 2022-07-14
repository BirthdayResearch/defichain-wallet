import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'
import { theme } from '../../tailwind.config'

export function PortfolioSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800')}
      light={tailwind('bg-white')}
      style={tailwind('py-4 mb-3 items-center justify-center rounded-lg')}
      testID='portfolio_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : theme.extend.colors.dfxblue[900]}
        foregroundColor={isLight ? '#ffffff' : theme.extend.colors.dfxblue[800]}
        height={44}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 328 44'
        width='100%'
        {...props}
      >
        <Circle cx='30' cy='22' r='16' />
        <Rect x='58' y='4' rx='5' ry='5' width='110' height='16' />
        <Rect x='58' y='25' rx='5' ry='5' width='110' height='12' />

        <Rect x='220' y='4' rx='5' ry='5' width='93' height='16' />
        <Rect x='220' y='25' rx='5' ry='5' width='93' height='12' />
      </ContentLoader>
    </ThemedView>
  )
}
