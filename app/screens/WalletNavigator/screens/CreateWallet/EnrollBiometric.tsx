import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect , useCallback } from 'react'
import { ActivityIndicator, ScrollView } from 'react-native'
import tailwind from 'tailwind-rn'
import { MnemonicEncrypted } from '../../../../api/wallet/provider/mnemonic_encrypted'
import { Text, View } from '../../../../components'
import { PinInput } from '../../../../components/PinInput'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletManagementContext } from '../../../../contexts/WalletManagementContext'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'
import * as LocalAuthentication from 'expo-local-authentication'
import { SecurityLevel, AuthenticationType } from 'expo-local-authentication'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { Logging } from '../../../../api'
import LoadingScreen from '../../../LoadingNavigator/LoadingScreen'


type Props = StackScreenProps<WalletParamList, 'EnrollBiometric'>

export function EnrollBiometric ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const { network } = useNetworkContext()
  const { pin, encrypted } = route.params
  const { setWallet } = useWalletManagementContext()

  const [securityLevelChecked, setSecurityLevelChecked] = useState(false)
  const [isProtected, setIsProtected] = useState<boolean | null>(null)
  const [supported, setSupported] = useState<AuthenticationType[]>([])
  const [selectedType, setSelectedTyped] = useState<AuthenticationType>()
  const [spinnerMessage, setSpinnerMessage] = useState<string>()

  function verifyPin (input: string): void {
    if (input.length !== pin.length) return
    if (input !== pin) {
      setInvalid(true)
      return
    }

    const copy = { words, network, pin }
    setSpinnerMessage(translate('screens/PinConfirmation', 'Encrypting wallet...'))
    setTimeout(() => {
      MnemonicEncrypted.toData(copy.words, copy.network, copy.pin)
        .then(async encrypted => navigation.navigate('EnrollBiometric', { pin, encrypted }))
        .catch(e => console.log(e))
    }, 50) // allow UI render the spinner before async task
  }

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
      <Text style={tailwind('text-center text-lg font-bold')}>{translate('screens/PinConfirmation', 'Verify your passcode')}</Text>
      <Text style={tailwind('pt-2 pb-4 text-center text-gray-500')}>{translate('screens/PinConfirmation', 'Enter your passcode again to verify')}</Text>
      <PinInput
        length={pin.length as any}
        onChange={verifyPin}
      />
      {
        (spinnerMessage !== undefined) ? (
          <View style={tailwind('flex-row justify-center p-2')}>
            <ActivityIndicator />
            <Text style={tailwind('ml-2')}>{spinnerMessage}</Text>
          </View>
        ) : null
      }
      {
        (invalid) ? (
          <Text style={tailwind('text-center text-red-500 font-bold')}>
            {translate('screens/PinConfirmation', 'Wrong passcode entered')}
          </Text>
        ) : null
      }
    </ScrollView>
  )
}
