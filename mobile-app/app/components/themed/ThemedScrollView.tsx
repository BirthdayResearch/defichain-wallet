import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { forwardRef } from 'react'

import { ScrollView } from 'react-native'
import { ThemedProps } from './index'

type ThemedScrollViewProps = ScrollView['props'] & ThemedProps

export const ThemedScrollView = forwardRef(function (props: ThemedScrollViewProps, ref: React.Ref<any>): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-gray-50'),
    dark = tailwind('bg-gray-900'),
    ...otherProps
  } = props
  return (
    <ScrollView
      style={[style, isLight ? light : dark]}
      ref={ref}
      {...otherProps}
    />
  )
})
