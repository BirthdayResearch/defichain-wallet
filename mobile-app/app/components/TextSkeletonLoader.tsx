import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import ContentLoader, { Rect, IContentLoaderProps } from 'react-content-loader/native'
import { ThemedView } from './themed'

interface TextSkeletonLoaderProps {
  iContentLoaderProps: IContentLoaderProps
  textWidth?: string
  textHeight?: string
  viewBoxWidth?: string
  viewBoxHeight?: string
  textHorizontalOffset?: string
  textVerticalOffset?: string
  textXRadius?: string
  textYRadius?: string
}
export function TextSkeletonLoader (props: TextSkeletonLoaderProps): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('items-center justify-center')}
      testID={props.iContentLoaderProps.testID}
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={props.iContentLoaderProps.height}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox={`0 0 ${props.viewBoxWidth ?? props.iContentLoaderProps.width?.toString() ?? '0'} ${props.viewBoxHeight ?? props.iContentLoaderProps.height?.toString() ?? '0'}`}
        width={props.iContentLoaderProps.width ?? '100%'}
        {...props.iContentLoaderProps}
      >
        <Rect x={props.textHorizontalOffset ?? '0'} y={props.textVerticalOffset ?? '0'} rx={props.textXRadius ?? '5'} ry={props.textYRadius ?? '5'} width={props.textWidth ?? props.iContentLoaderProps.width} height={props.textHeight ?? props.iContentLoaderProps.height} />
      </ContentLoader>
    </ThemedView>
  )
}
