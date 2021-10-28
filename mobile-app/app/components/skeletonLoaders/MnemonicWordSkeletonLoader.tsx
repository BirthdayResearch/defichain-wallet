import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { ThemedView } from '../themed'

export function MnemonicWordSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      testID='mnemonic_word_skeleton_loader'
      light={tailwind('bg-white border-b border-gray-200')}
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      style={tailwind('p-2 w-full items-center justify-center')}
    >
      <ContentLoader
        speed={2}
        width='100%'
        height={47}
        viewBox='0 0 400 47'
        preserveAspectRatio='xMidYMid slice'
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        {...props}
      >
        <Rect x='70' y='3' rx='3' ry='3' width='290' height='33' />
        <Circle x='20' cx='20' cy='20' r='20' />
      </ContentLoader>
    </ThemedView>
  )
}
