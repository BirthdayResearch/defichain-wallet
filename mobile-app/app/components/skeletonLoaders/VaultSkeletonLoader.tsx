import * as React from 'react'
import ContentLoader, { IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

type VaultSkeletonLoaderProps = JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }

export function VaultSkeletonLoader (props: VaultSkeletonLoaderProps): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border border-gray-700')}
      light={tailwind('bg-white border border-gray-200')}
      style={tailwind('p-4 mx-4 mt-2 items-center justify-center')}
      testID='vault_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={130}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 328 130'
        width='100%'
        {...props}
      >
        <Rect
          height='16'
          width='60'
          x='0'
          y='13'
        />

        <Rect
          height='16'
          width='60'
          x='70'
          y='13'
        />

        <Rect
          height='16'
          width='240'
          x='0'
          y='33'
        />

        <Rect
          height='15'
          width='150'
          x='0'
          y='53'
        />

        <Rect
          height='15'
          width='130'
          x='0'
          y='90'
        />

        <Rect
          height='15'
          width='140'
          x='220'
          y='90'
        />

        <Rect
          height='15'
          width='130'
          x='0'
          y='115'
        />

        <Rect
          height='15'
          width='140'
          x='220'
          y='115'
        />

      </ContentLoader>
    </ThemedView>
  )
}
