import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getColor, tailwind } from '@tailwind'
import * as React from 'react'
import ContentLoader, { IContentLoaderProps, Rect } from 'react-content-loader/native'
import { ThemedViewV2 } from '../themed'

export function MnemonicWordSkeletonLoaderV2 (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode, border: boolean }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedViewV2
      testID='mnemonic_word_skeleton_loader'
      dark={tailwind('border-mono-dark-v2-300')}
      light={tailwind('border-mono-light-v2-300')}
      style={tailwind(['py-5 mx-5 flex-row justify-center', { 'border-b': props.border }])}
    >
      <ContentLoader
        speed={2}
        width='100%'
        height={20}
        viewBox='0 0 328 20'
        preserveAspectRatio='xMidYMid slice'
        backgroundColor={getColor(isLight ? 'mono-light-v2-100' : 'mono-dark-v2-100')}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        {...props}
      >
        <Rect x='18' y='2' rx='5' ry='5' width='226' height='16' />
      </ContentLoader>
    </ThemedViewV2>
  )
}
