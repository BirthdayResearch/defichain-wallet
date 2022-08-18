import * as Localization from 'expo-localization'
import { forwardRef } from 'react'
import * as React from 'react'
import { KeyboardTypeOptions, Platform, TextInput, TextInputProps } from 'react-native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getColor, tailwind } from '@tailwind'

export const ThemedTextInputV2 = forwardRef(
  function (props: React.PropsWithChildren<TextInputProps>, ref: React.Ref<any>): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    keyboardType,
    ...otherProps
  } = props

  const getKeyboardType = (): KeyboardTypeOptions | undefined => {
    if (keyboardType === 'numeric' && Platform.OS === 'ios' && Localization.decimalSeparator !== '.') {
      return 'default'
    }
    return keyboardType
  }

  return (
    <TextInput
      placeholderTextColor={isLight ? getColor('mono-light-v2-500') : getColor('mono-dark-v2-500')}
      style={[style, tailwind(isLight ? 'text-mono-light-v2-800' : 'text-mono-dark-v2-800')]}
      ref={ref}
      {...otherProps}
      keyboardType={getKeyboardType()}
    />
  )
})
