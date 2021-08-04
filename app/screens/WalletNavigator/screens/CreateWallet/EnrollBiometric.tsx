import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect, useCallback } from 'react'
import { Platform, ScrollView, Switch } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'
import * as LocalAuthentication from 'expo-local-authentication'
import { SecurityLevel, AuthenticationType } from 'expo-local-authentication'
import { Logging } from '../../../../api'
import LoadingScreen from '../../../LoadingNavigator/LoadingScreen'
import { Button } from '../../../../components/Button'
import { BiometricProtectedPasscode } from '../../../../api/wallet/biometric_protected_passcode'
import { FaceIdIcon } from '../../../../components/icons/FaceIdIcon'
import { TouchIdIcon } from '../../../../components/icons/TouchIdIcon'

type Props = StackScreenProps<WalletParamList, 'EnrollBiometric'>

export function EnrollBiometric ({ route }: Props): JSX.Element {
  const { pin, encrypted } = route.params
  const { setWallet } = useWalletPersistenceContext()

  const [securityLevelChecked, setSecurityLevelChecked] = useState(false)
  const [isDeviceProtected, setIsDeviceProtected] = useState<boolean>(false)
  const [supported, setSupported] = useState<AuthenticationType[]>([])
  const [enrolled, setEnrolled] = useState(false)

  const enroll = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: true,
      promptMessage: translate('screens/EnrollBiometric', 'Secure Your DeFi Wallet'),
      cancelLabel: translate('screens/EnrollBiometric', 'Fallback to created 6 digits pin')
    })

    if (result.success) {
      await BiometricProtectedPasscode.set(pin)
      setEnrolled(true)
    }
  }, [])

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync()
      .then(async hasHardware => {
        const isDeviceProtected = hasHardware &&
          await LocalAuthentication.getEnrolledLevelAsync() === SecurityLevel.BIOMETRIC
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

        setIsDeviceProtected(isDeviceProtected)
        setSupported(supportedTypes)
        setSecurityLevelChecked(true)
      })
      .catch(e => Logging.error(e))
  }, [])

  if (!securityLevelChecked) {
    return <LoadingScreen message={translate('screens/EnrollBiometric', 'Checking hardware status')} />
  }

  let additionalNote = 'You can enroll biometric in settings'
  if (supported.length === 0) {
    additionalNote = 'No biometric authentication hardware found'
  } else if (!isDeviceProtected) {
    additionalNote = `Increase your device security level to start use biometric authentication. ${additionalNote}`
  }

  let biometricIcon = <FaceIdIcon width={64} height={64} />
  if (!supported.includes(AuthenticationType.FACIAL_RECOGNITION) && supported.includes(AuthenticationType.FINGERPRINT)) {
    biometricIcon = <TouchIdIcon width={64} height={64} />
  }

  return (
    <View style={tailwind('w-full flex-1 flex-col')}>
      <ScrollView contentContainerStyle={tailwind('w-full flex-1 flex-col')}>
        <View style={tailwind('w-full p-2 justify-center items-center p-4 pt-8')}>
          {biometricIcon}
        </View>
        <Text style={tailwind('m-4')}>{translate('screens/EnrollBiometric', 'Do you want to use local authentication to unlock your light wallet?')}</Text>
        <View style={tailwind('bg-white flex-row p-2 justify-between items-center')}>
          <Text style={tailwind('ml-2')}>{translate('screens/EnrollBiometric', 'Biometric sensor(s)')}</Text>
          <Switch
            disabled={[null, false].includes(isDeviceProtected) || supported.length === 0}
            style={tailwind('mr-2')}
            onValueChange={async enabled => {
              if (!enabled) setEnrolled(false)
              else await enroll()
            }} value={enrolled}
          />
        </View>
        {
          supported.map(type => (<BiometricOption key={type} type={type} />))
        }
        {
          supported.length === 0 ? (
            <View style={tailwind('bg-white flex-row p-2 justify-between items-center')}>
              <Text style={tailwind('ml-2')}>{translate('screens/EnrollBiometric', 'none')}</Text>
            </View>
          ) : null
        }
        <Text style={tailwind('w-full text-center p-2')}>{translate('screens/EnrollBiometric', additionalNote)}</Text>
      </ScrollView>
      <View style={tailwind('bg-white justify-center')}>
        <Button
          margin='m-4'
          label={translate('screens/EnrollBiometric', 'GO TO WALLET')}
          title='gotoWallet'
          onPress={async () => await setWallet(encrypted)}
        />
      </View>
    </View>
  )
}

function BiometricOption ({ type }: { type: AuthenticationType }): JSX.Element {
  let optionName: string
  switch (type) {
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
  const msg = translate('screens/EnrollBiometric', `Use ${optionName}`)
  return (
    <View style={tailwind('bg-white flex-row p-2 justify-between items-center')}>
      <Text style={tailwind('ml-2')}>• {msg}</Text>
    </View>
  )
}
