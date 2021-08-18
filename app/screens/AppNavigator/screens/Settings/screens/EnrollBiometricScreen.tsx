import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { AuthenticationType } from 'expo-local-authentication'
import React, { useCallback, useState } from 'react'
import { ScrollView, Switch, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text } from '../../../../../components'
import { Button } from '../../../../../components/Button'
import { BiometricHardwareOption } from '../../../../../components/biometric/BiometricHardwareOption'
import { FaceIdIcon } from '../../../../../components/icons/FaceIdIcon'
import { TouchIdIcon } from '../../../../../components/icons/TouchIdIcon'
import { useLocalAuthContext } from '../../../../../contexts/LocalAuthContext'
import { translate } from '../../../../../translations'
import { SettingsParamList } from '../SettingsNavigator'
import { useDispatch } from 'react-redux'
import { authentication, Authentication } from '../../../../../store/authentication'
import { MnemonicStorage } from '../../../../../api/wallet/mnemonic_storage'
import { ocean } from '../../../../../store/ocean'

type Props = StackScreenProps<SettingsParamList, 'EnrollBiometric'>

export function EnrollBiometricScreen ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const dispatch = useDispatch()
  const localAuth = useLocalAuthContext()
  const { hasHardware, isDeviceProtected, supportedTypes } = localAuth
  const [enrolled, setEnrolled] = useState(false)

  const enroll = useCallback(async () => {
    // enroll
    const auth: Authentication<string> = {
      consume: async passphrase => {
        await MnemonicStorage.get(passphrase) // for validation purpose only
        return passphrase
      },
      onAuthenticated: async passphrase => {
        await localAuth.enrollBiometric(passphrase)
      },
      onError: (e) => {
        dispatch(ocean.actions.setError(e))
      },
      message: translate('screens/Settings', 'To enroll biometric authentication, we need you to enter your passcode.'),
      loading: translate('screens/Settings', 'Verifying passcode...')
    }

    dispatch(authentication.actions.prompt(auth))
  }, [])

  const goBack = useCallback(async () => {
    navigation.dispatch(StackActions.pop())
  }, [])

  let additionalNote = 'You can enroll biometric in settings'
  if (!hasHardware) {
    additionalNote = 'No biometric authentication hardware found'
  } else if (!isDeviceProtected) {
    additionalNote = `Increase your device security level to start use biometric authentication. ${additionalNote}`
  }

  let biometricIcon = <FaceIdIcon width={64} height={64} />
  if (!supportedTypes.includes(AuthenticationType.FACIAL_RECOGNITION) && supportedTypes.includes(AuthenticationType.FINGERPRINT)) {
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
            disabled={!localAuth.canEnroll}
            style={tailwind('mr-2')}
            onValueChange={async enabled => {
              if (!enabled) setEnrolled(false)
              else await enroll()
            }} value={enrolled}
          />
        </View>
        {
          supportedTypes.map((type, idx) => (
            <View key={idx} style={tailwind('bg-white flex-row p-2 justify-between items-center')}>
              <BiometricHardwareOption type={type} style={tailwind('ml-2')} />
            </View>
          ))
        }
        {
          supportedTypes.length === 0 ? (
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
          label={translate('screens/EnrollBiometricScreen', 'GO BACK')}
          title='enrollBiometric'
          onPress={async () => await goBack()}
        />
      </View>
    </View>
  )
}
