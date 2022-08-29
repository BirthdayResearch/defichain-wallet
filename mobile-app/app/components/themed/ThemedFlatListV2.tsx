import { forwardRef } from 'react'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { FlatList } from 'react-native'
import { ThemedProps } from './index'

type ThemedFlatListProps = FlatList['props'] & ThemedProps

export const ThemedFlatListV2 = forwardRef(function (props: ThemedFlatListProps, ref: React.Ref<any>): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-mono-light-v2-100'),
    dark = tailwind('bg-mono-dark-v2-100'),
    ...otherProps
  } = props

  return (
    <FlatList
      style={[style, isLight ? light : dark]}
      ref={ref}
      {...otherProps}
    />
  )
})
