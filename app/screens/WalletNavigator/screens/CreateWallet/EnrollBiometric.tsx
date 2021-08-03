import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Platform, ScrollView, Switch } from 'react-native'
import tailwind from 'tailwind-rn'
import { MnemonicEncrypted } from '../../../../api/wallet/provider/mnemonic_encrypted'
import { Text, View } from '../../../../components'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'
import * as LocalAuthentication from 'expo-local-authentication'
import { SecurityLevel, AuthenticationType } from 'expo-local-authentication'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { Logging } from '../../../../api'
import LoadingScreen from '../../../LoadingNavigator/LoadingScreen'
import { Button } from '../../../../components/Button'

type Props = StackScreenProps<WalletParamList, 'EnrollBiometric'>

export function EnrollBiometric ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const { network } = useNetworkContext()
  const { pin, encrypted } = route.params
  const { setWallet } = useWalletPersistenceContext()

  const [securityLevelChecked, setSecurityLevelChecked] = useState(false)
  const [isProtected, setIsProtected] = useState<boolean | null>(null)
  const [supported, setSupported] = useState<AuthenticationType[]>([])
  const [selectedType, setSelectedType] = useState<AuthenticationType>()

  // function end (input: string): void {
  //   setWallet(encrypted).then(() => {}).catch(e => {})
  //   storePasscode()
  // }

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync()
      .then(async hasHardware => {
        const isDeviceProtected = hasHardware &&
          await LocalAuthentication.getEnrolledLevelAsync() !== SecurityLevel.NONE
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

        setIsProtected(isDeviceProtected)
        setSupported(supportedTypes)
        setSecurityLevelChecked(true)
      })
      .catch(e => Logging.error(e))
  }, [])

  if (!securityLevelChecked) {
    return <LoadingScreen message={translate('screens/EnrollBiometric', 'Checking hardware status')} />
  }

  return (
    <ScrollView contentContainerStyle={tailwind('w-full flex-1 flex-col bg-white justify-center')}>
      {/* <Text style={tailwind('text-center text-lg font-bold')}>{translate('screens/PinConfirmation', 'Verify your passcode')}</Text>
      <Text style={tailwind('pt-2 pb-4 text-center text-gray-500')}>{translate('screens/PinConfirmation', 'Enter your passcode again to verify')}</Text> */}
      {
        supported.map(type => (
          <BiometricOption
            key={type}
            type={type}
            enabled={type === selectedType}
            onSelected={setSelectedType}
          />
        ))
      }
      <Button
        label={translate('screens/EnrollBiometric', 'GO TO WALLET')}
        title='gotoWallet'
        onPress={() => {}}
      />
    </ScrollView>
  )
}

function BiometricOption ({ type, enabled, onSelected }: {
  type: AuthenticationType
  enabled: boolean
  onSelected: (t: AuthenticationType) => void
}): JSX.Element {
  let optionName: string
  switch (type) {
    case AuthenticationType.FACIAL_RECOGNITION:
      if (Platform.OS === 'android') {
        optionName = 'facial recognition'
      } else {
        optionName = 'Face ID'
      }
      break
    case AuthenticationType.FINGERPRINT:
      if (Platform.OS === 'android') {
        optionName = 'fingerprint'
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
    <View style={tailwind('bg-white flex-row p-2 justify-between')}>
      <Text>{msg}</Text>
      <Switch onValueChange={() => onSelected(type)} value={enabled} />
    </View>
  )
}
