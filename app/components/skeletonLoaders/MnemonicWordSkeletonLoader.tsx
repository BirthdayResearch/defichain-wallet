import * as React from 'react'
import ContentLoader, { IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
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
        viewBox='0 0 400 150'
        preserveAspectRatio='xMidYMid slice'
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        {...props}
      >
        <Rect x='-1' y='-18' rx='0' ry='0' width='73' height='191' />
        <Rect x='80' y='1' rx='0' ry='0' width='504' height='222' />
      </ContentLoader>
    </ThemedView>
  )
}
