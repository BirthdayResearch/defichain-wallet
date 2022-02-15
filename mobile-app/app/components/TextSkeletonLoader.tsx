import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import ContentLoader, { Rect, IContentLoaderProps } from 'react-content-loader/native'
import { ThemedView } from './themed'

interface TextSkeletonLoaderProps {
  textWidth?: string
  textHeight?: string
  viewBoxWidth?: string
  viewBoxHeight?: string
  textHorizontalOffset?: string
  textVerticalOffset?: string
}
export function TextSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode } & TextSkeletonLoaderProps): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('items-center justify-center')}
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={props.height}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox={`0 0 ${props.viewBoxWidth ?? props.width?.toString() ?? '0'} ${props.viewBoxHeight ?? props.height?.toString() ?? '0'}`}
        width={props.width ?? '100%'}
        {...props}
      >
        <Rect x={props.textHorizontalOffset ?? '0'} y={props.textVerticalOffset ?? '0'} rx='5' ry='5' width={props.textWidth ?? props.width} height={props.textHeight ?? props.height} />
      </ContentLoader>
    </ThemedView>
  )
}
