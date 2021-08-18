import { AuthenticationType } from 'expo-local-authentication'
import { Platform } from 'react-native'
import { translate } from '../../translations'
import { Text, TextProps } from '../Text'

export interface Props extends TextProps {
  type: AuthenticationType
}
export function BiometricHardwareOption (props: Omit<Props, 'children'>): JSX.Element {
  let optionName: string
  switch (props.type) {
    case AuthenticationType.FACIAL_RECOGNITION:
      if (Platform.OS === 'android') {
        optionName = 'Facial recognition'
      } else {
        optionName = 'Face ID'
      }
      break
    case AuthenticationType.FINGERPRINT:
      if (Platform.OS === 'android') {
        optionName = 'Fingerprint'
      } else {
        optionName = 'Touch ID'
      }
      break
    case AuthenticationType.IRIS:
      optionName = 'iris scanner'
      break
    default: // must be handled when LocalAuthentication lib upgraded with new type
      throw Error('Unhandled biometric type')
  }
  const msg = translate('components/BiometricHardwareOption', `Use ${optionName}`)
  return (
    <Text {...props}>• {msg}</Text>
  )
}
