import * as React from 'react'
import ContentLoader, { Circle, IContentLoaderProps, Rect } from 'react-content-loader/native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { ThemedView } from '../themed'

type BrowseAuctionsLoaderProps = JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }

export function BrowseAuctionsLoader (props: BrowseAuctionsLoaderProps): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border border-gray-700')}
      light={tailwind('bg-white border border-gray-200')}
      style={tailwind('px-2 mb-2 rounded items-center justify-center')}
      testID='browse_auctions_skeleton_loader'
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        speed={2}
        width='100%'
        height={186}
        viewBox='0 0 400 186'
        {...props}
      >
        <Circle cx='21' cy='27' r='16' />
        <Rect x='46' y='12' rx='3' ry='3' width='120' height='26' />
        <Circle cx='347' cy='21' r='8' />
        <Circle cx='365' cy='21' r='8' />
        <Circle cx='382' cy='21' r='8' />
        <Rect x='8' y='56' rx='3' ry='3' width='120' height='12' />
        <Rect x='282' y='56' rx='3' ry='3' width='110' height='12' />
        <Rect x='8' y='81' rx='3' ry='3' width='132' height='12' />
        <Rect x='272' y='81' rx='3' ry='3' width='118' height='12' />
        <Rect x='8' y='105' rx='3' ry='3' width='170' height='12' />
        <Rect x='252' y='105' rx='3' ry='3' width='140' height='12' />
        <Rect x='8' y='132' rx='3' ry='3' width='384' height='12' />
        <Rect x='8' y='162' rx='3' ry='3' width='100' height='20' />
        <Rect x='118' y='162' rx='3' ry='3' width='130' height='20' />
      </ContentLoader>
    </ThemedView>
  )
}
