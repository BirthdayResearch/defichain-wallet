import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'

export function AddressSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-gray-900 border-gray-700')}
      style={tailwind('py-3 px-2 border-b')}
      testID='address_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        height={35}
        viewBox='0 0 400 35'
        width='100%'
        {...props}
      >
        <Circle cx='35' cy='16' r='12' />
        <Rect x='60' y='5' rx='3' ry='3' width='280' height='20' />
      </ContentLoader>
    </ThemedView>
  )
}
