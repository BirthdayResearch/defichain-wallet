
import { TextProps } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedProps } from '.'
import { ThemedText } from './ThemedText'

type SectionTitleProp = TextProps & ThemedProps & IThemedSectionTitle

interface IThemedSectionTitle {
  text: string
}

export function ThemedSectionTitle (props: SectionTitleProp): JSX.Element {
  const {
    style = tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium'),
    light = tailwind('bg-gray-50 text-gray-500'),
    dark = tailwind('bg-gray-900 text-gray-400'),
    ...otherProps
  } = props

  return (
    <ThemedText
      dark={dark}
      light={light}
      style={style}
      {...otherProps}
    >
      {props.text}
    </ThemedText>
  )
}
