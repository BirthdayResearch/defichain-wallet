import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'
import { theme } from '../../tailwind.config'

export function AddressSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
      style={tailwind('py-3 px-2 border-b')}
      testID='address_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : theme.extend.colors.dfxblue[900]}
        foregroundColor={isLight ? '#ffffff' : theme.extend.colors.dfxblue[800]}
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
