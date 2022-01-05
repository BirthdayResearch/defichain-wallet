
import { Text as DefaultText } from 'react-native'
import { tailwind } from '@tailwind'

export const HeaderFont = tailwind('font-semibold')

export type TextProps = DefaultText['props']

export function Text (props: TextProps): JSX.Element {
  const { style, ...otherProps } = props
  return (
    <DefaultText
      style={[tailwind('font-normal text-base'), style]}
      {...otherProps}
    />
  )
}
