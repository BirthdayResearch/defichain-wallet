import { Alert, AlertButton, AlertOptions, Platform } from 'react-native'

interface CustomAlertOption {
  title: string
  message?: string
  buttons?: AlertButton[]
  options?: AlertOptions
}

/**
 * Alert that supports web and native.
 *
 * @param option Same param as react native's `Alert.alert()`.
 *
 * ## Web
 *
 * Using `window.alert()` for single button and `window.confirm()` for two buttons.
 *
 * Limitations:
 * - does not support Android-only's third button
 * - does not support custom button text
 * - single button will always has two buttons, in order to implement `onPress` callback
 *
 * ## Native
 *
 * Using react-native's `Alert`.
 *
 * @reference https://github.com/necolas/react-native-web/issues/1026#issuecomment-687572134
 */
export function WalletAlert (option: CustomAlertOption): void {
  if (Platform.OS !== 'web') {
    Alert.alert(option.title, option.message, option.buttons, option.options)
  } else if ((option.buttons === undefined || option.buttons.length === 0)) {
    window.alert([option.title, option.message].filter(Boolean).join('\n'))
  } else {
    const result = window.confirm([option.title, option.message].filter(Boolean).join('\n'))

    if (result) {
      const confirm = option.buttons.find(({ style }) => style !== 'cancel')
      confirm?.onPress?.()
    }

    const cancel = option.buttons.find(({ style }) => style === 'cancel')
    cancel?.onPress?.()
  }
}
